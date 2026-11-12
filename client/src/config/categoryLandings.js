// Category landing pages (/kategoriya/:slug and /ru/kategoriya/:slug).
// One source for the React pages and for scripts/generate-seo-pages.mjs, so the
// page Google reads before JavaScript and the page a visitor sees say the same thing.
// `match` holds the exact product.category values the admin uses for this group.
import { slugify } from '../utils/productUrl.js';

const SERVICE_UZ = 'Toshkent bo‘ylab shu kuni bepul yetkazamiz. Kiyimni uyda kiyib ko‘rasiz va faqat yoqqanini olasiz, to‘lov naqd, yetkazilganda. Mos kelmasa, 14 kun ichida qaytarish mumkin.';
const SERVICE_RU = 'Доставляем по Ташкенту в тот же день, бесплатно. Вы примеряете вещь дома и оплачиваете только то, что оставляете, наличными при получении. Если не подошло, вернуть можно в течение 14 дней.';

export const CATEGORY_LANDINGS = [
  {
    slug: 'palto-plash',
    match: ['Palto plash'],
    uz: {
      name: 'Paltolar va plashlar',
      title: 'Ayollar paltosi va plashi Toshkentda | Luxx.uz',
      h1: 'Ayollar paltolari va plashlari',
      description: 'Ayollar uchun premium palto va plashlar: jun, klassik va oversize fasonlar. Toshkent bo‘ylab shu kuni yetkazish, uyda kiyib ko‘rib to‘lash.',
      intro: [
        'Yaxshi palto bir mavsumga emas, bir necha yilga olinadi. Shuning uchun bu bo‘limda faqat mato, bichim va tikuvi bilan o‘zini oqlaydigan modellar turadi: ofisga ham, kechki chiqishga ham yarashadigan klassik paltolar va kuz-bahor uchun yengil plashlar.',
        'Palto tanlashda yelka chizig‘iga qarang: tikuv yelkangiz tugaydigan joyda tursa, palto o‘lchamingiz. Ichiga qalin trikotaj kiysangiz, bir o‘lcham kattasini oling. Uzunlik bo‘yingizga qarab: past bo‘yli ayollarga tizzagacha, baland bo‘yliga to‘piqqa yaqin model yarashadi.',
        SERVICE_UZ,
      ],
    },
    ru: {
      name: 'Пальто и плащи',
      title: 'Женские пальто и плащи в Ташкенте | Luxx.uz',
      h1: 'Женские пальто и плащи',
      description: 'Премиальные женские пальто и плащи: шерсть, классика и oversize. Доставка по Ташкенту в тот же день, примерка дома.',
      intro: [
        'Хорошее пальто покупают не на один сезон, а на несколько лет. Поэтому здесь только модели, которые оправдывают себя тканью, кроем и пошивом: классические пальто, уместные и в офисе, и вечером, и лёгкие плащи на осень и весну.',
        'При выборе смотрите на линию плеча: если шов заканчивается там, где заканчивается ваше плечо, размер ваш. Если планируете носить под пальто плотный трикотаж, берите на размер больше. Длину выбирайте по росту: невысоким идёт длина до колена, высоким — почти до щиколотки.',
        SERVICE_RU,
      ],
    },
  },
  {
    slug: 'kastyum-shim',
    match: ['Kastyum shim'],
    uz: {
      name: 'Shimli kostyumlar',
      title: 'Ayollar shimli kostyumi Toshkentda | Luxx.uz',
      h1: 'Ayollar uchun shimli kostyumlar',
      description: 'Ofis va tadbirlar uchun premium shimli kostyumlar: blazer va shim to‘plamlari. Toshkent bo‘ylab shu kuni yetkazish.',
      intro: [
        'Shimli kostyum — ayol garderobidagi eng ishonchli kiyim. Uni muzokaraga ham, kechki uchrashuvga ham kiyish mumkin: blazer bilan to‘liq kiysangiz rasmiy, shimni oddiy futbolka bilan kiysangiz erkin ko‘rinadi.',
        'O‘lchamni blazerga qarab tanlang, shim keyin moslashtiriladi. Blazer tugmalangan holda ko‘krak va belda tortilmasligi, yeng uchi bilak suyagida tugashi kerak. Keng shimlar baland poshna bilan, tor shimlar esa loafer yoki tuflidan yaxshi ko‘rinadi.',
        SERVICE_UZ,
      ],
    },
    ru: {
      name: 'Брючные костюмы',
      title: 'Женские брючные костюмы в Ташкенте | Luxx.uz',
      h1: 'Женские брючные костюмы',
      description: 'Премиальные брючные костюмы для офиса и мероприятий: комплекты из блейзера и брюк. Доставка по Ташкенту в тот же день.',
      intro: [
        'Брючный костюм — самая надёжная вещь в женском гардеробе. Его можно надеть и на переговоры, и на вечернюю встречу: целиком с блейзером он выглядит официально, а брюки с простой футболкой — свободно.',
        'Размер выбирайте по блейзеру. В застёгнутом виде он не должен тянуть на груди и в талии, а рукав должен заканчиваться на косточке запястья. Широкие брюки лучше смотрятся с каблуком, узкие — с лоферами или туфлями.',
        SERVICE_RU,
      ],
    },
  },
  {
    slug: 'kastyum-yubka',
    match: ['Kastyum yubka'],
    uz: {
      name: 'Yubkali kostyumlar',
      title: 'Ayollar yubkali kostyumi Toshkentda | Luxx.uz',
      h1: 'Ayollar uchun yubkali kostyumlar',
      description: 'Kechki va rasmiy tadbirlar uchun premium yubkali kostyumlar. Toshkent bo‘ylab shu kuni yetkazish, uyda kiyib ko‘rib to‘lash.',
      intro: [
        'Yubkali kostyum to‘y, bayram va rasmiy tadbirlarda o‘zini eng yaxshi ko‘rsatadi. Bir xil matodan tikilgan jaket va yubka obrazni yaxlit qiladi, qo‘shimcha aksessuar talab qilmaydi.',
        'Yubka uzunligini oldindan o‘ylang: tizzadan sal pastroq uzunlik deyarli hamma tadbirga mos keladi. Jaketni yelkasiga qarab tanlang va uni yechib ham kiyish mumkinligini tekshiring — ostidagi top yoki bluzka alohida ham chiroyli turishi kerak.',
        SERVICE_UZ,
      ],
    },
    ru: {
      name: 'Костюмы с юбкой',
      title: 'Женские костюмы с юбкой в Ташкенте | Luxx.uz',
      h1: 'Женские костюмы с юбкой',
      description: 'Премиальные костюмы с юбкой для вечерних и официальных мероприятий. Доставка по Ташкенту в тот же день, примерка дома.',
      intro: [
        'Костюм с юбкой лучше всего показывает себя на свадьбах, праздниках и официальных мероприятиях. Жакет и юбка из одной ткани делают образ цельным и не требуют лишних аксессуаров.',
        'Продумайте длину юбки заранее: чуть ниже колена подходит почти к любому событию. Жакет выбирайте по плечам и проверьте, как образ смотрится без него — топ или блузка под ним должны выглядеть самостоятельно.',
        SERVICE_RU,
      ],
    },
  },
  {
    slug: 'dvoyka-troyka',
    match: ['Dvoyka va troyka'],
    uz: {
      name: 'Dvoyka va troykalar',
      title: 'Ayollar dvoyka va troykasi Toshkentda | Luxx.uz',
      h1: 'Ayollar uchun dvoyka va troykalar',
      description: 'Bir-biriga mos jaket, shim va yubkadan iborat premium to‘plamlar. Toshkent bo‘ylab shu kuni yetkazish, uyda kiyib ko‘rib to‘lash.',
      intro: [
        'Dvoyka va troyka — bir-biriga mos kiyimlardan tuzilgan tayyor to‘plam. Ularning afzalligi shundaki, har bir qismini alohida kiyib, bitta to‘plamdan bir necha xil obraz yasash mumkin.',
        'Tanlashda avval qaysi qismini ko‘proq kiyishingizni o‘ylang. Jaketni ofisga, shimni har kunga kiymoqchi bo‘lsangiz, ikkalasi ham o‘lchamingizga aniq tushishi kerak. Printli jaketni oddiy qora shim bilan kiysangiz, obraz og‘ir ko‘rinmaydi.',
        SERVICE_UZ,
      ],
    },
    ru: {
      name: 'Двойки и тройки',
      title: 'Женские двойки и тройки в Ташкенте | Luxx.uz',
      h1: 'Женские двойки и тройки',
      description: 'Премиальные комплекты из жакета, брюк и юбки. Доставка по Ташкенту в тот же день, примерка дома.',
      intro: [
        'Двойка и тройка — готовый комплект из вещей, которые подходят друг другу. Их преимущество в том, что каждую часть можно носить отдельно и собрать из одного комплекта несколько образов.',
        'При выборе подумайте, какую часть будете носить чаще. Если жакет — в офис, а брюки — каждый день, обе вещи должны точно сидеть по размеру. Жакет с принтом с простыми чёрными брюками не выглядит тяжело.',
        SERVICE_RU,
      ],
    },
  },
];

const normalise = (value) => String(value || '').trim().toLowerCase();

// A missing department (empty category name) falls back to the full catalogue.
export const categoryPath = (landing, language = 'uz') =>
  `${language === 'ru' ? '/ru' : ''}${landing?.slug ? `/kategoriya/${landing.slug}` : '/products'}`;

// A product category the admin adds later still gets a page, with plain generic copy.
const genericLanding = (categoryName) => ({
  slug: slugify(categoryName),
  match: [categoryName],
  generic: true,
  uz: {
    name: categoryName,
    title: `${categoryName} — ayollar kiyimlari Toshkentda | Luxx.uz`,
    h1: categoryName,
    description: `Luxx.uz katalogidagi ${categoryName.toLowerCase()} modellari. Toshkent bo‘ylab shu kuni yetkazish, uyda kiyib ko‘rib to‘lash.`,
    intro: [SERVICE_UZ],
  },
  ru: {
    name: categoryName,
    title: `${categoryName} — женская одежда в Ташкенте | Luxx.uz`,
    h1: categoryName,
    description: `Модели из раздела «${categoryName}» в каталоге Luxx.uz. Доставка по Ташкенту в тот же день, примерка дома.`,
    intro: [SERVICE_RU],
  },
});

export const landingForCategory = (categoryName) => {
  if (!normalise(categoryName)) return null;
  return CATEGORY_LANDINGS.find((landing) => landing.match.some((name) => normalise(name) === normalise(categoryName)))
    || genericLanding(String(categoryName).trim());
};

export const productsInLanding = (landing, products = []) =>
  products.filter((product) => landing.match.some((name) => normalise(name) === normalise(product.category)));

// Every landing that has products, curated first, in a stable order.
export const landingsForProducts = (products = []) => {
  const seen = new Map();
  products.forEach((product) => {
    const landing = landingForCategory(product.category);
    if (landing && !seen.has(landing.slug)) seen.set(landing.slug, landing);
  });
  const curatedOrder = CATEGORY_LANDINGS.map((landing) => landing.slug);
  return [...seen.values()].sort((a, b) => {
    const ai = curatedOrder.indexOf(a.slug);
    const bi = curatedOrder.indexOf(b.slug);
    return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi) || a.slug.localeCompare(b.slug);
  });
};

// Resolves /kategoriya/:slug against curated pages first, then live product categories.
export const resolveLanding = (slug, products = []) => {
  const curated = CATEGORY_LANDINGS.find((landing) => landing.slug === slug);
  if (curated) return curated;
  const product = products.find((item) => item.category && slugify(item.category) === slug);
  return product ? landingForCategory(product.category) : null;
};
