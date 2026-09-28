import { Product } from '../src/types';
import { getAllCoffeeItems, coffeeItemToProduct } from './coffeeItems';

// Static accessories and equipment
const EQUIPMENT_AND_ACCESSORIES: Product[] = [
  {
    id: 'drip-vibe-mix-box',
    name: 'Дрип-пакеты «Vibe Mix Box» (10 шт)',
    subtitle: 'Ассорти из 5 сортов арабики · В азотной среде',
    category: 'drip',
    categoryLabel: 'Дрип-кофе',
    price: 890,
    originalPrice: 990,
    rating: 4.9,
    reviewsCount: 184,
    shortDescription: 'Натуральный кофе свежего помола в удобных японских дрип-пакетах. Нужна только кружка и кипяток.',
    fullDescription: 'В наборе 10 дрип-пакетов из сортов таблицы VibeCoffeItems: Эфиопия, Колумбия, Кения, Гватемала и Коста-Рика. Индивидуальный фольгированный сашет с газозамещением азотом.',
    roastLevel: 2,
    roastName: 'Светлая обжарка под фильтр',
    flavorNotes: ['Ягоды', 'Цитрусы', 'Шоколад', 'Желтые фрукты'],
    brewingMethods: ['В чашке с горячей водой (92–95°C)'],
    image: 'https://images.unsplash.com/photo-1511920170033-f8396924c348?auto=format&fit=crop&w=800&q=80',
    inStock: true,
    weight: '10 шт × 11 г',
  },
  {
    id: 'timemore-c3-esp-pro',
    name: 'Ручная кофемолка Timemore Chestnut C3 ESP Pro',
    subtitle: 'Конические стальные жернова S2C 660 · Складная ручка',
    category: 'equipment',
    categoryLabel: 'Оборудование',
    price: 6490,
    originalPrice: 7200,
    rating: 5.0,
    reviewsCount: 89,
    shortDescription: 'Премиальная ручная кофемолка с микро-кликами для тончайшей настройки помола от турки до френч-пресса.',
    fullDescription: 'Оснащена запатентованными 38-мм жерновами Spike-to-Cut (S2C 660) из стали SUS420. Микро-шаг настройки 0.0233 мм на клик.',
    flavorNotes: ['Равномерный помол', 'Минимум пыли', 'Долговечность 10+ лет'],
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
    shortDescription: 'Классический пуровер для заваривания чистого, яркого и богатого оттенками кофе дома.',
    fullDescription: 'Спиральные ребра воронки способствуют максимальному расширению кофейного слоя и плавному выходу углекислого газа. Сервер из боросиликатного термостойкого стекла.',
    flavorNotes: ['Идеальная чистота чашки', 'Контроль экстракции', 'Японский дизайн'],
    brewingMethods: ['V60 Пуровер'],
    image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=800&q=80',
    inStock: true,
    weight: '680 г',
  },
  {
    id: 'vibe-smart-scale-pro',
    name: 'Кофейные весы Vibe Scale Pro с таймером',
    subtitle: 'Точность 0.1 г · Автозапуск таймера · Силиконовый коврик',
    category: 'equipment',
    categoryLabel: 'Оборудование',
    price: 3200,
    originalPrice: 3800,
    rating: 4.8,
    reviewsCount: 76,
    shortDescription: 'Компактные электронные весы со скрытым LED-дисплеем и умным режимом распознавания начала пролива.',
    fullDescription: 'Созданы специально для бариста и домашних энтузиастов. Автоматический режим tare и старт таймера при падении первой капли.',
    flavorNotes: ['Высокая скорость отклика 10 мс', 'Влагозащищенная панель', 'Зарядка Type-C'],
    brewingMethods: ['V60', 'Эспрессо', 'Аэропресс', 'Кемекс'],
    image: 'https://images.unsplash.com/photo-1541167760496-1628856ab772?auto=format&fit=crop&w=800&q=80',
    inStock: true,
    weight: '280 г',
  },
  {
    id: 'gooseneck-kettle-800',
    name: 'Чайник с гусиным носиком Vibe Barista 800мл',
    subtitle: 'Нержавеющая сталь AISI 304 · Встроенный термометр',
    category: 'accessories',
    categoryLabel: 'Аксессуары',
    price: 3750,
    rating: 4.8,
    reviewsCount: 54,
    shortDescription: 'Идеальный ламинарный поток воды под углом 90° для филигранного контроля пролива пуровера.',
    fullDescription: 'Тонкий гусиный носик изогнутой формы позволяет наливать воду тончайшей контролируемой струей. В крышку встроен термометр.',
    flavorNotes: ['Идеальный контроль струи', 'Эргономичная ненагревающаяся ручка'],
    brewingMethods: ['V60', 'Кемекс', 'Аэропресс'],
    image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80',
    inStock: true,
    weight: '520 г',
  },
];

/**
 * Returns dynamic product catalog where coffee beans strictly reflect
 * items from Google Sheet VibeCoffeItems.
 */
export function getFullCatalog(): Product[] {
  const coffeeItems = getAllCoffeeItems();
  const coffeeProducts = coffeeItems.map(coffeeItemToProduct);
  return [...coffeeProducts, ...EQUIPMENT_AND_ACCESSORIES];
}

export const COFFEE_CATALOG: Product[] = getFullCatalog();

export function getProductById(id: string): Product | undefined {
  const catalog = getFullCatalog();
  // Exact match or slug match
  return catalog.find((p) => p.id === id || p.id.replace(/-/g, '') === id.replace(/-/g, ''));
}

export function getRandomProduct(excludeId?: string): Product {
  const catalog = getFullCatalog();
  const filtered = excludeId ? catalog.filter((p) => p.id !== excludeId) : catalog;
  const pool = filtered.length > 0 ? filtered : catalog;
  const index = Math.floor(Math.random() * pool.length);
  return pool[index];
}

export function searchProducts(query: string): Product[] {
  const q = query.toLowerCase();
  return getFullCatalog().filter(
    (p) =>
      p.name.toLowerCase().includes(q) ||
      p.shortDescription.toLowerCase().includes(q) ||
      p.flavorNotes.some((n) => n.toLowerCase().includes(q)) ||
      p.brewingMethods.some((b) => b.toLowerCase().includes(q)) ||
      p.categoryLabel.toLowerCase().includes(q)
  );
}
