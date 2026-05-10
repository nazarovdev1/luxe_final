import React from 'react';
import { Link } from 'react-router-dom';
import { Gem, ArrowRight, ShoppingBag, Crown, Star, Shield, Play } from 'lucide-react';

export const MobileHero = ({ product, onScrollToProducts }) => {
    const image = '/333-mobile.webp';

    return (
        <section className="relative min-h-[85vh] overflow-hidden rounded-b-[2.5rem] bg-[#08090d]">
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
                <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/20 to-[#08090d]" />
                <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-black/60" />
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
        <section className="px-5 py-12 bg-[#08090d]">
            <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-amber-500/30 px-3 py-1">
                <Crown className="h-3 w-3 text-amber-500" />
                <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-amber-500">Brend Tarixi</span>
            </div>

           
            <div className="font-brilliant text-5xl text-[#d6b47c] mb-6">Luxx Signature</div>

            <p className="mb-10 text-sm leading-relaxed text-neutral-400">
                2025-yilda kichik butik sifatida boshlangan yo'l, bugun premium digital atelier tajribasiga aylandi. Maqsadimiz oddiy: zamonaviy ayol uchun sifatli, nafis va esda qoladigan fashion kuratsiyasi.
            </p>

            {/* Timeline */}
            <div className="relative border-l border-white/10 ml-1.5 space-y-10 pb-4">
                {/* Item 1 */}
                <div className="relative pl-8">
                    <div className="absolute -left-[5px] top-1.5 h-2.5 w-2.5 rounded-full bg-[#d6b47c] ring-4 ring-[#08090d]" />
                    <span className="mb-1 block text-xs font-medium uppercase tracking-widest text-[#d6b47c] opacity-80">2025</span>
                    <h3 className="mb-2 text-xl font-bold text-white">Boutique bosqichi</h3>
                    <p className="text-sm text-neutral-400">
                        Kichik capsule-drop bilan ish boshladik va premium quality standartini o'rnatdik.
                    </p>
                </div>

                {/* Item 2 */}
                <div className="relative pl-8">
                    <div className="absolute -left-[5px] top-1.5 h-2.5 w-2.5 rounded-full bg-[#d6b47c] ring-4 ring-[#08090d]" />
                    <span className="mb-1 block text-xs font-medium uppercase tracking-widest text-[#d6b47c] opacity-80">2026</span>
                    <h3 className="mb-2 text-xl font-bold text-white">Raqamli Atelye</h3>
                    <p className="text-sm text-neutral-400">
                        Online tajribani editorial formatga olib chiqdik: lookbook, premium card va tez checkout.
                    </p>
                </div>

                {/* Item 3 */}
                <div className="relative pl-8">
                    <div className="absolute -left-[5px] top-1.5 h-2.5 w-2.5 rounded-full bg-[#d6b47c] ring-4 ring-[#08090d]" />
                    <span className="mb-1 block text-xs font-medium uppercase tracking-widest text-[#d6b47c] opacity-80">HOZIR</span>
                    <h3 className="mb-2 text-xl font-bold text-white">Luxx Signature</h3>
                    <p className="text-sm text-neutral-400">
                        O'zbekiston ayollari uchun nozik, modern va original fasonlar kuratsiyasi.
                    </p>
                </div>
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
