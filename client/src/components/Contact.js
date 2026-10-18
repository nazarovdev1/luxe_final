import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowUpRight, Check, Clock, Mail, MapPin, Phone } from 'lucide-react';
import { API_BASE_URL } from '../services/api';
import { useLanguage } from '../contexts/LanguageContext';
import { CONTACT } from '../config/policies';
import './contact.css';

gsap.registerPlugin(ScrollTrigger);

const OPEN_HOUR = 9;
const pad = (hour) => String(hour).padStart(2, '0');
const CLOSE_HOUR = 22;
const MAP_LINK = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(CONTACT.address)}`;

const WORDS = {
  uz: {
    kicker: 'Luxx · Atelier konsyerj',
    title: ['Sizni', 'tinglash uchun', 'shu yerdamiz.'],
    lead: "O'lcham, obraz, yetkazish yoki bitta savol — konsyerjimiz sizga shaxsan javob beradi.",
    open: (h) => `Hozir ochiq · ${h}:00 gacha`,
    closed: (h) => `Hozir yopiq · ${pad(h)}:00 da ochiladi`,
    call: "Qo'ng'iroq qilish",
    write: 'Xabar qoldirish',
    caption: 'Shaxsiy konsyerj',
    cue: 'Pastga',
    indexTitle: "To'g'ridan-to'g'ri",
    rows: { phone: 'Telefon', email: 'Email', atelier: 'Atelier', hours: 'Ish vaqti' },
    hoursValue: `Har kuni, ${pad(OPEN_HOUR)}:00 — ${CLOSE_HOUR}:00`,
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
    mapTitle: 'Atelierga tashrif',
    mapOpen: 'Xaritada ochish',
  },
  ru: {
    kicker: 'Luxx · Консьерж ателье',
    title: ['Мы здесь,', 'чтобы', 'вас услышать.'],
    lead: 'Размер, образ, доставка или один вопрос — наш консьерж ответит вам лично.',
    open: (h) => `Сейчас открыто · до ${h}:00`,
    closed: (h) => `Сейчас закрыто · откроемся в ${pad(h)}:00`,
    call: 'Позвонить',
    write: 'Оставить сообщение',
    caption: 'Личный консьерж',
    cue: 'Вниз',
    indexTitle: 'Напрямую',
    rows: { phone: 'Телефон', email: 'Email', atelier: 'Ателье', hours: 'Часы работы' },
    hoursValue: `Ежедневно, ${pad(OPEN_HOUR)}:00 — ${CLOSE_HOUR}:00`,
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
    mapTitle: 'Визит в ателье',
    mapOpen: 'Открыть на карте',
  },
  en: {
    kicker: 'Luxx · Atelier concierge',
    title: ['We are here', 'to listen', 'to you.'],
    lead: 'Sizing, styling, delivery or a single question — our concierge answers you personally.',
    open: (h) => `Open now · until ${h}:00`,
    closed: (h) => `Closed now · opens at ${pad(h)}:00`,
    call: 'Call us',
    write: 'Leave a message',
    caption: 'Personal concierge',
    cue: 'Scroll',
    indexTitle: 'Directly',
    rows: { phone: 'Phone', email: 'Email', atelier: 'Atelier', hours: 'Hours' },
    hoursValue: `Daily, ${pad(OPEN_HOUR)}:00 — ${CLOSE_HOUR}:00`,
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
    mapTitle: 'Visit the atelier',
    mapOpen: 'Open in maps',
  },
};

// The atelier keeps Tashkent hours (UTC+5) regardless of the visitor's timezone.
const isOpenNow = (date = new Date()) => {
  const hour = (date.getUTCHours() + 5) % 24;
  return hour >= OPEN_HOUR && hour < CLOSE_HOUR;
};

const marquee = (items) => items.map(([text, outline], index) => (
  <span key={index} className={outline ? 'is-outline' : ''}>{text}</span>
));
const MARQUEE_A = marquee([['LUXX', true], ['ATELIER', false], ['LUXX', true], ['CONCIERGE', false]]);
const MARQUEE_B = marquee([['PRIVATE', false], ['FITTING', true], ['STYLING', false], ['HOME', true]]);

const PHONE_PATTERN = /^[+]?[0-9\-\s()]{7,15}$/;

const Field = ({ label, as = 'input', ...props }) => {
  const Tag = as;
  return (
    <label className="ct-field">
      <Tag {...props} placeholder=" " className="ct-field__input" />
      <span className="ct-field__label">{label}</span>
      <span className="ct-field__line" aria-hidden="true" />
    </label>
  );
};

const Contact = () => {
  const { language } = useLanguage();
  const w = WORDS[language] || WORDS.uz;
  const rootRef = useRef(null);
  const formRef = useRef(null);
  const lenisRef = useRef(null);

  const [topic, setTopic] = useState(0);
  const [formData, setFormData] = useState({ name: '', phone: '', message: '' });
  const [status, setStatus] = useState('idle'); // idle | sending | sent
  const [error, setError] = useState('');
  const [sentName, setSentName] = useState('');
  const open = useMemo(() => isOpenNow(), []);
  const formWords = [
    ...w.formTitle[0].split(' ').map((word) => ({ word, accent: false })),
    ...w.formTitle[1].split(' ').map((word) => ({ word, accent: true })),
  ];

  const rows = [
    { id: 'phone', label: w.rows.phone, value: CONTACT.phone, href: CONTACT.phoneHref, icon: Phone },
    { id: 'email', label: w.rows.email, value: CONTACT.email, href: `mailto:${CONTACT.email}`, icon: Mail },
    { id: 'atelier', label: w.rows.atelier, value: CONTACT.address, href: MAP_LINK, icon: MapPin, external: true },
    { id: 'hours', label: w.rows.hours, value: w.hoursValue, icon: Clock },
  ];

  // Inertial wheel scrolling: turns the wheel's stepped jumps into one continuous glide,
  // which is what makes scrubbed animations look smooth instead of catching up in steps.
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;

    const lenis = new Lenis({ lerp: 0.085, wheelMultiplier: 0.9, smoothWheel: true });
    lenisRef.current = lenis;
    lenis.on('scroll', ScrollTrigger.update);
    const tick = (time) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(tick);
      gsap.ticker.lagSmoothing(500, 33);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;

    const ctx = gsap.context(() => {
      const arch = root.querySelector('.ct-arch__photo');
      gsap.timeline({ defaults: { ease: 'expo.out' }, delay: 0.1 })
        .from('.ct-hero__kicker', { y: 16, autoAlpha: 0, duration: 0.9 })
        .from('.ct-hero__title > span > span', { yPercent: 115, duration: 1.3, stagger: 0.11 }, 0.1)
        .fromTo(arch, { clipPath: 'inset(100% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.6, ease: 'expo.inOut' }, 0.15)
        .from('.ct-arch__photo img', { scale: 1.25, duration: 2.2, ease: 'power3.out' }, 0.15)
        .from('.ct-arch__outline path', { strokeDashoffset: 1, duration: 2, ease: 'power2.inOut' }, 0.6)
        .from('.ct-hero__lead, .ct-hero__status, .ct-hero__actions > *', { y: 22, autoAlpha: 0, duration: 1, stagger: 0.08 }, 0.7)
        .from('.ct-arch__caption', { x: -18, autoAlpha: 0, duration: 1 }, 1.3);

      const scrub = (trigger, start, end, extra = {}) => ({ trigger, start, end, scrub: 0.3, ...extra });

      // Hero leaves the stage as the page scrolls: lines drift apart, photo lags behind.
      gsap.utils.toArray('.ct-hero__title > span').forEach((line, index) => {
        gsap.to(line, { x: index % 2 ? 90 : -90, autoAlpha: 0.15, ease: 'none', scrollTrigger: scrub('.ct-hero', 'top top', 'bottom 15%') });
      });
      gsap.to('.ct-hero__copy > :not(.ct-hero__title)', { y: -60, autoAlpha: 0, ease: 'none', scrollTrigger: scrub('.ct-hero', '35% top', 'bottom 20%') });
      gsap.to('.ct-arch', { y: 140, ease: 'none', scrollTrigger: scrub('.ct-hero', 'top top', 'bottom top') });
      gsap.to('.ct-arch__photo img', { scale: 1.18, yPercent: 6, ease: 'none', scrollTrigger: scrub('.ct-hero', 'top top', 'bottom top') });
      gsap.to('.ct-cue', { autoAlpha: 0, ease: 'none', scrollTrigger: scrub('.ct-hero', 'top top', '20% top') });

      // Gold progress thread across the top of the page.
      gsap.fromTo('.ct-progress', { scaleX: 0 }, { scaleX: 1, ease: 'none', scrollTrigger: { trigger: root, start: 'top top', end: 'bottom bottom', scrub: 0.3 } });

      // A giant marquee slides sideways with the scroll, in both directions.
      gsap.fromTo('.ct-marquee__track', { xPercent: 0 }, { xPercent: -42, ease: 'none', scrollTrigger: scrub('.ct-marquee', 'top bottom', 'bottom top', { scrub: 0.3 }) });
      gsap.fromTo('.ct-marquee__track--rev', { xPercent: -42 }, { xPercent: 0, ease: 'none', scrollTrigger: scrub('.ct-marquee', 'top bottom', 'bottom top', { scrub: 0.3 }) });

      gsap.from('.ct-index__head > *', {
        y: 30, autoAlpha: 0, duration: 1, stagger: 0.1, ease: 'power3.out',
        scrollTrigger: { trigger: '.ct-index', start: 'top 80%', once: true },
      });
      // Each direct line is "written" left to right as it crosses the middle of the screen.
      gsap.utils.toArray('.ct-row').forEach((row) => {
        const range = scrub(row, 'top 88%', 'top 38%');
        gsap.fromTo(row.querySelector('.ct-row__value'), { '--fill': '0%' }, { '--fill': '100%', ease: 'none', scrollTrigger: range });
        gsap.fromTo(row.querySelector('.ct-row__rule'), { scaleX: 0 }, { scaleX: 1, ease: 'none', scrollTrigger: range });
        gsap.from(row.querySelectorAll('.ct-row__num, .ct-row__label'), { x: -34, autoAlpha: 0, stagger: 0.1, ease: 'none', scrollTrigger: range });
        const arrow = row.querySelector('.ct-row__arrow');
        if (arrow) gsap.from(arrow, { x: -24, y: 24, autoAlpha: 0, ease: 'none', scrollTrigger: range });
      });

      // Request: headline words rise, the photo unveils and drifts, fields arrive one by one.
      gsap.from('.ct-request__intro h2 .ct-word > span', {
        yPercent: 110, duration: 1.2, stagger: 0.12, ease: 'expo.out',
        scrollTrigger: { trigger: '.ct-request', start: 'top 75%', once: true },
      });
      gsap.from('.ct-request__intro .ct-kicker', { y: 16, autoAlpha: 0, duration: 0.9, scrollTrigger: { trigger: '.ct-request', start: 'top 78%', once: true } });
      gsap.fromTo('.ct-request__photo', { clipPath: 'inset(45% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', ease: 'none', scrollTrigger: scrub('.ct-request', 'top 70%', 'top 20%') });
      gsap.fromTo('.ct-request__photo img', { yPercent: -9, scale: 1.2 }, { yPercent: 9, scale: 1.2, ease: 'none', scrollTrigger: scrub('.ct-request', 'top bottom', 'bottom top') });
      const reveal = gsap.utils.toArray('.ct-topic, .ct-field, .ct-form__foot');
      gsap.set(reveal, { y: 44, autoAlpha: 0 });
      ScrollTrigger.batch(reveal, {
        start: 'top 93%',
        once: true,
        onEnter: (batch) => gsap.to(batch, { y: 0, autoAlpha: 1, stagger: 0.09, duration: 1, ease: 'power3.out', overwrite: true }),
      });

      // Map: the frame opens like a curtain while the city zooms out behind the card.
      gsap.fromTo('.ct-map__frame', { clipPath: 'inset(14% 10% 14% 10%)' }, { clipPath: 'inset(0% 0% 0% 0%)', ease: 'none', scrollTrigger: scrub('.ct-map', 'top bottom', 'top 25%') });
      gsap.from('.ct-map__card > *', {
        y: 34, autoAlpha: 0, duration: 1, stagger: 0.1, ease: 'power3.out',
        scrollTrigger: { trigger: '.ct-map', start: 'top 55%', once: true },
      });
    }, root);

    return () => ctx.revert();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) setError('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const name = formData.name.trim();
    const phone = formData.phone.trim();
    const message = formData.message.trim();
    if (!name || !message || !PHONE_PATTERN.test(phone)) {
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
      setFormData({ name: '', phone: '', message: '' });
      setStatus('sent');
    } catch (err) {
      console.error('Error submitting form:', err);
      setError(w.failed);
      setStatus('idle');
    }
  };

  const scrollToForm = () => {
    if (lenisRef.current) lenisRef.current.scrollTo(formRef.current, { offset: -90, duration: 1.6 });
    else formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div ref={rootRef} className="ct">
      <span className="ct-progress" aria-hidden="true" />
      <section className="ct-hero">
        <div className="ct-hero__copy">
          <p className="ct-hero__kicker">{w.kicker}</p>
          <h1 className="ct-hero__title">
            {w.title.map((line, index) => (
              <span key={line}><span>{index === w.title.length - 1 ? <em>{line}</em> : line}</span></span>
            ))}
          </h1>
          <p className="ct-hero__lead">{w.lead}</p>
          <p className={`ct-hero__status ${open ? 'is-open' : ''}`}>
            <span className="ct-hero__dot" aria-hidden="true" />
            {open ? w.open(CLOSE_HOUR) : w.closed(OPEN_HOUR)}
          </p>
          <div className="ct-hero__actions">
            <a href={CONTACT.phoneHref} className="ct-btn ct-btn--solid">
              <Phone className="h-4 w-4" />
              <span>{w.call}</span>
            </a>
            <button type="button" onClick={scrollToForm} className="ct-btn ct-btn--ghost">
              <span>{w.write}</span>
              <ArrowUpRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        <figure className="ct-arch">
          <svg className="ct-arch__outline" viewBox="0 0 100 130" preserveAspectRatio="none" aria-hidden="true">
            <path d="M1 129 V50 A49 49 0 0 1 99 50 V129" pathLength="1" />
          </svg>
          <div className="ct-arch__photo">
            <img
              src="/editorial/atelier-concierge-v2.png"
              alt={w.caption}
              width="1122"
              height="1402"
              decoding="async"
              fetchpriority="high"
            />
          </div>
          <figcaption className="ct-arch__caption">
            <span>No. 01</span>
            {w.caption}
          </figcaption>
        </figure>
        <span className="ct-cue" aria-hidden="true">
          <span>{w.cue}</span>
          <i />
        </span>
      </section>

      <div className="ct-marquee" aria-hidden="true">
        <div className="ct-marquee__track">{MARQUEE_A}{MARQUEE_A}</div>
        <div className="ct-marquee__track ct-marquee__track--rev">{MARQUEE_B}{MARQUEE_B}</div>
      </div>

      <section className="ct-index">
        <div className="ct-index__head">
          <p className="ct-kicker">{w.indexTitle}</p>
          <span className="ct-index__count">04</span>
        </div>
        <ul className="ct-rows">
          {rows.map((row, index) => {
            const Icon = row.icon;
            const content = (
              <>
                <span className="ct-row__num">{String(index + 1).padStart(2, '0')}</span>
                <span className="ct-row__label"><Icon className="h-4 w-4" />{row.label}</span>
                <span className="ct-row__value">{row.value}</span>
                {row.href && <ArrowUpRight className="ct-row__arrow" />}
                <span className="ct-row__rule" aria-hidden="true" />
              </>
            );
            return (
              <li key={row.id}>
                {row.href ? (
                  <a
                    href={row.href}
                    className="ct-row is-link"
                    target={row.external ? '_blank' : undefined}
                    rel={row.external ? 'noreferrer' : undefined}
                  >
                    {content}
                  </a>
                ) : (
                  <div className="ct-row">{content}</div>
                )}
              </li>
            );
          })}
        </ul>
      </section>

      <section ref={formRef} className="ct-request">
        <div className="ct-request__intro">
          <p className="ct-kicker">{w.formKicker}</p>
          <h2>
            {formWords.map(({ word, accent }, index) => (
              <span key={index} className="ct-word">
                <span>{accent ? <em>{word}</em> : word}</span>{' '}
              </span>
            ))}
          </h2>
          <figure className="ct-request__photo">
            <img src="/editorial/atelier-fitting-v2.png" alt="" width="1122" height="1402" loading="lazy" decoding="async" />
          </figure>
        </div>

        <div className="ct-request__panel">
          {status === 'sent' ? (
            <div className="ct-sent" role="status">
              <Check className="ct-sent__mark" />
              <h3>{w.thanks(sentName)}</h3>
              <p>{w.thanksNote}</p>
              <button type="button" className="ct-btn ct-btn--ghost" onClick={() => setStatus('idle')}>
                {w.again}
              </button>
            </div>
          ) : (
            <>
              <div className="ct-topics" role="radiogroup">
                {w.topics.map((label, index) => (
                  <button
                    key={label}
                    type="button"
                    role="radio"
                    aria-checked={topic === index}
                    className={`ct-topic ${topic === index ? 'is-active' : ''}`}
                    onClick={() => setTopic(index)}
                  >
                    <span className="ct-topic__num">{String(index + 1).padStart(2, '0')}</span>
                    {label}
                  </button>
                ))}
              </div>

              <form onSubmit={handleSubmit} className="ct-form" noValidate>
                <div className="ct-form__pair">
                  <Field label={w.name} name="name" value={formData.name} onChange={handleChange} autoComplete="name" required />
                  <Field label={w.phone} name="phone" type="tel" value={formData.phone} onChange={handleChange} autoComplete="tel" required />
                </div>
                <Field label={w.message} as="textarea" data-lenis-prevent name="message" rows={4} value={formData.message} onChange={handleChange} required />

                {error && <p className="ct-form__error" role="alert">{error}</p>}

                <div className="ct-form__foot">
                  <button type="submit" disabled={status === 'sending'} className={`ct-submit ${status === 'sending' ? 'is-sending' : ''}`}>
                    <span>{status === 'sending' ? w.sending : w.submit}</span>
                    <ArrowUpRight className="h-4 w-4" />
                  </button>
                  <p className="ct-form__privacy">{w.privacy}</p>
                </div>
              </form>
            </>
          )}
        </div>
      </section>

      <section className="ct-map">
        <div className="ct-map__frame">
          <iframe
            title={w.mapTitle}
            src="https://www.openstreetmap.org/export/embed.html?bbox=69.1803%2C41.2646%2C69.3200%2C41.3500&layer=mapnik&marker=41.2995%2C69.2401"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
        <div className="ct-map__card">
          <p className="ct-kicker">{w.mapTitle}</p>
          <p className="ct-map__address">{CONTACT.address}</p>
          <p className="ct-map__hours">{w.hoursValue}</p>
          <a href={MAP_LINK} target="_blank" rel="noreferrer" className="ct-map__link">
            {w.mapOpen}
            <ArrowUpRight className="h-4 w-4" />
          </a>
        </div>
      </section>
    </div>
  );
};

export default Contact;
