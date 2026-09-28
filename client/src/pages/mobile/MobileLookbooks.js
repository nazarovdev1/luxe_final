import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingBag, ArrowRight, Gem, Filter, RefreshCw, WifiOff } from 'lucide-react';
import { gsap } from 'gsap';
import { useLanguage } from '../../contexts/LanguageContext';

import { apiFetch } from '../../services/api';

const MobileLookbooks = () => {
    const navigate = useNavigate();
    const { t } = useLanguage();
    const [looks, setLooks] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState(false);
    const [activeFilter, setActiveFilter] = useState('all');
    const [isFilterOpen, setIsFilterOpen] = useState(false);

    // Opening animation state and refs
    const [openingActive, setOpeningActive] = useState(true);
    const openingRef = useRef(null);
    const counterRef = useRef(null);
    const progressRef = useRef(null);
    const timelineRef = useRef(null);

    const playOpening = () => {
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            setOpeningActive(false);
            return;
        }

        setOpeningActive(true);
        const root = openingRef.current;
        if (!root) return;

        root.style.display = 'flex';
        root.style.pointerEvents = 'auto';

        if (timelineRef.current) {
            timelineRef.current.kill();
        }

        const left = root.querySelector('.ml-curtain-left');
        const right = root.querySelector('.ml-curtain-right');
        const stage = root.querySelector('.ml-stage');
        const topBar = root.querySelector('.ml-top');
        const bottomBar = root.querySelector('.ml-bottom');
        const counterEl = counterRef.current;
        const progressEl = progressRef.current;

        if (left && right) gsap.set([left, right], { xPercent: 0 });
        if (stage) gsap.set(stage, { y: 0, scale: 1, autoAlpha: 1, filter: 'blur(0px)' });
        if (topBar && bottomBar) gsap.set([topBar, bottomBar], { autoAlpha: 1, y: 0 });
        if (progressEl) gsap.set(progressEl, { scaleX: 0 });
        if (counterEl) counterEl.textContent = '00';

        const tl = gsap.timeline({
            defaults: { ease: 'power3.out' },
            onComplete: () => {
                if (root) {
                    root.style.display = 'none';
                    root.style.pointerEvents = 'none';
                }
                setOpeningActive(false);
            }
        });

        timelineRef.current = tl;

        if (stage) {
            tl.fromTo(stage.children,
                { y: 25, autoAlpha: 0 },
                { y: 0, autoAlpha: 1, duration: 0.65, stagger: 0.08, ease: 'power3.out' },
                0.1
            );
        }

        if (topBar && bottomBar) {
            tl.fromTo([topBar, bottomBar],
                { autoAlpha: 0 },
                { autoAlpha: 1, duration: 0.5 },
                0.2
            );
        }

        const counterObj = { val: 0 };
        tl.to(counterObj, {
            val: 100,
            duration: 1.2,
            ease: 'power2.inOut',
            onUpdate: () => {
                if (counterEl) {
                    counterEl.textContent = Math.round(counterObj.val).toString().padStart(2, '0');
                }
            }
        }, 0.2);

        if (progressEl) {
            tl.to(progressEl, {
                scaleX: 1,
                duration: 1.2,
                ease: 'power2.inOut'
            }, 0.2);
        }

        // Dissolve stage
        if (stage) {
            tl.to(stage, {
                scale: 1.05,
                y: -15,
                autoAlpha: 0,
                filter: 'blur(6px)',
                duration: 0.45,
                ease: 'power2.in'
            }, 1.4);
        }

        if (topBar && bottomBar) {
            tl.to([topBar, bottomBar], {
                autoAlpha: 0,
                duration: 0.35,
                ease: 'power2.in'
            }, 1.45);
        }

        // Part curtains
        if (left && right) {
            tl.to(left, {
                xPercent: -101,
                duration: 1.0,
                ease: 'expo.inOut'
            }, 1.5);
            tl.to(right, {
                xPercent: 101,
                duration: 1.0,
                ease: 'expo.inOut'
            }, 1.5);
        }

        tl.to(root, {
            autoAlpha: 0,
            duration: 0.25,
            ease: 'none'
        }, 2.25);
    };

    const skipOpening = () => {
        if (timelineRef.current) {
            timelineRef.current.progress(1);
        }
        const root = openingRef.current;
        if (root) {
            root.style.display = 'none';
            root.style.pointerEvents = 'none';
        }
        setOpeningActive(false);
    };

    useEffect(() => {
        fetchLooks();
        playOpening();
        return () => {
            if (timelineRef.current) {
                timelineRef.current.kill();
            }
        };
    }, []);

    const fetchLooks = async () => {
        try {
            setIsLoading(true);
            setLoadError(false);
            const controller = new AbortController();
            const timeoutId = window.setTimeout(() => controller.abort(), 8000);
            const result = await apiFetch('/api/looks', { signal: controller.signal });
            window.clearTimeout(timeoutId);
            if (result.success && Array.isArray(result.data)) {
                setLooks(result.data);
            } else {
                setLoadError(true);
            }
        } catch (err) {
            console.error('Failed to fetch looks:', err);
            setLoadError(true);
        } finally {
            setIsLoading(false);
        }
    };

    const categories = useMemo(() => {
        const cats = new Set(['all']);
        looks.forEach(look => {
            (look.items || []).forEach(item => cats.add(item.category));
        });
        return Array.from(cats);
    }, [looks]);

    const filteredLooks = useMemo(() => {
        if (activeFilter === 'all') return looks;
        return looks.filter(look =>
            (look.items || []).some(item => item.category === activeFilter)
        );
    }, [looks, activeFilter]);

    const getLookProductCount = (look) => {
        if (look.products && look.products.length > 0) {
            return look.products.length;
        }
        return (look.items || []).reduce((sum, item) => sum + (item.count || 1), 0);
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-[#08090d] flex items-center justify-center">
                <div className="text-center">
                    <div className="relative w-16 h-16 mx-auto mb-4">
                        <div className="absolute inset-0 border-2 border-[#d6b47c]/30 rounded-full animate-ping"></div>
                        <div className="absolute inset-2 border-2 border-[#d6b47c]/60 rounded-full animate-pulse"></div>
                        <Gem className="absolute inset-0 m-auto w-6 h-6 text-[#d6b47c] animate-pulse" />
                    </div>
                    <p className="text-[#d6b47c] text-xs tracking-widest uppercase animate-pulse">{t('mobileLookbooks.loading')}</p>
                </div>
            </div>
        );
    }

    if (loadError) {
        return (
            <div className="min-h-screen bg-[#08090d] px-6 flex items-center justify-center">
                <div className="max-w-sm text-center">
                    <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-[#d6b47c]/10 border border-[#d6b47c]/25 flex items-center justify-center">
                        <WifiOff className="w-7 h-7 text-[#d6b47c]" />
                    </div>
                    <p className="text-[#f4f1eb] font-brilliant text-2xl mb-3">Obrazlar hozir ochilmadi</p>
                    <p className="text-neutral-400 text-sm leading-6 mb-7">Internet yoki server bilan aloqa uzilgan. Qayta urinib ko‘ring.</p>
                    <button
                        type="button"
                        onClick={fetchLooks}
                        className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#d6b47c] text-[#111] text-sm font-semibold"
                    >
                        <RefreshCw className="w-4 h-4" />
                        Qayta urinish
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#08090d] pb-20 relative">
            {/* Mobile Cinematic Editorial Opening */}
            <div
                ref={openingRef}
                className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden bg-transparent text-[#f6f1e8] pointer-events-auto select-none"
            >
                <div className="ml-curtain-left absolute inset-y-0 left-0 w-1/2 bg-gradient-to-r from-[#0c0a08] to-[#171310] border-r border-[#d6b47c]/20 origin-left" />
                <div className="ml-curtain-right absolute inset-y-0 right-0 w-1/2 bg-gradient-to-l from-[#0c0a08] to-[#171310] border-l border-[#d6b47c]/20 origin-right" />

                {/* Top header */}
                <div className="ml-top absolute top-6 inset-x-6 flex items-center justify-between z-10 text-[10px] tracking-[0.25em] text-[#d6b47c]/80 uppercase">
                    <span>LUXX MAISON</span>
                    <button
                        type="button"
                        onClick={skipOpening}
                        className="px-3 py-1.5 rounded-full border border-[#d6b47c]/30 bg-white/5 text-[9px] text-[#d6b47c] tracking-widest uppercase"
                    >
                        O‘tkazib yuborish
                    </button>
                </div>

                {/* Center stage */}
                <div className="ml-stage relative z-10 text-center px-6 max-w-sm">
                    <div className="inline-flex items-center justify-center mb-4 p-3 rounded-2xl bg-[#d6b47c]/10 border border-[#d6b47c]/30 shadow-[0_0_20px_rgba(214,180,124,0.3)]">
                        <Gem className="w-6 h-6 text-[#d6b47c]" />
                    </div>
                    <span className="block text-[10px] tracking-[0.35em] text-[#d6b47c] uppercase font-semibold mb-2">
                        VOL. 01 / LOOKBOOK
                    </span>
                    <h2 className="text-3xl font-brilliant text-[#f6f1e8] tracking-tight leading-tight mb-3">
                        Kiyinish <em className="italic text-[#d6b47c]">san’ati.</em>
                    </h2>
                    <p className="text-xs text-[#f6f1e8]/70 italic leading-relaxed">
                        Har bir obraz — sizning kayfiyatingiz va hikoyangiz.
                    </p>
                </div>

                {/* Bottom ticker */}
                <div className="ml-bottom absolute bottom-8 inset-x-6 flex items-center justify-between z-10 text-[10px] tracking-[0.25em] text-[#f6f1e8]/60 uppercase">
                    <span className="text-sm font-serif text-[#d6b47c] tracking-wider">
                        <span ref={counterRef}>00</span>%
                    </span>
                    <div className="flex-1 max-w-[140px] h-[1px] bg-white/10 mx-4 relative overflow-hidden">
                        <span ref={progressRef} className="absolute inset-0 bg-[#d6b47c] origin-left scale-x-0" />
                    </div>
                    <span>TASHKENT</span>
                </div>
            </div>

            {/* Hero Section */}
            <div className="relative pt-20 pb-6 px-4">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <Gem className="w-5 h-5 text-[#d6b47c]" />
                        <h1 className="text-2xl font-brilliant text-[#f4f1eb]">{t('mobileLookbooks.title')}</h1>
                    </div>
                    <button
                        type="button"
                        onClick={() => setIsFilterOpen(!isFilterOpen)}
                        className="p-2 rounded-xl border border-[#d6b47c]/30 bg-[#d6b47c]/10 text-[#d6b47c]"
                        aria-label="Filtrlar"
                    >
                        <Filter className="w-5 h-5" />
                    </button>
                </div>

                {/* Filter Dropdown */}
                {isFilterOpen && (
                    <div className="mb-4 p-3 rounded-2xl bg-[#0f1623]/80 backdrop-blur-sm border border-white/10">
                        <div className="flex flex-wrap gap-2">
                            {categories.map(cat => (
                                <button
                                    key={cat}
                                    onClick={() => setActiveFilter(cat)}
                                    className={`px-4 py-2 rounded-xl text-xs font-medium transition-all ${activeFilter === cat
                                            ? 'bg-[#d6b47c] text-[#0a0a0a] shadow-lg shadow-[#d6b47c]/25'
                                            : 'bg-white/5 text-neutral-400 hover:bg-white/10 border border-white/10'
                                        }`}
                                >
                                    {cat === 'all' ? t('mobileLookbooks.all') : cat}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                <p className="text-sm text-neutral-400">
                    {filteredLooks.length} {t('mobileLookbooks.looksFoundSuffix')}
                </p>
            </div>

            {/* Lookbook Grid */}
            {filteredLooks.length === 0 ? (
                <div className="text-center py-20 px-4">
                    <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-white/5 flex items-center justify-center">
                        <ShoppingBag className="w-10 h-10 text-neutral-600" />
                    </div>
                    <p className="text-neutral-400 text-sm">{t('mobileLookbooks.notFound')}</p>
                </div>
            ) : (
                <div className="px-4 space-y-4">
                    {filteredLooks.map((look, index) => {
                        const productCount = getLookProductCount(look);
                        const lookId = look._id || look.id;

                        return (
                            <div
                                key={lookId}
                                className="relative rounded-3xl overflow-hidden border border-white/10 bg-[#0f1623]/50 backdrop-blur-sm"
                            >
                                {/* Image */}
                                <button
                                    type="button"
                                    className="relative w-full pt-[125%] cursor-pointer text-left"
                                    onClick={() => navigate(`/mobile/lookbooks/${lookId}`)}
                                >
                                    <img
                                        src={look.heroImage}
                                        alt={look.title}
                                        onError={(e) => { e.target.src = '/mobile.jpg' }}
                                        className="absolute inset-0 w-full h-full object-cover"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-[#08090d] via-[#08090d]/20 to-transparent" />

                                    {/* Product Count Badge */}
                                    <div className="absolute top-3 left-3">
                                        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/10">
                                            <ShoppingBag className="w-3 h-3 text-[#d6b47c]" />
                                            <span className="text-xs font-medium text-white">{productCount}</span>
                                        </div>
                                    </div>

                                    {/* Content */}
                                    <div className="absolute bottom-0 left-0 right-0 p-4">
                                        <div className="inline-flex items-center gap-2 mb-2 px-3 py-1 rounded-full bg-[#d6b47c]/20 backdrop-blur-sm border border-[#d6b47c]/30">
                                            <span className="text-[9px] uppercase tracking-wider text-[#d6b47c] font-medium">
                                                {t('mobileLookbooks.lookLabel')} {look.id || index + 1}
                                            </span>
                                        </div>

                                        <h3 className="text-xl font-brilliant text-[#f4f1eb] mb-1 line-clamp-1">
                                            {look.title}
                                        </h3>

                                        <p className="text-xs text-neutral-400 line-clamp-2">
                                            {look.description}
                                        </p>
                                    </div>
                                </button>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Back to Home */}
            <div className="px-4 py-6">
                <button
                    onClick={() => navigate('/mobile')}
                    className="w-full py-3.5 rounded-2xl border border-white/10 bg-white/5 text-[#f4f1eb] font-medium text-sm flex items-center justify-center gap-2"
                >
                    {t('mobileLookbooks.backHome')}
                    <ArrowRight className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
};

export default MobileLookbooks;
