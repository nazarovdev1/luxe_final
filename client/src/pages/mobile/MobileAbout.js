import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
    ArrowLeft,
    ArrowUpRight,
    Gem,
    Heart,
    ShieldCheck,
    Sparkles,
    Truck,
} from 'lucide-react';
import SEO from '../../components/SEO';
import { useLanguage } from '../../contexts/LanguageContext';

const galleryImages = ['/second_pose.jpg', '/about_photo.jpg', '/about.JPG'];

const usePrefersReducedMotion = () => {
    const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

    useEffect(() => {
        if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
            return undefined;
        }

        const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
        const syncPreference = () => setPrefersReducedMotion(mediaQuery.matches);

        syncPreference();

        if (typeof mediaQuery.addEventListener === 'function') {
            mediaQuery.addEventListener('change', syncPreference);
            return () => mediaQuery.removeEventListener('change', syncPreference);
        }

        mediaQuery.addListener(syncPreference);
        return () => mediaQuery.removeListener(syncPreference);
    }, []);

    return prefersReducedMotion;
};

const MobileAbout = () => {
    const { t } = useLanguage();
    const prefersReducedMotion = usePrefersReducedMotion();
    const galleryRef = useRef(null);
    const slideRefs = useRef([]);
    const [activeImageIndex, setActiveImageIndex] = useState(0);

    const proofChips = useMemo(() => ([
        { value: '98%', label: t('about.satisfaction') },
        { value: '3-6', label: t('about.pillarDelivery') },
        { value: '14', label: t('about.pillarTrust') },
    ]), [t]);

    const pillars = useMemo(() => ([
        {
            icon: Gem,
            title: t('about.pillarPremium'),
            description: t('about.pillarPremiumDesc'),
        },
        {
            icon: Heart,
            title: t('about.pillarClient'),
            description: t('about.pillarClientDesc'),
        },
        {
            icon: Truck,
            title: t('about.pillarDelivery'),
            description: t('about.pillarDeliveryDesc'),
        },
    ]), [t]);

    const milestones = useMemo(() => ([
        {
            year: '2025',
            title: t('about.milestone1'),
            description: t('about.milestone1Desc'),
        },
        {
            year: '2026',
            title: t('about.milestone2'),
            description: t('about.milestone2Desc'),
        },
        {
            year: t('about.now'),
            title: t('about.milestone3'),
            description: t('about.milestone3Desc'),
        },
    ]), [t]);

    const syncActiveSlide = () => {
        const container = galleryRef.current;
        const nodes = slideRefs.current.filter(Boolean);
        if (!container || nodes.length === 0) {
            return;
        }

        let nearestIndex = 0;
        let nearestDistance = Number.POSITIVE_INFINITY;

        nodes.forEach((node, index) => {
            const distance = Math.abs(node.offsetLeft - container.scrollLeft);
            if (distance < nearestDistance) {
                nearestDistance = distance;
                nearestIndex = index;
            }
        });

        setActiveImageIndex((currentIndex) => (
            currentIndex === nearestIndex ? currentIndex : nearestIndex
        ));
    };

    useEffect(() => {
        syncActiveSlide();
    }, []);

    const scrollToImage = (index) => {
        const slide = slideRefs.current[index];
        if (!slide) {
            return;
        }

        slide.scrollIntoView({
            behavior: prefersReducedMotion ? 'auto' : 'smooth',
            block: 'nearest',
            inline: 'start',
        });
        setActiveImageIndex(index);
    };

    return (
        <div className="min-h-screen bg-[#140f0d] pb-28 text-white selection:bg-[#d6b47c] selection:text-[#140f0d]">
            <SEO
                title={t('nav.about')}
                description={t('about.description')}
                canonicalPath="/about"
                noIndex={true}
            />

            <div className="pointer-events-none fixed inset-x-0 top-0 z-0 h-[45vh] bg-[radial-gradient(circle_at_top,rgba(214,180,124,0.22),transparent_62%)]" />
            <div className="pointer-events-none fixed bottom-0 right-0 z-0 h-72 w-72 rounded-full bg-[#7f5a34]/20 blur-[120px]" />

            <div className="relative z-10">
                <section className="px-5 pb-8 pt-7">
                    <Link
                        to="/mobile"
                        className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-[11px] uppercase tracking-[0.24em] text-white/72 backdrop-blur-md"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Luxx
                    </Link>

                    <div className="mt-5 overflow-hidden rounded-[2rem] border border-white/10 bg-[#1d1714] shadow-[0_30px_80px_rgba(0,0,0,0.28)]">
                        <div className="relative aspect-[4/5]">
                            <img
                                src="/second_pose.jpg"
                                alt={t('about.brandTitle')}
                                className="h-full w-full object-cover object-[66%_center]"
                                style={{
                                    transform: prefersReducedMotion ? 'none' : 'scale(1.03)',
                                    transition: prefersReducedMotion ? 'none' : 'transform 1200ms cubic-bezier(0.16, 1, 0.3, 1)',
                                }}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-[#120d0b] via-[#120d0b]/22 to-black/10" />
                            <div className="absolute inset-x-0 bottom-0 p-5">
                                <div className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-black/25 px-3 py-2 text-[10px] uppercase tracking-[0.26em] text-[#ecd8ba] backdrop-blur-md">
                                    <Sparkles className="h-3.5 w-3.5" />
                                    {t('about.brand')}
                                </div>
                                <h1 className="mt-4 font-brilliant text-[3.7rem] leading-[0.8] tracking-[-0.05em] text-[#f7efe3]">
                                    Luxx
                                </h1>
                                <p className="mt-4 max-w-[20rem] text-sm leading-6 text-white/78">
                                    {t('about.visionText')}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="mt-5 rounded-[1.8rem] border border-white/10 bg-white/[0.04] p-5 backdrop-blur-sm">
                        <p className="text-[11px] uppercase tracking-[0.28em] text-[#d6b47c]">
                            {t('about.manifesto')}
                        </p>
                        <p className="mt-3 text-[15px] leading-7 text-white/80">
                            {t('about.description')}
                        </p>
                    </div>

                    <div className="mt-5 grid grid-cols-3 gap-3">
                        {proofChips.map((chip) => (
                            <article key={chip.label} className="rounded-[1.5rem] border border-white/8 bg-[#201916] px-3 py-4 text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
                                <p className="text-2xl font-light text-[#f5e7d2]">{chip.value}</p>
                                <p className="mt-2 text-[9px] uppercase tracking-[0.22em] text-white/52">
                                    {chip.label}
                                </p>
                            </article>
                        ))}
                    </div>
                </section>

                <section className="px-5 py-3">
                    <div className="flex items-end justify-between">
                        <div>
                            <p className="text-[11px] uppercase tracking-[0.28em] text-[#d6b47c]">
                                {t('about.brandTitle')}
                            </p>
                            <h2 className="mt-3 font-brilliant text-[2.6rem] leading-[0.9] text-[#f8efe2]">
                                {t('about.quotePart2')}
                            </h2>
                        </div>
                        <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-[10px] uppercase tracking-[0.22em] text-white/55">
                            01
                        </span>
                    </div>

                    <div
                        ref={galleryRef}
                        onScroll={syncActiveSlide}
                        className="scrollbar-hide -mx-5 mt-6 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-3"
                        style={{ scrollBehavior: prefersReducedMotion ? 'auto' : 'smooth' }}
                        aria-label={t('about.brandTitle')}
                    >
                        {galleryImages.map((image, index) => (
                            <article
                                key={image}
                                ref={(node) => {
                                    slideRefs.current[index] = node;
                                }}
                                className="w-[84%] flex-shrink-0 snap-start overflow-hidden rounded-[1.9rem] border border-white/10 bg-[#1c1613]"
                            >
                                <div className="aspect-[4/5] overflow-hidden">
                                    <img
                                        src={image}
                                        alt={`${t('about.brandTitle')} ${index + 1}`}
                                        className="h-full w-full object-cover"
                                    />
                                </div>
                                <div className="border-t border-white/8 px-4 py-4">
                                    <p className="text-[10px] uppercase tracking-[0.22em] text-[#d6b47c]">
                                        {milestones[index]?.year || t('about.now')}
                                    </p>
                                    <p className="mt-2 text-sm leading-6 text-white/74">
                                        {milestones[index]?.description || t('about.manifestoDesc')}
                                    </p>
                                </div>
                            </article>
                        ))}
                    </div>

                    <div className="mt-3 flex items-center justify-between gap-4">
                        <div className="flex gap-2" role="tablist" aria-label={t('about.journey')}>
                            {galleryImages.map((image, index) => (
                                <button
                                    key={image}
                                    type="button"
                                    onClick={() => scrollToImage(index)}
                                    className={`h-2.5 rounded-full transition-[width,background-color] duration-300 ${
                                        activeImageIndex === index ? 'w-8 bg-[#d6b47c]' : 'w-2.5 bg-white/20'
                                    }`}
                                    aria-label={`${t('about.journey')} ${index + 1}`}
                                    aria-pressed={activeImageIndex === index}
                                />
                            ))}
                        </div>
                        <p className="text-[10px] uppercase tracking-[0.22em] text-white/42">
                            {activeImageIndex + 1} / {galleryImages.length}
                        </p>
                    </div>
                </section>

                <section className="px-5 py-9">
                    <div className="rounded-[2rem] border border-white/10 bg-[#171210] p-5">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-[11px] uppercase tracking-[0.28em] text-[#d6b47c]">
                                    {t('about.quotePart1')}
                                </p>
                                <h2 className="mt-3 font-brilliant text-[2.5rem] leading-[0.94] text-[#f8efe2]">
                                    {t('about.vision')}
                                </h2>
                            </div>
                            <ShieldCheck className="h-6 w-6 text-[#d6b47c]" />
                        </div>

                        <div className="mt-6 space-y-3">
                            {pillars.map((pillar) => {
                                const Icon = pillar.icon;
                                return (
                                    <article
                                        key={pillar.title}
                                        className="rounded-[1.5rem] border border-white/8 bg-white/[0.03] p-4"
                                    >
                                        <div className="flex items-start gap-3">
                                            <span className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-full border border-[#d6b47c]/25 bg-[#d6b47c]/10 text-[#d6b47c]">
                                                <Icon className="h-4 w-4" />
                                            </span>
                                            <div>
                                                <h3 className="text-sm font-medium text-[#f6ebdc]">
                                                    {pillar.title}
                                                </h3>
                                                <p className="mt-2 text-sm leading-6 text-white/60">
                                                    {pillar.description}
                                                </p>
                                            </div>
                                        </div>
                                    </article>
                                );
                            })}
                        </div>
                    </div>
                </section>

                <section className="px-5 py-2">
                    <div className="rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,#1b1512_0%,#120e0d_100%)] p-5 shadow-[0_26px_80px_rgba(0,0,0,0.24)]">
                        <div className="flex items-end justify-between gap-4">
                            <div>
                                <p className="text-[11px] uppercase tracking-[0.28em] text-[#d6b47c]">
                                    {t('about.journey')}
                                </p>
                                <h2 className="mt-3 font-brilliant text-[2.5rem] leading-[0.92] text-[#f8efe2]">
                                    Luxx Signature
                                </h2>
                            </div>
                            <span className="text-[10px] uppercase tracking-[0.22em] text-white/36">
                                02
                            </span>
                        </div>

                        <div className="mt-7 space-y-5">
                            {milestones.map((milestone, index) => (
                                <article key={`${milestone.year}-${milestone.title}`} className="grid grid-cols-[44px_1fr] gap-4">
                                    <div className="flex flex-col items-center">
                                        <span className="flex h-11 w-11 items-center justify-center rounded-full border border-[#d6b47c]/35 bg-[#d6b47c]/10 text-[10px] uppercase tracking-[0.14em] text-[#e7c89a]">
                                            {milestone.year}
                                        </span>
                                        {index < milestones.length - 1 && (
                                            <span className="mt-3 h-full w-px bg-gradient-to-b from-[#d6b47c]/50 to-transparent" />
                                        )}
                                    </div>
                                    <div className="pb-5">
                                        <h3 className="text-lg text-[#f5ead9]">{milestone.title}</h3>
                                        <p className="mt-2 text-sm leading-6 text-white/62">
                                            {milestone.description}
                                        </p>
                                    </div>
                                </article>
                            ))}
                        </div>
                    </div>
                </section>

                <div className="sticky bottom-24 z-20 px-5 pb-6 pt-8">
                    <div className="rounded-[1.8rem] border border-white/12 bg-[#f4efe7] p-3 shadow-[0_18px_45px_rgba(0,0,0,0.28)]">
                        <Link
                            to="/mobile/products"
                            className="flex items-center justify-between rounded-[1.25rem] bg-[#181311] px-5 py-4 text-[#f8efe2]"
                        >
                            <div>
                                <p className="text-[10px] uppercase tracking-[0.24em] text-[#d6b47c]">
                                    {t('about.collection')}
                                </p>
                                <p className="mt-1 text-sm text-white/72">
                                    {t('about.manifestoDesc')}
                                </p>
                            </div>
                            <span className="ml-4 flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full border border-white/12 bg-white/[0.05]">
                                <ArrowUpRight className="h-4 w-4" />
                            </span>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MobileAbout;
