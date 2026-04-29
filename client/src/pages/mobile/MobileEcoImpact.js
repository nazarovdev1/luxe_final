import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Leaf, Droplets, Wind, TreeDeciduous, Award, BarChart3, ShoppingBag, Shirt, Recycle, Sprout, Waves, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const ECO_TIPS = [
  { icon: <Shirt className="w-6 h-6" />, tip: 'Kiyimni uzoq muddatga olish', color: '#d6b47c' },
  { icon: <Recycle className="w-6 h-6" />, tip: 'Natural materiallardan tanlash', color: '#4ade80' },
  { icon: <Sprout className="w-6 h-6" />, tip: 'Lokal brendlarga ustunlik', color: '#86efac' },
  { icon: <Waves className="w-6 h-6" />, tip: 'Sovuq suvda yuvish', color: '#60a5fa' },
];

const StatCard = ({ icon, value, label, color, unit }) => (
  <div className="rounded-[24px] border border-white/5 bg-white/[0.02] p-5 text-center relative overflow-hidden group">
    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity" style={{ background: `${color}05` }} />
    <div className="relative z-10">
      <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: `${color}15`, color }}>
        {React.cloneElement(icon, { className: 'w-6 h-6' })}
      </div>
      <p className="text-3xl font-brilliant mb-1 leading-none" style={{ color }}>
        {typeof value === 'number' ? value.toLocaleString() : value}
      </p>
      {unit && <p className="text-[10px] uppercase tracking-widest text-gray-500 font-black mb-1">{unit}</p>}
      <p className="text-[11px] uppercase tracking-[0.2em] text-gray-400 font-black">{label}</p>
    </div>
  </div>
);

export default function MobileEcoImpact() {
  const { isAuthenticated, token } = useAuth();
  const navigate = useNavigate();
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
        toast.error('Statistikani yuklashda xatolik');
      } finally {
        setIsLoading(false);
      }
    };
    fetch();
  }, [isAuthenticated, token]);

  const ecoScore = stats?.avgEcoScore || 0;
  const scoreColor = ecoScore >= 8 ? '#4ade80' : ecoScore >= 6 ? '#86efac' : ecoScore >= 4 ? '#d6b47c' : '#f87171';

  return (
    <div className="min-h-screen bg-[#07090f] text-white pb-24 relative overflow-hidden">
      {/* Cinematic Background Glows */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-green-600/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/4" />
      <div className="absolute top-[20%] left-0 w-64 h-64 bg-green-900/5 rounded-full blur-[80px] -translate-x-1/2" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#d6b47c]/5 rounded-full blur-[120px] translate-y-1/3" />

      <div className="relative z-10">
        {/* Header */}
        <div className="px-5 pt-10 pb-8">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-400 mb-10 active:scale-90 transition-transform">
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm font-medium uppercase tracking-widest">Orqaga</span>
          </button>

          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-[14px] bg-green-600/20 border border-green-500/30 flex items-center justify-center backdrop-blur-xl">
              <Leaf className="w-5 h-5 text-green-500" />
            </div>
            <span className="text-[11px] uppercase tracking-[0.4em] text-green-500 font-black">Sustainable Luxury</span>
          </div>
          <h1 className="text-6xl font-brilliant text-white leading-none">
            Eco <span className="text-[#d6b47c]">Impact</span>
          </h1>
          <p className="text-base text-gray-400 mt-4 leading-relaxed max-w-[300px]">
            Har bir tanlovingiz tabiatda o'z <span className="text-white font-bold">ijobiy izini</span> qoldiradi.
          </p>
        </div>

        {/* Content */}
        {!isAuthenticated ? (
          <div className="rounded-[28px] border border-white/5 bg-white/[0.02] p-8 text-center">
            <div className="w-16 h-16 bg-green-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-green-500/20">
              <Leaf className="w-8 h-8 text-green-500" />
            </div>
            <h3 className="text-xl font-serif mb-2">O'z Eco-ta'siringizni ko'ring</h3>
            <p className="text-sm text-gray-400 mb-5">Xaridlaringiz orqali tabiatga qo'shgan hissangizni kuzating</p>
            <button onClick={() => navigate('/mobile/login')} className="w-full py-3.5 bg-green-600 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em]">
              Tizimga Kirish
            </button>
          </div>
        ) : isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-10 h-10 border-2 border-green-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-green-500 text-xs tracking-widest animate-pulse font-black uppercase">Tahlil qilinmoqda...</p>
          </div>
        ) : stats ? (
          <div className="space-y-4">
            {/* Eco Rank Badge */}
            <div className="rounded-[28px] border border-white/10 bg-white/[0.03] p-5 flex items-center gap-4 relative overflow-hidden">
              <div className="absolute inset-0 bg-green-500/3" />
              <div className="relative w-14 h-14 bg-green-500/10 rounded-2xl flex items-center justify-center border border-green-500/20 shrink-0">
                <Award className="w-7 h-7 text-green-400" />
              </div>
              <div className="relative">
                <p className="text-[10px] uppercase tracking-[0.3em] text-gray-400 font-black mb-0.5">Eco Darajangiz</p>
                <span className="text-3xl font-brilliant text-green-400 leading-none">{stats.ecoRank}</span>
                <p className="text-[10px] text-gray-500 mt-1">{stats.totalOrders} ta buyurtma asosida</p>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-3">
              <StatCard icon={<Droplets />} value={stats.estimatedWaterSaved} unit="litr" label="Tejlgan suv" color="#60a5fa" />
              <StatCard icon={<Wind />} value={stats.estimatedCO2Saved} unit="kg" label="CO₂ tejami" color="#86efac" />
              <StatCard icon={<TreeDeciduous />} value={stats.treesEquivalent} label="Daraxt" color="#4ade80" />
            </div>

            {/* Eco Score */}
            <div className="rounded-[28px] border border-white/5 bg-white/[0.02] p-5">
              <div className="flex justify-between items-end mb-4">
                <p className="text-[11px] uppercase tracking-[0.3em] text-gray-400 font-black">Ekologik Ball</p>
                <span className="text-3xl font-brilliant" style={{ color: scoreColor }}>{ecoScore}<span className="text-xs opacity-40 ml-1">/10</span></span>
              </div>
              <div className="h-2.5 bg-white/5 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-1000"
                  style={{ width: `${(ecoScore / 10) * 100}%`, background: scoreColor, boxShadow: `0 0 12px ${scoreColor}60` }}
                />
              </div>
              <p className="text-[10px] text-gray-500 mt-3 leading-relaxed">
                Xaridlaringizdagi <span className="text-white font-medium">organik va qayta ishlangan</span> materiallar asosida.
              </p>
            </div>

            {/* Top Categories */}
            {stats.topCategories?.length > 0 && (
              <div className="rounded-[28px] border border-white/5 bg-white/[0.02] p-5">
                <h3 className="text-sm font-black uppercase tracking-widest text-gray-400 mb-4 flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-[#d6b47c]" /> Top Yo'nalishlar
                </h3>
                <div className="space-y-4">
                  {stats.topCategories.map((cat, i) => (
                    <div key={cat.category} className="flex items-center gap-3 group">
                      <span className="w-5 text-[10px] text-gray-500 font-black shrink-0">{i + 1}.</span>
                      <div className="flex-1">
                        <div className="flex justify-between items-center mb-1.5">
                          <span className="text-sm text-gray-300 font-bold">{cat.category}</span>
                          <span className="text-xs text-[#d6b47c] font-black">{cat.count} ta</span>
                        </div>
                        <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-[#d6b47c]/50 group-hover:bg-[#d6b47c] transition-all duration-700"
                            style={{ width: `${(cat.count / stats.totalItems) * 100}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Eco Tips */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-green-600/20 to-transparent" />
                <h3 className="text-[10px] uppercase tracking-[0.4em] text-gray-500 font-black">Eco Maslahatlar</h3>
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-green-600/20 to-transparent" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                {ECO_TIPS.map((tip, i) => (
                  <div key={i} className="rounded-[20px] border border-white/5 bg-white/[0.02] p-4 text-center hover:border-green-500/30 transition-all">
                    <div className="flex justify-center mb-3 text-green-500/60">
                      {tip.icon}
                    </div>
                    <p className="text-xs text-gray-400 font-medium leading-relaxed">{tip.tip}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* CTA */}
            <button onClick={() => navigate('/mobile/products')} className="w-full py-4 rounded-2xl border border-green-600/30 bg-green-600/10 text-green-500 text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2">
              <ShoppingBag className="w-4 h-4" /> Eco-friendly Kolleksiya
            </button>
          </div>
        ) : (
          <div className="text-center py-16">
            <Leaf className="w-14 h-14 text-gray-800 mx-auto mb-4" />
            <h3 className="text-lg text-gray-500">Hali xaridlar yo'q</h3>
            <button onClick={() => navigate('/mobile/products')} className="mt-4 px-8 py-3 bg-[#d6b47c] text-black rounded-2xl font-bold text-sm">
              Xarid qilish
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
