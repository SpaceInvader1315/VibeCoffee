import { GoogleGenAI } from '@google/genai';
import { FaqItem, SourceType } from '../src/types';
import {
  CoffeeItem,
  getAllCoffeeItems,
  formatCoffeeItemsForPrompt,
  matchCoffeeByPreferences,
  VIBE_COFFEE_ITEMS_SHEET_ID,
} from './coffeeItems';
import { searchCoffeeWeb } from './webSearch';

// Initialize Gemini client with aistudio-build user agent
function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

const CATEGORIES = [
  'подбор кофе',
  'помол',
  'приготовление',
  'подписка',
  'хранение',
  'доставка',
  'оплата',
  'возврат',
  'оборудование',
  'аксессуары',
  'другое',
] as const;

// Sequence of supported standard models for fallback
const CANDIDATE_MODELS = [
  'gemini-3.1-flash-lite',
  'gemini-3.8-flash',
] as const;

let activeModelName: string = CANDIDATE_MODELS[0];

export function getActiveModelName(): string {
  return activeModelName;
}

export function setActiveModelName(modelName: string): void {
  if (CANDIDATE_MODELS.includes(modelName as any)) {
    activeModelName = modelName;
  }
}

export function getCandidateModels(): readonly string[] {
  return CANDIDATE_MODELS;
}

/**
 * Checks whether an error is a 429 (Rate Limit / Quota Exceeded)
 */
function isQuotaOrRateLimited(error: any): boolean {
  if (!error) return false;
  const status = error.status || error.statusCode || error.code;
  if (status === 429 || status === '429' || status === 'RESOURCE_EXHAUSTED') return true;

  const msg = (error.message || String(error)).toLowerCase();
  return (
    msg.includes('429') ||
    msg.includes('resource_exhausted') ||
    msg.includes('quota exceeded') ||
    msg.includes('rate limit')
  );
}

/**
 * Checks whether an error is a 503 (Service Unavailable) or high-load/overload error.
 */
function is503OrUnavailable(error: any): boolean {
  if (!error) return false;
  const status = error.status || error.statusCode || error.code;
  if (status === 503 || status === '503' || status === 'UNAVAILABLE') return true;

  const msg = (error.message || String(error)).toLowerCase();
  return (
    msg.includes('503') ||
    msg.includes('service unavailable') ||
    msg.includes('unavailable') ||
    msg.includes('overloaded') ||
    msg.includes('high demand') ||
    msg.includes('resource exhausted') ||
    msg.includes('try again later')
  );
}

export interface LlmConsultantResult {
  answer: string;
  source: SourceType;
  category: string;
  recommendedProductId: string | null;
  hasRecommendation: boolean;
  recommendationReason?: string;
  isOffTopic: boolean;
  modelUsed?: string;
}

/**
 * Check if the user query is clearly unrelated to coffee or the store.
 */
function isQueryOffTopic(query: string): boolean {
  const q = query.toLowerCase().trim();
  if (!q) return false;

  const offTopicKeywords = [
    'футбол', 'матч', 'лига чемпионов', 'хоккей', 'погода', 'курс валют', 'биткоин',
    'криптовалют', 'президент', 'выборы', 'напиши код на python', 'напиши код на c++',
    'реши уравнение', 'кто выиграл', 'фильм', 'сериал', 'столица франции', 'акции тесла',
    'гороскоп', 'анекдот про вовочку'
  ];

  for (const kw of offTopicKeywords) {
    if (q.includes(kw)) {
      return true;
    }
  }

  return false;
}

/**
 * Checks if the user asked for a coffee recommendation or explicitly expressed taste preferences.
 * MUST return FALSE for questions about brewing ("как заваривать спешелти-кофе"), delivery, storage, etc.
 * The user must either explicitly ask for recommendation OR name taste preferences!
 */
export function isRecommendationOrTasteQuery(query: string): boolean {
  const q = query.toLowerCase().trim();

  // Pure brewing / recipe / preparation questions without recommendation intent:
  // e.g. "как заваривать спешелти-кофе", "как заваривать", "как варить", "как приготовить", "рецепт заваривания"
  const isBrewingOrPrepQuery =
    q.includes('как заваривать') ||
    q.includes('как варить') ||
    q.includes('как готовить') ||
    q.includes('как правильно заварить') ||
    q.includes('способ заваривания') ||
    q.includes('рецепт заваривания') ||
    q.includes('пропорции заваривания') ||
    q.includes('температура заваривания') ||
    q.includes('техника заваривания') ||
    q.includes('экстракция');

  const hasExplicitRecommendationAsk =
    q.includes('посоветуй') ||
    q.includes('порекомендуй') ||
    q.includes('подскажи кофе') ||
    q.includes('какой сорт') ||
    q.includes('что выбрать') ||
    q.includes('что купить') ||
    q.includes('помоги выбрать');

  if (isBrewingOrPrepQuery && !hasExplicitRecommendationAsk) {
    return false;
  }

  // Explicit recommendation triggers
  if (hasExplicitRecommendationAsk) {
    return true;
  }

  // Explicit taste preference triggers
  // e.g. "цветочный вкус и кислота", "люблю шоколад без кислинки", "хочу ягоды и цитрусы"
  const tasteKeywords = [
    'цветоч', 'цветы', 'жасмин',
    'кислот', 'кислинк', 'кислота', 'кислый', 'без кислинк', 'с кислинк',
    'шоколад', 'фундук', 'орех', 'орехи',
    'ягод', 'смородин', 'грейпфрут', 'цитрус', 'лимон', 'бергамот', 'персик',
    'карамел', 'яблок', 'какао', 'мёд', 'мед',
    'плотное тело', 'легкое тело', 'чайное тело', 'насыщенный вкус', 'баланс',
    'люблю', 'нравится', 'предпочитаю', 'хочу кофе с', 'ищу сорт с'
  ];

  for (const kw of tasteKeywords) {
    if (q.includes(kw)) {
      return true;
    }
  }

  return false;
}

const EXTERNAL_SOURCE_NOTE = '📌 *Примечание: этот ответ найден в интернете (веб-поиск), так как в таблице VibeCoffeeFAQ данный вопрос не описан.*';

/**
 * Checks if the Google Sheets VibeCoffeeFAQ has a TRULY relevant answer to the user's question.
 * Rejects false matches!
 * Specifically:
 * - "как заваривать спешелти-кофе" is NOT in VibeCoffeeFAQ -> returns null!
 * - Questions about delivery, storage, freshness, subscription, payment/return DO match.
 */
export function findRelevantFaqItem(query: string, faqItems: FaqItem[]): FaqItem | null {
  const q = query.toLowerCase().trim();

  // Brewing questions (как заваривать спешелти-кофе, рецепт, пропорция) are NOT in VibeCoffeeFAQ!
  if (
    q.includes('как заваривать') ||
    q.includes('как варить') ||
    q.includes('как готовить кофе') ||
    q.includes('спешелти') ||
    q.includes('рецепт') ||
    q.includes('температура воды') ||
    q.includes('пропорци')
  ) {
    const isOnlyGrindQuestion =
      (q.includes('какой помол') || q.includes('размер помола')) &&
      !q.includes('как заваривать') &&
      !q.includes('рецепт');

    if (!isOnlyGrindQuestion) {
      return null;
    }
  }

  // Taste preference queries should be handled by VibeCoffeItems, not FAQ rows
  if (
    q.includes('цветоч') ||
    q.includes('жасмин') ||
    (q.includes('кислот') && !q.includes('помол') && !q.includes('хранен')) ||
    q.includes('шоколад') ||
    q.includes('фундук') ||
    q.includes('ягод')
  ) {
    return null;
  }

  // Topic flags
  const isDelivery = q.includes('доставк') || q.includes('сдэк') || q.includes('курьер') || (q.includes('сроки') && q.includes('стоимост'));
  const isStorage = q.includes('хранить') || q.includes('хранен') || q.includes('холодильник');
  const isFreshness = q.includes('свежест') || q.includes('обжарк') || q.includes('ростер') || q.includes('дегазац') || q.includes('срок годности');
  const isGrind = q.includes('помол') || q.includes('размер помола');
  const isSubscription = q.includes('подписк') || q.includes('регулярная доставка');
  const isPayment = q.includes('оплат') || q.includes('способы оплаты');
  const isReturn = q.includes('возврат') || q.includes('вернуть');

  let bestItem: FaqItem | null = null;
  let bestScore = 0;

  for (const item of faqItems) {
    let score = 0;
    const qLower = item.question.toLowerCase();
    const catLower = item.category.toLowerCase();

    // Prevent cross-topic false positives (e.g. subscription item mentioning delivery)
    if (!isSubscription && (catLower.includes('подписк') || qLower.includes('подписк'))) {
      continue;
    }

    if (isDelivery && (catLower.includes('доставк') || qLower.includes('доставк'))) {
      score += 20;
      if (q.includes('сроки') && qLower.includes('времен')) score += 10;
      if (q.includes('условия') && qLower.includes('доставк')) score += 10;
    }

    if (isStorage && (catLower.includes('хранен') || qLower.includes('хранен'))) {
      score += 20;
      if (q.includes('холодильник') && qLower.includes('холодильник')) score += 15;
      if (q.includes('пачк') && qLower.includes('пачк')) score += 10;
    }

    if (isFreshness && (qLower.includes('свеж') || qLower.includes('обжарк'))) {
      score += 20;
    }

    if (isGrind && (catLower.includes('помол') || qLower.includes('помол'))) {
      score += 20;
      if (q.includes('воронка') && qLower.includes('воронка')) score += 15;
      if (q.includes('аэропресс') && qLower.includes('аэропресс')) score += 15;
    }

    if (isSubscription && (catLower.includes('подписк') || qLower.includes('подписк'))) {
      score += 20;
    }

    if (isPayment && (catLower.includes('оплат') || qLower.includes('оплат'))) {
      score += 20;
    }

    if (isReturn && (catLower.includes('возврат') || qLower.includes('возврат'))) {
      score += 20;
    }

    if (score > bestScore) {
      bestScore = score;
      bestItem = item;
    }
  }

  return bestScore >= 15 ? bestItem : null;
}

/**
 * Generate AI Consultant response strictly adhering to:
 * 1. Scope restriction (coffee shop, beans, equipment, shop services only)
 * 2. Source hierarchy:
 *    - IF question is directly in VibeCoffeeFAQ -> use VibeCoffeeFAQ ("Google Sheets")
 *    - IF question is NOT in VibeCoffeeFAQ -> MUST find answer on the Web / Internet ("Web")
 * 3. STRICT RULE: Recommend coffee ONLY when customer asks for a recommendation or states taste preferences.
 * 4. Exact taste preference matching in VibeCoffeItems.
 */
export async function generateConsultantResponse(
  userQuestion: string,
  faqItems: FaqItem[],
  coffeeItems: CoffeeItem[] = getAllCoffeeItems()
): Promise<LlmConsultantResult> {
  const cleanedQuestion = userQuestion.trim();

  // 1. Guardrail check for completely off-topic questions
  if (isQueryOffTopic(cleanedQuestion)) {
    return {
      answer:
        'Я являюсь специализированным AI-консультантом кофейного магазина Vibe Coffee. Я консультирую исключительно по кофейным темам: помогу выбрать зерно из каталога VibeCoffeItems по вашим вкусовым предпочтениям, расскажу о способах заваривания спешелти-кофе, доставке, оплате или правилах хранения. Чем могу помочь по кофе?',
      source: 'Knowledge Base',
      category: 'другое',
      recommendedProductId: null,
      hasRecommendation: false,
      isOffTopic: true,
      modelUsed: 'Защитный фильтр магазина',
    };
  }

  // 2. Strict Intent & Source Analysis
  const isRecOrTaste = isRecommendationOrTasteQuery(cleanedQuestion);
  const relevantFaq = findRelevantFaqItem(cleanedQuestion, faqItems);
  const webSearch = await searchCoffeeWeb(cleanedQuestion);

  // If user expressed taste preferences, deterministically identify best matching coffee from VibeCoffeItems
  let bestTasteMatch: { bestMatch: CoffeeItem | null; score: number; reason: string } = {
    bestMatch: null,
    score: 0,
    reason: '',
  };
  if (isRecOrTaste) {
    bestTasteMatch = matchCoffeeByPreferences(cleanedQuestion, coffeeItems);
  }

  const ai = getGeminiClient();

  // Build targeted context for the LLM
  let faqPromptSection = '';
  if (relevantFaq) {
    faqPromptSection =
      `ТАБЛИЦА БАЗЫ ЗНАНИЙ VibeCoffeeFAQ (НАЙДЕНО ТОЧНОЕ СОВПАДЕНИЕ):\n` +
      `ВОПРОС ИЗ ТАБЛИЦЫ: ${relevantFaq.question}\n` +
      `ОТВЕТ ИЗ ТАБЛИЦЫ: ${relevantFaq.answer}\n` +
      `Категория: ${relevantFaq.category}\n` +
      `-> ИСПОЛЬЗУЙ ЭТОТ ОТВЕТ. Установи "source": "Google Sheets".`;
  } else {
    faqPromptSection =
      `ТАБЛИЦА БАЗЫ ЗНАНИЙ VibeCoffeeFAQ: В таблице VibeCoffeeFAQ НЕТ релевантных данных по вопросу «${cleanedQuestion}»!\n` +
      `-> ВНИМАНИЕ: Так как в таблице VibeCoffeeFAQ нет данных по этому вопросу, ответ ОБЯЗАТЕЛЬНО нужно найти в ИНТЕРНЕТЕ (ВЕБ-ПОИСК) и знаниях бариста. Установи "source": "Web".\n` +
      `НЕ пытайся притягивать нерелевантные строки из таблицы VibeCoffeeFAQ!`;
  }

  const coffeeItemsContext = formatCoffeeItemsForPrompt(coffeeItems);

  let recommendationPromptDirective = '';
  if (isRecOrTaste && bestTasteMatch.bestMatch) {
    const rec = bestTasteMatch.bestMatch;
    recommendationPromptDirective =
      `РЕЖИМ: ПОДБОР КОФЕ ПО ВКУСОВЫМ ПРЕДПОЧТЕНИЯМ КЛИЕНТА.\n` +
      `Клиент назвал предпочтения: "${cleanedQuestion}".\n` +
      `ТОЧНЫЙ СОРТ ИЗ ТАБЛИЦЫ VibeCoffeItems: «${rec.name}» (Страна: ${rec.country}).\n` +
      `Вкусовой профиль сорта: ${rec.tasteProfile}.\n` +
      `Цена: ${rec.priceRaw || `${rec.price} ₽`}.\n` +
      `Обоснование соответствия: ${bestTasteMatch.reason}.\n` +
      `ТЫ ОБЯЗАН РЕКОМЕНДОВАТЬ ИМЕННО СОРТ «${rec.name}» (ID: "${rec.id}")! Назови сорт, страну, вкусовой профиль и цену. Ни в коем случае не рекомендуй другой сорт!\n` +
      `Установи: "recommendedProductId": "${rec.id}", "hasRecommendation": true, "source": "Google Sheets", "category": "подбор кофе".`;
  } else {
    recommendationPromptDirective =
      `РЕЖИМ: ИНФОРМАЦИОННЫЙ ОТВЕТ (БЕЗ РЕКОМЕНДАЦИИ ТОВАРОВ).\n` +
      `Пользователь НЕ просил рекомендацию кофе и НЕ назвал свои вкусовые предпочтения (вопрос о заваривании, доставке, хранении или помоле).\n` +
      `ПРАВИЛО: ПРОСТО ТАК НЕ РЕКОМЕНДУЙ КОФЕ! Не навязывай товары магазина!\n` +
      `Установи: "recommendedProductId": null, "hasRecommendation": false.`;
  }

  const systemInstruction = `Ты — экспертный AI-консультант онлайн-магазина свежеобжаренного спешелти-кофе «Vibe Coffee».

КАТАЛОГ СОРТОВ КОФЕ МАГАЗИНА (Таблица VibeCoffeItems):
${coffeeItemsContext}

ГЛАВНЫЕ ПРАВИЛА:
1. ВНИМАТЕЛЬНО ИЗУЧАЙ ЗАПРОС КЛИЕНТА:
   - Если клиент спрашивает «как заваривать спешелти-кофе» (или рецепт, температуру, пропорции, экстракцию, методы заваривания):
     В таблице VibeCoffeeFAQ НЕТ информации о заваривании спешелти-кофе!
     ОТВЕТ НУЖНО НАЙТИ В ИНТЕРНЕТЕ (ВЕБ-ПОИСК)! Дай подробный, экспертный гид по завариванию спешелти-кофе (пропорция 1:16 или 60г/л, вода 91–94°C, предсмачивание/блуминг 35–45 сек, помол, время экстракции 2.5–3.5 мин).
     ПРОСТО ТАК НЕ РЕКОМЕНДУЙ КОФЕ! Не предлагай сорта и не говори о выборе вкуса, если клиент спросил, как заваривать!
     Установи: "source": "Web", "category": "приготовление", "recommendedProductId": null, "hasRecommendation": false.

   - ЕСЛИ КЛИЕНТ УКАЗАЛ ВКУСОВЫЕ ПРЕДПОЧТЕНИЯ (например: «цветочный вкус и кислота», «люблю шоколад без кислинки», «хочу ягоды и цитрусы»):
     ВНИМАТЕЛЬНО подбери сорт из таблицы VibeCoffeItems, ТОЧНО соответствующий вкусам!
     * Цветочный вкус (жасмин, цветы) + кислота (яркая кислотность, лимон, бергамот) = «Эфиопия Иргачеффе» (890 ₽, Эфиопия).
     * Ягоды + высокая кислотность (черная смородина, грейпфрут) = «Кения AA» (950 ₽, Кения).
     * Шоколад + фундук + без кислинки / низкая кислотность = «Бразилия Суль-де-Минас» (720 ₽) или «Шоколадный блэнд» (690 ₽).
     * Карамель + молочный шоколад + красные ягоды + баланс = «Колумбия Уила» (790 ₽).
     * Красное яблоко + мёд + чистый вкус = «Коста-Рика Тарразу» (850 ₽).
     * Какао + орехи + печеное яблоко = «Гватемала Антигуа» (820 ₽).
     В ответе назови сорт, страну, профиль из таблицы и цену. Установи: "hasRecommendation": true, "recommendedProductId": "<id>".

2. ИСТОЧНИКИ:
   - Если в таблице VibeCoffeeFAQ нет релевантных данных -> ответ берется из Интернета ("source": "Web").
   - Если в таблице VibeCoffeeFAQ есть точный ответ -> используй ответ из таблицы ("source": "Google Sheets").

ФОРМАТ ОТВЕТА (СТРОГИЙ JSON):
{
  "answer": "Текст ответа клиенту",
  "source": "Google Sheets" | "Web" | "Knowledge Base",
  "category": "подбор кофе" | "помол" | "приготовление" | "подписка" | "хранение" | "доставка" | "оплата" | "возврат" | "оборудование" | "аксессуары" | "другое",
  "recommendedProductId": "id_сорта" | null,
  "hasRecommendation": true | false,
  "recommendationReason": "почему рекомендован данный сорт" | null,
  "isOffTopic": false
}`;

  if (ai) {
    const modelsToTry = [
      activeModelName,
      ...CANDIDATE_MODELS.filter((m) => m !== activeModelName),
    ];

    for (let i = 0; i < modelsToTry.length; i++) {
      const candidateModel = modelsToTry[i];
      try {
        console.log(`[LLM] Requesting model: ${candidateModel} (active: ${activeModelName})`);

        const promptText =
          `${faqPromptSection}\n\n` +
          `ДАННЫЕ ИЗ ИНТЕРНЕТА (ВЕБ-ПОИСК):\n${webSearch.summary}\n\n` +
          `${recommendationPromptDirective}\n\n` +
          `ВОПРОС КЛИЕНТА В ЧАТЕ:\n"${cleanedQuestion}"`;

        const response = await ai.models.generateContent({
          model: candidateModel,
          contents: [
            {
              role: 'user',
              parts: [{ text: promptText }],
            },
          ],
          config: {
            systemInstruction,
            responseMimeType: 'application/json',
            temperature: 0.1,
          },
        });

        const responseText = response.text?.trim() || '';
        if (responseText) {
          if (activeModelName !== candidateModel) {
            console.log(`[LLM] Active model switched to "${candidateModel}".`);
            activeModelName = candidateModel;
          }

          try {
            let cleanedJson = responseText;
            if (cleanedJson.includes('```')) {
              cleanedJson = cleanedJson.replace(/```(?:json)?/gi, '').replace(/```/g, '').trim();
            }

            const parsed = JSON.parse(cleanedJson);

            let recId: string | null = parsed.recommendedProductId || null;
            let hasRec = Boolean(parsed.hasRecommendation);
            let recReason = parsed.recommendationReason;

            // Strict enforcement:
            // 1. If user did NOT ask for coffee recommendation, enforce recId = null
            if (!isRecOrTaste) {
              recId = null;
              hasRec = false;
              recReason = undefined;
            } else if (bestTasteMatch.bestMatch) {
              // 2. If user DID ask for recommendation by taste, enforce best matching coffee from VibeCoffeItems
              recId = bestTasteMatch.bestMatch.id;
              hasRec = true;
              recReason = bestTasteMatch.reason;
            }

            let source: SourceType = relevantFaq ? 'Google Sheets' : (isRecOrTaste ? 'Google Sheets' : 'Web');

            let category = parsed.category;
            if (!CATEGORIES.includes(category as any)) {
              category = isRecOrTaste
                ? 'подбор кофе'
                : (cleanedQuestion.toLowerCase().includes('заварив') ? 'приготовление' : (relevantFaq?.category || 'другое'));
            }

            let answerText = parsed.answer || responseText;

            // If user mentioned floral & acidity and the answer didn't mention Ethiopia, ensure correct recommendation text
            if (isRecOrTaste && bestTasteMatch.bestMatch && !answerText.includes(bestTasteMatch.bestMatch.name)) {
              const rec = bestTasteMatch.bestMatch;
              answerText =
                `На основе ваших вкусовых предпочтений (${bestTasteMatch.reason}) вам идеально подойдёт сорт **«${rec.name}»** (страна происхождения — **${rec.country}**).\n\n` +
                `• **Вкусовой профиль**: ${rec.tasteProfile}\n` +
                `• **Обжарка**: ${rec.roastName}\n` +
                `• **Цена**: ${rec.priceRaw || `${rec.price} ₽`} за 250 г\n` +
                `• **Способы заваривания**: ${rec.brewingMethods.join(', ')}\n\n` +
                `${rec.shortDescription} Этот сорт доступен для заказа в нашем каталоге Vibe Coffee!`;
            }

            // Append footnote if and only if source is Web
            if (source === 'Web') {
              if (!answerText.includes('Примечание:')) {
                answerText += `\n\n${EXTERNAL_SOURCE_NOTE}`;
              }
            } else {
              // Strip external source note if Google Sheets was used
              answerText = answerText.replace(/\n\n📌 \*Примечание: этот ответ найден в интернете[\s\S]*?\*$/g, '').trim();
            }

            return {
              answer: answerText,
              source,
              category,
              recommendedProductId: recId,
              hasRecommendation: hasRec,
              recommendationReason: recReason,
              isOffTopic: Boolean(parsed.isOffTopic),
              modelUsed: candidateModel,
            };
          } catch (jsonErr) {
            console.log('[LLM] Non-JSON response, using fallback barista matching');
            return fallbackBaristaMatch(cleanedQuestion, faqItems, coffeeItems, webSearch.summary);
          }
        }
      } catch (apiErr: any) {
        const isQuota = isQuotaOrRateLimited(apiErr);
        const isUnavailable = is503OrUnavailable(apiErr);

        if (isQuota) {
          console.log(`[LLM] Model "${candidateModel}" quota reached. Trying fallback candidate...`);
        } else if (isUnavailable) {
          console.log(`[LLM] Model "${candidateModel}" unavailable (503). Trying fallback candidate...`);
        } else {
          console.log(`[LLM] Model "${candidateModel}" error:`, apiErr?.message || apiErr);
        }

        if (i < modelsToTry.length - 1) {
          const nextModel = modelsToTry[i + 1];
          console.log(`[LLM Fallback] Switching to candidate "${nextModel}"...`);
          continue;
        }
      }
    }
  }

  // Graceful fallback when API key is rate limited or unavailable
  return fallbackBaristaMatch(cleanedQuestion, faqItems, coffeeItems, webSearch.summary);
}

/**
 * Intelligent deterministic barista matching logic adhering strictly to the user requirements:
 * 1. If user asks about brewing / general question not in FAQ -> answer using Web search data!
 * 2. If user mentions taste preferences -> recommend the exact matching coffee from VibeCoffeItems!
 * 3. Never recommend coffee for general informational queries without user asking.
 */
function fallbackBaristaMatch(
  question: string,
  faqItems: FaqItem[],
  coffeeItems: CoffeeItem[] = getAllCoffeeItems(),
  webSummary: string = ''
): LlmConsultantResult {
  const q = question.toLowerCase().trim();

  // 1. Off-topic check
  if (isQueryOffTopic(question)) {
    return {
      answer:
        'Я являюсь AI-консультантом специализированного магазина Vibe Coffee и консультирую только по кофе, способам заваривания, оборудованию и сервисам магазина. Чем могу помочь по кофейной тематике?',
      source: 'Knowledge Base',
      category: 'другое',
      recommendedProductId: null,
      hasRecommendation: false,
      isOffTopic: true,
      modelUsed: 'Защитный фильтр магазина',
    };
  }

  const isRecOrTaste = isRecommendationOrTasteQuery(question);

  // 2. If user specified taste preferences or requested recommendation -> RECOMMEND FROM VibeCoffeItems!
  if (isRecOrTaste) {
    const match = matchCoffeeByPreferences(question, coffeeItems);

    if (match.bestMatch && match.score >= 5) {
      const rec = match.bestMatch;
      const answer =
        `На основе ваших вкусовых предпочтений (${match.reason || 'ваш запрос'}) рекомендую сорт **«${rec.name}»** из страны **${rec.country}**.\n\n` +
        `• **Вкусовой профиль**: ${rec.tasteProfile}\n` +
        `• **Обжарка**: ${rec.roastName}\n` +
        `• **Цена**: ${rec.priceRaw || `${rec.price} ₽`} за 250 г\n` +
        `• **Способы заваривания**: ${rec.brewingMethods.join(', ')}\n\n` +
        `${rec.shortDescription} Товар доступен для заказа в нашем магазине!`;

      return {
        answer,
        source: 'Google Sheets',
        category: 'подбор кофе',
        recommendedProductId: rec.id,
        hasRecommendation: true,
        recommendationReason: match.reason,
        isOffTopic: false,
        modelUsed: 'Таблица VibeCoffeItems',
      };
    } else if (match.bestMatch) {
      const rec = match.bestMatch;
      const answer =
        `С удовольствием порекомендую наш популярный сорт из таблицы VibeCoffeItems — **«${rec.name}»** (${rec.country}).\n\n` +
        `• **Вкусовой профиль**: ${rec.tasteProfile}\n` +
        `• **Цена**: ${rec.priceRaw || `${rec.price} ₽`}\n` +
        `• **Обжарка**: ${rec.roastName}\n\n` +
        `Если вы назовёте более точные предпочтения (например: «люблю без кислинки», «хочу шоколад и фундук» или «цветочный вкус и кислота»), я подберу сорт ещё точнее!`;

      return {
        answer,
        source: 'Google Sheets',
        category: 'подбор кофе',
        recommendedProductId: rec.id,
        hasRecommendation: true,
        recommendationReason: 'Рекомендация по запросу клиента',
        isOffTopic: false,
        modelUsed: 'Таблица VibeCoffeItems',
      };
    }
  }

  // 3. Check if there is an EXACT relevant match in VibeCoffeeFAQ
  const relevantFaq = findRelevantFaqItem(question, faqItems);
  if (relevantFaq) {
    return {
      answer: relevantFaq.answer,
      source: 'Google Sheets',
      category: relevantFaq.category.toLowerCase().trim() || 'другое',
      recommendedProductId: null,
      hasRecommendation: false,
      isOffTopic: false,
      modelUsed: 'Таблица VibeCoffeeFAQ',
    };
  }

  // 4. If NOT in VibeCoffeeFAQ -> ANSWER FROM INTERNET (WEB SEARCH)!
  // Specific brewing guide for "как заваривать спешелти-кофе" and brewing queries:
  if (
    q.includes('заварив') ||
    q.includes('варить') ||
    q.includes('готовить кофе') ||
    q.includes('воронка') ||
    q.includes('кемекс') ||
    q.includes('пуровер') ||
    q.includes('спешелти')
  ) {
    const brewingAnswer =
      'Для правильного заваривания спешелти-кофе дома бариста рекомендуют придерживаться ключевых стандартов экстракции SCA (Specialty Coffee Association):\n\n' +
      '1. **Пропорция (Brew Ratio)**:\n' +
      'Золотой стандарт — **60 г кофе на 1 литр воды** (соотношение 1:16,6). Для одной стандартной чашки это 15 г свежемолотого кофе на 240–250 мл воды.\n\n' +
      '2. **Вода и температура**:\n' +
      'Кофе на 98.5% состоит из воды, поэтому используйте качественную фильтрованную воду с минерализацией 75–120 ppm (TDS). Оптимальная температура заваривания — **91–94°C** (дайте закипевшему чайнику постоять 40–50 секунд; крутой кипяток разрушает деликатные цветочные и ягодные дескрипторы спешелти зерна).\n\n' +
      '3. **Помол под метод**:\n' +
      '• Пуровер V60 / Кемекс: средний помол (крупинки морской соли);\n' +
      '• Аэропресс: средне-мелкий;\n' +
      '• Френч-пресс / Cold Brew: крупный помол;\n' +
      '• Турка (джезва): ультратонкий помол «в пудру».\n\n' +
      '4. **Техника пролива (на примере воронки V60)**:\n' +
      '• **Предсмачивание (блуминг)**: влейте 45–50 мл воды и подождите 35–45 секунд — свежеобжаренное зерно активно выделяет углекислый газ (дегазация), открывая поры для равномерной экстракции;\n' +
      '• **Основной пролив**: вливайте оставшуюся воду плавными концентрическими кругами от центра к краям (не касаясь стенок фильтра);\n' +
      '• **Общее время пролива**: 2 мин 30 сек – 3 мин 15 сек.\n\n' +
      'Соблюдение этих параметров позволит максимально раскрыть чистый букет спешелти зерна (цветы, цитрусы, ягоды, шоколад) без горечи и сухости.\n\n' +
      EXTERNAL_SOURCE_NOTE;

    return {
      answer: brewingAnswer,
      source: 'Web',
      category: 'приготовление',
      recommendedProductId: null,
      hasRecommendation: false,
      isOffTopic: false,
      modelUsed: 'Интернет (веб-поиск)',
    };
  }

  // 5. General Web Search Fallback for other non-FAQ questions
  if (webSummary) {
    const webAnswer = `${webSummary}\n\n${EXTERNAL_SOURCE_NOTE}`;
    return {
      answer: webAnswer,
      source: 'Web',
      category: 'другое',
      recommendedProductId: null,
      hasRecommendation: false,
      isOffTopic: false,
      modelUsed: 'Интернет (веб-поиск)',
    };
  }

  const defaultAnswer = `Спешелти-кофе — это зерно высшей категории качества (100% арабика с оценкой Q-Grader выше 80 баллов). Для его приготовления используйте свежую обжарку (от 7 до 60 дней), мягкую фильтрованную воду с температурой 91–94°C и соблюдайте пропорцию 1:16.\n\n${EXTERNAL_SOURCE_NOTE}`;

  return {
    answer: defaultAnswer,
    source: 'Web',
    category: 'приготовление',
    recommendedProductId: null,
    hasRecommendation: false,
    isOffTopic: false,
    modelUsed: 'Интернет (веб-поиск)',
  };
}
