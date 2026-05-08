import React from 'react';
import { Crown, ChevronDown } from 'lucide-react';

const ProductHero = ({ title, subtitle, count, categoriesCount }) => {
  return (
    <section className="relative h-screen min-h-[600px] max-h-[900px] flex items-center justify-center overflow-hidden luxury-hero-bg">
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full bg-[#c9a96e]/[0.03] blur-[120px] animate-hero-float" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full bg-[#c9a96e]/[0.02] blur-[100px] animate-hero-float animation-delay-4000" />
      </div>

      <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0b]/40 via-transparent to-[#0a0a0b]" />

      <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-[#c9a96e]/[0.08] border border-[#c9a96e]/20 mb-8 animate-fade-in">
          <Crown className="w-4 h-4 text-[#c9a96e]" />
          <span className="text-[11px] uppercase tracking-[0.3em] text-[#c9a96e] font-semibold">
            Premium Kolleksiya
          </span>
        </div>

        <h1 className="text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-brilliant text-[#f5f5f3] leading-[0.95] mb-6 animate-fade-in-up">
          {title || 'Premium Katalog'}
        </h1>

        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="h-px w-16 bg-gradient-to-r from-transparent to-[#c9a96e]/50" />
          <div className="w-2 h-2 rounded-full bg-[#c9a96e]" />
          <div className="h-px w-16 bg-gradient-to-l from-transparent to-[#c9a96e]/50" />
        </div>

        <p className="text-base lg:text-lg text-[#8a8a8d] leading-relaxed max-w-lg mx-auto mb-10 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          {subtitle || "Eksklyuziv dizayn va yuqori sifatli matolardan tikilgan premium kiyimlar to'plami."}
        </p>

        <div className="flex items-center justify-center gap-8 text-sm animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
          <div className="text-center">
            <span className="block text-3xl font-brilliant gold-shimmer-text">{count || 0}</span>
            <span className="text-[11px] uppercase tracking-[0.2em] text-[#6b6b6e] mt-1 block">Mahsulot</span>
          </div>
          <div className="w-px h-12 bg-white/10" />
          <div className="text-center">
            <span className="block text-3xl font-brilliant gold-shimmer-text">{categoriesCount || 0}</span>
            <span className="text-[11px] uppercase tracking-[0.2em] text-[#6b6b6e] mt-1 block">Kategoriya</span>
          </div>
        </div>
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-scroll-indicator">
        <span className="text-[10px] uppercase tracking-[0.3em] text-[#6b6b6e]">Scroll</span>
        <ChevronDown className="w-5 h-5 text-[#c9a96e]" />
      </div>
    </section>
  );
};

export default ProductHero;
