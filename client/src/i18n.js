import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import translations from './data/translations';
import { initialLanguage } from './config/localizedRoutes';

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
      let saved = null;
      try { saved = localStorage.getItem(LANGUAGE_KEY); } catch (e) { /* ignore */ }
      const pathname = typeof window !== 'undefined' ? window.location.pathname : '/';
      const language = initialLanguage(pathname, saved);
      // An /ru address is an explicit choice; remember it like a tap on the switch.
      if (language === 'ru' && saved !== 'ru') {
        try { localStorage.setItem(LANGUAGE_KEY, 'ru'); } catch (e) { /* ignore */ }
      }
      return language;
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
