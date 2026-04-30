import React, { createContext, useContext, useState, useCallback } from 'react';
import translations from '../data/translations';

const LanguageContext = createContext();

const LANGUAGE_KEY = 'luxx_language';
const SUPPORTED_LANGUAGES = ['uz', 'ru', 'en'];

const LANGUAGE_LABELS = {
  uz: '🇺🇿 O\'zbek',
  ru: '🇷🇺 Русский',
  en: '🇬🇧 English',
};

const LANGUAGE_FLAGS = {
  uz: '🇺🇿',
  ru: '🇷🇺',
  en: '🇬🇧',
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguageState] = useState(() => {
    try {
      const saved = localStorage.getItem(LANGUAGE_KEY);
      if (saved && SUPPORTED_LANGUAGES.includes(saved)) {
        return saved;
      }
    } catch (e) {
      // ignore
    }
    return 'uz'; // Default to Uzbek
  });

  const setLanguage = useCallback((lang) => {
    if (SUPPORTED_LANGUAGES.includes(lang)) {
      setLanguageState(lang);
      try {
        localStorage.setItem(LANGUAGE_KEY, lang);
      } catch (e) {
        // ignore
      }
    }
  }, []);

  // Translation function: t('nav.login') => 'Kirish'
  const t = useCallback((key, fallback) => {
    const keys = key.split('.');
    let value = translations[language];

    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        // Fallback to Uzbek if key not found in current language
        let fallbackValue = translations.uz;
        for (const fk of keys) {
          if (fallbackValue && typeof fallbackValue === 'object' && fk in fallbackValue) {
            fallbackValue = fallbackValue[fk];
          } else {
            return fallback || key;
          }
        }
        return typeof fallbackValue === 'string' ? fallbackValue : (fallback || key);
      }
    }

    return typeof value === 'string' ? value : (fallback || key);
  }, [language]);

  // Get current language info
  const languageInfo = {
    code: language,
    label: LANGUAGE_LABELS[language],
    flag: LANGUAGE_FLAGS[language],
  };

  // Available languages for the switcher
  const availableLanguages = SUPPORTED_LANGUAGES.map((code) => ({
    code,
    label: LANGUAGE_LABELS[code],
    flag: LANGUAGE_FLAGS[code],
    isActive: code === language,
  }));

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        t,
        languageInfo,
        availableLanguages,
        SUPPORTED_LANGUAGES,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export default LanguageContext;
