import { Router, Request, Response } from 'express';
import { getLiveFaqData, getAllFaqItems, addFaqItem, resetFaqSheet, getSheetSyncMeta } from './sheets';
import { getFullCatalog, getProductById, getRandomProduct } from './catalog';
import { getLiveCoffeeItems, getAllCoffeeItems, getCoffeeItemsSyncMeta } from './coffeeItems';
import { generateConsultantResponse, getActiveModelName, getCandidateModels } from './llm';
import { logQuestionAnswer, getAllLogs, clearAllLogs, getLiveLogs, getLogsSyncMeta } from './logger';
import { AskQuestionResponse } from '../src/types';

export const apiRouter = Router();

/**
 * Main Question-Answering Endpoint:
 * 1. Получить вопрос пользователя.
 * 2. Зафиксировать время начала обработки.
 * 3. Загрузить актуальные данные из Google Sheets:
 *    - База знаний магазина (VibeCoffeeFAQ)
 *    - Таблица товаров магазина (VibeCoffeItems ID: 1VynuGR-LVzYYfLHtMqlWTvPUpZoaskWp_kNF7Z7TgM8)
 * 4. Принять решение через LLM:
 *    - Если пользователь сам попросил рекомендацию или явно назвал вкусовые предпочтения:
 *      подобрать и рекомендовать конкретный кофе из VibeCoffeItems.
 *    - Просто так НЕ рекомендовать кофе (если вопрос общий - ответить без навязывания товара).
 * 5. Записать результат в аудит-лог VibeCoffeeLogs.
 * 6. Вернуть ответ frontend.
 */
apiRouter.post('/chat', async (req: Request, res: Response) => {
  const startTime = Date.now();
  const { question } = req.body || {};

  if (!question || typeof question !== 'string' || question.trim().length === 0) {
    res.status(400).json({ error: 'Вопрос не может быть пустым' });
    return;
  }

  try {
    // 3. Загрузить актуальные данные из обеих Google-таблиц
    const [{ data: faqItems }, { data: coffeeItems }] = await Promise.all([
      getLiveFaqData(),
      getLiveCoffeeItems(),
    ]);

    // 4. Обработка вопроса через LLM со строгими правилами рекомендаций
    const result = await generateConsultantResponse(question, faqItems, coffeeItems);

    // 5. Продолжительность обработки
    const durationMs = Date.now() - startTime;
    const duration = `${durationMs} ms`;

    // 6. Получить данные о рекомендуемом товаре ТОЛЬКО если есть рекомендация
    let recommendedProduct = null;
    if (result.recommendedProductId) {
      recommendedProduct = getProductById(result.recommendedProductId) || null;
    }

    // 7. Асинхронная запись в VibeCoffeeLogs (non-blocking)
    const logId = `log-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    logQuestionAnswer({
      question,
      answer: result.answer,
      source: result.source,
      duration,
      category: result.category,
      recommendedProductId: recommendedProduct?.id || undefined,
      recommendedProductName: recommendedProduct ? recommendedProduct.name : '— (без рекомендации)',
      modelUsed: result.modelUsed || 'VibeCoffeItems + FAQ',
    }).catch((logErr) => {
      console.warn('[Logger] Error recording log (non-fatal):', logErr);
    });

    // 8. Вернуть ответ клиенту
    const responsePayload: AskQuestionResponse = {
      answer: result.answer,
      source: result.source,
      duration,
      durationMs,
      category: result.category,
      recommendedProductId: result.recommendedProductId,
      recommendedProduct,
      hasRecommendation: Boolean(result.hasRecommendation && recommendedProduct),
      recommendationReason: result.recommendationReason,
      isOffTopic: result.isOffTopic,
      logged: true,
      logId,
      modelUsed: result.modelUsed || 'VibeCoffeItems + FAQ',
    };

    res.json(responsePayload);
  } catch (error: any) {
    console.error('[API /chat] Unexpected error:', error);
    const durationMs = Date.now() - startTime;

    res.status(200).json({
      answer:
        'Извините, произошла кратковременная задержка при обращении к базе знаний магазина. Наши бариста на связи: вы можете повторить вопрос или назвать свои вкусовые предпочтения для рекомендации сортов из таблицы VibeCoffeItems!',
      source: 'Knowledge Base',
      duration: `${durationMs} ms`,
      durationMs,
      category: 'другое',
      recommendedProductId: null,
      recommendedProduct: null,
      hasRecommendation: false,
      isOffTopic: false,
      logged: false,
      modelUsed: 'Резервная база знаний (при 503)',
    });
  }
});

/**
 * Google Sheet VibeCoffeItems Endpoints (ID: 1VynuGR-LVzYYfLHtMqlWTvPUpZoaskWp_kNF7Z7TgM8)
 */
apiRouter.get('/coffee-items', async (_req: Request, res: Response) => {
  const { data, sourceName, isRemote, status } = await getLiveCoffeeItems();
  const meta = getCoffeeItemsSyncMeta();
  res.json({
    items: data,
    total: data.length,
    source: sourceName,
    isRemote,
    status,
    meta,
  });
});

/**
 * Catalog Endpoints
 */
apiRouter.get('/catalog', (_req: Request, res: Response) => {
  const products = getFullCatalog();
  res.json({
    products,
    total: products.length,
  });
});

apiRouter.get('/catalog/random', (req: Request, res: Response) => {
  const excludeId = req.query.exclude as string | undefined;
  const product = getRandomProduct(excludeId);
  res.json(product);
});

apiRouter.get('/catalog/:id', (req: Request, res: Response) => {
  const product = getProductById(req.params.id);
  if (!product) {
    res.status(404).json({ error: 'Товар не найден' });
    return;
  }
  res.json(product);
});

/**
 * Google Sheets FAQ Endpoints (VibeCoffeeFAQ)
 */
apiRouter.get('/faq', async (_req: Request, res: Response) => {
  const faqData = await getLiveFaqData();
  const meta = getSheetSyncMeta();
  res.json({
    items: faqData.data,
    source: faqData.sourceName,
    meta,
  });
});

apiRouter.post('/faq', (req: Request, res: Response) => {
  const { question, answer, category } = req.body || {};
  if (!question || !answer) {
    res.status(400).json({ error: 'Требуется вопрос и ответ' });
    return;
  }
  const created = addFaqItem({ question, answer, category });
  res.status(201).json(created);
});

apiRouter.post('/faq/reset', (_req: Request, res: Response) => {
  resetFaqSheet();
  res.json({ success: true, items: getAllFaqItems() });
});

/**
 * Google Sheets Logs Endpoints (VibeCoffeeLogs)
 */
apiRouter.get('/logs', async (_req: Request, res: Response) => {
  const result = await getLiveLogs();
  const meta = getLogsSyncMeta();
  res.json({
    logs: result.logs,
    total: result.total,
    sheetName: result.sheetName,
    remoteSynced: result.remoteSynced,
    meta,
  });
});

apiRouter.post('/logs/clear', (_req: Request, res: Response) => {
  clearAllLogs();
  res.json({ success: true, message: 'Логи очищены' });
});

/**
 * System Status
 */
apiRouter.get('/status', async (_req: Request, res: Response) => {
  const faqMeta = getSheetSyncMeta();
  const logsMeta = getLogsSyncMeta();
  const coffeeItemsMeta = getCoffeeItemsSyncMeta();
  res.json({
    status: 'online',
    storeName: 'Vibe Coffee',
    time: new Date().toISOString(),
    geminiConfigured: Boolean(process.env.GEMINI_API_KEY),
    activeModel: getActiveModelName(),
    candidateModels: getCandidateModels(),
    faqSheet: faqMeta,
    logsSheet: logsMeta,
    coffeeItemsSheet: coffeeItemsMeta,
  });
});
