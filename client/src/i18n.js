import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import translations from './data/translations';

const LANGUAGE_KEY = 'luxx_language';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      uz: { translation: translations.uz },
      ru: { translation: translations.ru },
      en: { translation: translations.en },
    },
    fallbackLng: 'uz',
    lng: (() => {
      try {
        const saved = localStorage.getItem(LANGUAGE_KEY);
        if (saved && ['uz', 'ru', 'en'].includes(saved)) return saved;
      } catch (e) { /* ignore */ }
      return 'uz';
    })(),
    interpolation: {
      escapeValue: false, // React already escapes
    },
    detection: {
      order: ['localStorage', 'navigator'],
      lookupLocalStorage: LANGUAGE_KEY,
      caches: ['localStorage'],
    },
  });

export default i18n;
