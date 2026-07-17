import React from 'react';
import { Link } from 'react-router-dom';
import { Gem, ArrowRight, ShoppingBag, Crown, Star, Shield, Play } from 'lucide-react';

export const MobileHero = ({ product, onScrollToProducts }) => {
    const image = '/333-mobile.webp';

    return (
        <section className="relative min-h-[85vh] overflow-hidden bg-[#060a14]">
            {/* Background Image */}
            <div className="absolute inset-0">
                <img
                    src={image}
                    alt="Campaign"
                    fetchPriority="high"
                    width="800"
                    height="1200"
                    className="h-full w-full object-cover object-top opacity-90"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/20 to-[#060a14]" />
                <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-black/60" />
                {/* Extra bottom gradient to fade fully to solid color */}
                <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#060a14] via-[#060a14]/70 to-transparent" />
            </div>

            {/* Content Container */}
            <div className="relative z-10 flex h-full flex-col justify-end px-5 pb-24 pt-24">
                {/* Top Tag */}
                <div className="mb-6 inline-flex w-fit items-center gap-2 rounded-full border border-white/20 bg-black/40 px-3 py-1.5 backdrop-blur-md">
                    <Gem className="h-3 w-3 text-amber-300" />
                    <span className="text-[10px] uppercase tracking-wider text-white">Maxsus To'plam</span>
                </div>

                {/* Title */}
                <h1 className="font-brilliant text-6xl text-[#f4f1eb] leading-[1.1]">
                    <span className="block">Yangi</span>
                    <span className="block">Kolleksiya</span>
                    <span className="block text-5xl mt-3 tracking-widest opacity-90">2026</span>
                </h1>

                {/* Description */}
                <p className="mt-5 text-sm leading-relaxed text-neutral-300/90 max-w-[320px]">
                    Premium fasonlar, cheklangan drop va mukammal tikuv sifati. Har bir detal ko'cha modasidan emas, podium kayfiyatidan ilhomlangan.
                </p>

                {/* Buttons */}
                <div className="mt-8 flex items-center gap-3">
                    <Link
                        to="/mobile/products?filter=new"
                        className="flex h-12 items-center justify-center gap-2 rounded-tr-[30px] rounded-bl-[30px] rounded-tl-none rounded-br-none bg-white px-8 text-sm font-bold uppercase tracking-wider text-black transition-transform active:scale-95"
                    >
                        Ko'rish
                        <ArrowRight className="h-4 w-4" />
                    </Link>
                    <button
                        onClick={() => document.getElementById('lookbook-section')?.scrollIntoView({ behavior: 'smooth' })}
                        className="flex h-12 items-center justify-center gap-2 rounded-full border border-white/20 bg-black/40 px-6 text-sm font-medium text-white backdrop-blur-md hover:bg-black/60 transition-colors"
                    >
                        Lookbook
                        <ShoppingBag className="h-4 w-4" />
                    </button>
                </div>

                {/* Stats Grid */}
                <div className="mt-10 grid grid-cols-2 gap-3">
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
                        <p className="font-sans text-2xl font-bold text-white">5+</p>
                        <p className="text-[11px] text-neutral-400">Premium mahsulotlar</p>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
                        <p className="font-sans text-2xl font-bold text-white">4+</p>
                        <p className="text-[11px] text-neutral-400">Asosiy kategoriyalar</p>
                    </div>
                </div>

                {/* Premium Service Badge */}
                <div className="mt-3 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
                    <div className="flex items-center gap-2 mb-2">
                        <Crown className="h-4 w-4 text-amber-300" />
                        <span className="text-xs font-bold uppercase tracking-wide text-amber-300">Premium Service</span>
                    </div>
                    <p className="text-xs leading-relaxed text-neutral-300">
                        Premium LUXE ko'rinishidagi 100% sifatli fashion ayollar kiyimlari. Mahsulotlar 3 SOAT ichida yetkazib beriladi. kiyimlarni 14 kun ichida almashtirish yoki qaytarib olish imkoniyati mavjud.
                    </p>
                </div>
            </div>
        </section>
    );
};

export const BrandJourney = () => {
    return (
        <section className="relative h-[500px] w-full overflow-hidden bg-[#060a14]">
            {/* Background Image */}
            <div className="absolute inset-0">
                <img
                    src="/luxxjarayon-background.png"
                    alt="Luxx Signature"
                    className="h-full w-full object-cover object-[center_top] opacity-90"
                />
                {/* Top Fade overlay - solid at top edge to blend seamlessly with MobileHero */}
                <div className="absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-[#060a14] via-[#060a14]/60 to-transparent z-10" />
                {/* Bottom Fade overlay — strong, covers 60% of height */}
                <div className="absolute inset-x-0 bottom-0 h-[60%] bg-gradient-to-t from-[#060a14] via-[#060a14]/90 to-transparent z-10" />
                {/* Left Fade overlay for text readability */}
                <div className="absolute inset-y-0 left-0 w-2/3 bg-gradient-to-r from-[#060a14] via-[#060a14]/80 to-transparent z-10" />
            </div>

            {/* Content Container */}
            <div className="relative z-20 flex h-full flex-col justify-center px-6 pt-10">
                <div className="flex items-center gap-3 mb-3">
                    <div className="h-1.5 w-1.5 rounded-full bg-[#d6b47c]" />
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#d6b47c]">Hozir</span>
                </div>
                
                <h2 className="font-brilliant text-[40px] leading-tight text-[#f4f1eb] mb-5">
                    Luxx Signature
                </h2>
                
                <p className="text-[13px] leading-relaxed text-neutral-300 max-w-[240px]">
                    O'zbekiston ayollari uchun nozik, modern va original fasonlar kuratsiyasi.
                </p>
            </div>
        </section>
    );
};

export const Manifesto = () => {
    return (
        <section className="px-4 pb-12 bg-[#08090d]">
            <div className="relative overflow-hidden rounded-[2rem] border border-amber-500/20 bg-[#0c0d12] p-6 sm:p-8">
                {/* Decorative background glow */}
                <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-amber-500/5 blur-3xl" />
                <div className="absolute -left-20 -bottom-20 h-64 w-64 rounded-full bg-purple-500/5 blur-3xl" />

                <div className="relative z-10">
                    <span className="mb-4 block text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-500">Qadriyatlar</span>

                    <h2 className="mb-6 text-2xl font-bold leading-tight text-[#f4f1eb]">
                        "Sifat, uslub va xizmat - <span className="text-[#d6b47c]">bir xil darajada premium bo'lishi kerak.</span>"
                    </h2>

                    <p className="mb-8 text-sm leading-relaxed text-neutral-400">
                        Biz uchun mahsulot sotish emas, xaridor kayfiyatini yuqori darajaga olib chiqish muhim. Shu sababli kolleksiyalarimiz ham, servis jarayoni ham alohida dizayn tili bilan quriladi.
                    </p>

                    <div className="flex gap-3">
                        <Link
                            to="/mobile/products"
                            className="flex-1 inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-[#f4f1eb] text-xs font-bold uppercase tracking-wider text-black active:scale-95 transition-transform"
                        >
                            Kolleksiya
                            <ArrowRight className="h-3 w-3" />
                        </Link>
                        <Link
                            to="/contact"
                            className="flex-1 inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/5 text-xs font-bold uppercase tracking-wider text-white hover:bg-white/10 active:scale-95 transition-all"
                        >
                            Aloqa
                            <ArrowRight className="h-3 w-3" />
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    );
};
