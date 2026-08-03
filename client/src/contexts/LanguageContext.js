import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import i18n from '../i18n';

const LanguageContext = createContext();

const LANGUAGE_KEY = 'luxx_language';
const SUPPORTED_LANGUAGES = ['uz', 'ru', 'en'];

const LANGUAGE_LABELS = {
  uz: "🇺🇿 O'zbek",
  ru: '🇷🇺 Русский',
  en: '🇬🇧 English',
};

const LANGUAGE_FLAGS = {
  uz: '🇺🇿',
  ru: '🇷🇺',
  en: '🇬🇧',
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguageState] = useState(() => i18n.language || 'uz');

  // Sync state when i18next language changes externally
  useEffect(() => {
    const handleLanguageChanged = (lng) => {
      setLanguageState(lng);
    };
    i18n.on('languageChanged', handleLanguageChanged);
    return () => {
      i18n.off('languageChanged', handleLanguageChanged);
    };
  }, []);

  const setLanguage = useCallback((lang) => {
    if (SUPPORTED_LANGUAGES.includes(lang)) {
      i18n.changeLanguage(lang);
      try {
        localStorage.setItem(LANGUAGE_KEY, lang);
      } catch (e) {
        // ignore
      }
    }
  }, []);

  // Translation function: t('nav.login') => 'Kirish'
  // Uses i18next under the hood for proper pluralization, interpolation, etc.
  const t = (key, fallback) => {
    const interpolate = (value) => {
      if (typeof value !== 'string' || !fallback || typeof fallback !== 'object') return value;
      return value.replace(/\{([^}]+)\}/g, (match, name) => (
        Object.prototype.hasOwnProperty.call(fallback, name) ? fallback[name] : match
      ));
    };
    // Direct lookup for arrays in translations object
    const lang = i18n.language || 'uz';
    const resources = i18n.options && i18n.options.resources;
    if (resources && resources[lang]) {
      const parts = key.split('.');
      let cur = resources[lang].translation;
      for (const p of parts) {
        if (cur && Object.prototype.hasOwnProperty.call(cur, p)) {
          cur = cur[p];
        } else {
          cur = null;
          break;
        }
      }
      if (cur !== null && cur !== undefined) {
        return interpolate(cur);
      }
    }
    const value = i18n.t(key);
    // If i18next returns the key itself, it means translation not found
    if (value === key && fallback) {
      return fallback;
    }
    return interpolate(value);
  };

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
