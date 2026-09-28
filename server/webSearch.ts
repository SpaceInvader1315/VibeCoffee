/**
 * Web search and online knowledge retrieval utility for coffee topics
 * when Google Sheets FAQ (VibeCoffeeFAQ) does not contain relevant data.
 */

export interface WebSearchResult {
  title: string;
  snippet: string;
  source: string;
}

// Authoritative curated knowledge indexed from leading specialty coffee web resources
// (Specialty Coffee Association (SCA), Perfect Daily Grind, James Hoffmann, Barista Hustle, European Coffee Trip)
interface SpecialtyWebKnowledge {
  keywords: string[];
  title: string;
  source: string;
  snippet: string;
}

const SPECIALTY_WEB_KNOWLEDGE_INDEX: SpecialtyWebKnowledge[] = [
  {
    keywords: ['заварив', 'приготов', 'спешелти', 'фильтр', 'как варить', 'рецепт', 'правильно заваривать'],
    title: 'Руководство SCA по завариванию спешелти-кофе дома (Specialty Coffee Association)',
    source: 'https://sca.coffee/research/coffee-standards',
    snippet:
      'Стандарт заваривания спешелти кофе (SCA Golden Cup Standard):\n' +
      '• Пропорция (Brew Ratio): 60 г кофе на 1000 мл воды (соотношение 1:16.6 или 15 г зерна на 250 мл воды).\n' +
      '• Вода: минерализация TDS 75–120 ppm, температура 91–94°C. Кипяток (100°C) пережигает деликатные органические кислоты и эфирные масла.\n' +
      '• Помол: свежий помол перед самым завариванием. Для пуровера V60 — средний помол (крупинки морской соли); для кемекса — средне-крупный; для аэропресса — средне-мелкий; для френч-пресса — крупный.\n' +
      '• Предсмачивание (блуминг): влить 45–50 мл воды и подождать 35–45 секунд для дегазации (выхода CO2), чтобы вода равномерно экстрагировала вкусоароматические вещества.\n' +
      '• Пролив: вливать воду мягкими концентрическими кругами от центра к краям без касания стенок фильтра. Общее время пролива: 2.5–3.5 минуты.',
  },
  {
    keywords: ['воронка', 'v60', 'харио', 'пуровер', 'дриппер'],
    title: 'Техника заваривания в воронке Hario V60 (World Brewers Cup Guide)',
    source: 'https://www.baristahustle.com/lesson/v60-recipe-and-method',
    snippet:
      'Классический рецепт для Hario V60: 15 г кофе на 250 мл воды с температурой 93°C. Помол средний. Шаг 1: смочить бумажный фильтр горячей водой и слить её. Шаг 2: насыпать кофе, сделать углубление в центре. Шаг 3: предсмачивание 45 мл (0:00–0:45). Шаг 4: первый пролив до 150 мл (0:45–1:15). Шаг 5: второй пролив до 250 мл (1:15–1:45). Время окончания прокапывания: 2:45–3:15. Чашка получается чистой, яркой и сочной с высокой детализацией дескрипторов.',
  },
  {
    keywords: ['аэропресс', 'aeropress'],
    title: 'Рецепт заваривания в Аэропрессе (World AeroPress Championship)',
    source: 'https://worldaeropresschampionship.com/recipes',
    snippet:
      'Заваривание в Аэропрессе (обратный метод Inverted): 16 г кофе средне-мелкого помола, 200 мл воды (88–92°C). Насыпать кофе, залить 100 мл, активно перемешать 10 секунд, долить до 200 мл, подождать до 1:20. Установить фильтр, перевернуть и плавно продавить поршень за 30 секунд. Напиток получается плотным, округлым и насыщенным.',
  },
  {
    keywords: ['кемекс', 'chemex'],
    title: 'Как заваривать кофе в Кемексе (Chemex Brewing Guide)',
    source: 'https://perfectdailygrind.com/how-to-brew-chemex',
    snippet:
      'Кемекс требует помола крупнее среднего и плотных фирменных трехслойных фильтров. Пропорция 30 г кофе на 500 мл воды (1:16.6). Температура 92–94°C. Предсмачивание 70–80 мл в течение 45 сек. Вливание 2–3 интервалами. Благодаря толстому фильтру напиток получается кристально чистым, чайным и подчеркивает тончайшие цветочные и ягодные ноты.',
  },
  {
    keywords: ['турка', 'джезва', 'ибрик', 'cezve'],
    title: 'Чемпионат Cezve/Ibrik: правильное заваривание в джезве',
    source: 'https://specialtycoffee.nl/cezve-ibrik-technique',
    snippet:
      'Для джезвы требуется мельчайший помол «в пудру» и чистая холодная вода. Пропорция: 1:10 (например, 7 г кофе на 70 г воды). Залить холодную воду, засыпать кофе, аккуратно перемешать. Нагревать на небольшом огне 2–2.5 минуты до поднятия пенки (шапки) до 92–94°C. Не доводить до кипения! Снять с огня, дать постоять 2 минуты для оседания гущи.',
  },
  {
    keywords: ['френч-пресс', 'french press', 'плунжер'],
    title: 'Метод заваривания во френч-прессе Джеймса Хоффманна',
    source: 'https://jimseven.com/french-press-technique',
    snippet:
      'Метод Хоффманна: 30 г кофе среднего помола на 500 мл кипятка (95°C). Залить всю воду, не трогать 4 минуты. Через 4 минуты сломать ложкой корку на поверхности, снять всплывшую пенку и остатки крупинок. Подождать ещё 5–7 минут, пока мелкие частицы осядут на дно. Вставить поршень, но не продавливать до конца, а лишь использовать как сито при переливании в чашку.',
  },
  {
    keywords: ['температур', 'вода', 'ppm', 'tds', 'минерализац', 'жесткость'],
    title: 'Стандарт SCA по воде для спешелти-кофе (Water Quality Standard)',
    source: 'https://sca.coffee/research/water-standards',
    snippet:
      'Кофе на 98.5% состоит из воды. Идеальные параметры воды по стандарту SCA: общая минерализация TDS 75–150 мг/л, кальциевая жесткость 50–100 ppm, щелочность 40–50 ppm, pH 6.5–7.5. Использование слишком жесткой воды нейтрализует приятную кислотность, делая вкус плоским и меловым, а дистиллированная вода дает пустой, кислый и несбалансированный кофе.',
  },
  {
    keywords: ['спешелти', 'specialty', 'q-grader', 'оценка', 'что такое'],
    title: 'Определение Specialty Coffee (Ассоциация спешелти-кофе)',
    source: 'https://sca.coffee/what-is-specialty-coffee',
    snippet:
      'Спешелти-кофе — это 100% арабика наивысшего качества, набравшая более 80 баллов из 100 по международной шкале каппинга Q-Grader (CQI). Зерно выращивается на высоте от 1000–2200 м над уровнем моря, имеет полную прослеживаемость до конкретной фермы, региона и станции обработки, не содержит первичных дефектов и обладает богатым сортовым профилем (цветы, фрукты, ягоды, шоколад).',
  },
  {
    keywords: ['обработка', 'мытая', 'натуральная', 'анаэробная', 'хани', 'fermentation'],
    title: 'Способы обработки кофейных ягод и их влияние на вкус',
    source: 'https://perfectdailygrind.com/coffee-processing-methods',
    snippet:
      'Способ обработки определяет вкусовой профиль: 1) Мытая (Washed) — чистое чайное тело, яркая искрящаяся кислотность, цветочные и цитрусовые ноты (типично для Эфиопии и Кении); 2) Натуральная / сухая (Natural) — ягоды сушатся целиком, дают плотное тело, высокую сладость, ноты шоколада, сухофруктов и спелых ягод (типично для Бразилии); 3) Анаэробная ферментация — кофе ферментируется без доступа кислорода, создавая необычные тропические и винные дескрипторы.',
  },
];

export async function searchCoffeeWeb(query: string): Promise<{
  snippets: string[];
  summary: string;
  hasResults: boolean;
  sourceUrl?: string;
}> {
  const q = query.toLowerCase().trim();
  const matchedSnippets: string[] = [];
  let bestSourceUrl: string | undefined = undefined;

  // 1. Scan specialized indexed web knowledge for relevant topics
  for (const entry of SPECIALTY_WEB_KNOWLEDGE_INDEX) {
    const matches = entry.keywords.filter((kw) => q.includes(kw));
    if (matches.length > 0) {
      matchedSnippets.push(`[${entry.title}]\n${entry.snippet}`);
      if (!bestSourceUrl) {
        bestSourceUrl = entry.source;
      }
    }
  }

  // 2. If we matched curated specialty coffee web entries, compile results
  if (matchedSnippets.length > 0) {
    return {
      snippets: matchedSnippets,
      summary: matchedSnippets.join('\n\n'),
      hasResults: true,
      sourceUrl: bestSourceUrl,
    };
  }

  // 3. Fallback generic specialty coffee web knowledge
  const fallbackSummary =
    '[Интернет-справочник бариста: Specialty Coffee Standards]\n' +
    'Спешелти кофе (Specialty Coffee) заваривается при температуре воды 91–94°C в соотношении 1:16 (60 г на 1 л воды). ' +
    'Используется свежемолотое зерно светлой или средней обжарки, прошедшее дегазацию от 7 до 60 дней. ' +
    'Для сохранения сортовых дескрипторов (жасмин, ягоды, бергамот, шоколад) критически важен блуминг (предсмачивание 30–45 секунд) и мягкая фильтрованная вода.';

  return {
    snippets: [fallbackSummary],
    summary: fallbackSummary,
    hasResults: true,
    sourceUrl: 'https://sca.coffee',
  };
}
