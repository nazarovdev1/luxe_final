import React, { useState } from 'react';
import { Calendar, Check, Mail, Phone, Plus, Share2 } from 'lucide-react';
import SEO from '../../components/SEO';
import { useLanguage } from '../../contexts/LanguageContext';
import { CONTACT } from '../../config/policies';
import { TopBar } from '../ui';
import './legal.css';

// Only the page chrome is translated; the legal text itself is passed in unchanged.
const WORDS = {
  uz: { share: 'Ulashish', section: "Bo'lim", call: "Qo'ng'iroq", email: 'Email', copied: 'Havola nusxalandi' },
  ru: { share: 'Поделиться', section: 'Раздел', call: 'Позвонить', email: 'Email', copied: 'Ссылка скопирована' },
  en: { share: 'Share', section: 'Section', call: 'Call', email: 'Email', copied: 'Link copied' },
};

// sections: [{ id, number, title, items?, body? }]
export default function LegalPage({ seo, label, kicker, title, lead, updated, highlights, sections, help, footnote, shareTitle }) {
  const { language } = useLanguage();
  const w = WORDS[language] || WORDS.uz;
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* clipboard blocked */ }
  };

  const share = async () => {
    if (navigator.share) {
      try { await navigator.share({ title: shareTitle, url: window.location.href }); } catch { copy(); }
    } else copy();
  };

  return (
    <div className="m-page m-reveal mlg">
      <SEO {...seo} />
      <TopBar
        title={title}
        subtitle={label}
        right={(
          <button type="button" className="m-icon-btn" onClick={share} aria-label={copied ? w.copied : w.share}>
            {copied ? <Check className="h-5 w-5" strokeWidth={1.5} /> : <Share2 className="h-5 w-5" strokeWidth={1.5} />}
          </button>
        )}
      />

      <header className="mlg-head m-pad">
        <p className="m-kicker">{kicker}</p>
        <h1 className="m-h1">{title}</h1>
        <p className="m-body">{lead}</p>
        <p className="mlg-date"><Calendar className="h-3.5 w-3.5" strokeWidth={1.5} />{updated}</p>
      </header>

      <ul className="mlg-highlights m-pad">
        {highlights.map((item) => (
          <li key={item.num}>
            <span className="mlg-highlights__num">{item.num}</span>
            <strong>{item.title}</strong>
            <span>{item.desc}</span>
          </li>
        ))}
      </ul>

      <section className="mlg-sections m-pad">
        {sections.map((section, index) => (
          <details key={section.id} className="m-acc mlg-acc" open={index === 0}>
            <summary>
              <span>
                <small>{section.kicker || `${w.section} ${section.number}`}</small>
                {section.title}
              </span>
              <Plus className="h-4 w-4" strokeWidth={1.5} />
            </summary>
            <div className="m-acc__body">
              {section.items && (
                <ul className="mlg-list">
                  {section.items.map((item) => <li key={item}>{item}</li>)}
                </ul>
              )}
              {section.body}
            </div>
          </details>
        ))}
      </section>

      <section className="m-section m-pad">
        <h2 className="m-h3">{help.title}</h2>
        <p className="m-body mlg-help">{help.text}</p>
        <div className="mlg-actions">
          <a href={CONTACT.phoneHref} className="m-btn m-btn--ghost"><Phone className="h-4 w-4" />{w.call}</a>
          <a href={`mailto:${CONTACT.email}`} className="m-btn m-btn--solid"><Mail className="h-4 w-4" />{w.email}</a>
        </div>
        <p className="m-small mlg-foot">{footnote}</p>
      </section>
    </div>
  );
}
