import React from 'react';
import PageOpening from './PageOpening';

/* Page-specific openings built on the shared PageOpening shell. Each one plays once per tab. */

// ── HOME · Maison doors ─────────────────────────────────────────────────────
// A gold seam is drawn, LUXX settles across two doors, light leaks through the seam,
// then the doors swing open in 3D onto the home page.
const HOME_COPY = {
  uz: { kicker: 'Maison · Toshkent', caption: 'Har bir ayol — o‘z imzosi.' },
  ru: { kicker: 'Maison · Ташкент', caption: 'Каждая женщина — своя подпись.' },
  en: { kicker: 'Maison · Tashkent', caption: 'Every woman, her own signature.' },
};

const DoorMark = () => <span>LU<i>X</i>X</span>;

export function HomeOpening({ language = 'uz' }) {
  const copy = HOME_COPY[language] || HOME_COPY.uz;
  const build = (tl, el) => {
    const seam = el.querySelector('.po-seam');
    const doors = el.querySelectorAll('.po-door');
    const left = el.querySelector('.po-door--left');
    const right = el.querySelector('.po-door--right');
    const marks = el.querySelectorAll('.po-door__mark');
    const words = el.querySelectorAll('.po-doors__kicker, .po-doors__caption');

    tl.set(seam, { scaleY: 0 })
      .set(marks, { yPercent: 18, autoAlpha: 0, letterSpacing: '.3em' })
      .set(words, { y: 16, autoAlpha: 0 })
      .to(seam, { scaleY: 1, duration: 0.9, ease: 'expo.inOut' }, 0)
      .to(marks, { yPercent: 0, autoAlpha: 1, letterSpacing: '.08em', duration: 1.3, ease: 'expo.out' }, 0.35)
      .to(words, { y: 0, autoAlpha: 1, duration: 0.8, stagger: 0.12 }, 0.7)
      // light leaks through the seam just before the doors part
      .to(seam, { width: 10, marginLeft: -5, boxShadow: '0 0 90px 30px rgba(255,236,200,.55)', duration: 0.45, ease: 'power2.in' }, 1.85)
      .to(words, { autoAlpha: 0, y: -10, duration: 0.35, ease: 'power2.in' }, 1.95)
      .to(left, { rotateY: -108, duration: 1.5, ease: 'power3.inOut' }, 2.2)
      .to(right, { rotateY: 108, duration: 1.5, ease: 'power3.inOut' }, 2.2)
      .to(doors, { filter: 'brightness(.35)', duration: 1.2, ease: 'power2.in' }, 2.3)
      .to(seam, { autoAlpha: 0, duration: 0.5 }, 2.35)
      .to(el, { backgroundColor: 'rgba(11,9,7,0)', duration: 0.6 }, 2.2);
  };

  return (
    <PageOpening id="home" language={language} className="po-doors" build={build}>
      <div className="po-door po-door--left"><div className="po-door__frame" /><div className="po-door__mark"><DoorMark /></div></div>
      <div className="po-door po-door--right"><div className="po-door__frame" /><div className="po-door__mark"><DoorMark /></div></div>
      <div className="po-seam" />
      <p className="po-kicker po-doors__kicker">{copy.kicker}</p>
      <p className="po-doors__caption">{copy.caption}</p>
    </PageOpening>
  );
}

// ── KIYIMLAR · Atelier rail ─────────────────────────────────────────────────
// A brass rail is drawn, real pieces from the catalogue swing in on hangers,
// then fabric pleats sweep up and take the room away.
const RAIL_COPY = {
  uz: { kicker: 'Atelye · Garderob', one: 'Garderob', two: 'ochilmoqda.', pieces: 'buyum tayyor' },
  ru: { kicker: 'Ателье · Гардероб', one: 'Гардероб', two: 'открывается.', pieces: 'вещей готово' },
  en: { kicker: 'Atelier · Wardrobe', one: 'The wardrobe', two: 'is open.', pieces: 'pieces ready' },
};

const RAIL_FALLBACK = ['/editorial/private-edit-tailoring.webp', '/editorial/private-edit-evening.webp', '/editorial/story-posture-v2.webp', '/editorial/story-softness-v2.webp', '/editorial/opening-main-v2.webp'];

const imageOf = (product) => {
  if (!product) return '';
  if (product.image) return product.image;
  const first = product.images?.[0];
  return typeof first === 'object' ? first?.url : first || '';
};

export function CatalogueOpening({ language = 'uz', products = [] }) {
  const copy = RAIL_COPY[language] || RAIL_COPY.uz;
  // Frozen at mount: if products arrive mid-animation, swapping the hangers would detach the tweens.
  const railRef = React.useRef(null);
  if (railRef.current === null) {
    const real = products.map(imageOf).filter(Boolean);
    railRef.current = { pieces: (real.length ? real : RAIL_FALLBACK).slice(0, 5), count: real.length };
  }
  const { pieces } = railRef.current;
  const count = Math.max(railRef.current.count, products.length) || pieces.length;

  const build = (tl, el) => {
    const bar = el.querySelector('.po-rail__bar');
    const hangers = el.querySelectorAll('.po-rail__piece');
    const titleSpans = el.querySelectorAll('.po-rail__title h2 > span > span');
    const kicker = el.querySelector('.po-rail__title .po-kicker');
    const counter = el.querySelector('.po-rail__count');
    const pleats = el.querySelectorAll('.po-rail__pleat');

    tl.set(bar, { scaleX: 0 })
      .set(hangers, { x: () => window.innerWidth * 0.7, rotate: -14, autoAlpha: 0 })
      .set(titleSpans, { yPercent: 110 })
      .set([kicker, counter], { autoAlpha: 0, y: 12 })
      .to(bar, { scaleX: 1, duration: 0.9, ease: 'expo.inOut' }, 0)
      .to(hangers, { x: 0, autoAlpha: 1, duration: 1.1, stagger: 0.12, ease: 'power3.out' }, 0.45)
      // the swing settles like a garment on a hanger
      .to(hangers, { rotate: 0, duration: 1.6, stagger: 0.12, ease: 'elastic.out(1, 0.35)' }, 0.75)
      .to(kicker, { autoAlpha: 1, y: 0, duration: 0.6 }, 0.6)
      .to(titleSpans, { yPercent: 0, duration: 1, stagger: 0.12, ease: 'expo.out' }, 0.75)
      .to(counter, { autoAlpha: 1, y: 0, duration: 0.6 }, 1.1)
      .to(hangers, { y: -40, autoAlpha: 0, duration: 0.6, stagger: 0.06, ease: 'power2.in' }, 2.75)
      .to(pleats, { yPercent: -101, duration: 0.95, stagger: { each: 0.05, from: 'center' }, ease: 'power3.inOut' }, 2.95)
      .set(el, { backgroundColor: 'transparent' }, 3.1)
      .set(el.querySelectorAll('.po-rail__title, .po-rail__count, .po-rail__bar'), { autoAlpha: 0 }, 3.1);
  };

  return (
    <PageOpening id="catalogue" language={language} className="po-rail" build={build}>
      <div className="po-rail__bar" />
      <div className="po-rail__pieces">
        {pieces.map((src) => <div className="po-rail__piece" key={src}><img src={src} alt="" decoding="async" /></div>)}
      </div>
      <div className="po-rail__title">
        <span className="po-kicker">{copy.kicker}</span>
        <h2><span><span>{copy.one}</span></span><span><span><em>{copy.two}</em></span></span></h2>
      </div>
      <div className="po-rail__count"><strong>{String(count).padStart(2, '0')}</strong>{copy.pieces}</div>
      <div className="po-rail__pleats" aria-hidden="true">
        {Array.from({ length: 9 }, (_, index) => <span key={index} className="po-rail__pleat" />)}
      </div>
    </PageOpening>
  );
}

// ── EVENTS · Invitation ─────────────────────────────────────────────────────
// A private invitation flies in, a wax seal is pressed, light sweeps the card,
// then the guest steps through it into the page.
const INVITES = {
  vip: {
    seal: 'V',
    uz: { kicker: 'Shaxsiy taklifnoma', title: <>VIP <em>Club</em></>, note: 'Faqat siz uchun ochilgan eshik.' },
    ru: { kicker: 'Личное приглашение', title: <>VIP <em>Club</em></>, note: 'Дверь, открытая только для вас.' },
    en: { kicker: 'Private invitation', title: <>VIP <em>Club</em></>, note: 'A door opened only for you.' },
  },
  eco: {
    seal: 'E',
    uz: { kicker: 'Taklifnoma · Tabiat', title: <>Eco <em>Impact</em></>, note: 'Go‘zallik, tabiatga zarar yetkazmasdan.' },
    ru: { kicker: 'Приглашение · Природа', title: <>Eco <em>Impact</em></>, note: 'Красота без вреда природе.' },
    en: { kicker: 'Invitation · Nature', title: <>Eco <em>Impact</em></>, note: 'Beauty that costs the earth nothing.' },
  },
  gift: {
    seal: 'G',
    uz: { kicker: 'Sovg‘a uchun taklifnoma', title: <>Sovg‘a <em>kartalari</em></>, note: 'Tanlov huquqini sovg‘a qiling.' },
    ru: { kicker: 'Приглашение к подарку', title: <>Подарочные <em>карты</em></>, note: 'Подарите право выбора.' },
    en: { kicker: 'An invitation to give', title: <>Gift <em>cards</em></>, note: 'Give the pleasure of choosing.' },
  },
  blog: {
    seal: 'J',
    uz: { kicker: 'LUXX Jurnali', title: <>Moda <em>jurnali</em></>, note: 'Uslub, mato va ayollar hikoyalari.' },
    ru: { kicker: 'Журнал LUXX', title: <>Модный <em>журнал</em></>, note: 'Стиль, ткани и женские истории.' },
    en: { kicker: 'The LUXX Journal', title: <>The <em>journal</em></>, note: 'Style, fabric and women’s stories.' },
  },
};

export function EventOpening({ variant = 'vip', language = 'uz' }) {
  const invite = INVITES[variant] || INVITES.vip;
  const copy = invite[language] || invite.uz;

  const build = (tl, el) => {
    const card = el.querySelector('.po-invite__card');
    const seal = el.querySelector('.po-invite__seal');
    const sheen = el.querySelector('.po-invite__sheen');
    const inside = el.querySelectorAll('.po-invite__card > :not(.po-invite__seal):not(.po-invite__shine)');

    tl.set(card, { y: () => window.innerHeight * 0.7, rotateX: 62, rotateZ: -8, autoAlpha: 0 })
      .set(inside, { autoAlpha: 0, y: 10 })
      .set(seal, { scale: 2.4, autoAlpha: 0 })
      .to(card, { y: 0, rotateX: 0, rotateZ: 0, autoAlpha: 1, duration: 1.25, ease: 'expo.out' }, 0)
      .to(inside, { autoAlpha: 1, y: 0, duration: 0.6, stagger: 0.1 }, 0.7)
      // the seal is pressed into the paper
      .to(seal, { scale: 1, autoAlpha: 1, duration: 0.35, ease: 'power4.in' }, 1.35)
      .to(card, { y: 3, duration: 0.08, yoyo: true, repeat: 1, ease: 'power1.inOut' }, 1.7)
      .to(sheen, { xPercent: 240, duration: 1.1, ease: 'power2.inOut' }, 1.8)
      // step through the invitation
      .to(card, { scale: 7, rotateX: -12, autoAlpha: 0, duration: 1.1, ease: 'expo.in' }, 2.75)
      .to(el, { backgroundColor: 'rgba(11,9,7,0)', duration: 0.7 }, 3.2);
  };

  return (
    <PageOpening id={`event-${variant}`} language={language} className={`po-invite po-invite--${variant}`} build={build}>
      <div className="po-invite__card">
        <span className="po-kicker">{copy.kicker}</span>
        <h2 className="po-invite__title">{copy.title}</h2>
        <span className="po-invite__line" />
        <p className="po-invite__note">{copy.note}</p>
        <span className="po-invite__shine" aria-hidden="true"><span className="po-invite__sheen" /></span>
        <span className="po-invite__seal" aria-hidden="true">{invite.seal}</span>
      </div>
    </PageOpening>
  );
}

// ── BIZ HAQIMIZDA · Signature ───────────────────────────────────────────────
// "Luxx" is drawn by hand in gold, a thread is pulled beneath it, the ink fills,
// then the view irises open onto the story.
const SIGN_COPY = {
  uz: { kicker: 'Toshkent · 2026', line: 'Ayollar uchun, sevgi bilan tikilgan.' },
  ru: { kicker: 'Ташкент · 2026', line: 'Для женщин, сшито с любовью.' },
  en: { kicker: 'Tashkent · 2026', line: 'For women, tailored with love.' },
};

export function AboutOpening({ language = 'uz' }) {
  const copy = SIGN_COPY[language] || SIGN_COPY.uz;

  const build = (tl, el) => {
    const word = el.querySelector('.po-sign__word');
    const thread = el.querySelector('.po-sign__thread');
    const meta = el.querySelectorAll('.po-sign__meta > *');
    const length = 2600;
    const threadLength = thread.getTotalLength ? thread.getTotalLength() : 640;
    // Iris driven from a number so the circle never interpolates oddly.
    const iris = { r: 150 };
    const applyIris = () => { el.style.clipPath = `circle(${iris.r}% at 50% 46%)`; };

    tl.set(word, { strokeDasharray: length, strokeDashoffset: length, fillOpacity: 0 })
      .set(thread, { strokeDasharray: threadLength, strokeDashoffset: threadLength })
      .set(meta, { autoAlpha: 0, y: 12 })
      .call(applyIris)
      .to(word, { strokeDashoffset: 0, duration: 2, ease: 'power2.inOut' }, 0.1)
      .to(thread, { strokeDashoffset: 0, duration: 1.2, ease: 'power2.inOut' }, 1.1)
      .to(word, { fill: '#d8b988', fillOpacity: 1, duration: 0.8, ease: 'power1.out' }, 1.75)
      .to(meta, { autoAlpha: 1, y: 0, duration: 0.7, stagger: 0.12 }, 1.6)
      .to(iris, { r: 0, duration: 1.15, ease: 'expo.inOut', onUpdate: applyIris }, 3.05);
  };

  return (
    <PageOpening id="about" language={language} className="po-sign" build={build}>
      <svg className="po-sign__svg" viewBox="0 0 720 300" aria-hidden="true">
        <text className="po-sign__word" x="50%" y="190" textAnchor="middle">Luxx</text>
        <path className="po-sign__thread" d="M90 240 C 230 210, 330 270, 470 236 S 640 222, 660 238" />
      </svg>
      <div className="po-sign__meta">
        <span className="po-kicker">{copy.kicker}</span>
        <p>{copy.line}</p>
      </div>
    </PageOpening>
  );
}
