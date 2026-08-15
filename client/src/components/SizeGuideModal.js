import React, { useState, useEffect } from 'react';
import { X, Ruler, Info, ChevronDown, ChevronUp, Target, Lightbulb } from 'lucide-react';
import { trackEvent } from '../utils/analytics';
import { getProductOptions } from '../utils/productVariants';
import { useLanguage } from '../contexts/LanguageContext';
import './sizeGuideModal.css';

const getInitialCharts = (t) => ({
  default: {
    name: t('sizeGuideModal.defaultCategory'),
    headers: [t('sizeGuideModal.bustHeader').replace(' (sm)', ''), t('sizeGuideModal.bustHeader'), t('sizeGuideModal.waistHeader'), t('sizeGuideModal.hipsHeader'), t('sizeGuideModal.heightHeader')],
    rows: [
      ["XS", "80-84", "60-64", "86-90", "158-164"],
      ["S", "84-88", "64-68", "90-94", "164-170"],
      ["M", "88-92", "68-72", "94-98", "170-176"],
      ["L", "92-96", "72-76", "98-102", "170-176"],
      ["XL", "96-100", "76-80", "102-106", "170-176"],
      ["XXL", "100-104", "80-84", "106-110", "170-176"],
    ],
  },
  dresses: {
    name: t('sizeGuideModal.dressesCategory'),
    headers: ["O'lcham", t('sizeGuideModal.bustHeader'), t('sizeGuideModal.waistHeader'), t('sizeGuideModal.hipsHeader'), t('sizeGuideModal.lengthHeader')],
    rows: [
      ["XS", "80-84", "60-64", "86-90", "85-90"],
      ["S", "84-88", "64-68", "90-94", "90-95"],
      ["M", "88-92", "68-72", "94-98", "95-100"],
      ["L", "92-96", "72-76", "98-102", "100-105"],
      ["XL", "96-100", "76-80", "102-106", "105-110"],
    ],
  },
  outerwear: {
    name: t('sizeGuideModal.outerwearCategory'),
    headers: ["O'lcham", t('sizeGuideModal.bustHeader'), t('sizeGuideModal.waistHeader'), t('sizeGuideModal.hipsHeader'), t('sizeGuideModal.shoulderHeader')],
    rows: [
      ["XS", "80-84", "60-64", "86-90", "36-38"],
      ["S", "84-88", "64-68", "90-94", "38-40"],
      ["M", "88-92", "68-72", "94-98", "40-42"],
      ["L", "92-96", "72-76", "98-102", "42-44"],
      ["XL", "96-100", "76-80", "102-106", "44-46"],
    ],
  },
});

const SizeGuideModal = ({ isOpen, onClose, productCategory, product }) => {
  const { t } = useLanguage();
  const SIZE_CHARTS = getInitialCharts(t);
  const [activeTab, setActiveTab] = useState('chart');
  const [activeChart, setActiveChart] = useState('default');
  const [expandedChart, setExpandedChart] = useState(null);

  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [chest, setChest] = useState('');
  const [waist, setWaist] = useState('');
  const [hips, setHips] = useState('');
  const [recommendedSize, setRecommendedSize] = useState(null);

  useEffect(() => {
    if (!isOpen) return;

    trackEvent('size_guide_open', { productId: product?.id || product?._id, productName: product?.name });

    document.body.style.overflow = 'hidden';

    const navbar = document.querySelector('nav.fixed');
    if (navbar) {
      navbar.style.opacity = '0';
      navbar.style.pointerEvents = 'none';
      navbar.style.transition = 'opacity 0.3s ease';
    }

    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.body.style.overflow = '';
      if (navbar) {
        navbar.style.opacity = '';
        navbar.style.pointerEvents = '';
        navbar.style.transition = '';
      }
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose, product]);

  if (!isOpen) return null;

  const calculateSize = () => {
    const chestVal = parseFloat(chest);
    const waistVal = parseFloat(waist);
    const hipsVal = parseFloat(hips);

    if (!chestVal || !waistVal || !hipsVal) {
      setRecommendedSize({ error: t('sizeGuideModal.calcError') });
      return;
    }

    let size = '';
    let confidence = t('sizeGuideModal.confidenceHigh');

    // If product has sizeGuide entries, use them first
    if (product && Array.isArray(product.sizeGuide) && product.sizeGuide.length > 0) {
      const sortedGuide = [...product.sizeGuide].sort((a, b) => (a.bust || 0) - (b.bust || 0));
      const match = sortedGuide.find(g => 
        (!g.bust || g.bust >= chestVal) && 
        (!g.waist || g.waist >= waistVal) && 
        (!g.hips || g.hips >= hipsVal)
      );
      if (match) {
        size = match.size;
      } else {
        size = sortedGuide[sortedGuide.length - 1]?.size || '';
        confidence = t('sizeGuideModal.confidenceLow');
      }
    } else {
      // Standard table comparison (fallback)
      if (chestVal <= 84 && waistVal <= 64 && hipsVal <= 90) {
        size = 'XS';
      } else if (chestVal <= 88 && waistVal <= 68 && hipsVal <= 94) {
        size = 'S';
      } else if (chestVal <= 92 && waistVal <= 72 && hipsVal <= 98) {
        size = 'M';
      } else if (chestVal <= 96 && waistVal <= 76 && hipsVal <= 102) {
        size = 'L';
      } else if (chestVal <= 100 && waistVal <= 80 && hipsVal <= 106) {
        size = 'XL';
      } else if (chestVal <= 104 && waistVal <= 84 && hipsVal <= 110) {
        size = 'XXL';
      } else {
        const avg = (chestVal + waistVal + hipsVal) / 3;
        if (avg <= 78) size = 'XS';
        else if (avg <= 84) size = 'S';
        else if (avg <= 90) size = 'M';
        else if (avg <= 96) size = 'L';
        else if (avg <= 102) size = 'XL';
        else size = 'XXL';
        confidence = t('sizeGuideModal.confidenceMedium');
      }
    }

    const availableSizes = getProductOptions(product, 'size');
    const isAvailable = availableSizes.length === 0 || availableSizes.includes(size);

    if (confidence !== t('sizeGuideModal.confidenceHigh') || !isAvailable) {
      setRecommendedSize({
        size: null,
        message: t('sizeGuideModal.noMatchMessage')
      });
      return;
    }

    const heightVal = parseFloat(height);
    let heightNote = '';
    if (heightVal) {
      if (heightVal < 160) heightNote = t('sizeGuideModal.shortHeight');
      else if (heightVal > 175) heightNote = t('sizeGuideModal.tallHeight');
    }

    setRecommendedSize({ size, confidence, heightNote, isAvailable: true, availableSizes });
  };

  const resetCalculator = () => {
    setHeight('');
    setWeight('');
    setChest('');
    setWaist('');
    setHips('');
    setRecommendedSize(null);
  };

  const currentChart = SIZE_CHARTS[activeChart];

  return (
    <div className="size-guide-atlier fixed inset-0 z-[100] grid place-items-center p-3 sm:p-6">
      {/* ── Liquid Glass Backdrop ─────────────────────── */}
      <div
        className="absolute inset-0 cursor-pointer"
        onClick={onClose}
        style={{ isolation: 'isolate' }}
      >
        {/* Blur layer — blurs the page content behind */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backdropFilter: 'blur(24px) saturate(180%)',
            WebkitBackdropFilter: 'blur(24px) saturate(180%)',
            backgroundColor: 'rgba(5, 5, 8, 0.60)',
          }}
        />
        {/* Gold blob — top left */}
        <div
          style={{
            position: 'absolute',
            width: '55%',
            height: '55%',
            top: '-5%',
            left: '-5%',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(201,169,110,0.35) 0%, transparent 70%)',
            filter: 'blur(70px)',
            animation: 'liquid-blob-1 14s ease-in-out infinite alternate',
            pointerEvents: 'none',
          }}
        />
        {/* Purple blob — bottom right */}
        <div
          style={{
            position: 'absolute',
            width: '50%',
            height: '50%',
            bottom: '-5%',
            right: '-5%',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(139,92,246,0.25) 0%, transparent 70%)',
            filter: 'blur(80px)',
            animation: 'liquid-blob-2 11s ease-in-out infinite alternate-reverse',
            pointerEvents: 'none',
          }}
        />
        {/* Rose blob — top right */}
        <div
          style={{
            position: 'absolute',
            width: '35%',
            height: '35%',
            top: '10%',
            right: '5%',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(244,114,182,0.15) 0%, transparent 70%)',
            filter: 'blur(60px)',
            animation: 'liquid-blob-1 18s ease-in-out infinite alternate-reverse',
            pointerEvents: 'none',
          }}
        />
      </div>

      {/* Modal */}
      <div className="size-guide-atlier__dialog relative w-full max-w-3xl max-h-[92svh] overflow-y-auto animate-fade-in-scale">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between p-5 border-b border-white/10 bg-[#151b27]/95 backdrop-blur-xl rounded-t-[2rem]">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#d6b47c]/10 border border-[#d6b47c]/20">
              <Ruler className="h-5 w-5 text-[#d6b47c]" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-[#f4f1eb]">{t('product.sizeGuide')}</h2>
              <p className="text-xs text-[#9aa3b2]">{t('sizeGuide.subtitle')}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/5 border border-white/10 text-[#9aa3b2] hover:text-white hover:bg-white/10 transition-all"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 p-5 pb-0">
          <button
            onClick={() => setActiveTab('chart')}
            className={`flex-1 rounded-xl py-2.5 text-sm font-medium transition-all ${
              activeTab === 'chart'
                ? 'bg-[#d6b47c]/15 text-[#f4f1eb] border border-[#d6b47c]/30'
                : 'bg-white/5 text-[#9aa3b2] border border-white/10 hover:bg-white/10'
            }`}
          >
            <Ruler className="mr-1 inline-block" size={14} aria-hidden="true" />
            {t('sizeGuideModal.chartTab')}
          </button>
          <button
            onClick={() => setActiveTab('calculator')}
            className={`flex-1 rounded-xl py-2.5 text-sm font-medium transition-all ${
              activeTab === 'calculator'
                ? 'bg-[#d6b47c]/15 text-[#f4f1eb] border border-[#d6b47c]/30'
                : 'bg-white/5 text-[#9aa3b2] border border-white/10 hover:bg-white/10'
            }`}
          >
            <Target className="mr-1 inline-block" size={14} aria-hidden="true" />
            {t('sizeGuideModal.findSizeTab')}
          </button>
        </div>

        <div className="p-5">
          {/* Chart Tab */}
          {activeTab === 'chart' && (
            <div className="space-y-4">
              {/* Chart Type Selector */}
              <div className="flex flex-wrap gap-2">
                {Object.entries(SIZE_CHARTS).map(([key, chart]) => (
                  <button
                    key={key}
                    onClick={() => setActiveChart(key)}
                    className={`rounded-full px-4 py-2 text-xs font-medium transition-all ${
                      activeChart === key
                        ? 'bg-[#d6b47c]/15 text-[#f4f1eb] border border-[#d6b47c]/30'
                        : 'bg-white/5 text-[#9aa3b2] border border-white/10 hover:bg-white/10'
                    }`}
                  >
                    {chart.name}
                  </button>
                ))}
              </div>

              {/* Size Table */}
              <div className="overflow-x-auto rounded-2xl border border-white/10 bg-[#0d1423]/80">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/10">
                      {currentChart.headers.map((header, i) => (
                        <th
                          key={i}
                          className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[#d6b47c]"
                        >
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {currentChart.rows.map((row, i) => (
                      <tr
                        key={i}
                        className="border-b border-white/5 hover:bg-white/[0.02] transition-colors"
                      >
                        {row.map((cell, j) => (
                          <td
                            key={j}
                            className={`px-4 py-3 ${
                              j === 0
                                ? 'font-semibold text-[#f4f1eb]'
                                : 'text-[#9aa3b2]'
                            }`}
                          >
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* How to Measure */}
              <div className="rounded-2xl border border-white/10 bg-[#0d1423]/80 p-4">
                <button
                  onClick={() => setExpandedChart(expandedChart === 'how' ? null : 'how')}
                  className="flex w-full items-center justify-between text-sm font-semibold text-[#f4f1eb]"
                >
                  <span className="flex items-center gap-2">
                    <Info className="h-4 w-4 text-[#d6b47c]" />
                    {t('sizeGuideModal.howToMeasure')}
                  </span>
                  {expandedChart === 'how' ? (
                    <ChevronUp className="h-4 w-4 text-[#9aa3b2]" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-[#9aa3b2]" />
                  )}
                </button>

                {expandedChart === 'how' && (
                  <div className="mt-4 space-y-3">
                    <div className="flex gap-3 rounded-xl bg-white/[0.03] p-3">
                      <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-[#d6b47c]/10 text-xs font-bold text-[#d6b47c]">1</span>
                      <div>
                        <p className="text-sm font-medium text-[#f4f1eb]">{t('sizeGuideModal.bustTitle')}</p>
                        <p className="text-xs text-[#9aa3b2]">{t('sizeGuide.bustDesc')}</p>
                      </div>
                    </div>
                    <div className="flex gap-3 rounded-xl bg-white/[0.03] p-3">
                      <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-[#d6b47c]/10 text-xs font-bold text-[#d6b47c]">2</span>
                      <div>
                        <p className="text-sm font-medium text-[#f4f1eb]">{t('sizeGuideModal.waistTitle')}</p>
                        <p className="text-xs text-[#9aa3b2]">{t('sizeGuide.waistDesc')}</p>
                      </div>
                    </div>
                    <div className="flex gap-3 rounded-xl bg-white/[0.03] p-3">
                      <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-[#d6b47c]/10 text-xs font-bold text-[#d6b47c]">3</span>
                      <div>
                        <p className="text-sm font-medium text-[#f4f1eb]">{t('sizeGuideModal.hipsTitle')}</p>
                        <p className="text-xs text-[#9aa3b2]">{t('sizeGuide.hipsDesc')}</p>
                      </div>
                    </div>
                    <div className="flex gap-3 rounded-xl bg-white/[0.03] p-3">
                      <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-[#d6b47c]/10 text-xs font-bold text-[#d6b47c]">4</span>
                      <div>
                        <p className="text-sm font-medium text-[#f4f1eb]">{t('sizeGuideModal.heightTitle')}</p>
                        <p className="text-xs text-[#9aa3b2]">{t('sizeGuide.heightDesc')}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Tip */}
              <div className="rounded-2xl bg-gradient-to-r from-[#d6b47c]/10 to-transparent border border-[#d6b47c]/20 p-4">
                <p className="text-sm text-[#f4f1eb]">
                  <Lightbulb className="mr-2 inline-block text-[#d6b47c]" size={16} aria-hidden="true" />
                  <strong>{t('sizeGuideModal.tipTitle')}</strong> {t('sizeGuideModal.tipText')}
                </p>
              </div>
            </div>
          )}

          {/* Calculator Tab */}
          {activeTab === 'calculator' && (
            <div className="space-y-4">
              <div className="rounded-2xl border border-white/10 bg-[#0d1423]/80 p-4">
                <p className="text-sm text-[#9aa3b2] mb-4">
                  {t('sizeGuideModal.calcIntro')}
                </p>

                <div className="grid grid-cols-2 gap-3">
                  <label className="block">
                    <span className="mb-1.5 block text-xs text-[#9aa3b2]">{t('sizeGuide.heightCm')}</span>
                    <input
                      type="number"
                      value={height}
                      onChange={(e) => setHeight(e.target.value)}
                      placeholder={t('sizeGuideModal.placeholders.height')}
                      className="w-full rounded-xl border border-[#2d3442] bg-[#0e131d] px-3 py-2.5 text-sm text-[#f4f1eb] placeholder:text-[#6f7c90] outline-none transition focus:border-[#d6b47c] focus:ring-1 focus:ring-[#d6b47c]/20"
                    />
                  </label>
                  <label className="block">
                    <span className="mb-1.5 block text-xs text-[#9aa3b2]">{t('sizeGuide.weightKg')}</span>
                    <input
                      type="number"
                      value={weight}
                      onChange={(e) => setWeight(e.target.value)}
                      placeholder={t('sizeGuideModal.placeholders.weight')}
                      className="w-full rounded-xl border border-[#2d3442] bg-[#0e131d] px-3 py-2.5 text-sm text-[#f4f1eb] placeholder:text-[#6f7c90] outline-none transition focus:border-[#d6b47c] focus:ring-1 focus:ring-[#d6b47c]/20"
                    />
                  </label>
                  <label className="block">
                    <span className="mb-1.5 block text-xs text-[#9aa3b2]">{t('sizeGuide.bustCm')}</span>
                    <input
                      type="number"
                      value={chest}
                      onChange={(e) => setChest(e.target.value)}
                      placeholder={t('sizeGuideModal.placeholders.chest')}
                      className="w-full rounded-xl border border-[#2d3442] bg-[#0e131d] px-3 py-2.5 text-sm text-[#f4f1eb] placeholder:text-[#6f7c90] outline-none transition focus:border-[#d6b47c] focus:ring-1 focus:ring-[#d6b47c]/20"
                    />
                  </label>
                  <label className="block">
                    <span className="mb-1.5 block text-xs text-[#9aa3b2]">{t('sizeGuide.waistCm')}</span>
                    <input
                      type="number"
                      value={waist}
                      onChange={(e) => setWaist(e.target.value)}
                      placeholder={t('sizeGuideModal.placeholders.waist')}
                      className="w-full rounded-xl border border-[#2d3442] bg-[#0e131d] px-3 py-2.5 text-sm text-[#f4f1eb] placeholder:text-[#6f7c90] outline-none transition focus:border-[#d6b47c] focus:ring-1 focus:ring-[#d6b47c]/20"
                    />
                  </label>
                  <label className="block col-span-2">
                    <span className="mb-1.5 block text-xs text-[#9aa3b2]">{t('sizeGuide.hipsCm')}</span>
                    <input
                      type="number"
                      value={hips}
                      onChange={(e) => setHips(e.target.value)}
                      placeholder={t('sizeGuideModal.placeholders.hips')}
                      className="w-full rounded-xl border border-[#2d3442] bg-[#0e131d] px-3 py-2.5 text-sm text-[#f4f1eb] placeholder:text-[#6f7c90] outline-none transition focus:border-[#d6b47c] focus:ring-1 focus:ring-[#d6b47c]/20"
                    />
                  </label>
                </div>

                <div className="flex gap-2 mt-4">
                  <button
                    onClick={calculateSize}
                    className="flex-1 rounded-xl bg-[#d6b47c] px-4 py-2.5 text-sm font-semibold text-[#0f1014] transition-all hover:bg-[#e0c08e] active:scale-[0.98]"
                  >
                    {t('sizeGuideModal.findSizeBtn')}
                  </button>
                  <button
                    onClick={resetCalculator}
                    className="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-[#9aa3b2] hover:bg-white/10 transition-all"
                  >
                    {t('sizeGuideModal.resetBtn')}
                  </button>
                </div>
              </div>

              {/* Result */}
              {recommendedSize && (
                <div className={`rounded-2xl border p-5 ${
                  recommendedSize.error
                    ? 'border-red-500/30 bg-red-500/5'
                    : 'border-[#d6b47c]/30 bg-gradient-to-b from-[#d6b47c]/10 to-transparent'
                }`}>
                  {recommendedSize.error ? (
                    <p className="text-sm text-red-400">{recommendedSize.error}</p>
                  ) : (
                    <>
                      <p className="text-xs uppercase tracking-[0.15em] text-[#9aa3b2] mb-2">{t('sizeGuideModal.yourSize')}</p>
                      {recommendedSize.size ? (
                        <div className="flex items-center gap-4">
                          <span className="text-5xl font-bold text-[#d6b47c]">{recommendedSize.size}</span>
                          <div>
                            <p className="text-sm text-[#f4f1eb]">
                              {t('sizeGuideModal.confidence')}: <span className="text-[#d6b47c] font-medium">{recommendedSize.confidence}</span>
                            </p>
                            {recommendedSize.heightNote && (
                              <p className="text-xs text-[#9aa3b2] mt-1">{recommendedSize.heightNote}</p>
                            )}
                          </div>
                        </div>
                      ) : (
                        <p className="text-sm text-amber-300 font-medium leading-relaxed">{recommendedSize.message}</p>
                      )}
                      <div className="mt-4 rounded-xl bg-white/[0.03] p-3">
                        <p className="text-xs text-[#9aa3b2]">
                          {t('sizeGuideModal.disclaimer')}
                        </p>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SizeGuideModal;
