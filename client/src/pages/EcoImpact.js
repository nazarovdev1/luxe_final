import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Leaf, Droplets, Wind, TreeDeciduous, Award, BarChart3, ShoppingBag, Shirt, Recycle, Sprout, Waves } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import SEO from '../components/SEO';
import toast from 'react-hot-toast';

const ECO_TIPS = [
  { icon: <Shirt className="w-full h-full" />, tip: 'Kiyimni uzoq muddatga olish' },
  { icon: <Recycle className="w-full h-full" />, tip: 'Natural matеriallardan tanlash' },
  { icon: <Sprout className="w-full h-full" />, tip: 'Lokal brendlarga ustunlik berish' },
  { icon: <Waves className="w-full h-full" />, tip: 'Kiyimlarni sovuq suvda yuvish' },
];

const StatCard = ({ icon, value, label, color, unit }) => (
  <div className="rounded-[40px] border border-white/5 bg-white/[0.02] p-12 text-center group hover:border-[#d6b47c]/20 transition-all duration-500 relative overflow-hidden">
    <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
    <div className="relative z-10">
      <div
        className="w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-8 transition-transform group-hover:scale-110 duration-500"
        style={{ background: `${color}15`, border: `1px solid ${color}30` }}
      >
        {React.cloneElement(icon, { className: 'w-10 h-10', style: { color } })}
      </div>
      <p className="text-5xl md:text-6xl font-brilliant mb-3 text-white leading-none">
        {typeof value === 'number' ? value.toLocaleString() : value}
        {unit && <span className="text-[12px] uppercase tracking-widest text-gray-500 ml-2 font-black">{unit}</span>}
      </p>
      <p className="text-[13px] uppercase tracking-[0.3em] text-gray-400 font-black">{label}</p>
    </div>
  </div>
);

const EcoScoreBar = ({ score, t }) => {
  const color =
    score >= 8 ? '#4ade80' :
    score >= 6 ? '#86efac' :
    score >= 4 ? '#d6b47c' :
    '#f87171';

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-end">
        <span className="text-[12px] uppercase tracking-[0.3em] text-gray-400 font-black">{t('eco.ecoRating')}</span>
        <span className="text-5xl font-brilliant" style={{ color }}>{score}<span className="text-sm opacity-50 ml-1">/10</span></span>
      </div>
      <div className="h-3 bg-white/5 rounded-full overflow-hidden relative">
        <div
          className="absolute inset-y-0 left-0 rounded-full transition-all duration-1000 shadow-[0_0_20px_rgba(74,222,128,0.3)]"
          style={{ width: `${(score / 10) * 100}%`, background: color }}
        />
      </div>
    </div>
  );
};

const EcoImpact = () => {
  const { isAuthenticated, token } = useAuth();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) { setIsLoading(false); return; }
    const fetch = async () => {
      try {
        const res = await axios.get('/api/sustainability/my-stats', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.data.success) setStats(res.data.data);
      } catch (err) {
        console.error(err);
        toast.error(t('eco.error'));
      } finally {
        setIsLoading(false);
      }
    };
    fetch();
  }, [isAuthenticated, token, t]);

  return (
    <div className="min-h-screen bg-[#070707] text-white pt-32 pb-24 relative overflow-hidden">
      {/* Background Cinematic Glows - Green/Nature */}
      <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-green-600/5 rounded-full blur-[120px] -translate-y-1/2" />
      <div className="absolute bottom-0 left-1/4 w-[600px] h-[600px] bg-[#d6b47c]/3 rounded-full blur-[150px] translate-y-1/2" />

      <SEO title="Eco Impact — Luxe" description="O'zingizning xaridlaringiz orqali tabiatga qo'shgan hissangizni ko'ring." />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        {/* Header Section */}
        <div className="flex flex-col items-center text-center mb-20">
          <div className="inline-flex items-center gap-2.5 bg-gradient-to-r from-green-600/20 via-green-600/10 to-transparent border-l-2 border-green-600 px-6 py-2 mb-8">
            <Leaf className="w-4 h-4 text-green-500" />
            <span className="text-green-500 text-[10px] tracking-[0.4em] uppercase font-black">{t('eco.sustainableFuture')}</span>
          </div>
          <h1 className="text-6xl md:text-9xl font-brilliant text-white mb-8 leading-tight">
            Eco <span className="text-[#d6b47c]">{t('eco.title')}</span>
          </h1>
          <p className="text-gray-400 text-lg md:text-xl font-light max-w-3xl leading-relaxed">
            {t('eco.subtitle')}
          </p>
        </div>

        {!isAuthenticated ? (
          <div className="text-center py-24 rounded-[40px] border border-white/5 bg-white/[0.02] backdrop-blur-xl">
            <div className="w-20 h-20 bg-green-500/10 rounded-3xl flex items-center justify-center mx-auto mb-8 border border-green-500/20">
              <Leaf className="w-10 h-10 text-green-500" />
            </div>
            <h3 className="text-3xl font-serif mb-3">O'z Eco-ta'siringizni ko'ring</h3>
            <p className="text-gray-500 mb-10 max-w-sm mx-auto text-lg font-light">Xaridlaringiz orqali tabiatga qo'shgan hissangizni real vaqtda kuzatib boring.</p>
            <button onClick={() => navigate('/login')} className="px-12 py-5 bg-green-600 text-white rounded-full font-black text-xs uppercase tracking-[0.2em] hover:scale-105 transition-transform">
              {t('eco.login')}
            </button>
          </div>
        ) : isLoading ? (
          <div className="flex flex-col items-center justify-center py-32 gap-6">
            <div className="w-12 h-12 border-[3px] border-green-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-green-500 text-sm tracking-widest font-medium animate-pulse">{t('eco.analyzing')}</p>
          </div>
        ) : stats ? (
          <div className="space-y-24">
            {/* Eco Rank Badge */}
            <div className="flex flex-col items-center">
              <div className="relative group">
                <div className="absolute -inset-4 bg-green-500/20 rounded-full blur-2xl opacity-50 group-hover:opacity-100 transition-opacity duration-1000" />
                <div className="relative flex items-center gap-8 bg-gradient-to-br from-white/[0.05] to-transparent border border-white/10 px-12 py-8 rounded-[40px] backdrop-blur-xl">
                  <Award className="w-12 h-12 text-green-400" />
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.3em] text-gray-400 font-black mb-2">{t('eco.ecoLevel')}</p>
                    <span className="text-5xl font-brilliant text-green-400 leading-none">{stats.ecoRank}</span>
                  </div>
                </div>
              </div>
              <p className="text-[12px] text-gray-500 font-black uppercase tracking-widest mt-8">
                {stats.totalOrders} ta buyurtma asosida hisoblandi
              </p>
            </div>

            {/* Big Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <StatCard
                icon={<Droplets />}
                value={stats.estimatedWaterSaved}
                unit="litr"
                label={t('eco.waterSaved')}
                color="#60a5fa"
              />
              <StatCard
                icon={<Wind />}
                value={stats.estimatedCO2Saved}
                unit="kg"
                label={t('eco.co2Saved')}
                color="#86efac"
              />
              <StatCard
                icon={<TreeDeciduous />}
                value={stats.treesEquivalent}
                label="Daraxt ekvivalenti"
                color="#4ade80"
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Eco Score */}
              <div className="rounded-[40px] border border-white/5 bg-white/[0.02] p-10 md:p-12 relative overflow-hidden group">
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-green-500/5 rounded-full blur-3xl" />
                <h2 className="text-xl font-serif mb-10 text-white">{t('eco.averageScore')}</h2>
                <EcoScoreBar score={stats.avgEcoScore} t={t} />
                <p className="text-[11px] text-gray-500 mt-8 leading-relaxed font-light">
                  Bu ko'rsatkich xaridlaringiz tarkibidagi <span className="text-white font-medium italic">organik va qayta ishlangan</span> materiallar miqdori asosida shakllanadi.
                </p>
              </div>

              {/* Top Categories */}
              {stats.topCategories?.length > 0 && (
                <div className="rounded-[40px] border border-white/5 bg-white/[0.02] p-10 md:p-12">
                  <h2 className="text-2xl font-serif mb-10 flex items-center gap-4 text-white">
                    <BarChart3 className="w-6 h-6 text-[#d6b47c]" /> {t('eco.topDirections')}
                  </h2>
                  <div className="space-y-8">
                    {stats.topCategories.map((cat, i) => (
                      <div key={cat.category} className="flex items-center group">
                        <span className="w-10 text-[12px] text-gray-500 font-black">{i + 1}.</span>
                        <div className="flex-1">
                          <div className="flex justify-between items-center mb-3">
                            <span className="text-[13px] text-gray-300 font-bold tracking-wide uppercase">{cat.category}</span>
                            <span className="text-sm text-[#d6b47c] font-black">{cat.count} <span className="text-[10px] opacity-60">ta</span></span>
                          </div>
                          <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-[#d6b47c]/40 group-hover:bg-[#d6b47c] transition-all duration-700 shadow-[0_0_10px_rgba(214,180,124,0.2)]" 
                              style={{ width: `${(cat.count / stats.totalItems) * 100}%` }} 
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Eco Tips */}
            <div>
              <div className="flex items-center gap-6 mb-16">
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-green-600/20 to-transparent" />
                <h2 className="text-[10px] uppercase tracking-[0.5em] text-gray-500 font-black">{t('eco.ecoTips')}</h2>
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-green-600/20 to-transparent" />
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {ECO_TIPS.map((tip, i) => (
                  <div key={i} className="group relative rounded-3xl border border-white/5 bg-white/[0.02] p-8 text-center hover:border-green-500/30 transition-all duration-500 overflow-hidden">
                    <div className="absolute inset-0 bg-green-500/0 group-hover:bg-green-500/[0.02] transition-colors" />
                    <div className="flex justify-center mb-6 text-green-500/60 group-hover:text-green-500 group-hover:scale-110 transition-all duration-500">
                      {tip.icon}
                    </div>
                    <p className="text-[11px] text-gray-500 font-medium leading-relaxed">{tip.tip}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* CTA */}
            <div className="text-center pt-10">
              <button
                onClick={() => navigate('/products')}
                className="group relative px-12 py-5 bg-transparent overflow-hidden rounded-full"
              >
                <div className="absolute inset-0 bg-green-600 opacity-20 group-hover:opacity-30 transition-opacity" />
                <div className="absolute inset-0 border border-green-600/30 rounded-full" />
                <span className="relative z-10 flex items-center gap-3 text-green-500 text-xs font-black tracking-widest uppercase">
                  <ShoppingBag className="w-5 h-5" /> Eco-friendly kolleksiya
                </span>
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center py-20">
            <Leaf className="w-16 h-16 text-gray-800 mx-auto mb-4" />
            <h3 className="text-xl text-gray-500">{t('eco.noPurchases')}</h3>
            <p className="text-gray-600 mt-2">Xarid qilish orqali o'z eco-statistikangizni ko'ring.</p>
            <button onClick={() => navigate('/products')} className="mt-6 px-8 py-3 bg-[#d6b47c] text-black rounded-full font-bold text-sm">
              {t('eco.shopNow')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default EcoImpact;
