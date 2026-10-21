import React, { useMemo, useState } from 'react';
import { ArrowUpRight, CheckCircle2, Clock, Mail, MapPin, Phone } from 'lucide-react';
import SEO from '../../components/SEO';
import { useLanguage } from '../../contexts/LanguageContext';
import { CONTACT } from '../../config/policies';
import { API_BASE_URL } from '../../services/api';
import { Field, SoftImage, TopBar } from '../ui';
import './contact.css';

// Same hours and map link as the desktop contact page.
const OPEN_HOUR = 9;
const CLOSE_HOUR = 22;
const pad = (hour) => String(hour).padStart(2, '0');
const MAP_LINK = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(CONTACT.address)}`;
// Count digits, not characters, so a spaced number like +998 90 123 45 67 passes.
const isPhone = (value) => {
  const digits = value.replace(/\D/g, '').length;
  return /^[+]?[0-9\-\s()]+$/.test(value) && digits >= 7 && digits <= 15;
};

const WORDS = {
  uz: {
    title: 'Aloqa',
    kicker: 'Atelier konsyerj',
    heading: ['Sizni', 'tinglaymiz.'],
    lead: "O'lcham, obraz, yetkazish yoki bitta savol — konsyerjimiz sizga shaxsan javob beradi.",
    open: `Hozir ochiq · ${CLOSE_HOUR}:00 gacha`,
    closed: `Hozir yopiq · ${pad(OPEN_HOUR)}:00 da ochiladi`,
    call: "Qo'ng'iroq qilish",
    direct: "To'g'ridan-to'g'ri",
    rows: { phone: 'Telefon', email: 'Email', atelier: 'Atelier', hours: 'Ish vaqti' },
    hours: `Har kuni, ${pad(OPEN_HOUR)}:00 — ${CLOSE_HOUR}:00`,
    formKicker: "So'rov",
    formTitle: ['Qanday', 'yordam beraylik?'],
    topics: ["Uyda kiyib ko'rish", 'Shaxsiy fitting', 'Obraz konsyerji', 'Boshqa savol'],
    name: 'Ismingiz',
    phone: 'Telefon raqamingiz',
    message: 'Xabaringiz',
    submit: "So'rov yuborish",
    sending: 'Yuborilmoqda',
    invalid: "Iltimos, ism, to'g'ri telefon raqam va xabarni kiriting.",
    failed: "Xabar yuborilmadi. Iltimos, qayta urinib ko'ring yoki qo'ng'iroq qiling.",
    privacy: "Ma'lumotlaringiz faqat siz bilan bog'lanish uchun ishlatiladi.",
    thanks: (name) => `Rahmat, ${name}.`,
    thanksNote: "So'rovingiz konsyerjga yetdi. Tez orada siz bilan bog'lanamiz.",
    again: 'Yana yozish',
  },
  ru: {
    title: 'Контакты',
    kicker: 'Консьерж ателье',
    heading: ['Мы вас', 'слушаем.'],
    lead: 'Размер, образ, доставка или один вопрос — наш консьерж ответит вам лично.',
    open: `Сейчас открыто · до ${CLOSE_HOUR}:00`,
    closed: `Сейчас закрыто · откроемся в ${pad(OPEN_HOUR)}:00`,
    call: 'Позвонить',
    direct: 'Напрямую',
    rows: { phone: 'Телефон', email: 'Email', atelier: 'Ателье', hours: 'Часы работы' },
    hours: `Ежедневно, ${pad(OPEN_HOUR)}:00 — ${CLOSE_HOUR}:00`,
    formKicker: 'Запрос',
    formTitle: ['Чем', 'мы можем помочь?'],
    topics: ['Примерка дома', 'Личная примерка', 'Консьерж по образу', 'Другой вопрос'],
    name: 'Ваше имя',
    phone: 'Ваш телефон',
    message: 'Сообщение',
    submit: 'Отправить запрос',
    sending: 'Отправляем',
    invalid: 'Пожалуйста, укажите имя, верный номер телефона и сообщение.',
    failed: 'Сообщение не отправлено. Попробуйте ещё раз или позвоните нам.',
    privacy: 'Ваши данные используются только для связи с вами.',
    thanks: (name) => `Спасибо, ${name}.`,
    thanksNote: 'Ваш запрос у консьержа. Мы скоро свяжемся с вами.',
    again: 'Написать ещё',
  },
  en: {
    title: 'Contact',
    kicker: 'Atelier concierge',
    heading: ['We are', 'listening.'],
    lead: 'Sizing, styling, delivery or a single question — our concierge answers you personally.',
    open: `Open now · until ${CLOSE_HOUR}:00`,
    closed: `Closed now · opens at ${pad(OPEN_HOUR)}:00`,
    call: 'Call us',
    direct: 'Directly',
    rows: { phone: 'Phone', email: 'Email', atelier: 'Atelier', hours: 'Hours' },
    hours: `Daily, ${pad(OPEN_HOUR)}:00 — ${CLOSE_HOUR}:00`,
    formKicker: 'Request',
    formTitle: ['How may', 'we help?'],
    topics: ['Try on at home', 'Private fitting', 'Styling concierge', 'Another question'],
    name: 'Your name',
    phone: 'Your phone',
    message: 'Your message',
    submit: 'Send request',
    sending: 'Sending',
    invalid: 'Please enter your name, a valid phone number and a message.',
    failed: 'The message was not sent. Please try again or call us.',
    privacy: 'Your details are used only to get back to you.',
    thanks: (name) => `Thank you, ${name}.`,
    thanksNote: 'Your request is with the concierge. We will be in touch shortly.',
    again: 'Write again',
  },
};

// The atelier keeps Tashkent hours (UTC+5) regardless of the visitor's timezone.
const isOpenNow = (date = new Date()) => {
  const hour = (date.getUTCHours() + 5) % 24;
  return hour >= OPEN_HOUR && hour < CLOSE_HOUR;
};

export default function Contact() {
  const { language } = useLanguage();
  const w = WORDS[language] || WORDS.uz;
  const open = useMemo(() => isOpenNow(), []);

  const [topic, setTopic] = useState(0);
  const [form, setForm] = useState({ name: '', phone: '', message: '' });
  const [status, setStatus] = useState('idle'); // idle | sending | done | sent
  const [error, setError] = useState('');
  const [sentName, setSentName] = useState('');

  const rows = [
    { id: 'phone', icon: Phone, label: w.rows.phone, value: CONTACT.phone, href: CONTACT.phoneHref },
    { id: 'email', icon: Mail, label: w.rows.email, value: CONTACT.email, href: `mailto:${CONTACT.email}` },
    { id: 'atelier', icon: MapPin, label: w.rows.atelier, value: CONTACT.address, href: MAP_LINK, external: true },
    { id: 'hours', icon: Clock, label: w.rows.hours, value: w.hours },
  ];

  const change = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (error) setError('');
  };

  const submit = async (event) => {
    event.preventDefault();
    const name = form.name.trim();
    const phone = form.phone.trim();
    const message = form.message.trim();
    if (!name || !message || !isPhone(phone)) {
      setError(w.invalid);
      return;
    }

    setStatus('sending');
    try {
      const response = await fetch(`${API_BASE_URL}/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, phone, message: `[${w.topics[topic]}] ${message}` }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.message || 'Server error');
      setSentName(name);
      setForm({ name: '', phone: '', message: '' });
      // Let the gold button fill with ink before the thank-you replaces the form.
      setStatus('done');
      window.setTimeout(() => setStatus('sent'), 900);
    } catch (err) {
      console.error('Error submitting form:', err);
      setError(w.failed);
      setStatus('idle');
    }
  };

  return (
    <div className="m-page m-reveal mct">
      <SEO title={w.title} description={w.lead} canonicalPath="/contact" />
      <TopBar title={w.title} />

      <header className="mct-head m-pad">
        <p className="m-kicker">{w.kicker}</p>
        <h1 className="m-h1">{w.heading[0]} <em>{w.heading[1]}</em></h1>
        <p className="m-body">{w.lead}</p>
        <p className={`mct-status ${open ? 'is-open' : ''}`}><span aria-hidden="true" />{open ? w.open : w.closed}</p>
        <a href={CONTACT.phoneHref} className="m-btn m-btn--solid m-btn--block"><Phone className="h-4 w-4" />{w.call}</a>
      </header>

      <div className="mct-arch">
        <SoftImage src="/editorial/atelier-concierge-v2.png" alt={w.kicker} />
      </div>

      <section className="m-section m-pad">
        <p className="m-kicker">{w.direct}</p>
        <ul className="mct-rows">
          {rows.map(({ id, icon: Icon, label, value, href, external }) => {
            const body = (
              <>
                <Icon className="h-5 w-5" strokeWidth={1.4} />
                <span className="mct-row__text"><small>{label}</small>{value}</span>
                {href && <ArrowUpRight className="mct-row__arrow h-4 w-4" />}
              </>
            );
            return (
              <li key={id}>
                {href
                  ? <a className="mct-row" href={href} {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>{body}</a>
                  : <div className="mct-row">{body}</div>}
              </li>
            );
          })}
        </ul>
      </section>

      <section className="m-section m-pad" id="request">
        <p className="m-kicker">{w.formKicker}</p>
        <h2 className="m-h2 mct-form-title">{w.formTitle[0]} <em>{w.formTitle[1]}</em></h2>

        {status === 'sent' ? (
          <div className="mct-sent" role="status">
            <CheckCircle2 className="h-7 w-7" strokeWidth={1.3} />
            <h3 className="m-h3">{w.thanks(sentName)}</h3>
            <p className="m-body">{w.thanksNote}</p>
            <button type="button" className="m-link" onClick={() => setStatus('idle')}>{w.again}</button>
          </div>
        ) : (
          <form className="mct-form" onSubmit={submit} noValidate>
            <div className="m-chips mct-topics" role="group" aria-label={w.formKicker}>
              {w.topics.map((label, index) => (
                <button key={label} type="button" className={`m-chip ${topic === index ? 'is-on' : ''}`} aria-pressed={topic === index} onClick={() => setTopic(index)}>
                  {label}
                </button>
              ))}
            </div>
            <Field label={w.name} name="name" value={form.name} onChange={change} autoComplete="name" required />
            <Field label={w.phone} name="phone" type="tel" inputMode="tel" value={form.phone} onChange={change} autoComplete="tel" required />
            <Field label={w.message} name="message" as="textarea" rows={3} value={form.message} onChange={change} required />
            {error && <p className="mct-error" role="alert">{error}</p>}
            <button
              type="submit"
              className={`m-btn m-btn--solid m-btn--block ${status === 'sending' ? 'is-busy' : ''} ${status === 'done' ? 'is-done' : ''}`}
              disabled={status === 'sending' || status === 'done'}
            >
              {status === 'done' && <CheckCircle2 className="h-4 w-4" />}
              {status === 'sending' ? w.sending : w.submit}
            </button>
            <p className="m-small mct-privacy">{w.privacy}</p>
          </form>
        )}
      </section>
    </div>
  );
}
