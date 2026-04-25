import React from 'react';
import { Link } from 'react-router-dom';
import { Award, ArrowUpRight, Crown, Shield, Gem, Truck, Users } from 'lucide-react';

const milestones = [
  {
    year: '2025',
    title: 'Boutique bosqichi',
    description: 'Kichik capsule-drop bilan ish boshladik va premium quality standartini o\'rnatdik.',
  },
  {
    year: '2026',
    title: 'Digital atelier',
    description: 'Online tajribani editorial formatga olib chiqdik: lookbook, premium card va tez checkout.',
  },
  {
    year: 'HOZIR',
    title: 'Luxx Signature',
    description: 'O\'zbekiston ayollari uchun nozik, modern va original fasonlar taqdim etadi.',
  },
];

const pillars = [
  {
    icon: Award,
    title: 'Premium Material',
    description: 'Yuqori sifatli mato, aniq bichim va tikuv nazorati bilan ishlaymiz.',
    span: 'md:col-span-5',
    tone: 'from-[#1c2232]/92 to-[#121927]/92 border-[#2f3d58]/50',
  },
  {
    icon: Users,
    title: 'Client Centric',
    description: 'Har buyurtma bo\'yicha support va uslub bo\'yicha yo\'naltirish beriladi.',
    span: 'md:col-span-4',
    tone: 'from-[#1a2536]/92 to-[#111a2b]/92 border-[#304766]/50',
  },
  {
    icon: Truck,
    title: 'Fast Delivery',
    description: 'Yetkazib berish tezligi premium servisning majburiy qismi sifatida yuritiladi.',
    span: 'md:col-span-3',
    tone: 'from-[#1a2430]/92 to-[#121a24]/92 border-[#3b4a5a]/50',
  },
  {
    icon: Shield,
    title: 'Trusted Service',
    description: 'Kafolat, ochiq aloqa va xavfsiz buyurtma jarayoni bilan ishonch yaratiladi.',
    span: 'md:col-span-6',
    tone: 'from-[#1f2230]/92 to-[#141924]/92 border-[#3f3552]/50',
  },
  {
    icon: Gem,
    title: 'Design Language',
    description: 'Har kolleksiya bir kayfiyatga ega: minimal, jozibador va podium ruhida.',
    span: 'md:col-span-6',
    tone: 'from-[#24202b]/92 to-[#171822]/92 border-[#4a3b56]/50',
  },
];

const About = () => {
  return (
    <section id="about" className="relative overflow-hidden bg-[#06080e] py-20 md:py-24">
      <div className="pointer-events-none absolute -top-28 left-1/2 h-72 w-[52rem] -translate-x-1/2 rounded-full bg-[#d6b47c]/14 blur-3xl" />
      <div className="pointer-events-none absolute top-60 -left-24 h-72 w-72 rounded-full bg-[#2a406c]/20 blur-3xl" />
      <div className="pointer-events-none absolute bottom-16 -right-20 h-80 w-80 rounded-full bg-[#7b4f71]/16 blur-3xl" />

      <div className="relative mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <header className="max-w-3xl">
          <p className="inline-flex items-center gap-2 rounded-full border border-[#9b7b4f]/45 bg-[#9b7b4f]/14 px-3 py-1 text-xs uppercase tracking-[0.24em] text-[#f3dfbc]">
            <Crown className="h-3.5 w-3.5" />
            Brand
          </p>
          <span className="font-brilliant block mt-10 text-[#d6b47c] text-5xl sm:text-6xl lg:text-7xl">
              Luxx Signature
            </span>
          <p className="mt-5 text-base sm:text-lg text-neutral-300 leading-relaxed">
            2025-yilda kichik butik sifatida boshlangan yo'l, bugun premium digital atelier tajribasiga aylandi.
            Maqsadimiz oddiy: zamonaviy ayol uchun sifatli, nafis va esda qoladigan fashion kuratsiyasi.
          </p>
        </header>

        <div className="mt-12 grid grid-cols-1 lg:grid-cols-[1.05fr_1.2fr] gap-6 lg:gap-7">
          <article className="relative overflow-hidden rounded-[2rem] bg-gradient-to-b from-[#131a2b]/92 to-[#0f1422]/88 p-6 sm:p-7 shadow-[0_20px_48px_rgba(1,4,12,0.52)]">
            <div className="absolute top-0 left-[22px] bottom-0 w-[2px] bg-gradient-to-b from-[#e2c38b]/70 via-[#8ea6d6]/55 to-transparent" />

            <p className="text-xs uppercase tracking-[0.22em] text-neutral-400 ml-6">Journey</p>
            <div className="mt-5 space-y-7">
              {milestones.map((item) => (
                <div key={item.year} className="relative pl-10">
                  <span className="absolute left-[-4px] top-1.5 h-3 w-3 rounded-full bg-[#e2c38b] shadow-[0_0_20px_rgba(226,195,139,0.6)]" />
                  <p className="text-xs uppercase tracking-[0.16em] text-[#d6b47c]">{item.year}</p>
                  <h3 className="mt-1 text-2xl sm:text-3xl font-semibold text-[#f4f1eb]">{item.title}</h3>
                  <p className="mt-2 text-sm sm:text-base text-neutral-300 leading-relaxed max-w-md">{item.description}</p>
                </div>
              ))}
            </div>
          </article>

          <article className="relative overflow-hidden rounded-[2rem] border border-[#2f3952]/55 bg-[#0c101b] min-h-[460px] lg:min-h-[520px] shadow-[0_18px_50px_rgba(2,5,16,0.55)]">
            <img
              src="/about_photo.jpg"
              alt="Luxx premium ayollar fashion"
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#080b13]/78 via-[#080b13]/22 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#080b13]/90 via-transparent to-transparent" />

            <div className="absolute top-5 left-5 rounded-2xl border border-[#445678]/45 bg-black/35 backdrop-blur-md px-4 py-3">
              <p className="text-xs uppercase tracking-[0.2em] text-neutral-400">Client Satisfaction</p>
              <p className="mt-1 text-2xl font-semibold text-[#f4f1eb]">98%</p>
            </div>

            <div className="absolute right-5 bottom-5 rounded-2xl bg-black/40 backdrop-blur-md px-4 py-3 max-w-[240px]">
              <p className="text-xs uppercase tracking-[0.2em] text-neutral-400">Vision</p>
              <p className="mt-2 text-sm text-neutral-200 leading-relaxed">
                Har ko'rinishda ayolning ishonchi, nafisligi va uslub erkinligini ochish.
              </p>
            </div>
          </article>
        </div>

        <div className="mt-7 grid grid-cols-1 md:grid-cols-12 gap-4">
          {pillars.map((item) => {
            const Icon = item.icon;
            return (
              <article
                key={item.title}
                className={`rounded-3xl border bg-gradient-to-b ${item.tone} p-5 sm:p-6 ${item.span}`}
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#33405a]/55 bg-black/25">
                    <Icon className="h-5 w-5 text-[#f3dfbc]" />
                  </span>
                  <h3 className="text-xl font-semibold text-[#f4f1eb]">{item.title}</h3>
                </div>
                <p className="mt-3 text-sm sm:text-base text-neutral-300 leading-relaxed">{item.description}</p>
              </article>
            );
          })}
        </div>

        <article className="mt-7 rounded-[2rem] border border-[#d6b47c]/55 bg-gradient-to-r from-[#131829]/92 via-[#151426]/90 to-[#11182a]/92 p-6 sm:p-7 lg:p-8 shadow-[0_16px_42px_rgba(1,3,12,0.45)]">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-6 lg:items-end">
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-neutral-400">Manifesto</p>
              <h3 className="mt-2 text-3xl sm:text-4xl font-semibold text-[#f4f1eb] leading-tight">
                "Sifat, uslub va xizmat -
                <span className="text-[#d6b47c]"> bir xil darajada premium bo'lishi kerak."</span>
              </h3>
              <p className="mt-4 text-sm sm:text-base text-neutral-300 max-w-2xl leading-relaxed">
                Biz uchun mahsulot sotish emas, xaridor kayfiyatini yuqori darajaga olib chiqish muhim.
                Shu sababli kolleksiyalarimiz ham, servis jarayoni ham alohida dizayn tili bilan quriladi.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                to="/products"
                className="inline-flex items-center gap-2 rounded-2xl bg-[#f4f1eb] px-5 py-3 text-sm font-semibold uppercase tracking-[0.06em] text-[#141414] hover:bg-white transition-colors"
              >
                Kolleksiya
                <ArrowUpRight className="h-4 w-4" />
              </Link>
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 rounded-2xl border border-[#3d4e73]/52 bg-black/25 px-5 py-3 text-sm font-medium uppercase tracking-[0.06em] text-neutral-200 hover:bg-black/35 transition-colors"
              >
                Aloqa
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </article>
      </div>
    </section>
  );
};

export default About;
