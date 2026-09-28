import { JWT } from 'google-auth-library';
import { Product } from '../src/types';

export const VIBE_COFFEE_ITEMS_SHEET_ID = '1VynuGR-LVzYYfLHtMqlWTvPUpZoaskWp_kNF7Z7TgM8';

export interface VibeCoffeeItemRow {
  name: string;
  country: string;
  flavorProfile: string;
  price: string;
  link?: string;
}

// Fallback baseline items from VibeCoffeItems sheet (1VynuGR-LVzYYfLHtMqlWTvPUpZoaskWp_kNF7Z7TgM8)
const DEFAULT_COFFEE_ITEMS: Product[] = [
  {
    id: 'ethiopia-yirgacheffe',
    name: 'Эфиопия Иргачеффе',
    subtitle: 'Specialty 100% Арабика · Эфиопия',
    category: 'beans',
    categoryLabel: 'Зерновой кофе',
    price: 890,
    rating: 4.9,
    reviewsCount: 142,
    shortDescription: 'Жасмин, бергамот, лимон, персик; яркая кислотность, лёгкое тело.',
    fullDescription: 'Изысканный микролот из легендарного региона Иргачеффе (Эфиопия). В букете раскрываются тонкие цветочные ноты жасмина, освежающий бергамот, лимон и сочный персик с искрящейся яркой кислотностью и легким чайным телом.',
    origin: 'Эфиопия',
    flavorNotes: ['Жасмин', 'Бергамот', 'Лимон', 'Персик'],
    acidity: 5,
    density: 2,
    sweetness: 4,
    roastLevel: 2,
    roastName: 'Светлая обжарка (под фильтр)',
    brewingMethods: ['V60', 'Кемекс', 'Аэропресс', 'Чашка'],
    image: 'https://images.unsplash.com/photo-1587734195503-904fca47e0e9?auto=format&fit=crop&w=800&q=80',
    inStock: true,
    weight: '250 г',
  },
  {
    id: 'colombia-huila',
    name: 'Колумбия Уила',
    subtitle: 'Specialty 100% Арабика · Колумбия',
    category: 'beans',
    categoryLabel: 'Зерновой кофе',
    price: 790,
    rating: 4.8,
    reviewsCount: 98,
    shortDescription: 'Красные ягоды, карамель, молочный шоколад; умеренная кислотность, среднее тело.',
    fullDescription: 'Классический сбалансированный колумбийский кофе из региона Уила. Сочетает сочные ноты спелых красных ягод, обволакивающую карамель и мягкий молочный шоколад. Идеален на каждый день.',
    origin: 'Колумбия',
    flavorNotes: ['Красные ягоды', 'Карамель', 'Молочный шоколад'],
    acidity: 3,
    density: 3,
    sweetness: 4,
    roastLevel: 3,
    roastName: 'Средняя обжарка (Omni)',
    brewingMethods: ['Эспрессо', 'Гейзер', 'V60', 'Френч-пресс', 'Автомат'],
    image: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?auto=format&fit=crop&w=800&q=80',
    inStock: true,
    weight: '250 г',
  },
  {
    id: 'brazil-sul-de-minas',
    name: 'Бразилия Суль-де-Минас',
    subtitle: 'Specialty 100% Арабика · Бразилия',
    category: 'beans',
    categoryLabel: 'Зерновой кофе',
    price: 720,
    rating: 4.7,
    reviewsCount: 215,
    shortDescription: 'Шоколад, фундук, карамель; низкая кислотность, плотное тело.',
    fullDescription: 'Плотный, сладкий и бархатистый кофе натуральной обработки из региона Суль-де-Минас. Глубокие оттенки десертного шоколада, жареного лесного ореха (фундука) и сливочной карамели. Практически без кислотности.',
    origin: 'Бразилия',
    flavorNotes: ['Шоколад', 'Фундук', 'Карамель'],
    acidity: 1,
    density: 5,
    sweetness: 4,
    roastLevel: 4,
    roastName: 'Средне-темная обжарка (под эспрессо)',
    brewingMethods: ['Эспрессо', 'Гейзер (Мока)', 'Турка', 'Кофемашина', 'С молоком'],
    image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80',
    inStock: true,
    weight: '250 г',
  },
  {
    id: 'kenya-aa',
    name: 'Кения AA',
    subtitle: 'Specialty 100% Арабика · Кения',
    category: 'beans',
    categoryLabel: 'Зерновой кофе',
    price: 950,
    rating: 4.9,
    reviewsCount: 67,
    shortDescription: 'Чёрная смородина, грейпфрут, красные ягоды; высокая кислотность, сочное тело.',
    fullDescription: 'Выдающийся кенийский грейд AA с ярчайшим терруарным профилем: спелая черная смородина, розовый грейпфрут и сочные красные ягоды. Взрывная сочная кислотность и комплексный многослойный вкус.',
    origin: 'Кения',
    flavorNotes: ['Чёрная смородина', 'Грейпфрут', 'Красные ягоды'],
    acidity: 5,
    density: 4,
    sweetness: 4,
    roastLevel: 2,
    roastName: 'Светлая обжарка (под фильтр)',
    brewingMethods: ['V60', 'Кемекс', 'Cold Brew', 'Аэропресс'],
    image: 'https://images.unsplash.com/photo-1611854779393-1b2da9d400fe?auto=format&fit=crop&w=800&q=80',
    inStock: true,
    weight: '250 г',
  },
  {
    id: 'guatemala-antigua',
    name: 'Гватемала Антигуа',
    subtitle: 'Specialty 100% Арабика · Гватемала',
    category: 'beans',
    categoryLabel: 'Зерновой кофе',
    price: 820,
    rating: 4.8,
    reviewsCount: 84,
    shortDescription: 'Какао, карамель, орехи, красное яблоко; умеренная кислотность, плотное тело.',
    fullDescription: 'Вулканический терруар долины Антигуа дарит кофе богатый аромат какао-бобов, жареных орехов и карамели со свежей ноткой хрустящего красного яблока. Плотное кремовое тело и чистый баланс.',
    origin: 'Гватемала',
    flavorNotes: ['Какао', 'Карамель', 'Орехи', 'Красное яблоко'],
    acidity: 3,
    density: 4,
    sweetness: 4,
    roastLevel: 3,
    roastName: 'Средняя обжарка',
    brewingMethods: ['V60', 'Аэропресс', 'Эспрессо', 'Френч-пресс'],
    image: 'https://images.unsplash.com/photo-1511920170033-f8396924c348?auto=format&fit=crop&w=800&q=80',
    inStock: true,
    weight: '250 г',
  },
  {
    id: 'costa-rica-tarrazu',
    name: 'Коста-Рика Тарразу',
    subtitle: 'Specialty 100% Арабика · Коста-Рика',
    category: 'beans',
    categoryLabel: 'Зерновой кофе',
    price: 850,
    rating: 4.8,
    reviewsCount: 56,
    shortDescription: 'Красное яблоко, мёд, цитрус, карамель; средняя кислотность, чистое тело.',
    fullDescription: 'Высокогорный микролот из региона Тарразу. Отличается кристальной чистотой чашки, медовой сладостью, деликатными цитрусовыми нотами и оттенком спелого красного яблока.',
    origin: 'Коста-Рика',
    flavorNotes: ['Красное яблоко', 'Мёд', 'Цитрус', 'Карамель'],
    acidity: 3,
    density: 3,
    sweetness: 5,
    roastLevel: 2,
    roastName: 'Светло-средняя обжарка',
    brewingMethods: ['V60', 'Кемекс', 'Фильтр', 'Аэропресс'],
    image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=800&q=80',
    inStock: true,
    weight: '250 г',
  },
  {
    id: 'chocolate-blend',
    name: 'Бразилия + Колумбия «Шоколадный блэнд»',
    subtitle: 'Specialty авторский блэнд 100% Арабики',
    category: 'beans',
    categoryLabel: 'Зерновой кофе',
    price: 690,
    rating: 4.9,
    reviewsCount: 310,
    shortDescription: 'Тёмный шоколад, карамель, фундук; низкая кислотность, насыщенное тело.',
    fullDescription: 'Фирменный блэнд от обжарщиков Vibe Coffee. Идеальное сочетание сладости колумбийского зерна и плотного орехово-шоколадного тела бразильской арабики. Превосходно в эспрессо, гейзере и молочных напитках.',
    origin: 'Бразилия / Колумбия',
    flavorNotes: ['Тёмный шоколад', 'Карамель', 'Фундук'],
    acidity: 1,
    density: 5,
    sweetness: 4,
    roastLevel: 4,
    roastName: 'Эспрессо обжарка (под молоко и чистый эспрессо)',
    brewingMethods: ['Эспрессо', 'Гейзер', 'Капучино / Латте', 'Турка', 'Автоматическая кофемашина'],
    image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80',
    inStock: true,
    weight: '250 г',
  },
];

// Equipment and accessories to complement the store
const EQUIPMENT_ITEMS: Product[] = [
  {
    id: 'timemore-c3-esp-pro',
    name: 'Ручная кофемолка Timemore Chestnut C3 ESP Pro',
    subtitle: 'Конические стальные жернова S2C 660 · Складная ручка',
    category: 'equipment',
    categoryLabel: 'Оборудование',
    price: 6490,
    rating: 5.0,
    reviewsCount: 89,
    shortDescription: 'Премиальная ручная кофемолка с микро-кликами для тончайшей настройки помола от турки до френч-пресса.',
    fullDescription: 'Оснащена запатентованными 38-мм жерновами Spike-to-Cut (S2C 660) из стали SUS420. Микро-шаг настройки 0.0233 мм на клик.',
    flavorNotes: ['Равномерный помол', 'Минимум пыли'],
    brewingMethods: ['Турка', 'Эспрессо', 'V60', 'Аэропресс', 'Гейзер'],
    image: 'https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?auto=format&fit=crop&w=800&q=80',
    inStock: true,
    weight: '430 г',
  },
  {
    id: 'v60-ceramic-set',
    name: 'Набор V60 Dripper Ceramic 02 + Сервер 600мл',
    subtitle: 'Японская жаропрочная керамика Arita-yaki + 40 фильтров в комплекте',
    category: 'accessories',
    categoryLabel: 'Аксессуары',
    price: 2890,
    rating: 4.9,
    reviewsCount: 112,
    shortDescription: 'Классический пуровер для заваривания чистого, яркого и богатого оттенками спешелти кофе дома.',
    fullDescription: 'Спиральные ребра воронки способствуют максимальному расширению кофейного слоя.',
    flavorNotes: ['Идеальная чистота чашки', 'Контроль экстракции'],
    brewingMethods: ['V60 Пуровер'],
    image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=800&q=80',
    inStock: true,
    weight: '680 г',
  },
];

let cachedProducts: Product[] = [...DEFAULT_COFFEE_ITEMS, ...EQUIPMENT_ITEMS];
let lastItemsFetchTime = 0;
const CACHE_TTL_MS = 60 * 1000; // 1 minute

function slugify(name: string): string {
  const map: Record<string, string> = {
    'эфиопия': 'ethiopia',
    'иргачеффе': 'yirgacheffe',
    'колумбия': 'colombia',
    'уила': 'huila',
    'бразилия': 'brazil',
    'суль-де-минас': 'sul-de-minas',
    'кения': 'kenya',
    'гватемала': 'guatemala',
    'антигуа': 'antigua',
    'коста-рика': 'costa-rica',
    'тарразу': 'tarrazu',
    'шоколадный': 'chocolate',
    'блэнд': 'blend',
  };

  const lower = name.toLowerCase();
  for (const [k, v] of Object.entries(map)) {
    if (lower.includes(k)) {
      return v;
    }
  }
  return name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').slice(0, 20);
}

/**
 * Parses flavor profile text into structured flavor notes, acidity, and density
 */
function parseFlavorProfile(profile: string) {
  const parts = profile.split(';');
  const notesText = parts[0] || '';
  const descriptorText = parts[1] || '';

  const notes = notesText
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  let acidity = 3;
  const lowerDesc = descriptorText.toLowerCase();
  if (lowerDesc.includes('яркая') || lowerDesc.includes('высокая') || lowerDesc.includes('взрывная')) {
    acidity = 5;
  } else if (lowerDesc.includes('низкая') || lowerDesc.includes('практически без')) {
    acidity = 1;
  } else if (lowerDesc.includes('умеренная') || lowerDesc.includes('средняя')) {
    acidity = 3;
  }

  let density = 3;
  if (lowerDesc.includes('плотное') || lowerDesc.includes('насыщенное')) {
    density = 5;
  } else if (lowerDesc.includes('лёгкое') || lowerDesc.includes('легкое') || lowerDesc.includes('чайное')) {
    density = 2;
  } else if (lowerDesc.includes('сочное') || lowerDesc.includes('чистое') || lowerDesc.includes('среднее')) {
    density = 3;
  }

  return { notes, acidity, density, description: descriptorText.trim() };
}

/**
 * Loads coffee items directly from Google Sheet VibeCoffeItems (1VynuGR-LVzYYfLHtMqlWTvPUpZoaskWp_kNF7Z7TgM8)
 */
export async function getLiveCoffeeItems(): Promise<Product[]> {
  const now = Date.now();
  if (now - lastItemsFetchTime < CACHE_TTL_MS && cachedProducts.length > 0) {
    return cachedProducts;
  }

  const sheetId = VIBE_COFFEE_ITEMS_SHEET_ID;

  try {
    const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
    let key = (process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY || '').replace(/\\n/g, '\n');

    let rows: string[][] = [];

    if (email && key) {
      const jwt = new JWT({
        email,
        key,
        scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
      });
      const token = (await jwt.getAccessToken())?.token;

      if (token) {
        const res = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/Sheet1!A1:E20`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.ok) {
          const data = await res.json();
          rows = data.values || [];
        }
      }
    }

    // Fallback to CSV export if service account didn't return rows
    if (rows.length === 0) {
      const csvRes = await fetch(`https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv`);
      if (csvRes.ok) {
        const text = await csvRes.text();
        const lines = text.split('\n').filter((l) => l.trim().length > 0);
        rows = lines.map((line) => line.split(',').map((cell) => cell.replace(/^"|"$/g, '').trim()));
      }
    }

    if (rows.length > 1) {
      // Find header indices
      const headerRow = rows[0].map((h) => h.toLowerCase());
      const nameIdx = headerRow.findIndex((h) => h.includes('название') || h.includes('сорт') || h.includes('name'));
      const countryIdx = headerRow.findIndex((h) => h.includes('страна') || h.includes('country'));
      const profileIdx = headerRow.findIndex((h) => h.includes('вкус') || h.includes('профиль') || h.includes('flavor'));
      const priceIdx = headerRow.findIndex((h) => h.includes('цена') || h.includes('price'));
      const linkIdx = headerRow.findIndex((h) => h.includes('ссылка') || h.includes('link'));

      const loadedItems: Product[] = [];

      for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        const name = row[nameIdx !== -1 ? nameIdx : 0]?.trim();
        if (!name) continue;

        const country = row[countryIdx !== -1 ? countryIdx : 1]?.trim() || '';
        const flavorProfile = row[profileIdx !== -1 ? profileIdx : 2]?.trim() || '';
        const rawPrice = row[priceIdx !== -1 ? priceIdx : 3]?.trim() || '790';
        const numPrice = parseInt(rawPrice.replace(/[^\d]/g, ''), 10) || 790;
        const link = row[linkIdx !== -1 ? linkIdx : 4]?.trim();

        const { notes, acidity, density, description } = parseFlavorProfile(flavorProfile);

        // Find existing image or fallback
        const existing = DEFAULT_COFFEE_ITEMS.find((d) => d.name.toLowerCase() === name.toLowerCase()) ||
          DEFAULT_COFFEE_ITEMS.find((d) => name.toLowerCase().includes(d.name.toLowerCase()) || d.name.toLowerCase().includes(name.toLowerCase()));

        const id = existing?.id || slugify(name);

        loadedItems.push({
          id,
          name,
          subtitle: `Specialty 100% Арабика · ${country}`,
          category: 'beans',
          categoryLabel: 'Зерновой кофе',
          price: numPrice,
          rating: existing?.rating || 4.8,
          reviewsCount: existing?.reviewsCount || 100,
          shortDescription: flavorProfile,
          fullDescription: `Свежеобжаренный спешелти кофе «${name}» из страны ${country}. Вкусовой профиль: ${flavorProfile}. Доставка в день обжарки.`,
          origin: country,
          flavorNotes: notes.length > 0 ? notes : (existing?.flavorNotes || ['Спелые ягоды', 'Карамель']),
          acidity,
          density,
          sweetness: existing?.sweetness || 4,
          roastLevel: existing?.roastLevel || (acidity >= 4 ? 2 : acidity === 1 ? 4 : 3),
          roastName: existing?.roastName || (acidity >= 4 ? 'Светлая обжарка (фильтр)' : acidity === 1 ? 'Темная обжарка (эспрессо)' : 'Средняя обжарка (omni)'),
          brewingMethods: existing?.brewingMethods || ['V60', 'Эспрессо', 'Гейзер', 'Чашка'],
          image: existing?.image || 'https://images.unsplash.com/photo-1587734195503-904fca47e0e9?auto=format&fit=crop&w=800&q=80',
          inStock: true,
          weight: '250 г',
        });
      }

      if (loadedItems.length > 0) {
        cachedProducts = [...loadedItems, ...EQUIPMENT_ITEMS];
        lastItemsFetchTime = now;
        console.log(`[VibeCoffeItems] Successfully loaded ${loadedItems.length} coffee items from Google Sheet!`);
        return cachedProducts;
      }
    }
  } catch (err: any) {
    console.warn('[VibeCoffeItems] Error fetching live items, using defaults:', err?.message || err);
  }

  return cachedProducts;
}

/**
 * Check if the user is explicitly requesting a recommendation or stating flavor preferences.
 * "Просто так не рекомендуй - пользователь должен сам попросить рекомендацию или явно назвать свои предпочтения, тогда нужно рекомендовать, если есть совпадения"
 */
export function hasExplicitRecommendationIntent(query: string): boolean {
  const q = query.toLowerCase().trim();

  // Explicit recommendation request phrases
  const recommendationTriggers = [
    'посоветуй',
    'порекомендуй',
    'что посоветуешь',
    'что порекомендуешь',
    'что выбрать',
    'какой кофе выбрать',
    'какой сорт выбрать',
    'какой кофе взять',
    'какой сорт взять',
    'какой кофе лучше',
    'помоги выбрать',
    'подбери кофе',
    'подскажи кофе',
    'подскажи сорт',
    'хочу выбрать',
    'рекомендаци',
  ];

  for (const trigger of recommendationTriggers) {
    if (q.includes(trigger)) {
      return true;
    }
  }

  // Explicit flavor preference statement phrases
  const flavorPreferenceTriggers = [
    'люблю кофе с',
    'люблю с кислинк',
    'люблю без кислинк',
    'люблю сладкий',
    'люблю плотный',
    'люблю темный',
    'люблю шоколад',
    'люблю ягод',
    'люблю фруктов',
    'люблю цитрус',
    'люблю орех',
    'предпочитаю',
    'хочу кофе с',
    'хочу кофе без',
    'хочу кислый',
    'хочу не кислый',
    'хочу с кислинкой',
    'хочу без кислинки',
    'хочу шоколадный',
    'хочу ягодный',
    'хочу фруктовый',
    'хочу цветочный',
    'хочу ореховый',
    'нравится кофе с',
    'нравится кислинк',
    'нравится без кислинк',
    'нравятся ягод',
    'нравится шоколад',
    'ищу кофе с',
    'ищу сорт с',
  ];

  for (const trigger of flavorPreferenceTriggers) {
    if (q.includes(trigger)) {
      return true;
    }
  }

  return false;
}

/**
 * Matches user flavor preferences against the items in VibeCoffeItems.
 * Returns the best matching product, or null if no genuine match.
 */
export function matchCoffeeByPreferences(query: string, items: Product[]): Product | null {
  const q = query.toLowerCase();
  const coffeeOnly = items.filter((p) => p.category === 'beans');

  let bestMatch: Product | null = null;
  let bestScore = 0;

  for (const item of coffeeOnly) {
    let score = 0;
    const nameLower = item.name.toLowerCase();
    const originLower = (item.origin || '').toLowerCase();
    const descLower = item.shortDescription.toLowerCase();

    // Check origin / country
    if (originLower && q.includes(originLower)) score += 5;
    if (nameLower.includes('эфиопия') && q.includes('эфиоп')) score += 5;
    if (nameLower.includes('колумбия') && q.includes('колумб')) score += 5;
    if (nameLower.includes('бразилия') && q.includes('бразил')) score += 5;
    if (nameLower.includes('кения') && q.includes('кени')) score += 5;
    if (nameLower.includes('гватемала') && q.includes('гватемал')) score += 5;
    if (nameLower.includes('коста-рика') && (q.includes('коста') || q.includes('рике') || q.includes('рику'))) score += 5;

    // Check acidity preferences
    if (q.includes('без кислинк') || q.includes('не кисл') || q.includes('минимум кислоты') || q.includes('низкая кислотность')) {
      if (item.acidity && item.acidity <= 2) score += 6;
      if (item.acidity && item.acidity >= 4) score -= 10;
    } else if (q.includes('с кислинк') || q.includes('яркая кислотность') || q.includes('кисленький') || q.includes('сочный') || q.includes('высокая кислотность')) {
      if (item.acidity && item.acidity >= 4) score += 6;
      if (item.acidity && item.acidity <= 2) score -= 10;
    }

    // Check body / density preferences
    if (q.includes('плотный') || q.includes('насыщенный') || q.includes('густой') || q.includes('тяжелое тело')) {
      if (item.density && item.density >= 4) score += 4;
    } else if (q.includes('легкий') || q.includes('лёгкий') || q.includes('чайный') || q.includes('тонкий')) {
      if (item.density && item.density <= 2) score += 4;
    }

    // Check flavor notes
    const flavorKeywords: Record<string, string[]> = {
      'шоколад': ['шоколад', 'какао', 'бразилия', 'блэнд'],
      'орех': ['орех', 'фундук', 'бразилия', 'гватемала'],
      'карамел': ['карамель', 'колумбия', 'гватемала', 'бразилия'],
      'ягод': ['ягод', 'смородин', 'черник', 'кения', 'колумбия'],
      'смородин': ['смородин', 'кения'],
      'цитрус': ['цитрус', 'лимон', 'грейпфрут', 'эфиопия', 'кения', 'коста-рика'],
      'жасмин': ['жасмин', 'эфиопия'],
      'цвет': ['жасмин', 'эфиопия', 'цветоч'],
      'персик': ['персик', 'эфиопия'],
      'яблок': ['яблоко', 'гватемала', 'коста-рика'],
      'мед': ['мёд', 'мед', 'коста-рика'],
    };

    for (const [key, related] of Object.entries(flavorKeywords)) {
      if (q.includes(key)) {
        for (const note of item.flavorNotes) {
          if (note.toLowerCase().includes(key)) {
            score += 4;
          }
        }
        if (descLower.includes(key)) score += 3;
      }
    }

    if (score > bestScore) {
      bestScore = score;
      bestMatch = item;
    }
  }

  // Only return a match if there is genuine relevance (score >= 3)
  return bestScore >= 3 ? bestMatch : null;
}
