import React from 'react';
import { Crown, ChevronDown, Sparkles, Gem, ShieldCheck } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

const ProductHero = ({ title, subtitle, count, categoriesCount }) => {
  const { t } = useLanguage();

  return (
    <section className="relative min-h-[85vh] max-h-[920px] flex items-center justify-center overflow-hidden bg-[#09090b] text-[#f7f1e8] selection:bg-[#d6b47c] selection:text-black pt-20 pb-16">
      {/* Ambient Luxury Lighting & Glow */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Top Center Warm Spotlight */}
        <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[700px] h-[500px] rounded-full bg-[radial-gradient(ellipse_at_center,rgba(214,180,124,0.14)_0%,rgba(197,155,95,0.04)_50%,transparent_80%)] blur-[90px] animate-pulse duration-[8000ms]" />
        
        {/* Floating Side Light Spheres */}
        <div className="absolute top-1/4 left-10 w-[380px] h-[380px] rounded-full bg-[#d6b47c]/[0.05] blur-[110px] animate-hero-float" />
        <div className="absolute bottom-1/3 right-10 w-[420px] h-[420px] rounded-full bg-[#b89759]/[0.04] blur-[130px] animate-hero-float animation-delay-4000" />

        {/* Delicate Noise/Dot Matrix Texture */}
        <div className="absolute inset-0 opacity-[0.12] [background-image:radial-gradient(rgba(255,255,255,0.7)_0.6px,transparent_0.6px)] [background-size:6px_6px]" />
        
        {/* Vignette Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#09090b]/80 via-transparent to-[#09090b]" />
      </div>

      <div className="relative z-10 text-center px-6 max-w-5xl mx-auto flex flex-col items-center">
        {/* Luxury Badge */}
        <div className="inline-flex items-center gap-2.5 px-5 py-2 rounded-full bg-gradient-to-r from-[#d6b47c]/15 via-[#f4efe6]/10 to-[#c59b5f]/15 border border-[#d6b47c]/35 shadow-[0_0_30px_rgba(214,180,124,0.18)] backdrop-blur-md mb-8 animate-fade-in transition-all duration-500 hover:border-[#d6b47c]/60">
          <Crown className="w-4 h-4 text-[#d6b47c] animate-pulse" />
          <span className="text-[11px] uppercase tracking-[0.32em] text-[#e8c87a] font-semibold">
            {t('productHero.badge') || "HAUTE COUTURE KOLLEKSIYASI"}
          </span>
        </div>

        {/* Main Title */}
        <h1 className="font-brilliant text-6xl sm:text-7xl lg:text-8xl xl:text-[100px] text-transparent bg-clip-text bg-gradient-to-b from-[#ffffff] via-[#f7f1e8] to-[#d6b47c] leading-[0.92] tracking-tight mb-6 animate-fade-in-up drop-shadow-[0_12px_40px_rgba(214,180,124,0.16)]">
          {title || t('productHero.title') || "Premium Katalog"}
        </h1>

        {/* Golden Ornament Divider */}
        <div className="flex items-center justify-center gap-4 mb-8 w-full max-w-md">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[#d6b47c]/40 to-[#d6b47c]/80" />
          <Sparkles className="w-4 h-4 text-[#d6b47c] shrink-0 opacity-90" />
          <div className="h-px flex-1 bg-gradient-to-l from-transparent via-[#d6b47c]/40 to-[#d6b47c]/80" />
        </div>

        {/* Subtitle */}
        <p className="text-base sm:text-lg lg:text-xl text-[#a2998f] font-light leading-relaxed max-w-2xl mx-auto mb-11 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          {subtitle || t('productHero.description') || "Eksklyuziv dizayn va yuqori sifatli matolardan tikilgan nafis premium ayollar kiyimlari to'plami."}
        </p>

        {/* Stats Glass Cards */}
        <div className="grid grid-cols-3 gap-4 sm:gap-8 max-w-xl w-full mx-auto p-4 rounded-2xl bg-white/[0.025] border border-white/[0.08] backdrop-blur-xl shadow-[0_16px_40px_rgba(0,0,0,0.4)] animate-fade-in-up" style={{ animationDelay: '0.35s' }}>
          <div className="text-center py-2 px-3 border-r border-white/10">
            <span className="block font-brilliant text-3xl sm:text-4xl text-[#f7f1e8] drop-shadow-sm">
              {count || 0}
            </span>
            <span className="text-[10px] uppercase tracking-[0.22em] text-[#d6b47c] font-medium mt-1 block">
              {t('productHero.products') || "Mahsulot"}
            </span>
          </div>

          <div className="text-center py-2 px-3 border-r border-white/10">
            <span className="block font-brilliant text-3xl sm:text-4xl text-[#f7f1e8] drop-shadow-sm">
              {categoriesCount || 0}
            </span>
            <span className="text-[10px] uppercase tracking-[0.22em] text-[#d6b47c] font-medium mt-1 block">
              {t('productHero.categories') || "Kategoriya"}
            </span>
          </div>

          <div className="text-center py-2 px-3 flex flex-col items-center justify-center">
            <div className="flex items-center gap-1 text-[#e8c87a] gap-3">
              <span className="font-brilliant text-2xl sm:text-3xl text-[#f7f1e8]">100%</span>
              <ShieldCheck className="w-4 h-4 text-[#d6b47c]" />
            </div>
            <span className="text-[10px] uppercase tracking-[0.22em] text-[#d6b47c] font-medium mt-1 block">
              Luxury Sifat
            </span>
          </div>
        </div>
      </div>

      {/* Scroll Down Indicator */}
      <a 
        href="#catalog-grid"
        className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/50 hover:text-[#d6b47c] transition-colors duration-300 group cursor-pointer"
      >
        <span className="text-[10px] uppercase tracking-[0.32em] text-[#a2998f] group-hover:text-[#d6b47c] transition-colors font-medium">
          {t('productHero.scroll') || "PASTGA QARANG"}
        </span>
        <div className="w-8 h-8 rounded-full border border-white/15 flex items-center justify-center group-hover:border-[#d6b47c]/50 group-hover:bg-[#d6b47c]/10 transition-all duration-300">
          <ChevronDown className="w-4 h-4 text-[#d6b47c] animate-bounce" />
        </div>
      </a>
    </section>
  );
};

export default ProductHero;
