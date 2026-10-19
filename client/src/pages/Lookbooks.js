import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import { ArrowUpRight, ArrowDown, ArrowRight, Plus } from 'lucide-react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import LookDetailModal from '../components/LookDetailModal';
import SEO from '../components/SEO';
import { useLanguage } from '../contexts/LanguageContext';
import { apiFetch } from '../services/api';
import './Lookbooks.css';

gsap.registerPlugin(ScrollTrigger);

const COPY = {
  uz: {
    label: 'Obrazlar', heroOne: 'Kiyinish', heroTwo: 'san’ati.', heroIntro: 'Bir qarashdan ko‘proq. Har bir obraz — sizning kayfiyatingiz, qadamingiz va hikoyangiz.', explore: 'Hikoyani boshlash', scroll: 'Pastga qarang',
    statementTop: '01 / Manifest', statement: 'Kiyim sizni o‘zgartirmaydi. U sizdagi go‘zallikni ko‘rsatadi.', statementBottom: 'Obrazlar orqali o‘zingizga yaqin lahzani toping.',
    chaptersTop: '02 / Uch kayfiyat', chapters: [
      { word: 'Sokinlik', title: 'O‘zingiz bilan qoladigan lahza.', text: 'Yumshoq matolar va erkin siluetlar. Hech narsani isbotlash shart bo‘lmagan kunlar uchun.' },
      { word: 'Ishonch', title: 'Qadamlaringiz aniqroq yangraydi.', text: 'Tiniq chiziqlar va kuchli qomat. Xonaga kirganingizdayoq seziladigan ishonch.' },
      { word: 'Joziba', title: 'Kechani o‘zingiz bilan olib boring.', text: 'Birgina detal butun kayfiyatni o‘zgartiradi. Nafosat siz bilan qoladi.' },
    ],
    archiveTop: '03 / The edit', archiveTitle: 'Obrazlar ichida o‘zingizni toping.', all: 'Barchasi', open: 'Obrazni ko‘rish', pieces: 'mahsulot', empty: 'Yangi obrazlar tez orada.', error: 'Obrazlarni yuklab bo‘lmadi.', retry: 'Qayta urinish', loading: 'Obrazlar yuklanmoqda',
    createTop: '04 / Sizning navbatingiz', create: 'Endi hikoyani siz yarating.', createText: 'Sevimli kiyimlaringizni birlashtiring. O‘zingizga xos obrazni bir necha qadamda yarating.', builder: 'Obraz yaratish', shop: 'Kiyimlarni ko‘rish',
    skip: 'O‘tkazib yuborish', replay: 'Opening', edition: 'Kolleksiya obrazlari', openingCaption: 'Har bir obraz — bitta kadr.',
  },
  ru: {
    label: 'Образы', heroOne: 'Искусство', heroTwo: 'одеваться.', heroIntro: 'Больше, чем первый взгляд. Каждый образ — ваше настроение, движение и история.', explore: 'Начать историю', scroll: 'Листайте вниз',
    statementTop: '01 / Манифест', statement: 'Одежда не меняет вас. Она раскрывает вашу красоту.', statementBottom: 'Найдите момент, который откликается вам.',
    chaptersTop: '02 / Три настроения', chapters: [
      { word: 'Спокойствие', title: 'Момент наедине с собой.', text: 'Мягкие ткани и свободные силуэты. Для дней, когда никому ничего не нужно доказывать.' },
      { word: 'Уверенность', title: 'Ваши шаги звучат яснее.', text: 'Чёткие линии и сильный силуэт. Уверенность, которую замечают сразу.' },
      { word: 'Очарование', title: 'Возьмите вечер с собой.', text: 'Одна деталь меняет всё настроение. Изящество остаётся с вами.' },
    ],
    archiveTop: '03 / The edit', archiveTitle: 'Найдите себя среди образов.', all: 'Все', open: 'Смотреть образ', pieces: 'вещей', empty: 'Новые образы скоро появятся.', error: 'Не удалось загрузить образы.', retry: 'Повторить', loading: 'Загрузка образов',
    createTop: '04 / Ваша очередь', create: 'Теперь создайте свою историю.', createText: 'Сочетайте любимые вещи. Соберите образ, который говорит о вас.', builder: 'Создать образ', shop: 'Смотреть одежду',
    skip: 'Пропустить', replay: 'Интро', edition: 'Коллекция образов', openingCaption: 'Каждый образ — один кадр.',
  },
  en: {
    label: 'Lookbooks', heroOne: 'The art of', heroTwo: 'dressing.', heroIntro: 'More than a first impression. Every look carries your mood, your movement, your story.', explore: 'Enter the story', scroll: 'Scroll to discover',
    statementTop: '01 / Manifesto', statement: 'Clothes do not change you. They reveal the beauty already there.', statementBottom: 'Find a moment that feels like yours.',
    chaptersTop: '02 / Three moods', chapters: [
      { word: 'Ease', title: 'A moment entirely your own.', text: 'Soft textures and free silhouettes. For the days when there is nothing to prove.' },
      { word: 'Presence', title: 'Every step feels more certain.', text: 'Clean lines and strong proportions. Confidence you can feel on arrival.' },
      { word: 'Allure', title: 'Take the evening with you.', text: 'A single detail can change the mood. Elegance stays with you.' },
    ],
    archiveTop: '03 / The edit', archiveTitle: 'Find yourself in the looks.', all: 'All looks', open: 'Discover look', pieces: 'pieces', empty: 'New looks are coming soon.', error: 'Unable to load the looks.', retry: 'Try again', loading: 'Loading looks',
    createTop: '04 / Your turn', create: 'Now write your own story.', createText: 'Bring your favourite pieces together. Create a look that speaks for you.', builder: 'Create a look', shop: 'Explore the pieces',
    skip: 'Skip', replay: 'Intro', edition: 'Collection Lookbook', openingCaption: 'Every look, a single frame.',
  },
};

const CHAPTER_IMAGES = ['/editorial/story-softness-v2.png', '/editorial/story-posture-v2.png', '/editorial/private-edit-evening.png'];
const FALLBACK = '/editorial/private-edit-evening.png';
const imageFallback = (event) => { if (!event.currentTarget.src.endsWith(FALLBACK)) event.currentTarget.src = FALLBACK; };

// Frames shown through the opening aperture; the last one is the hero image itself.
const HERO_IMAGE = '/editorial/lookbook-mood-v2.png';
const OPENING_FRAMES = [
  '/editorial/lookbook-opening-ivory-2026.webp',
  '/editorial/lookbook-opening-tailoring-2026.webp',
  '/editorial/lookbook-opening-evening-2026.webp',
  HERO_IMAGE,
];

export default function Lookbooks() {
  const pageRef = useRef(null);
  const openingContainerRef = useRef(null);
  const frameCountRef = useRef(null);
  const openingRunRef = useRef(0);
  const openingTimelineRef = useRef(null);
  const [openingActive, setOpeningActive] = useState(true);

  const { language } = useLanguage();
  const copy = COPY[language] || COPY.uz;
  const [looks, setLooks] = useState([]);
  const [status, setStatus] = useState('loading');
  const [attempt, setAttempt] = useState(0);
  const [category, setCategory] = useState('all');
  const [selectedLookId, setSelectedLookId] = useState(null);

  // The site navbar sits above page content; hide it while the opening owns the screen.
  const setChromeHidden = (hidden) => {
    window.dispatchEvent(new CustomEvent('luxx:chrome-visibility', { detail: { hidden } }));
  };

  const hideOpening = () => {
    setChromeHidden(false);
    const openingEl = openingContainerRef.current;
    if (openingEl) {
      openingEl.style.display = 'none';
      openingEl.style.pointerEvents = 'none';
    }
    setOpeningActive(false);
    ScrollTrigger.refresh();
  };

  // "The shoot": a portrait aperture flickers through editorial frames with a camera flash,
  // then opens to full screen on the very image the hero uses, so the hand-off is seamless.
  const playOpeningAnimation = async (runId) => {
    const root = pageRef.current;
    const openingEl = openingContainerRef.current;
    if (!root || !openingEl) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) {
      hideOpening();
      return;
    }
    setChromeHidden(true);

    const aperture = openingEl.querySelector('.lj-op-aperture');
    const frames = Array.from(openingEl.querySelectorAll('.lj-op-frame'));
    const lens = openingEl.querySelector('.lj-op-lens');
    const flash = openingEl.querySelector('.lj-op-flash');
    const shade = openingEl.querySelector('.lj-op-shade');
    const wordLeft = openingEl.querySelector('.lj-op-word--l');
    const wordRight = openingEl.querySelector('.lj-op-word--r');
    const chrome = openingEl.querySelectorAll('.lj-op-top, .lj-op-bottom');
    const caption = openingEl.querySelector('.lj-op-caption');
    const heroImage = root.querySelector('.lj-hero-image img');
    const heroTitles = root.querySelectorAll('.lj-hero-title span');
    const heroAccents = [
      root.querySelector('.lj-hero-content .lj-overline'),
      root.querySelector('.lj-hero-meta'),
      root.querySelector('.lj-hero-bottom'),
      root.querySelector('.lj-hero-side'),
    ].filter(Boolean);

    // Portrait lens geometry in pixels (GSAP interpolates matching inset() values).
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const lensH = Math.min(vh * 0.56, 560, vw * 0.82 / 0.74);
    const lensW = lensH * 0.74;
    const insetY = (vh - lensH) / 2;
    const insetX = (vw - lensW) / 2;
    // Tween plain numbers and write clip-path ourselves: browsers collapse equal inset() values,
    // which makes direct clip-path tweens interpolate the wrong edges.
    const iris = { top: vh / 2, right: insetX, bottom: vh / 2, left: insetX };
    const applyIris = () => {
      aperture.style.clipPath = `inset(${iris.top}px ${iris.right}px ${iris.bottom}px ${iris.left}px)`;
    };
    applyIris();
    gsap.set(lens, { top: insetY, left: insetX, width: lensW, height: lensH, autoAlpha: 0, scale: 0.92 });
    // Fit each photo to the portrait lens, rather than cropping the middle of a
    // viewport-sized photo (which cuts away the model's face and silhouette).
    gsap.set(frames, {
      top: insetY, left: insetX, width: lensW, height: lensH,
      autoAlpha: 0, scale: 1.035, objectPosition: '50% 50%',
    });
    const finalFrame = frames[frames.length - 1];
    // The landscape hero keeps its model on the right while inside the lens.
    gsap.set(finalFrame, { objectPosition: '100% 50%' });
    gsap.set(flash, { autoAlpha: 0 });
    gsap.set(shade, { autoAlpha: 0 });
    gsap.set(wordLeft, { xPercent: -60, autoAlpha: 0 });
    gsap.set(wordRight, { xPercent: 60, autoAlpha: 0 });
    gsap.set(chrome, { autoAlpha: 1 });
    gsap.set(caption, { autoAlpha: 0, y: 14 });
    if (heroImage) gsap.set(heroImage, { scale: 1, filter: 'brightness(1)' });
    if (heroTitles.length) gsap.set(heroTitles, { yPercent: 105, autoAlpha: 0 });
    if (heroAccents.length) gsap.set(heroAccents, { y: 20, autoAlpha: 0 });

    // Wait (briefly) for the frames so the flicker never shows an empty lens.
    await Promise.race([
      Promise.all(frames.map((img) => (img.decode ? img.decode().catch(() => {}) : Promise.resolve()))),
      new Promise((resolve) => setTimeout(resolve, 1400)),
    ]);
    // A newer run (or unmount) superseded this one while frames were decoding.
    if (!openingContainerRef.current || runId !== openingRunRef.current) return;

    const setFrameCount = (index) => {
      if (frameCountRef.current) frameCountRef.current.textContent = `${String(index + 1).padStart(2, '0')} / ${String(frames.length).padStart(2, '0')}`;
    };

    const tl = gsap.timeline({ defaults: { ease: 'power3.out' }, onComplete: hideOpening });
    openingTimelineRef.current = tl;

    // Safety net: the page must never stay behind the opening (e.g. a stalled animation frame loop).
    window.setTimeout(() => {
      if (runId === openingRunRef.current && openingContainerRef.current?.style.display !== 'none') skipOpening();
    }, 9000);

    tl
      .to(wordLeft, { xPercent: -8, autoAlpha: 1, duration: 2.6, ease: 'power2.out' }, 0.05)
      .to(wordRight, { xPercent: 8, autoAlpha: 1, duration: 2.6, ease: 'power2.out' }, 0.05)
      // Shutter opens vertically into a portrait lens
      .to(iris, { top: insetY, bottom: insetY, duration: 0.75, ease: 'expo.inOut', onUpdate: applyIris }, 0.2)
      .to(lens, { autoAlpha: 1, scale: 1, duration: 0.6 }, 0.55)
      .to(caption, { autoAlpha: 1, y: 0, duration: 0.6 }, 0.7);

    // Frames flicker in like a fashion shoot, each with a soft flash
    const firstFrameAt = 0.45;
    const frameStep = 0.54;
    frames.forEach((frame, index) => {
      const at = firstFrameAt + index * frameStep;
      tl.call(() => setFrameCount(index), null, at)
        .set(frame, { autoAlpha: 1 }, at)
        .to(frame, { scale: 1, duration: 0.9, ease: 'power2.out' }, at)
        .fromTo(flash, { autoAlpha: 0.55 }, { autoAlpha: 0, duration: 0.32, ease: 'power2.out' }, at);
      if (index > 0) tl.set(frames[index - 1], { autoAlpha: 0 }, at + 0.02);
    });

    // The last frame (the hero image) breaks out of the lens to full screen
    const expandAt = firstFrameAt + frames.length * frameStep + 0.25;
    tl.to(lens, { autoAlpha: 0, scale: 1.08, duration: 0.35, ease: 'power2.in' }, expandAt - 0.1)
      .to(caption, { autoAlpha: 0, y: -10, duration: 0.3, ease: 'power2.in' }, expandAt - 0.1)
      .to(iris, { top: 0, right: 0, bottom: 0, left: 0, duration: 1.15, ease: 'expo.inOut', onUpdate: applyIris }, expandAt)
      .to(finalFrame, {
        top: 0, left: 0, width: vw, height: vh,
        objectPosition: heroImage ? window.getComputedStyle(heroImage).objectPosition : '72% 35px',
        duration: 1.15, ease: 'expo.inOut',
      }, expandAt)
      .to(shade, { autoAlpha: 1, duration: 0.9, ease: 'power2.inOut' }, expandAt + 0.35)
      .to(wordLeft, { xPercent: -130, autoAlpha: 0, duration: 1.1, ease: 'expo.in' }, expandAt - 0.05)
      .to(wordRight, { xPercent: 130, autoAlpha: 0, duration: 1.1, ease: 'expo.in' }, expandAt - 0.05)
      .to(chrome, { autoAlpha: 0, duration: 0.4 }, expandAt + 0.3);

    // Hero copy rises as the frame settles; then the overlay quietly dissolves
    if (heroTitles.length) tl.to(heroTitles, { yPercent: 0, autoAlpha: 1, duration: 1, stagger: 0.1 }, expandAt + 0.85);
    if (heroAccents.length) tl.to(heroAccents, { y: 0, autoAlpha: 1, duration: 0.8, stagger: 0.07 }, expandAt + 1.05);
    tl.call(() => setChromeHidden(false), null, expandAt + 1.1)
      .to(openingEl, { autoAlpha: 0, duration: 0.45, ease: 'power1.out' }, expandAt + 1.1);
  };

  const skipOpening = () => {
    if (openingTimelineRef.current) {
      openingTimelineRef.current.progress(1);
    }
    hideOpening();
  };

  useEffect(() => {
    openingRunRef.current += 1;
    playOpeningAnimation(openingRunRef.current);
    return () => {
      openingRunRef.current += 1;
      if (openingTimelineRef.current) {
        openingTimelineRef.current.kill();
      }
      setChromeHidden(false);
    };
  }, []);

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape' && openingActive) {
        skipOpening();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [openingActive]);

  useEffect(() => {
    const root = pageRef.current;
    if (!root || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;

    const context = gsap.context(() => {
      const hero = root.querySelector('.lj-hero');
      const heroImage = hero?.querySelector('.lj-hero-image img');
      const manifest = root.querySelector('.lj-manifest');
      const film = root.querySelector('.lj-film');
      const scenes = Array.from(root.querySelectorAll('.lj-scene'));

      if (heroImage) gsap.to(heroImage, {
        opacity: 0.4, ease: 'none',
        scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: 0.7 },
      });

      if (manifest) {
        gsap.fromTo(manifest.querySelectorAll('.lj-overline, p, .lj-manifest-rule, small'),
          { y: 64, autoAlpha: 0 },
          { y: 0, autoAlpha: 1, duration: 1.15, stagger: 0.12, ease: 'power3.out',
            scrollTrigger: { trigger: manifest, start: 'top 78%', once: true } });
      }

      if (film && scenes.length > 1 && window.matchMedia('(min-width: 901px)').matches) {
        const filmTimeline = gsap.timeline({
          scrollTrigger: {
            trigger: film, start: 'top top', end: '+=240%', pin: true,
            scrub: 0.75, anticipatePin: 1, invalidateOnRefresh: true,
          },
        });
        scenes.slice(1).forEach((scene, index) => {
          const at = index;
          filmTimeline.to(scene, { clipPath: 'inset(0% 0 0 0)', duration: 1, ease: 'none' }, at);
          filmTimeline.fromTo(scene.querySelector('.lj-scene-image img'),
            { scale: 1.14, yPercent: 5 }, { scale: 1, yPercent: 0, duration: 1, ease: 'none' }, at);
          filmTimeline.fromTo(scene.querySelector('.lj-scene-copy'),
            { y: 55, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.55, ease: 'power2.out' }, at + 0.3);
        });
        gsap.to(film.querySelector('.lj-film-progress span'), {
          scaleX: 1, transformOrigin: 'left center', ease: 'none',
          scrollTrigger: { trigger: film, start: 'top top', end: '+=240%', scrub: true },
        });
      } else {
        scenes.forEach((scene) => {
          gsap.fromTo(scene.querySelector('.lj-scene-copy'),
            { y: 44, autoAlpha: 0 },
            { y: 0, autoAlpha: 1, duration: 0.9, ease: 'power3.out',
              scrollTrigger: { trigger: scene, start: 'top 74%', once: true } });
          gsap.fromTo(scene.querySelector('.lj-scene-image img'),
            { scale: 1.1 }, { scale: 1, duration: 1.4, ease: 'power2.out',
              scrollTrigger: { trigger: scene, start: 'top 78%', once: true } });
        });
      }

      const archive = root.querySelector('.lj-archive');
      if (archive) gsap.fromTo(archive.querySelector('.lj-archive-head'),
        { y: 65, autoAlpha: 0 },
        { y: 0, autoAlpha: 1, duration: 1, ease: 'power3.out',
          scrollTrigger: { trigger: archive, start: 'top 77%', once: true } });

      const finale = root.querySelector('.lj-finale');
      if (finale) {
        gsap.fromTo(finale.querySelector('.lj-finale-art img'),
          { scale: 1.15 }, { scale: 1, ease: 'none',
            scrollTrigger: { trigger: finale, start: 'top bottom', end: 'bottom top', scrub: 0.8 } });
        gsap.fromTo(finale.querySelectorAll('.lj-finale-copy > *'),
          { y: 42, autoAlpha: 0 },
          { y: 0, autoAlpha: 1, duration: 0.8, stagger: 0.12, ease: 'power3.out',
            scrollTrigger: { trigger: finale, start: 'top 72%', once: true } });
      }
    }, root);

    return () => context.revert();
  }, []);

  useEffect(() => {
    const root = pageRef.current;
    if (!root || status !== 'ready' || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;
    const context = gsap.context(() => {
      root.querySelectorAll('.lj-look').forEach((look) => {
        gsap.fromTo(look, { y: 68, autoAlpha: 0 }, {
          y: 0, autoAlpha: 1, duration: 0.95, ease: 'power3.out',
          scrollTrigger: { trigger: look, start: 'top 88%', once: true },
        });
      });
    }, root);
    return () => context.revert();
  }, [status, category, looks]);

  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), 8000);
    setStatus('loading');
    apiFetch('/api/looks', { signal: controller.signal }).then((result) => {
      if (cancelled) return;
      if (!result.success || !Array.isArray(result.data)) { setStatus('error'); return; }
      setLooks(result.data.filter((look) => look._id || look.id));
      setStatus('ready');
    }).catch(() => { if (!cancelled) setStatus('error'); }).finally(() => window.clearTimeout(timeoutId));
    return () => {
      cancelled = true;
      window.clearTimeout(timeoutId);
      controller.abort();
    };
  }, [attempt]);

  const categories = [...new Set(looks.flatMap((look) => (look.items || []).map((item) => item.category).filter(Boolean)))];
  const filtered = category === 'all' ? looks : looks.filter((look) => look.items?.some((item) => item.category === category));
  const scrollTo = (id) => document.getElementById(id)?.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
  const open = (look) => setSelectedLookId(look._id || look.id);

  return <main ref={pageRef} className="lj">
    <SEO title={`${copy.label} | LUXX`} description={copy.heroIntro} canonicalPath="/lookbooks" structuredData={{ '@context': 'https://schema.org', '@type': 'CollectionPage', name: copy.label, url: 'https://luxx.uz/lookbooks', inLanguage: language }} />

    {/* Opening: "the shoot" — see playOpeningAnimation. Portalled to <body> so no page
        stacking context (main content is z-10) lets the navbar or prompts paint over it. */}
    {createPortal(<div className="lj-opening" ref={openingContainerRef} role="dialog" aria-label={copy.edition}>
      <div className="lj-op-words" aria-hidden="true">
        <span className="lj-op-word lj-op-word--l">Look</span>
        <span className="lj-op-word lj-op-word--r"><em>book</em></span>
      </div>
      <div className="lj-op-aperture" aria-hidden="true">
        {OPENING_FRAMES.map((src, index) => (
          <img
            key={src}
            src={src}
            alt=""
            decoding="async"
            className={`lj-op-frame${index === OPENING_FRAMES.length - 1 ? ' lj-op-frame--final' : ''}`}
          />
        ))}
        <div className="lj-op-shade" />
        {/* Inside the aperture so the flash lights the lens only */}
        <div className="lj-op-flash" />
      </div>
      <div className="lj-op-lens" aria-hidden="true" />
      <div className="lj-op-grain" aria-hidden="true" />

      <header className="lj-op-top">
        <span className="lj-op-rec"><i aria-hidden="true" />LUXX · {copy.edition}</span>
        <span>VOL. 01 — {new Date().getFullYear()}</span>
        <button type="button" onClick={skipOpening} className="lj-op-skip" aria-label={copy.skip}>
          {copy.skip} <kbd>ESC</kbd>
        </button>
      </header>

      <p className="lj-op-caption">{copy.openingCaption}</p>

      <footer className="lj-op-bottom">
        <span>FRAME <span ref={frameCountRef} className="lj-op-frame-count">01 / {String(OPENING_FRAMES.length).padStart(2, '0')}</span></span>
        <span>TOSHKENT · ATELIER</span>
      </footer>
    </div>, document.body)}

    <section className="lj-hero" aria-labelledby="lj-title">
      <div className="lj-hero-image"><img src={HERO_IMAGE} alt="" fetchpriority="high" /></div>
      <div className="lj-hero-shade" />
      <div className="lj-hero-meta">
        <span>LUXX / THE LOOKBOOK</span>
        <span>VOL. 01 — {new Date().getFullYear()}</span>
      </div>
      <div className="lj-hero-content"><span className="lj-overline">THE ART OF BEING YOU</span><h1 id="lj-title" className="lj-hero-title"><span>{copy.heroOne}</span><span><em>{copy.heroTwo}</em></span></h1></div>
      <div className="lj-hero-bottom"><div><p>{copy.heroIntro}</p><button onClick={() => scrollTo('lj-manifest')} className="lj-round-link" aria-label={copy.explore}><ArrowDown size={21} /></button></div><span>{copy.scroll} <span className="lj-scroll-line" /></span></div>
      <span className="lj-hero-side">LUXX — EDITORIAL STORIES</span>
    </section>
    <section className="lj-manifest" id="lj-manifest"><div className="lj-manifest-inner"><span className="lj-overline">{copy.statementTop}</span><p>{copy.statement}</p><span className="lj-manifest-rule" /><small>{copy.statementBottom}</small></div></section>
    <section className="lj-film" aria-label={copy.chaptersTop}>
      {copy.chapters.map((chapter, index) => <article className="lj-scene" key={chapter.word}>
        <div className="lj-scene-image"><img src={CHAPTER_IMAGES[index]} alt="" loading={index === 0 ? 'eager' : 'lazy'} /></div>
        <div className="lj-scene-veil" />
        <div className="lj-scene-top"><span>{copy.chaptersTop}</span><span>0{index + 1} / 03</span></div>
        <div className="lj-scene-copy"><span className="lj-overline">LUXX / {chapter.word}</span><h2>{chapter.title}</h2><p>{chapter.text}</p><button onClick={() => scrollTo('lj-archive')} className="lj-text-link">{copy.archiveTitle}<ArrowUpRight size={18} /></button></div>
        <span className="lj-scene-word" aria-hidden="true">{chapter.word}</span>
      </article>)}
      <div className="lj-film-progress"><span /></div>
    </section>
    <section className="lj-archive" id="lj-archive" aria-labelledby="lj-archive-title">
      <div className="lj-archive-head"><span className="lj-overline">{copy.archiveTop}</span><h2 id="lj-archive-title">{copy.archiveTitle}</h2><span className="lj-archive-count">{String(looks.length).padStart(2, '0')} / LUXX</span></div>
      {categories.length > 0 && <nav className="lj-categories" aria-label={copy.label}>{['all', ...categories].map((item) => <button key={item} aria-pressed={category === item} onClick={() => setCategory(item)}>{item === 'all' ? copy.all : item}<span>{item === 'all' ? looks.length : looks.filter((look) => look.items?.some((entry) => entry.category === item)).length}</span></button>)}</nav>}
      {status === 'loading' ? <div className="lj-status" role="status">{copy.loading}<span className="lj-spinner" /></div> : status === 'error' ? <div className="lj-status" role="status"><span>{copy.error}</span><button onClick={() => setAttempt((value) => value + 1)}>{copy.retry}<ArrowRight size={17} /></button></div> : filtered.length === 0 ? <div className="lj-status"><span>{copy.empty}</span>{category !== 'all' && <button onClick={() => setCategory('all')}>{copy.all}<ArrowRight size={17} /></button>}</div> : <div className="lj-looks">{filtered.map((look, index) => <article className="lj-look" key={look._id || look.id}>
        <button className="lj-look-art" onClick={() => open(look)} aria-label={`${copy.open}: ${look.title}`}><img src={look.heroImage || FALLBACK} alt={look.title} loading="lazy" onError={imageFallback} /><span className="lj-look-action"><ArrowUpRight size={21} /></span></button>
        <div className="lj-look-info"><span>0{index + 1} / {look.items?.[0]?.category || copy.label}</span><button onClick={() => open(look)}>{look.title}<ArrowUpRight size={20} /></button><small>{look.products?.length || 0} {copy.pieces}</small></div>
      </article>)}</div>}
    </section>
    <section className="lj-finale"><div className="lj-finale-art"><img src="/editorial/lookbook-detail-v2.png" alt="" loading="lazy" /></div><div className="lj-finale-copy"><span className="lj-overline">{copy.createTop}</span><h2>{copy.create}</h2><p>{copy.createText}</p><Link to="/lookbook-builder" className="lj-finale-cta">{copy.builder}<Plus size={22} /></Link><Link to="/products" className="lj-text-link">{copy.shop}<ArrowUpRight size={18} /></Link></div></section>
    <footer className="lj-footer"><span>LUXX</span><span>{copy.label} / {new Date().getFullYear()}</span><Link to="/products">{copy.shop}<ArrowUpRight size={16} /></Link></footer>
    {selectedLookId && <LookDetailModal lookId={selectedLookId} onClose={() => setSelectedLookId(null)} />}
  </main>;
}
