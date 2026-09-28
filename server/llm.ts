import { GoogleGenAI } from '@google/genai';
import { FaqItem, SourceType } from '../src/types';
import {
  CoffeeItem,
  getAllCoffeeItems,
  formatCoffeeItemsForPrompt,
  matchCoffeeByPreferences,
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

const EXTERNAL_SOURCE_NOTE =
  '📌 *Примечание: этот ответ найден в интернете (веб-поиск), так как в таблице VibeCoffeeFAQ данный вопрос не описан.*';

const OFF_TOPIC_ANSWER =
  'К сожалению, я не могу ответить на этот вопрос. Я кофейный консультант Vibe Coffee и специализируюсь исключительно на кофе: помогу подобрать сорт из нашего каталога VibeCoffeItems, расскажу о способах заваривания, помоле, хранении, а также об условиях доставки и работы нашего магазина. Чем могу помочь по кофейной тематике?';

/**
 * ШАГ 1: Проверка — касается ли вопрос кофе, способов заваривания, оборудования,
 * зерен или сервисов магазина Vibe Coffee.
 */
export function isCoffeeRelatedQuery(query: string): boolean {
  const q = query.toLowerCase().trim();
  if (!q) return false;

  // Очевидные не связанные с кофе темы
  const nonCoffeeThemes = [
    'футбол', 'хоккей', 'баскетбол', 'матч', 'лига чемпионов', 'спортзал',
    'погода', 'дождь в москве', 'прогноз погоды',
    'курс валют', 'курс доллара', 'курс евро', 'биткоин', 'криптовалют',
    'президент', 'выборы', 'политик', 'госдум',
    'код на python', 'код на c++', 'код на javascript', 'напиши скрипт',
    'реши уравнение', 'интеграл', 'квадратный корень',
    'фильм', 'кино', 'сериал', 'актер',
    'столица франции', 'столица японии', 'география',
    'акции тесла', 'акции эппл',
    'ремонт автомобиля', 'шиномонтаж', 'стиральная машина',
    'гороскоп', 'знак зодиака', 'анекдот про вовочку', 'расскажи стих'
  ];

  for (const theme of nonCoffeeThemes) {
    if (q.includes(theme)) {
      return false;
    }
  }

  // Признаки кофейной тематики
  const coffeeKeywords = [
    'кофе', 'кофейн', 'зерн', 'арабик', 'робуст', 'чашк', 'напиток',
    'эспрессо', 'капучино', 'латте', 'американо', 'раф', 'флэт', 'колд брю', 'cold brew',
    'фильтр', 'пуровер', 'v60', 'харио', 'кемекс', 'аэропресс', 'турк', 'джезв',
    'гейзер', 'мока', 'френч-пресс', 'капельн', 'кофеварк', 'кофемашин', 'кофемолк',
    'заварив', 'варить', 'приготов', 'пролив', 'экстракц', 'блуминг', 'предсмачиван',
    'температур', 'вода', 'пропорци', 'соотношен', 'минерализац', 'tds', 'ppm',
    'помол', 'обжарк', 'свежест', 'дегазац', 'q-грейдер', 'каппинг', 'sca',
    'обработк', 'анаэробн', 'мытая', 'натуральн', 'ферментац', 'хани', 'декаф', 'каскара',
    'вкус', 'кислинк', 'кислот', 'горчинк', 'горечь', 'сладост', 'ноты', 'дескриптор',
    'жасмин', 'шоколад', 'фундук', 'орех', 'бергамот', 'цитрус', 'ягод', 'персик', 'карамел',
    'эфиопи', 'колумби', 'бразил', 'кени', 'гватемал', 'коста-рик',
    'доставк', 'сдэк', 'курьер', 'подписк', 'оплат', 'возврат', 'пачк', 'хранен', 'пакет',
    'vibe', 'вайб', 'магазин', 'каталог', 'сорт', 'посоветуй', 'порекомендуй', 'купить',
    'бариста', 'консультант', 'привет', 'здравствуйте', 'добрый день', 'добрый вечер'
  ];

  for (const kw of coffeeKeywords) {
    if (q.includes(kw)) {
      return true;
    }
  }

  // Если запрос короткий и не содержит кофейных слов, но и не явно отклонён — проверяем наличие кофейного контекста
  return false;
}

/**
 * ШАГ 2: Проверка — нужно ли и можно ли в ответ на вопрос предложить кофе из таблицы VibeCoffeeItems.
 * Кофе предлагается, если клиент:
 * 1) спрашивает про ассортимент, сорта кофе в магазине, что есть в продаже/наличии;
 * 2) просит рекомендацию, совет или помощь с выбором зерна (посоветуй, какой кофе выбрать, что купить и т.д.);
 * 3) выражает вкусовые предпочтения (с кислинкой, шоколадный, цветочный, ягодный, без кислинки и т.д.);
 * 4) спрашивает какое зерно купить/выбрать под конкретный метод заваривания или напиток (для турки, эспрессо, воронки, капучино и т.д.);
 * 5) интересуется зерном конкретной страны происхождения (Эфиопия, Колумбия, Кения, Бразилия, Гватемала, Коста-Рика).
 *
 * Кофе НЕ предлагается при чисто информационных вопросах:
 * - как заваривать, рецепты, пропорции, температура воды (без вопроса о покупке/выборе сорта);
 * - условия доставки, стоимость, сроки;
 * - правила хранения, можно ли в холодильник;
 * - помол для способов (какой помол для турки);
 * - теоретические вопросы (способы обработки ягод, ботаника кофе, калорийность и т.д.).
 */
export function canOfferCoffeeFromItems(
  query: string,
  coffeeItems: CoffeeItem[] = getAllCoffeeItems()
): {
  shouldOffer: boolean;
  matchedCoffee: CoffeeItem | null;
  reason: string;
  isAllVarietiesOverview?: boolean;
} {
  const q = query.toLowerCase().trim();

  // Чисто информационные вопросы (рецепты заваривания, техника, процессы, условия магазина),
  // если в них НЕТ вопроса о выборе/покупке сорта:
  const isPureInformationalQuestion =
    (q.includes('как заваривать') ||
      q.includes('как правильно заваривать') ||
      q.includes('как варить') ||
      q.includes('как готовить кофе') ||
      q.includes('рецепт заваривания') ||
      q.includes('пропорции') ||
      q.includes('температура воды') ||
      q.includes('время заваривания') ||
      q.includes('сколько грамм') ||
      q.includes('что такое') ||
      q.includes('в чем разница') ||
      q.includes('почему горчит') ||
      q.includes('почему кислит') ||
      q.includes('условия доставки') ||
      q.includes('сроки доставки') ||
      q.includes('сколько стоит доставка') ||
      q.includes('как хранить') ||
      q.includes('можно ли в холодильник') ||
      q.includes('как работает подписка') ||
      q.includes('какой помол выбрать') ||
      q.includes('какой помол нужен')) &&
    !q.includes('сорт') &&
    !q.includes('какой кофе') &&
    !q.includes('какие сорта') &&
    !q.includes('купить') &&
    !q.includes('выбрать') &&
    !q.includes('посоветуй') &&
    !q.includes('порекомендуй') &&
    !q.includes('магазин') &&
    !q.includes('наличи');

  // 1. Запрос ассортимента или сортов кофе в магазине
  const isCatalogVarietyAsk =
    q.includes('сорта кофе') ||
    q.includes('сорт кофе') ||
    q.includes('сорта в магазине') ||
    q.includes('сорта у вас') ||
    q.includes('какие сорта') ||
    q.includes('какой кофе в магазине') ||
    q.includes('какой кофе есть') ||
    q.includes('какой кофе прода') ||
    q.includes('какой кофе у вас') ||
    q.includes('какой кофе представлен') ||
    q.includes('что есть в магазине') ||
    q.includes('что у вас есть') ||
    q.includes('ассортимент') ||
    q.includes('каталог сортов') ||
    q.includes('каталог кофе') ||
    q.includes('какие зерна') ||
    q.includes('зерно в наличии') ||
    q.includes('кофе в наличии') ||
    q.includes('в продаже') ||
    q.includes('что продаете') ||
    q.includes('что вы продаете') ||
    q.includes('что есть из кофе') ||
    q.includes('какие позиции') ||
    q.includes('весь кофе') ||
    q.includes('список сортов') ||
    q.includes('все сорта') ||
    (q.includes('сорт') && (q.includes('магазин') || q.includes('у вас') || q.includes('есть') || q.includes('каталог')));

  // 2. Явный запрос рекомендации кофе
  const hasRecommendationAsk =
    q.includes('посоветуй') ||
    q.includes('порекомендуй') ||
    q.includes('подскажи кофе') ||
    q.includes('подскажи сорт') ||
    q.includes('какой сорт выбрать') ||
    q.includes('какой кофе выбрать') ||
    q.includes('что купить') ||
    q.includes('что выбрать') ||
    q.includes('помоги выбрать') ||
    q.includes('что взять') ||
    q.includes('какой сорт взять') ||
    q.includes('хочу купить') ||
    q.includes('хочу заказать') ||
    q.includes('что попробовать') ||
    q.includes('какой кофе лучше') ||
    q.includes('какой кофе купить') ||
    q.includes('какой кофе заказать') ||
    q.includes('купить кофе') ||
    q.includes('заказать кофе') ||
    q.includes('подобрать кофе') ||
    q.includes('подбери кофе');

  // 3. Запрос подбора зерна под конкретный метод заваривания или напиток
  const hasBrewMethodCoffeeAsk =
    (q.includes('турк') ||
      q.includes('джезв') ||
      q.includes('эспрессо') ||
      q.includes('капучино') ||
      q.includes('латте') ||
      q.includes('v60') ||
      q.includes('пуровер') ||
      q.includes('воронк') ||
      q.includes('фильтр') ||
      q.includes('кемекс') ||
      q.includes('гейзер') ||
      q.includes('мока') ||
      q.includes('френч') ||
      q.includes('колд брю') ||
      q.includes('cold brew')) &&
    (q.includes('какой') ||
      q.includes('сорт') ||
      q.includes('кофе') ||
      q.includes('зерн') ||
      q.includes('купить') ||
      q.includes('выбрать') ||
      q.includes('взять') ||
      q.includes('посоветуй') ||
      q.includes('порекомендуй') ||
      q.includes('лучше') ||
      q.includes('подходит'));

  // 4. Вопросы по конкретным странам/происхождениям кофе
  const hasCountryCoffeeAsk =
    (q.includes('эфиоп') ||
      q.includes('колумб') ||
      q.includes('бразил') ||
      q.includes('кени') ||
      q.includes('гватемал') ||
      q.includes('коста-рик')) &&
    (q.includes('есть') ||
      q.includes('сорт') ||
      q.includes('кофе') ||
      q.includes('купить') ||
      q.includes('у вас') ||
      q.includes('в наличии') ||
      q.includes('расскажи') ||
      q.includes('посоветуй') ||
      q.includes('представлен'));

  // 5. Вкусовые предпочтения для подбора сорта
  const hasTastePreferences =
    q.includes('цветоч') ||
    q.includes('жасмин') ||
    q.includes('кислот') ||
    q.includes('кислинк') ||
    q.includes('кислый') ||
    q.includes('без кислинк') ||
    q.includes('не кислый') ||
    q.includes('шоколад') ||
    q.includes('фундук') ||
    q.includes('орех') ||
    q.includes('ягод') ||
    q.includes('смородин') ||
    q.includes('цитрус') ||
    q.includes('грейпфрут') ||
    q.includes('лимон') ||
    q.includes('бергамот') ||
    q.includes('карамел') ||
    q.includes('плотное тело') ||
    q.includes('легкое тело') ||
    q.includes('люблю') ||
    q.includes('нравится') ||
    q.includes('предпочитаю') ||
    q.includes('хочу кофе с') ||
    q.includes('ищу сорт с');

  // Если это чисто информационный вопрос без признаков подбора/покупки/ассортимента
  if (isPureInformationalQuestion && !hasRecommendationAsk && !isCatalogVarietyAsk && !hasBrewMethodCoffeeAsk && !hasCountryCoffeeAsk) {
    return { shouldOffer: false, matchedCoffee: null, reason: '' };
  }

  if (isCatalogVarietyAsk || hasRecommendationAsk || hasTastePreferences || hasBrewMethodCoffeeAsk || hasCountryCoffeeAsk) {
    const match = matchCoffeeByPreferences(query, coffeeItems);
    if (match.bestMatch) {
      return {
        shouldOffer: true,
        matchedCoffee: match.bestMatch,
        reason: match.reason || 'соответствие ассортименту магазина Vibe Coffee',
        isAllVarietiesOverview: isCatalogVarietyAsk,
      };
    }
  }

  return { shouldOffer: false, matchedCoffee: null, reason: '' };
}

/**
 * ШАГ 3: Проверка — есть ли ответ на вопрос в таблице VibeCoffeeFAQ.
 * Правило: НЕ ПРИДУМЫВАТЬ ответы из таблицы, если их там нет!
 * В VibeCoffeeFAQ содержатся ответы ТОЛЬКО по темам:
 * 1) Условия, сроки и стоимость доставки (бесплатно от 2500 руб, СДЭК, курьер по Мск/СПб, фиксированные 350 руб)
 * 2) Свежесть кофе, обжарка на ростере Giesen, дегазация, пик вкуса, срок годности 12 месяцев
 * 3) Правила хранения (почему нельзя в холодильник, закрытая трехслойная пачка с клапаном в шкафу)
 * 4) Подбор размера помола для турки, эспрессо, гейзера, v60, кемекса, френч-пресса и бесплатный помол
 * 5) Подписка на кофе (скидка 15%, бесплатная доставка, интервалы, пауза и отмена)
 *
 * Если вопрос касается чего-то другого (как заваривать кофе, пропорции, температура воды, рецепт,
 * способы обработки ягод, ботаника кофе и т.д.) -> В ТАБЛИЦЕ ОТВЕТА НЕТ! Возвращаем null.
 */
export function findAnswerInFaq(query: string, faqItems: FaqItem[]): FaqItem | null {
  const q = query.toLowerCase().trim();

  // Вопросы о технике заваривания (как заваривать, пропорции, температура, рецепт)
  // НЕ описаны в VibeCoffeeFAQ (там есть только справочник помола, но не рецепты/инструкции заваривания)!
  const isBrewingRecipeQuery =
    q.includes('как заваривать') ||
    q.includes('как варить') ||
    q.includes('как готовить кофе') ||
    q.includes('рецепт') ||
    q.includes('температура воды') ||
    q.includes('пропорци') ||
    q.includes('блуминг') ||
    q.includes('предсмачиван') ||
    q.includes('время заваривания');

  if (isBrewingRecipeQuery) {
    // В таблице VibeCoffeeFAQ нет инструкций и рецептов заваривания!
    return null;
  }

  // Теоретические и энциклопедические вопросы (q-грейдер, мытая обработка, арабика vs робуста)
  // также отсутствуют в VibeCoffeeFAQ
  if (
    q.includes('q-грейдер') ||
    q.includes('обработк') ||
    q.includes('мытая обработка') ||
    q.includes('натуральная обработка') ||
    q.includes('анаэробная') ||
    q.includes('арабика и робуста') ||
    q.includes('почему горчит') ||
    q.includes('почему кислит')
  ) {
    return null;
  }

  // Проверка конкретных тем, представленных в VibeCoffeeFAQ
  const isDelivery =
    q.includes('доставк') ||
    q.includes('сдэк') ||
    q.includes('курьер') ||
    (q.includes('сроки') && q.includes('заказ')) ||
    (q.includes('стоимость') && q.includes('доставк')) ||
    (q.includes('сколько стоит') && q.includes('доставк'));

  const isStorage =
    q.includes('хранить') ||
    q.includes('хранен') ||
    q.includes('холодильник') ||
    (q.includes('пачк') && q.includes('открыт'));

  const isFreshness =
    q.includes('свежест') ||
    q.includes('обжарк') ||
    q.includes('ростер') ||
    q.includes('дегазац') ||
    q.includes('срок годности') ||
    q.includes('когда обжарен');

  const isGrind =
    (q.includes('помол') || q.includes('размер помола') || q.includes('смолоть')) &&
    !isBrewingRecipeQuery;

  const isSubscription =
    q.includes('подписк') ||
    q.includes('регулярная доставка') ||
    q.includes('скидка 15%');

  let bestItem: FaqItem | null = null;
  let bestScore = 0;

  for (const item of faqItems) {
    let score = 0;
    const qLower = item.question.toLowerCase();
    const catLower = item.category.toLowerCase();

    // 1. Доставка
    if (isDelivery && (catLower.includes('доставк') || qLower.includes('доставк'))) {
      if (!isSubscription && (catLower.includes('подписк') || qLower.includes('подписк'))) {
        continue;
      }
      score += 25;
      if (q.includes('сроки') && qLower.includes('сроки')) score += 10;
      if (q.includes('стоимост') && qLower.includes('стоимост')) score += 10;
      if (q.includes('условия') && qLower.includes('условия')) score += 10;
      if (q.includes('бесплатн') && qLower.includes('бесплатн')) score += 10;
    }

    // 2. Хранение и холодильник
    if (isStorage && (catLower.includes('хранен') || qLower.includes('хранен'))) {
      score += 25;
      if (q.includes('холодильник') && qLower.includes('холодильник')) score += 20;
      if (q.includes('пачк') && qLower.includes('пачк')) score += 10;
    }

    // 3. Свежесть и обжарка
    if (isFreshness && (qLower.includes('свеж') || qLower.includes('обжарк') || catLower.includes('хранен'))) {
      if (qLower.includes('свеж') || qLower.includes('обжарк')) {
        score += 25;
        if (q.includes('дегазац') && qLower.includes('дегазац')) score += 15;
        if (q.includes('срок годности') && qLower.includes('срок годности')) score += 15;
      }
    }

    // 4. Помол под способы
    if (isGrind && (catLower.includes('помол') || qLower.includes('помол'))) {
      score += 25;
      if (q.includes('турк') && qLower.includes('турк')) score += 15;
      if (q.includes('эспрессо') && qLower.includes('эспрессо')) score += 15;
      if (q.includes('гейзер') && qLower.includes('гейзер')) score += 15;
      if (q.includes('воронка') && qLower.includes('v60')) score += 15;
      if (q.includes('френч') && qLower.includes('френч')) score += 15;
    }

    // 5. Подписка
    if (isSubscription && (catLower.includes('подписк') || qLower.includes('подписк'))) {
      score += 25;
      if (q.includes('преимуществ') && qLower.includes('преимуществ')) score += 10;
      if (q.includes('скидк') && qLower.includes('скидк')) score += 10;
    }

    if (score > bestScore) {
      bestScore = score;
      bestItem = item;
    }
  }

  // Порог уверенности: засчитываем только реальные тематические совпадения
  return bestScore >= 25 ? bestItem : null;
}

/**
 * ГЛАВНЫЙ ПРОЦЕСС ОБРАБОТКИ ВОПРОСОВ:
 * Строго соответствует 4 шагам из требований пользователя:
 * 1. Проверить, касается ли вопрос кофе. Если не касается -> сообщить, что не можем ответить на вопрос.
 * 2. Если касается кофе -> проверить, можно ли предложить кофе из таблицы VibeCoffeeItems.
 * 3. Если кофе не нужно предлагать или нет подходящего -> проверить, есть ли ответ в таблице VibeCoffeeFAQ.
 *    (Не придумывать ответы из таблицы, если их там нет!)
 * 4. Если в таблице VibeCoffeeFAQ нет ответа на вопрос -> найти ответ в интернете (веб-поиск).
 */
export async function generateConsultantResponse(
  userQuestion: string,
  faqItems: FaqItem[],
  coffeeItems: CoffeeItem[] = getAllCoffeeItems()
): Promise<LlmConsultantResult> {
  const cleanedQuestion = userQuestion.trim();

  // ==========================================
  // ШАГ 1: Проверка на кофейную тематику
  // ==========================================
  const isCoffee = isCoffeeRelatedQuery(cleanedQuestion);
  if (!isCoffee) {
    return {
      answer: OFF_TOPIC_ANSWER,
      source: 'Knowledge Base',
      category: 'другое',
      recommendedProductId: null,
      hasRecommendation: false,
      isOffTopic: true,
      modelUsed: 'Защитный фильтр магазина',
    };
  }

  // ==========================================
  // ШАГ 2: Проверка предложения кофе из VibeCoffeeItems
  // ==========================================
  const offerDecision = canOfferCoffeeFromItems(cleanedQuestion, coffeeItems);

  // ==========================================
  // ШАГ 3: Проверка наличия ответа в VibeCoffeeFAQ
  // (только если кофе не предлагается)
  // ==========================================
  let relevantFaq: FaqItem | null = null;
  if (!offerDecision.shouldOffer) {
    relevantFaq = findAnswerInFaq(cleanedQuestion, faqItems);
  }

  // ==========================================
  // ШАГ 4: Поиск в интернете
  // (если кофе не предлагается и в VibeCoffeeFAQ нет ответа)
  // ==========================================
  const webSearch = await searchCoffeeWeb(cleanedQuestion);

  const ai = getGeminiClient();

  // Формируем инструкции для LLM с учетом установленного порядка шагов
  const coffeeItemsContext = formatCoffeeItemsForPrompt(coffeeItems);

  let stepContextDirective = '';
  if (offerDecision.shouldOffer && offerDecision.matchedCoffee) {
    const rec = offerDecision.matchedCoffee;
    if (offerDecision.isAllVarietiesOverview) {
      const itemsList = coffeeItems
        .map(
          (item, idx) =>
            `${idx + 1}. «${item.name}» (${item.country}) — ${item.tasteProfile}, ${item.priceRaw || `${item.price} ₽`} за 250 г (${item.roastName})`
        )
        .join('\n');

      stepContextDirective =
        `РЕШЕНИЕ ПО ШАГУ 2: Клиент спрашивает про ассортимент / сорта кофе в нашем магазине.\n` +
        `В ответ на данный вопрос СЛЕДУЕТ подробно рассказать про все сорта свежеобжаренного кофе из таблицы VibeCoffeItems и предложить сорт «${rec.name}» (${rec.country}).\n` +
        `Список сортов из таблицы VibeCoffeItems:\n${itemsList}\n` +
        `-> Подробно перечисли сорта из каталога Vibe Coffee и порекомендуй сорт «${rec.name}». Установи: "source": "Google Sheets", "hasRecommendation": true, "recommendedProductId": "${rec.id}", "category": "подбор кофе".`;
    } else {
      stepContextDirective =
        `РЕШЕНИЕ ПО ШАГУ 2: В ответ на данный вопрос клиента СЛЕДУЕТ предложить кофе из таблицы VibeCoffeeItems.\n` +
        `Подобранный сорт: «${rec.name}» (${rec.country}).\n` +
        `Вкусовой профиль: ${rec.tasteProfile}.\n` +
        `Цена: ${rec.priceRaw || `${rec.price} ₽`} за 250 г.\n` +
        `Обоснование подбора: ${offerDecision.reason}.\n` +
        `-> Рекомендуй именно этот сорт из каталога VibeCoffeItems. Установи: "source": "Google Sheets", "hasRecommendation": true, "recommendedProductId": "${rec.id}", "category": "подбор кофе".`;
    }
  } else if (relevantFaq) {
    stepContextDirective =
      `РЕШЕНИЕ ПО ШАГУ 3: Кофе предлагать не нужно. В таблице VibeCoffeeFAQ НАЙДЕН точный ответ на данный вопрос:\n` +
      `Вопрос из таблицы: ${relevantFaq.question}\n` +
      `Ответ из таблицы: ${relevantFaq.answer}\n` +
      `Категория: ${relevantFaq.category}\n` +
      `-> Сформулируй ответ строго на основе данных из таблицы VibeCoffeeFAQ. Установи: "source": "Google Sheets", "hasRecommendation": false, "recommendedProductId": null, "category": "${relevantFaq.category}".`;
  } else {
    stepContextDirective =
      `РЕШЕНИЕ ПО ШАГУ 4: Кофе предлагать не нужно (или нет подходящего), и в таблице VibeCoffeeFAQ НЕТ ответа на вопрос «${cleanedQuestion}».\n` +
      `ДАННЫЕ ИЗ ИНТЕРНЕТА (ВЕБ-ПОИСК ПО ВОПРОСУ «${cleanedQuestion}»):\n${webSearch.summary}\n` +
      `-> Найди и сформулируй точный, развернутый и профессиональный ответ на конкретный вопрос «${cleanedQuestion}» на основе найденных в интернете данных. Отвечай строго по теме заданного вопроса пользователя, без шаблонных вставок! НЕ придумывай и не натягивай ответы из таблицы VibeCoffeeFAQ! Установи: "source": "Web", "hasRecommendation": false, "recommendedProductId": null, "category": "приготовление" или "другое".`;
  }

  const systemInstruction = `Ты — экспертный AI-консультант онлайн-магазина свежеобжаренного кофе «Vibe Coffee».

КАТАЛОГ СОРТОВ КОФЕ (Таблица VibeCoffeItems):
${coffeeItemsContext}

ТВОЙ ПРОЦЕСС РАБОТЫ С ВОПРОСАМИ СТРОГО СЛЕДУЕТ 4 ШАГАМ:
1. Если вопрос не касается кофе -> сообщить, что не можешь ответить на вопрос.
2. Если вопрос касается кофе -> проверить, можно ли в ответ на него предложить кофе из таблицы VibeCoffeeItems (клиент просит рекомендацию сорта, интересуется покупкой или назвал вкусовые предпочтения). Если да — предложить подходящий сорт из VibeCoffeeItems.
3. Если кофе не нужно предлагать или нет подходящего -> ответить на вопрос из таблицы VibeCoffeeFAQ. НЕ ПРИДУМЫВАТЬ ответы из таблицы, если их там нет!
4. Если в таблице нет ответа на вопрос -> найти ответ в интернете (веб-поиск) и дать развернутый экспертный ответ.

ФОРМАТ ВЫХОДА (СТРОГИЙ JSON):
{
  "answer": "Текст ответа клиенту",
  "source": "Google Sheets" | "Web" | "Knowledge Base",
  "category": "подбор кофе" | "помол" | "приготовление" | "подписка" | "хранение" | "доставка" | "оплата" | "возврат" | "оборудование" | "аксессуары" | "другое",
  "recommendedProductId": "id_сорта_из_VibeCoffeItems" | null,
  "hasRecommendation": true | false,
  "recommendationReason": "почему рекомендован сорт" | null,
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
        const promptText =
          `${stepContextDirective}\n\n` +
          `ВОПРОС КЛИЕНТА:\n"${cleanedQuestion}"`;

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

            let recId: string | null = null;
            let hasRec = false;
            let recReason: string | undefined = undefined;

            if (offerDecision.shouldOffer && offerDecision.matchedCoffee) {
              recId = offerDecision.matchedCoffee.id;
              hasRec = true;
              recReason = offerDecision.reason;
            }

            let source: SourceType = 'Web';
            if (offerDecision.shouldOffer && offerDecision.matchedCoffee) {
              source = 'Google Sheets';
            } else if (relevantFaq) {
              source = 'Google Sheets';
            } else {
              source = 'Web';
            }

            let category = parsed.category;
            if (!CATEGORIES.includes(category as any)) {
              if (offerDecision.shouldOffer) {
                category = 'подбор кофе';
              } else if (relevantFaq) {
                category = relevantFaq.category;
              } else {
                category = cleanedQuestion.toLowerCase().includes('заварив') ? 'приготовление' : 'другое';
              }
            }

            let answerText = parsed.answer || responseText;

            // Если кофе предложен, но модель опустила детали сорта — гарантируем точные данные
            if (offerDecision.shouldOffer && offerDecision.matchedCoffee && !answerText.includes(offerDecision.matchedCoffee.name)) {
              const rec = offerDecision.matchedCoffee;
              answerText =
                `На основе вашего запроса (${offerDecision.reason}) рекомендую сорт **«${rec.name}»** (страна — **${rec.country}**).\n\n` +
                `• **Вкусовой профиль**: ${rec.tasteProfile}\n` +
                `• **Обжарка**: ${rec.roastName}\n` +
                `• **Цена**: ${rec.priceRaw || `${rec.price} ₽`} за 250 г\n` +
                `• **Способы заваривания**: ${rec.brewingMethods.join(', ')}\n\n` +
                `${rec.shortDescription} Сорт доступен для заказа в нашем магазине Vibe Coffee!`;
            }

            // Добавляем примечание для источника Web
            if (source === 'Web') {
              if (!answerText.includes('Примечание:')) {
                answerText += `\n\n${EXTERNAL_SOURCE_NOTE}`;
              }
            } else {
              answerText = answerText.replace(/\n\n📌 \*Примечание: этот ответ найден в интернете[\s\S]*?\*$/g, '').trim();
            }

            return {
              answer: answerText,
              source,
              category,
              recommendedProductId: recId,
              hasRecommendation: hasRec,
              recommendationReason: recReason,
              isOffTopic: false,
              modelUsed: candidateModel,
            };
          } catch (jsonErr) {
            console.log('[LLM] Non-JSON response, using deterministic fallback');
            return fallbackProcess(cleanedQuestion, offerDecision, relevantFaq, webSearch.summary);
          }
        }
      } catch (apiErr: any) {
        const isQuota = isQuotaOrRateLimited(apiErr);
        const isUnavailable = is503OrUnavailable(apiErr);

        if (isQuota || isUnavailable) {
          console.log(`[LLM] Model "${candidateModel}" hit limit/503. Trying next candidate...`);
        } else {
          console.log(`[LLM] Model "${candidateModel}" error:`, apiErr?.message || apiErr);
        }

        if (i < modelsToTry.length - 1) {
          continue;
        }
      }
    }
  }

  // Детерминированный fallback при недоступности API
  return fallbackProcess(cleanedQuestion, offerDecision, relevantFaq, webSearch.summary);
}

/**
 * Детерминированный fallback, строго повторяющий 4 шага:
 * 1. Проверка на кофе (уже пройдена до вызова)
 * 2. Предложение сорта из VibeCoffeeItems (если уместно)
 * 3. Ответ из VibeCoffeeFAQ (если есть точный ответ)
 * 4. Ответ из интернета (веб-поиск)
 */
function fallbackProcess(
  question: string,
  offerDecision: { shouldOffer: boolean; matchedCoffee: CoffeeItem | null; reason: string; isAllVarietiesOverview?: boolean },
  relevantFaq: FaqItem | null,
  webSummary: string
): LlmConsultantResult {
  // Шаг 2: Предложение кофе из VibeCoffeeItems
  if (offerDecision.shouldOffer && offerDecision.matchedCoffee) {
    const rec = offerDecision.matchedCoffee;
    let answer = '';

    if (offerDecision.isAllVarietiesOverview) {
      const itemsList = getAllCoffeeItems()
        .map(
          (item, idx) =>
            `${idx + 1}. **«${item.name}»** (${item.priceRaw || `${item.price} ₽`} за 250 г, ${item.country})\n` +
            `   • Вкусовой профиль: ${item.tasteProfile}\n` +
            `   • Обжарка: ${item.roastName}\n` +
            `   • Способы заваривания: ${item.brewingMethods.join(', ')}`
        )
        .join('\n\n');

      answer =
        `В нашем магазине **Vibe Coffee** представлены следующие сорта 100% свежеобжаренной арабики из каталога VibeCoffeItems:\n\n` +
        `${itemsList}\n\n` +
        `🌟 В качестве флагманского сорта рекомендуем попробовать **«${rec.name}»** (${rec.country}) — ${rec.shortDescription}\n\n` +
        `Все эти сорта доступны для заказа в нашем магазине! С удовольствием помогу подобрать сорт под ваш любимый способ заваривания или вкусовые предпочтения.`;
    } else {
      answer =
        `На основе вашего запроса (${offerDecision.reason}) рекомендую сорт **«${rec.name}»** (страна — **${rec.country}**).\n\n` +
        `• **Вкусовой профиль**: ${rec.tasteProfile}\n` +
        `• **Обжарка**: ${rec.roastName}\n` +
        `• **Цена**: ${rec.priceRaw || `${rec.price} ₽`} за 250 г\n` +
        `• **Способы заваривания**: ${rec.brewingMethods.join(', ')}\n\n` +
        `${rec.shortDescription} Сорт доступен для заказа в нашем магазине Vibe Coffee!`;
    }

    return {
      answer,
      source: 'Google Sheets',
      category: 'подбор кофе',
      recommendedProductId: rec.id,
      hasRecommendation: true,
      recommendationReason: offerDecision.reason,
      isOffTopic: false,
      modelUsed: 'Таблица VibeCoffeItems',
    };
  }

  // Шаг 3: Ответ из VibeCoffeeFAQ
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

  // Шаг 4: Поиск ответа в интернете (веб-поиск)
  const cat = question.toLowerCase().includes('заварив') || question.toLowerCase().includes('варить')
    ? 'приготовление'
    : 'другое';

  let webAnswer = '';
  if (webSummary && webSummary.trim().length > 0) {
    webAnswer = `${webSummary.trim()}\n\n${EXTERNAL_SOURCE_NOTE}`;
  } else {
    webAnswer = `По информации из открытых кофейных источников по вопросу «${question}»:\nДля приготовления сбалансированного напитка используйте чистую фильтрованную воду (TDS 75–120 ppm, 91–94°C), соотношение кофе и воды 1:16 и свежемолотое зерно подходящей для выбранного метода фракции помола.\n\n${EXTERNAL_SOURCE_NOTE}`;
  }

  return {
    answer: webAnswer,
    source: 'Web',
    category: cat,
    recommendedProductId: null,
    hasRecommendation: false,
    isOffTopic: false,
    modelUsed: 'Интернет (веб-поиск)',
  };
}
