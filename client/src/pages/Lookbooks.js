import React, { useEffect, useRef, useState } from 'react';
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
    skip: 'O‘tkazib yuborish', replay: 'Opening', edition: 'Kolleksiya obrazlari',
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
    skip: 'Пропустить', replay: 'Интро', edition: 'Коллекция образов',
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
    skip: 'Skip', replay: 'Intro', edition: 'Collection Lookbook',
  },
};

const CHAPTER_IMAGES = ['/editorial/story-softness-v2.png', '/editorial/story-posture-v2.png', '/editorial/private-edit-evening.png'];
const FALLBACK = '/editorial/private-edit-evening.png';
const imageFallback = (event) => { if (!event.currentTarget.src.endsWith(FALLBACK)) event.currentTarget.src = FALLBACK; };

export default function Lookbooks() {
  const pageRef = useRef(null);
  const openingContainerRef = useRef(null);
  const counterRef = useRef(null);
  const progressRef = useRef(null);
  const openingTimelineRef = useRef(null);
  const [openingActive, setOpeningActive] = useState(true);

  const { language } = useLanguage();
  const copy = COPY[language] || COPY.uz;
  const [looks, setLooks] = useState([]);
  const [status, setStatus] = useState('loading');
  const [attempt, setAttempt] = useState(0);
  const [category, setCategory] = useState('all');
  const [selectedLookId, setSelectedLookId] = useState(null);

  const playOpeningAnimation = () => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setOpeningActive(false);
      return;
    }

    setOpeningActive(true);
    const root = pageRef.current;
    if (!root) return;

    if (openingTimelineRef.current) {
      openingTimelineRef.current.kill();
    }

    const openingEl = openingContainerRef.current;
    if (!openingEl) return;
    openingEl.style.display = 'flex';
    openingEl.style.pointerEvents = 'auto';

    const leftPanel = root.querySelector('.lj-opening-panel--left');
    const rightPanel = root.querySelector('.lj-opening-panel--right');
    const seam = root.querySelector('.lj-opening-seam');
    const stage = root.querySelector('.lj-opening-stage');
    const topBar = root.querySelector('.lj-opening-top');
    const bottomBar = root.querySelector('.lj-opening-bottom');
    const counterEl = counterRef.current;
    const progressEl = progressRef.current;
    const heroImage = root.querySelector('.lj-hero-image img');
    const heroTitles = root.querySelectorAll('.lj-hero-title span');
    const heroMeta = root.querySelector('.lj-hero-meta');
    const heroOverline = root.querySelector('.lj-hero-content .lj-overline');
    const heroBottom = root.querySelector('.lj-hero-bottom');
    const heroSide = root.querySelector('.lj-hero-side');

    // Reset initial states
    if (leftPanel && rightPanel) gsap.set([leftPanel, rightPanel], { xPercent: 0 });
    if (seam) gsap.set(seam, { scaleY: 1, autoAlpha: 1 });
    if (stage) gsap.set(stage, { scale: 1, y: 0, autoAlpha: 1, filter: 'blur(0px)' });
    if (topBar && bottomBar) gsap.set([topBar, bottomBar], { autoAlpha: 1, y: 0 });
    if (progressEl) gsap.set(progressEl, { scaleX: 0 });
    if (counterEl) counterEl.textContent = '00';
    if (openingEl) gsap.set(openingEl, { autoAlpha: 1 });

    // Prime the hero elements underneath the curtains so they enter fluidly
    if (heroImage) gsap.set(heroImage, { scale: 1.05, transformOrigin: '72% 25%', filter: 'brightness(0.65)' });
    if (heroTitles && heroTitles.length) gsap.set(heroTitles, { yPercent: 105, autoAlpha: 0 });
    if (heroOverline) gsap.set(heroOverline, { y: 22, autoAlpha: 0 });
    if (heroMeta) gsap.set(heroMeta, { y: -18, autoAlpha: 0 });
    if (heroBottom) gsap.set(heroBottom, { y: 22, autoAlpha: 0 });
    if (heroSide) gsap.set(heroSide, { autoAlpha: 0 });

    const tl = gsap.timeline({
      defaults: { ease: 'power3.out' },
      onComplete: () => {
        if (openingEl) {
          openingEl.style.display = 'none';
          openingEl.style.pointerEvents = 'none';
        }
        setOpeningActive(false);
        ScrollTrigger.refresh();
      },
    });

    openingTimelineRef.current = tl;

    // 1. Opening stage text entrance
    if (stage) {
      tl.fromTo(stage.children,
        { y: 35, autoAlpha: 0 },
        { y: 0, autoAlpha: 1, duration: 0.8, stagger: 0.08, ease: 'power3.out' },
        0.1
      );
    }

    // Top & bottom chrome bars
    if (topBar && bottomBar) {
      tl.fromTo([topBar, bottomBar],
        { autoAlpha: 0 },
        { autoAlpha: 1, duration: 0.6 },
        0.2
      );
    }

    // Counter ticker 00 -> 100
    const counterObj = { val: 0 };
    tl.to(counterObj, {
      val: 100,
      duration: 1.3,
      ease: 'power2.inOut',
      onUpdate: () => {
        if (counterEl) {
          counterEl.textContent = Math.round(counterObj.val).toString().padStart(2, '0');
        }
      },
    }, 0.2);

    // Progress bar runner
    if (progressEl) {
      tl.to(progressEl, {
        scaleX: 1,
        duration: 1.3,
        ease: 'power2.inOut',
      }, 0.2);
    }

    // 2. Stage dissolve & lift
    if (stage) {
      tl.to(stage, {
        scale: 1.04,
        y: -22,
        autoAlpha: 0,
        filter: 'blur(8px)',
        duration: 0.45,
        ease: 'power2.in',
      }, 1.5);
    }

    if (topBar && bottomBar) {
      tl.to([topBar, bottomBar], {
        autoAlpha: 0,
        y: (i) => (i === 0 ? -16 : 16),
        duration: 0.35,
        ease: 'power2.in',
      }, 1.55);
    }

    if (seam) {
      tl.to(seam, {
        scaleY: 0,
        autoAlpha: 0,
        duration: 0.3,
        ease: 'power2.in',
      }, 1.55);
    }

    // 3. CURTAINS PARTING (Dual split reveals underlying hero seamlessly!)
    if (leftPanel && rightPanel) {
      tl.to(leftPanel, {
        xPercent: -101,
        duration: 1.25,
        ease: 'power4.inOut',
      }, 1.6);

      tl.to(rightPanel, {
        xPercent: 101,
        duration: 1.25,
        ease: 'power4.inOut',
      }, 1.6);
    }

    // 4. HERO ANIMATES IN SYNCHRONY WITH THE PARTING CURTAINS
    // As curtains open, hero image scales from 1.15 to 1.0 and brightens
    if (heroImage) {
      tl.to(heroImage, {
        scale: 1,
        filter: 'brightness(1)',
        duration: 1.35,
        ease: 'power3.out',
      }, 1.6);
    }

    // Hero title lines slide up from clip masks
    if (heroTitles && heroTitles.length) {
      tl.to(heroTitles, {
        yPercent: 0,
        autoAlpha: 1,
        duration: 1.0,
        stagger: 0.1,
        ease: 'power3.out',
      }, 1.8);
    }

    const heroAccents = [heroOverline, heroMeta, heroBottom, heroSide].filter(Boolean);
    if (heroAccents.length) {
      tl.to(heroAccents, {
        y: 0,
        autoAlpha: 1,
        duration: 0.85,
        stagger: 0.08,
        ease: 'power3.out',
      }, 2.0);
    }

    // Smooth invisible handoff for opening container
    tl.to(openingEl, {
      autoAlpha: 0,
      duration: 0.2,
      ease: 'none',
    }, 2.8);
  };

  const skipOpening = () => {
    if (openingTimelineRef.current) {
      openingTimelineRef.current.progress(1);
    }
    const openingEl = openingContainerRef.current;
    if (openingEl) {
      openingEl.style.display = 'none';
      openingEl.style.pointerEvents = 'none';
    }
    setOpeningActive(false);
  };

  useEffect(() => {
    playOpeningAnimation();
    return () => {
      if (openingTimelineRef.current) {
        openingTimelineRef.current.kill();
      }
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

    {/* Cinematic Editorial Opening Overlay */}
    <div className="lj-opening" ref={openingContainerRef} role="dialog" aria-label="Lookbook Opening">
      <div className="lj-opening-panel lj-opening-panel--left" />
      <div className="lj-opening-panel lj-opening-panel--right" />
      <div className="lj-opening-seam" />

      <header className="lj-opening-top">
        <span>LUXX MAISON D'ÉDITION</span>
        <span className="lj-opening-vol">VOL. 01 — {new Date().getFullYear()}</span>
        <button
          type="button"
          onClick={skipOpening}
          className="lj-opening-skip"
          aria-label={copy.skip}
        >
          <span>{copy.skip}</span>
          <span className="lj-opening-skip-key">ESC</span>
        </button>
      </header>

      <div className="lj-opening-stage">
        <div className="lj-opening-crest" aria-hidden="true">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
            <path d="M12 2L21 12L12 22L3 12L12 2Z" stroke="#d8b988" strokeWidth="1.2" />
            <circle cx="12" cy="12" r="2.5" fill="#d8b988" />
          </svg>
        </div>
        <span className="lj-opening-kicker">{copy.edition}</span>
        <div className="lj-opening-title">
          <div className="lj-opening-line"><span>{copy.heroOne}</span></div>
          <div className="lj-opening-line"><span><em>{copy.heroTwo}</em></span></div>
        </div>
        <p className="lj-opening-quote">{copy.heroIntro}</p>
      </div>

      <footer className="lj-opening-bottom">
        <span className="lj-opening-counter">
          <span ref={counterRef}>00</span><em>%</em>
        </span>
        <div className="lj-opening-progress">
          <span ref={progressRef} />
        </div>
        <span>TASHKENT • MILAN • PARIS</span>
      </footer>
    </div>

    <section className="lj-hero" aria-labelledby="lj-title">
      <div className="lj-hero-image"><img src="/editorial/lookbook-mood-v2.png" alt="" fetchPriority="high" /></div>
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
