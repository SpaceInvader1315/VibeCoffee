import { Product } from '../src/types';

export interface CoffeeItem {
  id: string;
  name: string; // название сорта
  country: string; // страна
  tasteProfile: string; // вкусовой профиль
  price: number; // числовая цена в рублях
  priceRaw: string; // исходная цена (например "890 ₽")
  link?: string; // ссылка
  flavorNotes: string[];
  acidityText: string;
  acidityLevel: number; // 1-5
  densityText: string;
  densityLevel: number; // 1-5
  roastName: string;
  roastLevel: number;
  brewingMethods: string[];
  image: string;
  shortDescription: string;
  fullDescription: string;
}

export const VIBE_COFFEE_ITEMS_SHEET_ID = '1VynuGR-LVzYYfLHtMqlWTvPUpZoaskWp_kNF7Z7TgM8';
export const VIBE_COFFEE_ITEMS_SHEET_NAME = 'VibeCoffeItems';

// High quality curated coffee imagery matching origin and style
const COFFEE_IMAGES: Record<string, string> = {
  'ethiopia-yirgacheffe': 'https://images.unsplash.com/photo-1587734195503-904fca47e0e9?auto=format&fit=crop&w=800&q=80',
  'colombia-huila': 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?auto=format&fit=crop&w=800&q=80',
  'brazil-sul-de-minas': 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80',
  'kenya-aa': 'https://images.unsplash.com/photo-1611854779393-1b2da9d400fe?auto=format&fit=crop&w=800&q=80',
  'guatemala-antigua': 'https://images.unsplash.com/photo-1511920170033-f8396924c348?auto=format&fit=crop&w=800&q=80',
  'costa-rica-tarrazu': 'https://images.unsplash.com/photo-1497935586351-b67a49e012bf?auto=format&fit=crop&w=800&q=80',
  'brazil-colombia-blend': 'https://images.unsplash.com/photo-1509785307050-d4066910ec1e?auto=format&fit=crop&w=800&q=80',
};

// Default fallback images
const DEFAULT_COFFEE_IMAGE = 'https://images.unsplash.com/photo-1587734195503-904fca47e0e9?auto=format&fit=crop&w=800&q=80';

// Authoritative default rows from Google Sheet VibeCoffeItems
const INITIAL_COFFEE_ITEMS: CoffeeItem[] = [
  {
    id: 'ethiopia-yirgacheffe',
    name: 'Эфиопия Иргачеффе',
    country: 'Эфиопия',
    tasteProfile: 'Жасмин, бергамот, лимон, персик; яркая кислотность, лёгкое тело',
    price: 890,
    priceRaw: '890 ₽',
    link: '',
    flavorNotes: ['Жасмин', 'Бергамот', 'Лимон', 'Персик'],
    acidityText: 'Яркая кислотность',
    acidityLevel: 4,
    densityText: 'Лёгкое тело',
    densityLevel: 2,
    roastName: 'Светлая обжарка (Filter Roast)',
    roastLevel: 2,
    brewingMethods: ['V60 (Пуровер)', 'Кемекс', 'Аэропресс', 'Капельная кофеварка'],
    image: COFFEE_IMAGES['ethiopia-yirgacheffe'],
    shortDescription: 'Легендарный сорт с цветочным ароматом жасмина, цитрусовыми нотами бергамота, лимона и сочного персика.',
    fullDescription: 'Высокогорный микролот из региона Иргачеффе. Раскрывается деликатным жасминовым чаем, сладким персиком и искрящейся лимонной кислотностью. Идеален для альтернативных способов заваривания.',
  },
  {
    id: 'colombia-huila',
    name: 'Колумбия Уила',
    country: 'Колумбия',
    tasteProfile: 'Красные ягоды, карамель, молочный шоколад; умеренная кислотность, среднее тело',
    price: 790,
    priceRaw: '790 ₽',
    link: '',
    flavorNotes: ['Красные ягоды', 'Карамель', 'Молочный шоколад'],
    acidityText: 'Умеренная кислотность',
    acidityLevel: 3,
    densityText: 'Среднее тело',
    densityLevel: 3,
    roastName: 'Средняя обжарка (Omni-Roast)',
    roastLevel: 3,
    brewingMethods: ['Эспрессо', 'Гейзерная кофеварка', 'V60', 'Френч-пресс', 'Автомат'],
    image: COFFEE_IMAGES['colombia-huila'],
    shortDescription: 'Сбалансированная чашка с карамельно-шоколадной сладостью и мягкими оттенками красных ягод.',
    fullDescription: 'Классический терруар департамента Уила на вулканических склонах Анд. Шелковистая текстура, карамель и ноты молочного шоколада гармонично дополняются ягодной сладостью.',
  },
  {
    id: 'brazil-sul-de-minas',
    name: 'Бразилия Суль-де-Минас',
    country: 'Бразилия',
    tasteProfile: 'Шоколад, фундук, карамель; низкая кислотность, плотное тело',
    price: 720,
    priceRaw: '720 ₽',
    link: '',
    flavorNotes: ['Шоколад', 'Фундук', 'Карамель'],
    acidityText: 'Низкая кислотность',
    acidityLevel: 1,
    densityText: 'Плотное тело',
    densityLevel: 5,
    roastName: 'Средне-темная под эспрессо (Espresso Roast)',
    roastLevel: 4,
    brewingMethods: ['Эспрессо', 'Турка (Джезва)', 'Гейзер (Мока)', 'Капучино / Латте'],
    image: COFFEE_IMAGES['brazil-sul-de-minas'],
    shortDescription: 'Плотный орехово-шоколадный профиль без кислинки с нотами жареного фундука и карамели.',
    fullDescription: 'Сухая натуральная обработка из южного региона штата Минас-Жерайс. Густой напиток с выраженным шоколадно-ореховым телом и бархатной пенкой крема, идеален с молоком.',
  },
  {
    id: 'kenya-aa',
    name: 'Кения AA',
    country: 'Кения',
    tasteProfile: 'Чёрная смородина, грейпфрут, красные ягоды; высокая кислотность, сочное тело',
    price: 950,
    priceRaw: '950 ₽',
    link: '',
    flavorNotes: ['Чёрная смородина', 'Грейпфрут', 'Красные ягоды'],
    acidityText: 'Высокая кислотность',
    acidityLevel: 5,
    densityText: 'Сочное тело',
    densityLevel: 4,
    roastName: 'Светлая обжарка (Filter Roast)',
    roastLevel: 2,
    brewingMethods: ['V60', 'Кемекс', 'Cold Brew', 'Аэропресс'],
    image: COFFEE_IMAGES['kenya-aa'],
    shortDescription: 'Взрывная ягодная чашка с яркими нотами спелой чёрной смородины, грейпфрута и красных ягод.',
    fullDescription: 'Отборное крупное зерно высшего кенийского грейда AA мытой обработки. Сложный комплексный букет с фирменной сочной смородиновой кислинкой и долгим освежающим цитрусовым послевкусием.',
  },
  {
    id: 'guatemala-antigua',
    name: 'Гватемала Антигуа',
    country: 'Гватемала',
    tasteProfile: 'Какао, карамель, орехи, красное яблоко; умеренная кислотность, плотное тело',
    price: 820,
    priceRaw: '820 ₽',
    link: '',
    flavorNotes: ['Какао', 'Карамель', 'Орехи', 'Красное яблоко'],
    acidityText: 'Умеренная кислотность',
    acidityLevel: 2,
    densityText: 'Плотное тело',
    densityLevel: 4,
    roastName: 'Средняя обжарка (Medium Roast)',
    roastLevel: 3,
    brewingMethods: ['Эспрессо', 'Фильтр', 'Френч-пресс', 'Гейзер'],
    image: COFFEE_IMAGES['guatemala-antigua'],
    shortDescription: 'Глубокий шоколадно-пряный вкус с теплыми нотами какао, карамели, орехов и печеного яблока.',
    fullDescription: 'Кофе из знаменитой вулканической долины Антигуа. Богатый минералами терруар дарит напитку плотное бархатистое тело, глубокий шоколадный тон и тонкую фруктовую сладость.',
  },
  {
    id: 'costa-rica-tarrazu',
    name: 'Коста-Рика Тарразу',
    country: 'Коста-Рика',
    tasteProfile: 'Красное яблоко, мёд, цитрус, карамель; средняя кислотность, чистое тело',
    price: 850,
    priceRaw: '850 ₽',
    link: '',
    flavorNotes: ['Красное яблоко', 'Мёд', 'Цитрус', 'Карамель'],
    acidityText: 'Средняя кислотность',
    acidityLevel: 3,
    densityText: 'Чистое тело',
    densityLevel: 3,
    roastName: 'Светло-средняя обжарка (Omni-Roast)',
    roastLevel: 2,
    brewingMethods: ['V60', 'Аэропресс', 'Капельная кофеварка', 'Эспрессо'],
    image: COFFEE_IMAGES['costa-rica-tarrazu'],
    shortDescription: 'Чистый медово-фруктовый профиль с оттенками спелого красного яблока, цитрусов и карамели.',
    fullDescription: 'Высокогорный регион Тарразу славится идеальным балансом сладости и сочности. Медовые переливы гармонируют с хрустящей яблочной кислинкой и легким цитрусовым финишем.',
  },
  {
    id: 'brazil-colombia-blend',
    name: 'Бразилия + Колумбия «Шоколадный блэнд»',
    country: 'Бразилия / Колумбия',
    tasteProfile: 'Тёмный шоколад, карамель, фундук; низкая кислотность, насыщенное тело',
    price: 690,
    priceRaw: '690 ₽',
    link: '',
    flavorNotes: ['Тёмный шоколад', 'Карамель', 'Фундук'],
    acidityText: 'Низкая кислотность',
    acidityLevel: 1,
    densityText: 'Насыщенное тело',
    densityLevel: 5,
    roastName: 'Темная обжарка под эспрессо (Dark Espresso)',
    roastLevel: 5,
    brewingMethods: ['Эспрессо', 'Турка', 'Гейзер', 'Капучино / Латте', 'Автоматические кофемашины'],
    image: COFFEE_IMAGES['brazil-colombia-blend'],
    shortDescription: 'Авторский купаж для плотного насыщенного кофе с нотами темного шоколада, фундука и карамели без кислинки.',
    fullDescription: 'Фирменный бленд двух ведущих кофейных держав Южной Америки. Плотное кремовое тело бразильского зерна натуральной обработки соединено с мягкой карамельной сладостью колумбийской мытой арабики.',
  },
];

let activeCoffeeItems: CoffeeItem[] = [...INITIAL_COFFEE_ITEMS];
let lastItemsSyncTimestamp: string = new Date().toISOString();
let itemsSyncStatus: 'synced_remote' | 'active_local' | 'error_fallback' = 'active_local';
let lastItemsSyncError: string | null = null;

function slugify(text: string): string {
  const map: Record<string, string> = {
    а: 'a', б: 'b', в: 'v', г: 'g', д: 'd', е: 'e', ё: 'e', ж: 'zh',
    з: 'z', и: 'i', й: 'y', к: 'k', л: 'l', м: 'm', н: 'n', о: 'o',
    п: 'p', р: 'r', с: 's', т: 't', у: 'u', ф: 'f', х: 'kh', ц: 'ts',
    ч: 'ch', ш: 'sh', щ: 'sch', ъ: '', ы: 'y', ь: '', э: 'e', ю: 'yu', я: 'ya',
  };
  return text
    .toLowerCase()
    .split('')
    .map((c) => map[c] || c)
    .join('')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * RFC 4180 compliant CSV parser
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
        i++;
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
 * Maps CSV rows from Google Sheet VibeCoffeItems
 * Headers: "название сорта","страна","вкусовой профиль","цена","ссылка"
 */
function mapCsvToCoffeeItems(rows: string[][]): CoffeeItem[] {
  if (rows.length < 2) return [];

  const headers = rows[0].map((h) => h.toLowerCase().trim().replace(/^["']|["']$/g, ''));

  let nameIdx = headers.findIndex((h) => h.includes('назван') || h.includes('сорт') || h.includes('name'));
  let countryIdx = headers.findIndex((h) => h.includes('стран') || h.includes('country'));
  let tasteIdx = headers.findIndex((h) => h.includes('вкус') || h.includes('профиль') || h.includes('taste'));
  let priceIdx = headers.findIndex((h) => h.includes('цен') || h.includes('price'));
  let linkIdx = headers.findIndex((h) => h.includes('ссылк') || h.includes('link') || h.includes('url'));

  if (nameIdx === -1) nameIdx = 0;
  if (countryIdx === -1) countryIdx = 1;
  if (tasteIdx === -1) tasteIdx = 2;
  if (priceIdx === -1) priceIdx = 3;

  const items: CoffeeItem[] = [];

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    if (!row || row.length === 0) continue;

    const name = (row[nameIdx] || '').trim();
    if (!name) continue;

    const country = (row[countryIdx] || '').trim();
    const tasteProfile = (row[tasteIdx] || '').trim();
    const priceRaw = (row[priceIdx] || '').trim();
    const link = linkIdx !== -1 && row[linkIdx] ? row[linkIdx].trim() : '';

    // Parse numeric price
    const numPrice = parseInt(priceRaw.replace(/[^0-9]/g, ''), 10) || 790;

    // Parse flavor notes & acidity/body from tasteProfile
    // Example: "Жасмин, бергамот, лимон, персик; яркая кислотность, лёгкое тело"
    const parts = tasteProfile.split(';');
    const flavorPart = parts[0] || '';
    const descPart = (parts[1] || '').toLowerCase();

    const flavorNotes = flavorPart
      .split(',')
      .map((n) => n.trim())
      .filter((n) => n.length > 0);

    let acidityText = 'Сбалансированная кислотность';
    let acidityLevel = 3;
    if (descPart.includes('яркая') || descPart.includes('высок')) {
      acidityText = 'Яркая кислотность';
      acidityLevel = descPart.includes('высок') ? 5 : 4;
    } else if (descPart.includes('низк') || descPart.includes('без кислинк')) {
      acidityText = 'Низкая кислотность';
      acidityLevel = 1;
    } else if (descPart.includes('умерен') || descPart.includes('средн')) {
      acidityText = 'Умеренная кислотность';
      acidityLevel = 3;
    }

    let densityText = 'Среднее тело';
    let densityLevel = 3;
    if (descPart.includes('плотн') || descPart.includes('насыщен')) {
      densityText = descPart.includes('насыщен') ? 'Насыщенное тело' : 'Плотное тело';
      densityLevel = descPart.includes('насыщен') ? 5 : 4;
    } else if (descPart.includes('легк') || descPart.includes('лёгк')) {
      densityText = 'Лёгкое тело';
      densityLevel = 2;
    } else if (descPart.includes('чист')) {
      densityText = 'Чистое тело';
      densityLevel = 3;
    }

    const id = slugify(name);
    const existingPreset = INITIAL_COFFEE_ITEMS.find(
      (p) => p.name.toLowerCase() === name.toLowerCase() || p.id === id
    );

    const image = COFFEE_IMAGES[id] || existingPreset?.image || DEFAULT_COFFEE_IMAGE;
    const roastName = existingPreset?.roastName || (acidityLevel >= 4 ? 'Светлая обжарка (Filter)' : acidityLevel <= 1 ? 'Под эспрессо (Espresso)' : 'Средняя обжарка (Omni-Roast)');
    const roastLevel = existingPreset?.roastLevel || (acidityLevel >= 4 ? 2 : acidityLevel <= 1 ? 4 : 3);
    const brewingMethods = existingPreset?.brewingMethods || (acidityLevel >= 4 ? ['V60', 'Кемекс', 'Аэропресс'] : ['Эспрессо', 'Гейзер', 'Френч-пресс']);

    items.push({
      id: existingPreset ? existingPreset.id : id,
      name,
      country,
      tasteProfile,
      price: numPrice,
      priceRaw: priceRaw || `${numPrice} ₽`,
      link,
      flavorNotes: flavorNotes.length > 0 ? flavorNotes : (existingPreset?.flavorNotes || ['Кофе']),
      acidityText,
      acidityLevel,
      densityText,
      densityLevel,
      roastName,
      roastLevel,
      brewingMethods,
      image,
      shortDescription: existingPreset?.shortDescription || `${country}. Вкусовой профиль: ${tasteProfile}.`,
      fullDescription: existingPreset?.fullDescription || `Свежеобжаренный спешелти кофе из ${country}. Вкусовой букет: ${tasteProfile}. Идеальный выбор для ценителей качества.`,
    });
  }

  return items;
}

/**
 * Fetch live data from Google Sheets VibeCoffeItems
 */
export async function getLiveCoffeeItems(forceRefresh: boolean = false): Promise<{
  data: CoffeeItem[];
  sourceName: string;
  isRemote: boolean;
  status: string;
}> {
  // If recently synced (less than 30s ago), return cached data immediately
  const ageMs = Date.now() - new Date(lastItemsSyncTimestamp).getTime();
  if (!forceRefresh && activeCoffeeItems.length > 0 && ageMs < 30000) {
    const sheetId = process.env.GOOGLE_SHEETS_COFFEE_ITEMS_ID || VIBE_COFFEE_ITEMS_SHEET_ID;
    return {
      data: activeCoffeeItems,
      sourceName: 'Google Sheets (VibeCoffeItems)',
      isRemote: itemsSyncStatus === 'synced_remote',
      status: itemsSyncStatus,
    };
  }

  const sheetId = process.env.GOOGLE_SHEETS_COFFEE_ITEMS_ID || VIBE_COFFEE_ITEMS_SHEET_ID;

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
        if (text && text.length > 40 && !text.includes('<!DOCTYPE html>')) {
          const rows = parseCsv(text);
          const parsed = mapCsvToCoffeeItems(rows);
          if (parsed.length > 0) {
            activeCoffeeItems = parsed;
            lastItemsSyncTimestamp = new Date().toISOString();
            itemsSyncStatus = 'synced_remote';
            lastItemsSyncError = null;
            console.log(`[Google Sheets] Successfully loaded ${parsed.length} live coffee items from VibeCoffeItems (${sheetId})`);
            return {
              data: activeCoffeeItems,
              sourceName: 'Google Sheets (VibeCoffeItems)',
              isRemote: true,
              status: itemsSyncStatus,
            };
          }
        }
      }
    } catch (err: any) {
      lastItemsSyncError = err?.message || 'Coffee items sheet fetch error';
      console.warn(`[Google Sheets VibeCoffeItems] Fetch error for ${url}:`, lastItemsSyncError);
    }
  }

  return {
    data: activeCoffeeItems,
    sourceName: 'Google Sheets (VibeCoffeItems)',
    isRemote: itemsSyncStatus === 'synced_remote',
    status: itemsSyncStatus,
  };
}

export function getAllCoffeeItems(): CoffeeItem[] {
  return activeCoffeeItems;
}

export function getCoffeeItemById(id: string): CoffeeItem | undefined {
  return activeCoffeeItems.find((c) => c.id === id);
}

/**
 * Converts a CoffeeItem to the app's standard Product representation
 */
export function coffeeItemToProduct(item: CoffeeItem): Product {
  return {
    id: item.id,
    name: item.name,
    subtitle: `Specialty 100% Арабика · ${item.country}`,
    category: 'beans',
    categoryLabel: 'Зерновой кофе (VibeCoffeItems)',
    price: item.price,
    rating: 4.9,
    reviewsCount: 110,
    shortDescription: item.shortDescription,
    fullDescription: item.fullDescription,
    origin: item.country,
    roastLevel: item.roastLevel,
    roastName: item.roastName,
    flavorNotes: item.flavorNotes,
    acidity: item.acidityLevel,
    density: item.densityLevel,
    sweetness: 4,
    brewingMethods: item.brewingMethods,
    image: item.image,
    inStock: true,
    weight: '250 г',
  };
}

/**
 * Returns formatted context string of all coffee items from VibeCoffeItems for LLM prompt
 */
export function formatCoffeeItemsForPrompt(items: CoffeeItem[]): string {
  return items
    .map(
      (item, idx) =>
        `[Сорт #${idx + 1}] ID: "${item.id}", Название: "${item.name}", Страна: "${item.country}", Вкусовой профиль: "${item.tasteProfile}", Цена: ${item.priceRaw || `${item.price} ₽`}`
    )
    .join('\n');
}

/**
 * Deterministic taste matching logic for fallback or AI validation.
 * Matches user query preferences against items from VibeCoffeItems.
 */
export function matchCoffeeByPreferences(
  query: string,
  items: CoffeeItem[] = activeCoffeeItems
): { bestMatch: CoffeeItem | null; score: number; reason: string } {
  const q = query.toLowerCase();

  let bestMatch: CoffeeItem | null = null;
  let bestScore = 0;
  let bestReason = '';

  for (const item of items) {
    let score = 0;
    const reasons: string[] = [];

    const tasteLower = item.tasteProfile.toLowerCase();
    const nameLower = item.name.toLowerCase();
    const countryLower = item.country.toLowerCase();

    // 1. Direct country match
    if (countryLower.includes('эфиопи') && (q.includes('эфиоп') || q.includes('ethiopia'))) {
      score += 20;
      reasons.push('страна Эфиопия');
    }
    if (countryLower.includes('колумби') && (q.includes('колумб') || q.includes('colombia'))) {
      score += 20;
      reasons.push('страна Колумбия');
    }
    if (countryLower.includes('бразил') && (q.includes('бразил') || q.includes('brazil'))) {
      score += 20;
      reasons.push('страна Бразилия');
    }
    if (countryLower.includes('кени') && (q.includes('кени') || q.includes('kenya'))) {
      score += 20;
      reasons.push('страна Кения');
    }
    if (countryLower.includes('гватемал') && (q.includes('гватемал') || q.includes('guatemala'))) {
      score += 20;
      reasons.push('страна Гватемала');
    }
    if (countryLower.includes('коста-рик') && (q.includes('коста') || q.includes('рир') || q.includes('costa'))) {
      score += 20;
      reasons.push('страна Коста-Рика');
    }

    // 2. Direct name match
    if (q.includes(nameLower)) {
      score += 25;
      reasons.push(`название «${item.name}»`);
    }

    // 3. Flavor keywords & descriptors matching
    for (const note of item.flavorNotes) {
      const nLower = note.toLowerCase();
      const stem = nLower.slice(0, Math.max(4, nLower.length - 2));
      if (q.includes(stem)) {
        score += 10;
        reasons.push(`нота «${note}»`);
      }
    }

    // 4. Floral notes (flowers, jasmine, tea-like)
    if (q.includes('цветоч') || q.includes('цвет') || q.includes('жасмин') || q.includes('флораль')) {
      if (item.id === 'ethiopia-yirgacheffe' || tasteLower.includes('жасмин')) {
        score += 25;
        reasons.push('цветочный профиль (жасмин)');
      }
    }

    // 5. Acidity preferences (handling "кислота", "кислоту", "кислинка", "кислый", "яркая кислотность", etc.)
    const wantsLowAcidity =
      q.includes('без кислинк') ||
      q.includes('не кисл') ||
      (q.includes('низк') && q.includes('кислот')) ||
      q.includes('без кислот') ||
      q.includes('минимум кислот');

    const wantsHighAcidity =
      !wantsLowAcidity &&
      (q.includes('кислот') || // covers кислота, кислоту, кислотность, кислотный
        q.includes('кислинк') ||
        q.includes('кисленьк') ||
        q.includes('кислый') ||
        q.includes('кислая') ||
        q.includes('сочн'));

    if (wantsLowAcidity) {
      if (item.acidityLevel <= 2) {
        score += 20;
        reasons.push('низкая кислотность (без кислинки)');
      } else {
        score -= 15;
      }
    } else if (wantsHighAcidity) {
      if (item.acidityLevel >= 4) {
        score += 20;
        reasons.push('выраженная яркая кислотность');
      } else if (item.acidityLevel <= 2) {
        score -= 15;
      }
    }

    // Combined boost: floral + acidity specifically points to Ethiopia Yirgacheffe
    if ((q.includes('цветоч') || q.includes('цвет')) && wantsHighAcidity && item.id === 'ethiopia-yirgacheffe') {
      score += 20;
      reasons.push('сочетание цветов и яркой кислотности');
    }

    // 6. Body & Texture preferences
    if (
      (q.includes('плотн') || q.includes('насыщенн') || q.includes('густ') || q.includes('крепк') || q.includes('для эспрессо') || q.includes('с молоком') || q.includes('капучино')) &&
      item.densityLevel >= 4
    ) {
      score += 15;
      reasons.push('плотное насыщенное тело');
    } else if (
      (q.includes('легк') || q.includes('лёгк') || q.includes('чайное') || q.includes('фильтр') || q.includes('пуровер') || q.includes('воронк')) &&
      item.densityLevel <= 3
    ) {
      score += 12;
      reasons.push('лёгкое чистое тело');
    }

    // 7. Sweetness preferences
    if ((q.includes('сладк') || q.includes('карамел') || q.includes('мёд') || q.includes('мед')) && (tasteLower.includes('карамель') || tasteLower.includes('мёд') || tasteLower.includes('шоколад'))) {
      score += 12;
      reasons.push('сладкий карамельный профиль');
    }

    // 8. Berry/Fruit preferences
    if ((q.includes('ягод') || q.includes('фрукт') || q.includes('смородин') || q.includes('персик') || q.includes('яблок')) && (tasteLower.includes('ягод') || tasteLower.includes('персик') || tasteLower.includes('смородин') || tasteLower.includes('яблоко'))) {
      score += 15;
      reasons.push('ягодно-фруктовые ноты');
    }

    // 9. Nut/Chocolate preferences
    if ((q.includes('шоколад') || q.includes('орех') || q.includes('фундук') || q.includes('какао')) && (tasteLower.includes('шоколад') || tasteLower.includes('фундук') || tasteLower.includes('какао') || tasteLower.includes('орехи'))) {
      score += 15;
      reasons.push('шоколадно-ореховый профиль');
    }

    if (score > bestScore) {
      bestScore = score;
      bestMatch = item;
      bestReason = reasons.join(', ');
    }
  }

  return {
    bestMatch,
    score: bestScore,
    reason: bestReason,
  };
}

export function getCoffeeItemsSyncMeta() {
  return {
    totalItems: activeCoffeeItems.length,
    sheetName: VIBE_COFFEE_ITEMS_SHEET_NAME,
    sheetId: process.env.GOOGLE_SHEETS_COFFEE_ITEMS_ID || VIBE_COFFEE_ITEMS_SHEET_ID,
    lastSync: lastItemsSyncTimestamp,
    status: itemsSyncStatus,
    lastError: lastItemsSyncError,
  };
}
