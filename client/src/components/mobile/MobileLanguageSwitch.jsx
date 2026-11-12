import React from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import './mobileLanguageSwitch.css';

const FALLBACK_LANGUAGES = [{ code: 'uz' }, { code: 'ru' }, { code: 'en' }];

/**
 * A quiet "UZ · RU · EN" text switch. It sits inside a page (the home hero, the
 * profile settings) instead of floating over the content, so it never covers a
 * product or a button.
 */
const MobileLanguageSwitch = ({ className = '', tone = 'light' }) => {
  const { t, language, setLanguage, availableLanguages } = useLanguage();
  const languages = availableLanguages?.length ? availableLanguages : FALLBACK_LANGUAGES;

  return (
    <div
      role="group"
      aria-label={t('mobileNav.changeLanguage', "Tilni o'zgartirish")}
      className={`mobile-lang-switch mobile-lang-switch--${tone} ${className}`.trim()}
    >
      {languages.map((lng) => {
        const isActive = lng.code === language;
        return (
          <button
            key={lng.code}
            type="button"
            aria-pressed={isActive}
            onClick={() => { if (!isActive) setLanguage(lng.code); }}
            className={`mobile-lang-switch__option${isActive ? ' mobile-lang-switch__option--active' : ''}`}
          >
            {lng.code.toUpperCase()}
          </button>
        );
      })}
    </div>
  );
};

export default MobileLanguageSwitch;
