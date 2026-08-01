import React, { useLayoutEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowDownRight, ArrowUpRight, Gem, Layers3, Sparkles, Truck } from 'lucide-react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import SEO from '../components/SEO';
import Footer from '../components/Footer';
import { useLanguage } from '../contexts/LanguageContext';

gsap.registerPlugin(ScrollTrigger);

const AboutPage = () => {
  const { t } = useLanguage();
  const pageRef = useRef(null);

  useLayoutEffect(() => {
    const root = pageRef.current;
    if (!root || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;

    const context = gsap.context(() => {
      const heroTimeline = gsap.timeline({ defaults: { ease: 'power4.out' } });
      heroTimeline
        .fromTo('[data-about-hero-image]', { scale: 1.16, filter: 'grayscale(1) contrast(1.12)' }, { scale: 1, filter: 'grayscale(.2) contrast(1)', duration: 1.2 })
        .fromTo('[data-about-kicker]', { y: 18, opacity: 0 }, { y: 0, opacity: 1, duration: 0.55 }, '-=.8')
        .fromTo('[data-about-title] .word', { yPercent: 115, rotate: 4 }, { yPercent: 0, rotate: 0, stagger: 0.12, duration: 0.9 }, '-=.25')
        .fromTo('[data-about-copy]', { y: 24, opacity: 0 }, { y: 0, opacity: 1, duration: 0.75 }, '-=.52')
        .fromTo('[data-about-rail]', { x: 42, opacity: 0 }, { x: 0, opacity: 1, duration: 0.75 }, '-=.65');

      gsap.to('[data-about-hero-image]', {
        yPercent: 8,
        ease: 'none',
        scrollTrigger: { trigger: '[data-about-hero]', start: 'top top', end: 'bottom top', scrub: 0.8 },
      });

      gsap.utils.toArray('[data-about-reveal]').forEach((section) => {
        const targets = section.querySelectorAll('[data-about-reveal-item]');
        gsap.fromTo(targets, { y: 52, opacity: 0 }, {
          y: 0,
          opacity: 1,
          duration: 0.9,
          stagger: 0.14,
          ease: 'power3.out',
          scrollTrigger: { trigger: section, start: 'top 76%' },
        });
      });

      gsap.utils.toArray('[data-about-wipe]').forEach((image) => {
        gsap.fromTo(image, { clipPath: 'inset(0 100% 0 0)' }, {
          clipPath: 'inset(0 0% 0 0)',
          duration: 1.3,
          ease: 'power4.inOut',
          scrollTrigger: { trigger: image, start: 'top 78%' },
        });
      });

      gsap.to('[data-about-mosaic-main]', {
        yPercent: -8,
        ease: 'none',
        scrollTrigger: { trigger: '[data-about-mosaic]', start: 'top bottom', end: 'bottom top', scrub: 1 },
      });
    }, root);

    return () => context.revert();
  }, []);

  const pillars = [
    { number: '01', icon: Layers3, title: t('about.pillarDesign'), body: t('about.pillarDesignDesc') },
    { number: '02', icon: Gem, title: t('about.pillarPremium'), body: t('about.pillarPremiumDesc') },
    { number: '03', icon: Truck, title: t('about.pillarDelivery'), body: t('about.pillarDeliveryDesc') },
  ];

  const milestones = [
    { year: '2025', title: t('about.milestone1'), body: t('about.milestone1Desc') },
    { year: '2026', title: t('about.milestone2'), body: t('about.milestone2Desc') },
    { year: t('about.now'), title: t('about.milestone3'), body: t('about.milestone3Desc') },
  ];

  return (
    <div ref={pageRef} className="overflow-hidden bg-[#eee7db] text-[#191511] selection:bg-[#bd8b47] selection:text-white">
      <SEO title={`${t('nav.about')} — Luxx.uz`} description={t('about.description')} canonicalPath="/about" />

      <main>
        <section data-about-hero className="relative min-h-[100svh] overflow-hidden bg-[#120f0c] text-[#f7f0e5]">
          <div className="absolute inset-0 overflow-hidden">
            <img data-about-hero-image src="/second_pose.jpg" alt={t('about.brandTitle')} className="h-[112%] w-full object-cover object-[67%_center]" />
          </div>
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(11,9,8,.95)_0%,rgba(11,9,8,.74)_38%,rgba(11,9,8,.18)_75%,rgba(11,9,8,.08)_100%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_40%,transparent_0,rgba(0,0,0,.26)_44%,rgba(0,0,0,.67)_100%)]" />
          <div className="absolute inset-0 opacity-[.15] [background-image:radial-gradient(rgba(255,255,255,.7)_0.55px,transparent_0.55px)] [background-size:5px_5px]" />

          <div className="relative mx-auto flex min-h-[100svh] max-w-[1440px] items-end px-5 pb-12 pt-36 sm:px-10 sm:pb-16 lg:px-16 lg:pb-20">
            <div className="grid w-full gap-12 lg:grid-cols-[minmax(0,1fr)_220px] lg:items-end">
              <div className="max-w-4xl">
                <p data-about-kicker className="mb-7 flex items-center gap-3 text-[10px] font-medium uppercase tracking-[.34em] text-[#d7ad71] sm:text-xs">
                  <span className="h-px w-10 bg-[#d7ad71]" />
                  {t('about.brand')}
                </p>
                <h1 data-about-title className="font-brilliant text-[clamp(4.5rem,13vw,11rem)] leading-[0.92] tracking-[-.06em] text-[#f7f0e5]">
                  <span className="block overflow-hidden py-[0.25em] -my-[0.25em]"><span className="word block py-[0.05em]">SOFT</span></span>
                  <span className="block overflow-hidden pl-[.34em] py-[0.25em] -my-[0.25em] pr-[0.1em]"><span className="word block text-[#d3a468] py-[0.05em]">POWER</span></span>
                </h1>
                <div data-about-copy className="mt-9 flex max-w-xl flex-col gap-7 sm:mt-11 sm:flex-row sm:items-end">
                  <p className="text-base font-light leading-8 text-white/72 sm:text-lg">{t('about.visionText')}</p>
                  <a href="#atelier" className="group inline-flex shrink-0 items-center gap-3 text-xs font-semibold uppercase tracking-[.18em] text-[#f3e6d3] transition hover:text-[#d7ad71]">
                    {t('about.journey')}
                    <span className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 transition group-hover:border-[#d7ad71] group-hover:bg-[#d7ad71] group-hover:text-[#16110d]"><ArrowDownRight className="h-4 w-4" /></span>
                  </a>
                </div>
              </div>

              <aside data-about-rail className="grid grid-cols-3 border-t border-white/20 pt-5 lg:grid-cols-1 lg:border-l lg:border-t-0 lg:pl-7 lg:pt-0">
                {[
                  ['98%', t('about.satisfaction')],
                  ['3–6', t('about.pillarDelivery')],
                  ['14', t('about.pillarTrust')],
                ].map(([value, label]) => (
                  <div key={value} className="py-2 lg:border-b lg:border-white/15 lg:py-5">
                    <p className="font-brilliant text-3xl text-[#f6ecdf]">{value}</p>
                    <p className="mt-1 text-[9px] uppercase leading-4 tracking-[.16em] text-white/46">{label}</p>
                  </div>
                ))}
              </aside>
            </div>
          </div>
        </section>

        <section id="atelier" data-about-reveal className="relative px-5 py-24 sm:px-10 lg:px-16 lg:py-36">
          <div className="pointer-events-none absolute left-[-14rem] top-24 h-[32rem] w-[32rem] rounded-full bg-[#c79657]/18 blur-[140px]" />
          <div className="relative mx-auto grid max-w-[1280px] gap-14 lg:grid-cols-[.85fr_1.15fr] lg:items-end">
            <div data-about-reveal-item className="max-w-md lg:pb-12">
              <p className="text-[10px] font-semibold uppercase tracking-[.32em] text-[#936532]">01 / Atelier</p>
              <h2 className="mt-6 font-brilliant text-6xl leading-[.9] tracking-[-.045em] text-[#1e1711] sm:text-8xl">{t('about.quotePart1')}</h2>
              <p className="mt-4 max-w-sm text-2xl font-light leading-tight text-[#a2713c] sm:text-3xl">{t('about.quotePart2')}</p>
              <p className="mt-8 text-base leading-8 text-[#62584d]">{t('about.description')}</p>
            </div>

            <div data-about-mosaic className="relative min-h-[470px] sm:min-h-[610px]">
              <div data-about-wipe className="absolute inset-x-0 top-0 h-[78%] overflow-hidden bg-[#b7ab9b]">
                <img data-about-mosaic-main src="/about_photo.jpg" alt={t('about.brandTitle')} className="h-[112%] w-full object-cover object-center" />
              </div>
              <div data-about-wipe className="absolute bottom-0 left-0 w-[43%] overflow-hidden border-[10px] border-[#eee7db] bg-[#1c1714] sm:border-[14px]">
                <img src="/professional-woman-artist.jpg" alt={t('about.pillarDesign')} className="aspect-[3/4] w-full object-cover" />
              </div>
              <div data-about-reveal-item className="absolute bottom-8 right-0 max-w-[58%] bg-[#c79657] px-5 py-6 text-[#20170f] shadow-[0_24px_55px_rgba(84,54,20,.22)] sm:bottom-12 sm:px-8 sm:py-9">
                <Sparkles className="h-5 w-5" />
                <p className="mt-5 text-lg font-medium leading-7 sm:text-xl">{t('about.manifestoDesc')}</p>
              </div>
            </div>
          </div>
        </section>

        <section data-about-reveal className="bg-[#17120f] px-5 py-24 text-[#f6eee1] sm:px-10 lg:px-16 lg:py-36">
          <div className="mx-auto max-w-[1280px]">
            <div data-about-reveal-item className="grid gap-7 lg:grid-cols-[1fr_.62fr] lg:items-end">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[.32em] text-[#d7ad71]">02 / Signature</p>
                <h2 className="mt-6 max-w-3xl font-brilliant text-6xl leading-[.87] tracking-[-.05em] sm:text-8xl">{t('about.vision')}</h2>
              </div>
              <p className="max-w-md text-base leading-8 text-white/55">{t('about.visionText')}</p>
            </div>

            <div className="mt-16 grid overflow-hidden border-y border-white/15 lg:grid-cols-3">
              {pillars.map((pillar) => {
                const Icon = pillar.icon;
                return (
                  <article data-about-reveal-item key={pillar.number} className="group min-h-[320px] border-b border-white/15 px-0 py-9 last:border-b-0 lg:border-b-0 lg:border-r lg:px-9 lg:last:border-r-0">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] tracking-[.26em] text-[#d7ad71]">{pillar.number}</span>
                      <Icon className="h-5 w-5 text-white/36 transition duration-500 group-hover:rotate-12 group-hover:text-[#d7ad71]" />
                    </div>
                    <h3 className="mt-20 max-w-[12rem] text-3xl font-medium leading-tight text-[#f7efe3]">{pillar.title}</h3>
                    <p className="mt-5 max-w-sm text-sm leading-7 text-white/52">{pillar.body}</p>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <section data-about-reveal className="relative bg-[#eee7db] px-5 py-24 sm:px-10 lg:px-16 lg:py-36">
          <div className="mx-auto max-w-[1280px]">
            <div data-about-reveal-item className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[.32em] text-[#936532]">03 / {t('about.journey')}</p>
                <h2 className="mt-5 font-brilliant text-6xl leading-none tracking-[-.05em] text-[#201811] sm:text-8xl">Luxx Signature</h2>
              </div>
              <p className="max-w-sm text-sm leading-7 text-[#665b50]">{t('about.manifestoDesc')}</p>
            </div>
            <div className="mt-16 grid gap-0 border-l border-[#b5844d]/50 lg:grid-cols-3 lg:border-l-0">
              {milestones.map((item, index) => (
                <article data-about-reveal-item key={item.year} className="relative border-b border-[#b5844d]/35 px-7 py-8 last:border-b-0 lg:border-b-0 lg:border-r lg:px-10 lg:last:border-r-0">
                  <span className="absolute -left-[5px] top-9 h-[9px] w-[9px] rounded-full bg-[#a8763d] lg:left-auto lg:right-[-5px] lg:top-[-5px]" />
                  <p className="text-xs font-semibold tracking-[.22em] text-[#9c6d37]">{item.year}</p>
                  <h3 className="mt-8 text-2xl font-medium text-[#211a13]">{item.title}</h3>
                  <p className="mt-4 max-w-sm text-sm leading-7 text-[#665b50]">{item.body}</p>
                  <p className="mt-10 text-[10px] uppercase tracking-[.22em] text-[#a8763d]">0{index + 1}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section data-about-reveal className="bg-[#0f0c0a] px-4 pt-4 sm:px-6 sm:pt-6">
          <div data-about-reveal-item className="relative mx-auto min-h-[640px] max-w-[1560px] overflow-hidden bg-[#17120f] text-[#f7efe4] sm:min-h-[720px]">
            <img data-about-wipe src="/about.JPG" alt={t('about.brandTitle')} className="absolute inset-0 h-full w-full object-cover object-[58%_center]" />
            <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(10,8,7,.94)_0%,rgba(10,8,7,.72)_42%,rgba(10,8,7,.12)_100%)]" />
            <div className="relative flex min-h-[640px] max-w-3xl flex-col justify-center px-7 py-16 sm:min-h-[720px] sm:px-14 lg:px-24">
              <p className="text-[10px] font-semibold uppercase tracking-[.32em] text-[#d7ad71]">04 / {t('about.manifesto')}</p>
              <h2 className="mt-7 font-brilliant text-6xl leading-[.83] tracking-[-.05em] sm:text-8xl">{t('about.quotePart2')}</h2>
              <p className="mt-8 max-w-xl text-base leading-8 text-white/68">{t('about.manifestoDesc')}</p>
              <div className="mt-10 flex flex-wrap gap-3">
                <Link to="/products" className="group inline-flex items-center gap-3 bg-[#f5ecdf] px-6 py-4 text-xs font-bold uppercase tracking-[.14em] text-[#1c1510] transition hover:bg-[#d7ad71]">
                  {t('about.collection')}
                  <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                </Link>
                <Link to="/contact" className="inline-flex items-center gap-3 border border-white/30 px-6 py-4 text-xs font-bold uppercase tracking-[.14em] text-white transition hover:border-[#d7ad71] hover:text-[#d7ad71]">
                  {t('about.contact')}
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer variant="editorial" />
    </div>
  );
};

export default AboutPage;
