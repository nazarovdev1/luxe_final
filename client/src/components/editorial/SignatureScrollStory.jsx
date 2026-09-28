import React, { useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { useLanguage } from '../../contexts/LanguageContext';

gsap.registerPlugin(ScrollTrigger, useGSAP);

export default function SignatureScrollStory() {
  const trackRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const { language } = useLanguage();

  const concepts = {
    uz: [
      {
        num: '01',
        label: '01 — SILUET',
        title: 'QOMATNI DAVOM ETTIRUVCHI ANIQ KESIM',
        body: 'Qomatni yashirmaydigan, balki uning tabiiy chiziqlarini davom ettiradigan arxitektural proporsiya.',
        subtext: 'ANATOMIK ANDOZA · SOKIN ISHONCH',
        image: '/heroimgg.jpg',
        fig: 'FIG. 01 — THE LINE',
      },
      {
        num: '02',
        label: '02 — TEKSTURA',
        title: 'QO‘L TEGMASIDAN SIFATI SEZILADIGAN MATO',
        body: 'Haqiqiy hashamat — ko‘z bilan emas, tananing har bir tebranishi bilan his qilinadigan tabiiy xomashyo.',
        subtext: 'RAW CASHMERE · MULBERRY SILK',
        image: '/about_photo.jpg',
        fig: 'FIG. 02 — THE MATTER',
      },
      {
        num: '03',
        label: '03 — HUZUR',
        title: 'XONAGA KIRGANINGIZDA SIZ SEZILASIZ',
        body: 'Kiyim sizdan oldin gapirmaydi. Birinchi bo‘lib sizning xarakteringiz va samimiy qudratingiz namoyon bo‘ladi.',
        subtext: 'TIMELESS PRESENCE · TASHKENT ATELIER',
        image: '/second_pose.jpg',
        fig: 'FIG. 03 — THE PRESENCE',
      },
    ],
    ru: [
      {
        num: '01',
        label: '01 — СИЛУЭТ',
        title: 'ТОЧНЫЙ КРОЙ, ПРОДОЛЖАЮЩИЙ ЛИНИИ ТЕЛА',
        body: 'Не скрывающий силуэт, а естественно продолжающий его архитектурные пропорции.',
        subtext: 'АНАТОМИЧЕСКИЙ КРОЙ · ТИХАЯ УВЕРЕННОСТЬ',
        image: '/heroimgg.jpg',
        fig: 'FIG. 01 — THE LINE',
      },
      {
        num: '02',
        label: '02 — ТЕКСТУРА',
        title: 'МАТЕРИЯ, ЧУВСТВУЮЩАЯСЯ ДО ПРИКОСНОВЕНИЯ',
        body: 'Истинная роскошь ощущается не визуальным шумом, а каждым движением благородного полотна.',
        subtext: 'RAW CASHMERE · MULBERRY SILK',
        image: '/about_photo.jpg',
        fig: 'FIG. 02 — THE MATTER',
      },
      {
        num: '03',
        label: '03 — ПРИСУТСТВИЕ',
        title: 'ВХОДЯ В ЗАЛ, ПЕРВОЙ ЗАМЕЧАЮТ ВАС',
        body: 'Одежда не говорит громче хозяйки. Сначала считывается ваше спокойствие и внутренняя сила.',
        subtext: 'TIMELESS PRESENCE · TASHKENT ATELIER',
        image: '/second_pose.jpg',
        fig: 'FIG. 03 — THE PRESENCE',
      },
    ],
    en: [
      {
        num: '01',
        label: '01 — SILHOUETTE',
        title: 'A CUT THAT EXTENDS YOUR FORM',
        body: 'Garments designed not to disguise posture, but to honor and seamlessly carry its natural architecture.',
        subtext: 'ANATOMIC PATTERN · POISE IN MOTION',
        image: '/heroimgg.jpg',
        fig: 'FIG. 01 — THE LINE',
      },
      {
        num: '02',
        label: '02 — TEXTURE',
        title: 'QUALITY FELT BEFORE TOUCH',
        body: 'True luxury requires no loud declarations; it breathes naturally against the skin with effortless grace.',
        subtext: 'RAW CASHMERE · MULBERRY SILK',
        image: '/about_photo.jpg',
        fig: 'FIG. 02 — THE MATTER',
      },
      {
        num: '03',
        label: '03 — PRESENCE',
        title: 'YOU ARE FELT BEFORE THE GARMENT',
        body: 'When you step into the room, clothing does not announce itself first — your quiet authority does.',
        subtext: 'TIMELESS PRESENCE · TASHKENT ATELIER',
        image: '/second_pose.jpg',
        fig: 'FIG. 03 — THE PRESENCE',
      },
    ],
  }[language] || [
    {
      num: '01',
      label: '01 — SILUET',
      title: 'QOMATNI DAVOM ETTIRUVCHI ANIQ KESIM',
      body: 'Qomatni yashirmaydigan, balki uning tabiiy chiziqlarini davom ettiradigan arxitektural proporsiya.',
      subtext: 'ANATOMIK ANDOZA · SOKIN ISHONCH',
      image: '/heroimgg.jpg',
      fig: 'FIG. 01 — THE LINE',
    },
    {
      num: '02',
      label: '02 — TEKSTURA',
      title: 'QO‘L TEGMASIDAN SIFATI SEZILADIGAN MATO',
      body: 'Haqiqiy hashamat — ko‘z bilan emas, tananing har bir tebranishi bilan his qilinadigan tabiiy xomashyo.',
      subtext: 'RAW CASHMERE · MULBERRY SILK',
      image: '/about_photo.jpg',
      fig: 'FIG. 02 — THE MATTER',
    },
    {
      num: '03',
      label: '03 — HUZUR',
      title: 'XONAGA KIRGANINGIZDA SIZ SEZILASIZ',
      body: 'Kiyim sizdan oldin gapirmaydi. Birinchi bo‘lib sizning xarakteringiz va samimiy qudratingiz namoyon bo‘ladi.',
      subtext: 'TIMELESS PRESENCE · TASHKENT ATELIER',
      image: '/second_pose.jpg',
      fig: 'FIG. 03 — THE PRESENCE',
    },
  ];

  const current = concepts[activeIndex] || concepts[0];

  useGSAP(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (window.innerWidth <= 1024) return; // Desktop-first pinned stage

    const track = trackRef.current;
    if (!track) return;

    ScrollTrigger.create({
      trigger: track,
      start: 'top top',
      end: 'bottom bottom',
      scrub: true,
      onUpdate: (self) => {
        const p = self.progress;
        let index = 0;
        if (p >= 0.66) {
          index = 2;
        } else if (p >= 0.33) {
          index = 1;
        }
        setActiveIndex((prev) => (prev !== index ? index : prev));
      },
    });
  }, { scope: trackRef, dependencies: [language] });

  return (
    <section ref={trackRef} className="e-signature-track" aria-label="Signature Philosophy Moment">
      <div className="e-signature-stage">
        <div className="e-signature-layout">
          {/* Left Column: Transforming Concept Typography */}
          <div className="e-signature-left">
            <div className="e-signature-stepper">
              {concepts.map((c, i) => (
                <button
                  key={c.num}
                  type="button"
                  className={`e-step-indicator ${activeIndex === i ? 'is-active' : ''}`}
                  onClick={() => setActiveIndex(i)}
                  aria-label={`Jump to concept ${c.num}`}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                >
                  {c.num}
                </button>
              ))}
              <div className="e-step-line">
                <div
                  className="e-step-progress"
                  style={{ width: `${((activeIndex + 1) / concepts.length) * 100}%` }}
                />
              </div>
            </div>

            <div className="e-signature-concept" key={current.num}>
              <span className="e-signature-concept-num">{current.label}</span>
              <h3 className="e-signature-concept-title">{current.title}</h3>
              <p className="e-signature-concept-body">{current.body}</p>
              <div className="e-signature-subtext">{current.subtext}</div>
            </div>
          </div>

          {/* Right Column: Architectural Image Viewport Changing in Place */}
          <div className="e-signature-right">
            {concepts.map((c, i) => (
              <div
                key={c.num}
                className={`e-signature-frame ${activeIndex === i ? 'is-active' : ''}`}
                aria-hidden={activeIndex !== i}
              >
                <img
                  src={c.image}
                  alt={c.title}
                  loading={i === 0 ? 'eager' : 'lazy'}
                  onError={(e) => { e.currentTarget.src = '/heroimg.jpg'; }}
                />
                <div className="e-signature-frame-shade" />
                <div className="e-signature-frame-caption">{c.fig}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
