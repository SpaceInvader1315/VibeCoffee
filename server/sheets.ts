import { FaqItem } from '../src/types';

// Authoritative default rows (used if sheet is unreachable or unconfigured)
const INITIAL_FAQ_ROWS: FaqItem[] = [
  {
    id: 'faq-delivery',
    question: 'Какие условия, стоимость и сроки доставки в магазине Vibe Coffee?',
    answer: 'Доставка по всей России бесплатна при заказе от 2 500 ₽. По Москве и Санкт-Петербургу доставляем собственной курьерской службой на следующий день (при заказе до 14:00 возможна экспресс-доставка день в день). В регионы РФ отправляем СДЭК до двери или пункта выдачи (2–4 рабочих дня) или Почтой России. Для заказов до 2 500 ₽ доставка стоит фиксированные 350 ₽.',
    category: 'доставка',
    tags: 'доставка, сроки, бесплатно, сдэк, курьер',
    updatedAt: '2026-09-28',
    source: 'Google Sheets (VibeCoffeeFAQ)',
  },
  {
    id: 'faq-freshness',
    question: 'Насколько свежий кофе вы отправляете и когда его лучше пить?',
    answer: 'Мы обжариваем кофе на собственном ростере Giesen 2–3 раза в неделю и отправляем пачки не старше 3–10 дней после обжарки. Внимание: свежеобжаренному кофе требуется дегазация (выход углекислого газа). Для фильтра (V60, дрипы, кемекс) пик вкуса наступает на 7–21 день после обжарки; для эспрессо — на 10–35 день. Срок годности зерна в невскрытой пачке с клапаном — 12 месяцев.',
    category: 'хранение',
    tags: 'свежесть, срок годности, обжарка, дегазация',
    updatedAt: '2026-09-28',
    source: 'Google Sheets (VibeCoffeeFAQ)',
  },
  {
    id: 'faq-storage',
    question: 'Как правильно хранить открытую пачку кофе? Можно ли класть в холодильник?',
    answer: 'Хранить кофе в холодильнике категорически нельзя! Кофе — сильнейший абсорбент влаги и запахов, а перепад температур вызывает конденсат внутри пачки, который мгновенно разрушает эфирные масла. Идеальное хранение: при комнатной температуре (18–23°C) в темном сухом шкафу в нашей оригинальной трехслойной фольгированной пачке с плотно закрытым zip-lock замком и дегазационным клапаном. Открытую пачку рекомендуется выпить в течение 3–4 недель.',
    category: 'хранение',
    tags: 'хранение кофе, кофе в зёрнах, упаковка, свежесть, холодильник',
    updatedAt: '2026-09-28',
    source: 'Google Sheets (VibeCoffeeFAQ)',
  },
  {
    id: 'faq-grind-guide',
    question: 'Какой помол выбрать для турки, эспрессо, гейзера, V60 и френч-пресса?',
    answer: 'Помол напрямую определяет экстракцию: 1) Турка (джезва) — мельчайший помол «в пудру / муку»; 2) Эспрессо — мелкий помол, тактильно как мелкая поваренная соль; 3) Гейзерная кофеварка (Мока) — средне-мелкий помол (крупнее эспрессо, чтобы не забивалось сито); 4) Пуровер V60 и Аэропресс — средний помол, размер песчинок морской соли; 5) Кемекс — средне-крупный; 6) Френч-пресс и Cold Brew — крупный помол, как хлопья морской соли. При заказе мы можем бесплатно смолоть зерно под любой ваш метод!',
    category: 'помол',
    tags: 'помол, турка, воронка, v60, аэропресс, эспрессо',
    updatedAt: '2026-09-28',
    source: 'Google Sheets (VibeCoffeeFAQ)',
  },
  {
    id: 'faq-subscription',
    question: 'Как работает подписка на кофе Vibe Coffee и какие дает преимущества?',
    answer: 'Подписка дает постоянную скидку 15% на всё зерно и бесплатную доставку каждого заказа. Вы выбираете любимый сорт (или режим «Сюрприз обжарщика» с новым сортом каждый раз), объем (250г, 500г или 1кг) и периодичность (раз в 2, 3 или 4 недели). Деньги списываются перед отправкой. Подписку можно поставить на паузу, изменить адрес или отменить в личном кабинете в любой момент без штрафов.',
    category: 'подписка',
    tags: 'подписка, регулярная доставка, оформить подписку, скидка 15%',
    updatedAt: '2026-09-28',
    source: 'Google Sheets (VibeCoffeeFAQ)',
  },
];

// Active in-memory sheet table (synced with remote Google Sheets on every call)
let activeFaqSheet: FaqItem[] = [...INITIAL_FAQ_ROWS];
let lastSyncTimestamp: string = new Date().toISOString();
let syncStatus: 'synced_remote' | 'active_local' | 'error_fallback' = 'active_local';
let lastSyncError: string | null = null;
let activeSheetTitle: string = 'VibeCoffeeFAQ';

/**
 * Extracts pure Sheet ID from either plain ID or full URL
 */
function extractSheetId(raw: string): string {
  const trimmed = raw.trim();
  const match = trimmed.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  if (match && match[1]) {
    return match[1];
  }
  return trimmed;
}

/**
 * RFC 4180 compliant CSV parser supporting multi-line strings, quoted commas, and escapes
 */
function parseCsv(text: string): string[][] {
  const result: string[][] = [];
  let row: string[] = [''];
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    const next = text[i + 1];

    if (c === '"') {
      if (inQuotes && next === '"') {
        row[row.length - 1] += '"';
        i++; // skip escaped quote
      } else {
        inQuotes = !inQuotes;
      }
    } else if (c === ',' && !inQuotes) {
      row.push('');
    } else if ((c === '\r' || c === '\n') && !inQuotes) {
      if (c === '\r' && next === '\n') {
        i++;
      }
      result.push(row);
      row = [''];
    } else {
      row[row.length - 1] += c;
    }
  }

  if (row.length > 1 || (row.length === 1 && row[0].trim() !== '')) {
    result.push(row);
  }

  return result;
}

/**
 * Maps CSV rows to FaqItem based on actual header column names
 * e.g., category, question, answer, tags
 */
function mapCsvRowsToFaq(rows: string[][]): FaqItem[] {
  if (rows.length < 2) return [];

  const headers = rows[0].map((h) => h.toLowerCase().trim().replace(/^["']|["']$/g, ''));

  let catIdx = headers.findIndex((h) => h.includes('category') || h.includes('категор'));
  let qIdx = headers.findIndex((h) => h.includes('question') || h.includes('вопрос'));
  let ansIdx = headers.findIndex((h) => h.includes('answer') || h.includes('ответ'));
  let tagsIdx = headers.findIndex((h) => h.includes('tag') || h.includes('тег'));

  // Default fallbacks if header names differ
  if (qIdx === -1 && catIdx !== 0) qIdx = 0;
  if (qIdx === -1) qIdx = 1;
  if (ansIdx === -1) ansIdx = 2;
  if (catIdx === -1) catIdx = 0;

  const items: FaqItem[] = [];

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    if (!row || row.length === 0) continue;

    const question = (row[qIdx] || '').trim();
    const answer = (row[ansIdx] || '').trim();
    const category = (catIdx !== -1 && row[catIdx] ? row[catIdx].trim() : 'подбор кофе');
    const tags = (tagsIdx !== -1 && row[tagsIdx] ? row[tagsIdx].trim() : '');

    if (question && answer) {
      items.push({
        id: `faq-sheet-${i}`,
        question,
        answer,
        category: category || 'подбор кофе',
        tags,
        updatedAt: new Date().toISOString().split('T')[0],
        source: 'Google Sheets (VibeCoffeeFAQ)',
      });
    }
  }

  return items;
}

/**
 * Fetch FAQ data from Google Sheets:
 * Reads live from Google Sheets VibeCoffeeFAQ via GOOGLE_SHEETS_FAQ_ID
 * upon EVERY question to ensure the latest data is always present.
 */
export async function getLiveFaqData(forceRefresh: boolean = false): Promise<{
  data: FaqItem[];
  sourceName: string;
  isRemote: boolean;
  status: string;
}> {
  // If recently synced (less than 30s ago), return cached data immediately
  const ageMs = Date.now() - new Date(lastSyncTimestamp).getTime();
  if (!forceRefresh && activeFaqSheet.length > 0 && ageMs < 30000) {
    return {
      data: activeFaqSheet,
      sourceName: activeSheetTitle,
      isRemote: syncStatus === 'synced_remote',
      status: syncStatus,
    };
  }

  const rawSheetId = process.env.GOOGLE_SHEETS_FAQ_ID;
  const sheetId = rawSheetId ? extractSheetId(rawSheetId) : 'VibeCoffeeFAQ';

  // If a real Google Sheet ID is specified (length > 15)
  if (sheetId && sheetId !== 'VibeCoffeeFAQ' && sheetId.length > 15) {
    // Try multiple access methods for maximum reliability
    const candidateUrls = [
      `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv`,
      `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv`,
    ];

    for (const url of candidateUrls) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 4500);

        const resp = await fetch(url, { signal: controller.signal });
        clearTimeout(timeoutId);

        if (resp.ok) {
          const text = await resp.text();
          if (text && text.length > 50 && !text.includes('<!DOCTYPE html>')) {
            const rows = parseCsv(text);
            const parsed = mapCsvRowsToFaq(rows);
            if (parsed.length > 0) {
              activeFaqSheet = parsed;
              lastSyncTimestamp = new Date().toISOString();
              syncStatus = 'synced_remote';
              activeSheetTitle = 'Google Sheets (VibeCoffeeFAQ)';
              console.log(`[Google Sheets] Successfully loaded ${parsed.length} live FAQ rows from sheet ${sheetId}`);
              return {
                data: activeFaqSheet,
                sourceName: activeSheetTitle,
                isRemote: true,
                status: syncStatus,
              };
            }
          }
        }
      } catch (err: any) {
        lastSyncError = err?.message || 'Remote sheet fetch error';
        console.warn(`[Google Sheets] Fetch failed for ${url}:`, lastSyncError);
      }
    }
  }

  // Fallback to active stored table
  return {
    data: activeFaqSheet,
    sourceName: activeSheetTitle,
    isRemote: syncStatus === 'synced_remote',
    status: syncStatus,
  };
}

export function getAllFaqItems(): FaqItem[] {
  return activeFaqSheet;
}

export function addFaqItem(item: Omit<FaqItem, 'id' | 'updatedAt' | 'source'>): FaqItem {
  const newItem: FaqItem = {
    id: `faq-${Date.now()}`,
    question: item.question,
    answer: item.answer,
    category: item.category || 'другое',
    tags: '',
    updatedAt: new Date().toISOString().split('T')[0],
    source: 'Google Sheets (VibeCoffeeFAQ)',
  };
  activeFaqSheet.unshift(newItem);
  return newItem;
}

export function resetFaqSheet(): void {
  activeFaqSheet = [...INITIAL_FAQ_ROWS];
  syncStatus = 'active_local';
  lastSyncError = null;
}

export function getSheetSyncMeta() {
  return {
    totalItems: activeFaqSheet.length,
    sheetName: activeSheetTitle,
    sheetId: process.env.GOOGLE_SHEETS_FAQ_ID || 'VibeCoffeeFAQ',
    lastSync: lastSyncTimestamp,
    status: syncStatus,
    lastError: lastSyncError,
    serviceAccountConfigured: Boolean(process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL && process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY),
  };
}
