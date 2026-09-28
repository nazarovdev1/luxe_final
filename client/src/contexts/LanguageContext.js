import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import i18n from '../i18n';

const LanguageContext = (typeof window !== 'undefined' && window.__LUXX_LANGUAGE_CONTEXT__)
  ? window.__LUXX_LANGUAGE_CONTEXT__
  : createContext(null);

if (typeof window !== 'undefined') {
  window.__LUXX_LANGUAGE_CONTEXT__ = LanguageContext;
}

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
  const [language, setLanguageState] = useState(() => i18n?.language || 'uz');

  // Sync state when i18next language changes externally
  useEffect(() => {
    if (!i18n?.on) return;
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
      if (i18n?.changeLanguage) {
        i18n.changeLanguage(lang);
      }
      try {
        localStorage.setItem(LANGUAGE_KEY, lang);
      } catch (e) {
        // ignore
      }
    }
  }, []);

  // Translation function: t('nav.login') => 'Kirish'
  const t = (key, fallback) => {
    const interpolate = (value) => {
      if (typeof value !== 'string' || !fallback || typeof fallback !== 'object') return value;
      return value.replace(/\{([^}]+)\}/g, (match, name) => (
        Object.prototype.hasOwnProperty.call(fallback, name) ? fallback[name] : match
      ));
    };
    // Direct lookup for arrays in translations object
    const lang = i18n?.language || 'uz';
    const resources = i18n?.options && i18n.options.resources;
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
    const value = i18n?.t ? i18n.t(key) : key;
    // If i18next returns the key itself, it means translation not found
    if (value === key && fallback) {
      return fallback;
    }
    return interpolate(value);
  };

  // Get current language info
  const languageInfo = {
    code: language,
    label: LANGUAGE_LABELS[language] || language,
    flag: LANGUAGE_FLAGS[language] || '',
  };

  // Available languages for the switcher
  const availableLanguages = SUPPORTED_LANGUAGES.map((code) => ({
    code,
    label: LANGUAGE_LABELS[code] || code,
    flag: LANGUAGE_FLAGS[code] || '',
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
    return {
      language: i18n?.language || 'uz',
      setLanguage: () => {},
      t: (key, fallback) => {
        try {
          const val = i18n?.t ? i18n.t(key) : key;
          return val === key && fallback ? fallback : val;
        } catch {
          return fallback || key;
        }
      },
      languageInfo: { code: 'uz', label: "🇺🇿 O'zbek", flag: '🇺🇿' },
      availableLanguages: SUPPORTED_LANGUAGES.map((code) => ({
        code,
        label: LANGUAGE_LABELS[code] || code,
        flag: LANGUAGE_FLAGS[code] || '',
        isActive: code === (i18n?.language || 'uz'),
      })),
      SUPPORTED_LANGUAGES,
    };
  }
  return context;
};

export default LanguageContext;
