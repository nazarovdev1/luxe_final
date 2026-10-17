// Single source of truth for shop policies shown across product, checkout, FAQ and terms.
export const RETURN_DAYS = 14;
export const WARRANTY_DAYS = 30;

// Opening promotion: a crossed-out price is shown only until this moment (Tashkent time),
// unless a product carries its own saleEndsAt.
export const OPENING_SALE_ENDS_AT = '2026-12-31T23:59:59+05:00';

// Services the atelier actually provides. Alterations are not offered yet.
export const SERVICES = {
  tryOnAtHome: true,
  privateFitting: true,
  stylingConcierge: true,
  alterations: false,
};

export const DELIVERY = {
  sameDayTashkent: true,
  feeTashkent: 0,
};

export const CONTACT = {
  phone: '+998 88 429 99 69',
  phoneHref: 'tel:+998884299969',
  email: 'support@luxx.uz',
  address: "Amir Temur ko'chasi 12, Toshkent",
};

export const POLICY_COPY = {
  uz: {
    delivery: "Toshkent bo'ylab shu kuni, bepul",
    tryOn: "Uyda kiyib ko'rib, yoqsa to'laysiz",
    returns: `${RETURN_DAYS} kun ichida qaytarish`,
    payment: "To'lov yetkazilganda, naqd",
    facts: [['Shu kuni', 'yetkazib berish'], ['Uyda', "kiyib ko'rish"], [`${RETURN_DAYS} kun`, 'qaytarish']],
  },
  ru: {
    delivery: 'Доставка по Ташкенту в тот же день, бесплатно',
    tryOn: 'Примерка дома, оплата только если понравится',
    returns: `Возврат в течение ${RETURN_DAYS} дней`,
    payment: 'Оплата при получении, наличными',
    facts: [['В тот же день', 'доставка'], ['Дома', 'примерка'], [`${RETURN_DAYS} дней`, 'на возврат']],
  },
  en: {
    delivery: 'Same-day delivery in Tashkent, free',
    tryOn: 'Try on at home, pay only if you keep it',
    returns: `${RETURN_DAYS}-day returns`,
    payment: 'Cash on delivery',
    facts: [['Same day', 'delivery'], ['At home', 'try-on'], [`${RETURN_DAYS} days`, 'to return']],
  },
};

export const getPolicyCopy = (language = 'uz') => POLICY_COPY[language] || POLICY_COPY.uz;
