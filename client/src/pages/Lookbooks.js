import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Eye, ShoppingBag, Gem, Play, ChevronDown, Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import LookDetailModal from '../components/LookDetailModal';
import SEO from '../components/SEO';
import { useProducts } from '../contexts/ProductContext';

/* ─── helpers ──────────────────────────────────────────────────── */
const SEASONS = ['Spring/Summer', 'Fall/Winter', 'Resort', 'Pre-Fall', 'Capsule'];

function getSeason(index) {
    return SEASONS[index % SEASONS.length];
}

/* ─── sub-components ─────────────────────────────────────────── */

function HeroSection() {
    const navigate = useNavigate();
    const [scrollY, setScrollY] = useState(0);
    useEffect(() => {
        const onScroll = () => setScrollY(window.scrollY);
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    return (
        <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden">
            {/* Background Image with Dark Overlay */}
            <div
                className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                style={{
                    backgroundImage: 'url("/look2.jpg")',
                    backgroundPosition: 'center',
                    backgroundSize: 'cover'
                }}
            />
            {/* Layered background gradient to keep text readable */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#060810] via-black/70 to-black/40" />
            <div
                className="absolute inset-0"
                style={{
                    background:
                        'radial-gradient(ellipse 80% 60% at 50% 40%, rgba(214,180,124,0.08) 0%, transparent 70%)',
                    transform: `translateY(${scrollY * 0.25}px)`,
                }}
            />
            {/* Grain texture */}
            <div
                className="absolute inset-0 opacity-[0.035] pointer-events-none"
                style={{
                    backgroundImage:
                        "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E\")",
                }}
            />
            {/* Fine grid */}
            <div
                className="absolute inset-0 opacity-[0.03]"
                style={{
                    backgroundImage:
                        'linear-gradient(rgba(214,180,124,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(214,180,124,0.5) 1px, transparent 1px)',
                    backgroundSize: '64px 64px',
                }}
            />

            {/* Issue badge */}
            <div className="relative z-10 flex flex-col items-center gap-6 text-center px-6">
                <div className="flex items-center gap-3 pb-10">
                    <div className="h-px w-12 bg-[#d6b47c]/50" />
                    <span className="text-[10px] uppercase tracking-[0.4em] text-[#d6b47c]/80 font-medium">
                        Luxe Editorial — Lookbook
                    </span>
                    <div className="h-px w-12 bg-[#d6b47c]/50" />
                </div>

                <h1
                    className="font-brilliant text-[clamp(3.5rem,12vw,9rem)] leading-[0.88] text-[#f5f0e8] relative transition-transform duration-100 ease-out"
                    style={{
                        letterSpacing: '-0.02em',
                        transform: `translateY(${scrollY * 0.4}px)`,
                        opacity: Math.max(0, 1 - scrollY / 600)
                    }}
                >
                    <span className="block">THE ART</span>
                    <span className="block text-transparent" style={{
                        WebkitTextStroke: '1px rgba(245,240,232,0.4)',
                    }}>
                        OF STYLE
                    </span>
                </h1>

                <p
                    className="text-[13px] text-neutral-400 max-w-sm leading-relaxed tracking-wide transition-transform duration-100 ease-out"
                    style={{
                        transform: `translateY(${scrollY * 0.2}px)`,
                        opacity: Math.max(0, 1 - scrollY / 500)
                    }}
                >
                    Professional editorial curations — premium kiyimlar, noyob stillar, va
                    cheksiz ilhom manbai.
                </p>

                <div
                    className="flex flex-col sm:flex-row items-center gap-4 mt-2 transition-transform duration-100 ease-out"
                    style={{
                        transform: `translateY(${scrollY * 0.1}px)`,
                        opacity: Math.max(0, 1 - scrollY / 400)
                    }}
                >
                    <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#d6b47c] text-[#0a0c14] text-xs font-semibold tracking-wide cursor-pointer hover:bg-[#e8c98a] transition-colors"
                        onClick={() => document.getElementById('lookbook-grid')?.scrollIntoView({ behavior: 'smooth' })}>
                        Kolleksiyani ko'rish
                        <ArrowRight className="w-3.5 h-3.5" />
                    </div>
                    <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-[#d6b47c]/30 text-[#d6b47c] text-xs font-semibold tracking-wide cursor-pointer hover:bg-[#d6b47c]/10 transition-colors"
                        onClick={() => navigate('/lookbook-builder')}>
                        Shaxsiy obraz yaratish
                        <Plus className="w-3.5 h-3.5" />
                    </div>
                </div>
            </div>

            {/* Decorative side text */}
            <div className="absolute left-4 top-1/2 -translate-y-1/2 hidden lg:flex flex-col items-center gap-3">
                <div className="h-16 w-px bg-gradient-to-b from-transparent via-[#d6b47c]/30 to-transparent" />
                <span
                    className="text-[9px] uppercase tracking-[0.4em] text-[#d6b47c]/40"
                    style={{ writingMode: 'vertical-rl' }}
                >
                    2024 Collection
                </span>
                <div className="h-16 w-px bg-gradient-to-b from-transparent via-[#d6b47c]/30 to-transparent" />
            </div>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 hidden lg:flex flex-col items-center gap-3">
                <div className="h-16 w-px bg-gradient-to-b from-transparent via-[#56c4bb]/30 to-transparent" />
                <span
                    className="text-[9px] uppercase tracking-[0.4em] text-[#56c4bb]/40"
                    style={{ writingMode: 'vertical-rl' }}
                >
                    Premium Looks
                </span>
                <div className="h-16 w-px bg-gradient-to-b from-transparent via-[#56c4bb]/30 to-transparent" />
            </div>
        </section>
    );
}

function FilterBar({ categories, activeFilter, setActiveFilter }) {
    const barRef = useRef(null);

    return (
        <div className="sticky top-0 z-30 bg-[#060810]/95 backdrop-blur-xl border-b border-white/[0.06]">
            <div className="max-w-[1600px] mx-auto px-6 py-4 flex items-center justify-between gap-4">
                {/* Logo mark */}
                <div className="hidden md:flex items-center gap-2.5 shrink-0">
                    <Gem className="w-4 h-4 text-[#d6b47c]" />
                    <span className="text-[10px] uppercase tracking-[0.25em] text-[#d6b47c]">
                        Lookbook
                    </span>
                </div>

                {/* Filter pills */}
                <div
                    ref={barRef}
                    className="flex items-center gap-2 overflow-x-auto scrollbar-hide flex-1 justify-start md:justify-center"
                >
                    {categories.map((cat) => (
                        <button
                            key={cat}
                            onClick={() => setActiveFilter(cat)}
                            className={`shrink-0 px-4 py-1.5 rounded-full text-[11px] font-medium tracking-wide uppercase transition-all duration-200 ${activeFilter === cat
                                ? 'bg-[#d6b47c] text-[#060810] shadow-lg shadow-[#d6b47c]/20'
                                : 'text-neutral-400 border border-white/10 hover:text-white hover:border-white/20'
                                }`}
                        >
                            {cat === 'all' ? 'Barchasi' : cat}
                        </button>
                    ))}
                </div>

                <div className="hidden md:flex items-center gap-1.5 shrink-0">
                    <Eye className="w-3.5 h-3.5 text-neutral-500" />
                    <span className="text-[10px] text-neutral-500 tracking-wide">Editorial</span>
                </div>
            </div>
        </div>
    );
}

/* LookCard – Pinterest masonry card */
function LookCard({ look, index, onOpen }) {
    const lookId = look._id || look.id;
    const season = getSeason(index);

    const [isVisible, setIsVisible] = useState(false);
    const cardRef = useRef(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                    observer.disconnect();
                }
            },
            { threshold: 0.1, rootMargin: '50px' }
        );

        if (cardRef.current) {
            observer.observe(cardRef.current);
        }

        return () => observer.disconnect();
    }, []);

    return (
        <article
            ref={cardRef}
            className={`group relative overflow-hidden cursor-pointer rounded-2xl bg-[#0c0f1a] mb-4 break-inside-avoid transition-all duration-700 transform ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
                }`}
            onClick={(e) => onOpen(e, lookId)}
            style={{ breakInside: 'avoid', pageBreakInside: 'avoid', transitionDelay: `${(index % 4) * 100}ms` }}
        >
            {/* Image – natural height, no fixed ratio */}
            <div className="relative w-full overflow-hidden">
                <img
                    src={look.heroImage}
                    alt={look.title}
                    onError={(e) => { e.target.src = '/hero.jpg'; }}
                    className="w-full h-auto block object-cover transition-all duration-700 ease-out group-hover:scale-[1.07] group-hover:brightness-110"
                />
                {/* bottom gradient for text readability (only at the very bottom) */}
                <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#060810]/95 to-transparent pointer-events-none" />

                {/* Season badge */}
                <span className="absolute top-3 left-3 text-[9px] uppercase tracking-[0.3em] text-white/70 bg-black/50 backdrop-blur-sm px-2.5 py-1 rounded-full border border-white/10">
                    {season}
                </span>

                {/* Expand button */}
                <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-2 group-hover:translate-y-0">
                    <div className="w-9 h-9 rounded-full bg-[#d6b47c] flex items-center justify-center shadow-[0_0_20px_rgba(214,180,124,0.4)] transform group-hover:scale-110 transition-transform duration-300">
                        <ArrowRight className="w-4 h-4 text-[#060810]" />
                    </div>
                </div>

                {/* Look number */}
                <span className="absolute bottom-3 right-3 font-brilliant text-3xl text-white/10 select-none leading-none">
                    {String(index + 1).padStart(2, '0')}
                </span>
            </div>

            {/* Card footer – compact, no wasted space */}
            <div className="px-5 pt-3 pb-5 absolute bottom-0 left-0 w-full flex flex-col justify-end transform transition-transform duration-500 group-hover:-translate-y-1">
                <p className="text-[10px] uppercase tracking-[0.3em] text-[#d6b47c] mb-1.5 font-semibold drop-shadow-md">
                    {look.items?.[0]?.category || 'Kolleksiya'}
                </p>
                <h3 className="font-serif text-2xl text-[#f5f0e8] leading-snug line-clamp-2 mb-3 drop-shadow-lg" style={{ letterSpacing: '0.02em' }}>
                    {look.title}
                </h3>
                <div className="flex items-center justify-between opacity-80 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="flex items-center gap-1.5 text-[11px] text-neutral-500">
                        <ShoppingBag className="w-3 h-3" />
                        {look.products?.length || 0} mahsulot
                    </div>
                    <span className="text-xs font-medium text-[#d6b47c] tracking-wide flex items-center gap-1.5 group-hover:text-white transition-colors duration-300">
                        Ko'rish
                        <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform duration-300" />
                    </span>
                </div>
            </div>
        </article>
    );
}

/* ─── Loading skeleton ────────────────────────────────────────── */
function LoadingState() {
    return (
        <div className="min-h-screen bg-[#060810] flex flex-col items-center justify-center gap-6">
            {/* Animated luxury spinner */}
            <div className="relative w-24 h-24">
                <div className="absolute inset-0 rounded-full border border-[#d6b47c]/10" />
                <div className="absolute inset-0 rounded-full border-t border-[#d6b47c]/50 animate-spin" style={{ animationDuration: '1.4s' }} />
                <div className="absolute inset-3 rounded-full border border-[#d6b47c]/5" />
                <div className="absolute inset-3 rounded-full border-b border-[#56c4bb]/40 animate-spin" style={{ animationDuration: '2s', animationDirection: 'reverse' }} />
                <Gem className="absolute inset-0 m-auto w-6 h-6 text-[#d6b47c] animate-pulse" />
            </div>
            <div className="text-center">
                <p className="text-[11px] uppercase tracking-[0.4em] text-[#d6b47c]/70 mb-1">Yuklanmoqda</p>
                <p className="text-xs text-neutral-600">Editorial kolleksiya tayyorlanmoqda...</p>
            </div>
        </div>
    );
}

/* ─── Main Component ─────────────────────────────────────────── */
const Lookbooks = () => {
    const navigate = useNavigate();
    const { products } = useProducts();

    const [looks, setLooks] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeFilter, setActiveFilter] = useState('all');
    const [selectedLookId, setSelectedLookId] = useState(null);

    useEffect(() => {
        const fetchLooks = async () => {
            try {
                setIsLoading(true);
                const response = await fetch('/api/looks');
                const result = await response.json();
                if (result.success) {
                    setLooks(result.data || []);
                } else {
                    toast.error('Looklarni yuklashda xatolik');
                }
            } catch (err) {
                console.error('Failed to fetch looks:', err);
                toast.error('Looklarni yuklashda xatolik');
            } finally {
                setIsLoading(false);
            }
        };
        fetchLooks();
    }, []);

    const categories = useMemo(() => {
        const cats = new Set(['all']);
        looks.forEach((look) => {
            (look.items || []).forEach((item) => {
                if (item.category) cats.add(item.category);
            });
        });
        return Array.from(cats);
    }, [looks]);

    const filteredLooks = useMemo(() => {
        if (activeFilter === 'all') return looks;
        return looks.filter((look) =>
            (look.items || []).some((item) => item.category === activeFilter)
        );
    }, [activeFilter, looks]);

    const openLookModal = (event, lookId) => {
        event.stopPropagation();
        setSelectedLookId(lookId);
    };

    if (isLoading) return <LoadingState />;

    return (
        <div className="min-h-screen bg-[#060810] text-[#f5f0e8]">
            <SEO
                title="Lookbook - ayollar obrazlari va seasonal style"
                description="Luxx.uz lookbook sahifasi: yozgi, qishgi, bahorgi va kuzgi ayollar obrazlari, premium kombinatsiyalar va luxury styling ilhomlari."
                keywords="lookbook uz, ayollar obrazlari, seasonal style, yozgi kiyimlar, qishgi kiyimlar, bahorgi kiyimlar, kuzgi kiyimlar, luxury kiyimlar"
                canonicalPath="/lookbooks"
                structuredData={{
                    '@context': 'https://schema.org',
                    '@type': 'CollectionPage',
                    name: 'LUXX Lookbook - Ayollar kiyimlari kolleksiyasi',
                    description: 'Professional editorial ayollar kiyimlari kolleksiyasi - premium looks va styling ilhomlari',
                    url: 'https://luxx.uz/lookbooks',
                    inLanguage: 'uz',
                    isPartOf: {
                        '@type': 'WebSite',
                        name: 'LUXX',
                        url: 'https://luxx.uz'
                    },
                    publisher: {
                        '@type': 'Organization',
                        name: 'LUXX',
                        url: 'https://luxx.uz',
                        logo: {
                            '@type': 'ImageObject',
                            url: 'https://luxx.uz/logoweb2.png'
                        }
                    }
                }}
            />

            {/* ── Hero ── */}
            <HeroSection />

            {/* ── Filter Bar ── */}
            <FilterBar
                categories={categories}
                activeFilter={activeFilter}
                setActiveFilter={setActiveFilter}
            />

            {/* ── Editorial Grid ── */}
            <section id="lookbook-grid" className="px-4 sm:px-6 lg:px-10 py-14 max-w-[1600px] mx-auto">

                {/* Section label */}
                <div className="flex items-center gap-6 mb-10">
                    <div className="h-px flex-1 bg-gradient-to-r from-[#d6b47c]/30 to-transparent" />
                    <div className="flex items-center gap-2.5">
                        <Gem className="w-3.5 h-3.5 text-[#d6b47c]" />
                        <span className="text-[10px] uppercase tracking-[0.35em] text-[#d6b47c]">
                            {activeFilter === 'all' ? 'Barcha looklar' : activeFilter}
                        </span>
                    </div>
                    <div className="h-px flex-1 bg-gradient-to-l from-[#d6b47c]/30 to-transparent" />
                </div>

                {filteredLooks.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-32 gap-4">
                        <div className="w-16 h-16 rounded-full border border-white/10 flex items-center justify-center">
                            <Eye className="w-7 h-7 text-neutral-600" />
                        </div>
                        <p className="text-neutral-500 text-sm">Bu kategoriya bo'yicha looklar topilmadi</p>
                        <button
                            onClick={() => setActiveFilter('all')}
                            className="text-[#d6b47c] text-xs underline underline-offset-4"
                        >
                            Barchasini ko'rish
                        </button>
                    </div>
                ) : (
                    /* True Pinterest masonry via CSS columns */
                    <div className="masonry-grid">
                        {filteredLooks.map((look, index) => (
                            <LookCard
                                key={look._id || look.id}
                                look={look}
                                index={index}
                                onOpen={openLookModal}
                            />
                        ))}
                    </div>
                )}
            </section>

            {/* ── Editorial Footer Banner ── */}
            <section className="mx-4 sm:mx-6 lg:mx-10 mb-14 relative overflow-hidden rounded-3xl bg-[#0e1120] border border-white/[0.05]">
                {/* Background accents */}
                <div className="absolute top-0 left-1/4 w-64 h-64 bg-[#d6b47c]/6 rounded-full blur-[80px] pointer-events-none" />
                <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-[#56c4bb]/6 rounded-full blur-[80px] pointer-events-none" />

                <div className="relative z-10 py-16 px-8 text-center flex flex-col items-center gap-6">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="h-px w-10 bg-[#d6b47c]/40" />
                        <span className="text-[10px] uppercase tracking-[0.4em] text-[#d6b47c]/70">Kolleksiya</span>
                        <div className="h-px w-10 bg-[#d6b47c]/40" />
                    </div>
                    <h2 className="font-brilliant text-3xl md:text-5xl text-[#f5f0e8]">
                        Barcha mahsulotlarni ko'ring
                    </h2>
                    <p className="text-sm text-neutral-400 max-w-md">
                        Premium brend mahsulotlari va noyob editoriyallar bilan tanishing.
                    </p>
                    <div className="flex items-center gap-3 flex-wrap justify-center">
                        <button
                            onClick={() => navigate('/products')}
                            className="inline-flex items-center gap-2 px-7 py-3 rounded-full bg-[#d6b47c] text-[#060810] text-sm font-semibold hover:bg-[#e8c98a] transition-all hover:shadow-xl hover:shadow-[#d6b47c]/20"
                        >
                            Mahsulotlarga o'tish
                            <ArrowRight className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => navigate('/')}
                            className="inline-flex items-center gap-2 px-7 py-3 rounded-full border border-white/15 text-white/70 text-sm hover:bg-white/5 hover:text-white transition-all"
                        >
                            Bosh sahifa
                        </button>
                    </div>
                </div>
            </section>

            {/* ── Look Detail Modal ── */}
            {selectedLookId && (
                <LookDetailModal lookId={selectedLookId} onClose={() => setSelectedLookId(null)} />
            )}
        </div>
    );
};

export default Lookbooks;
