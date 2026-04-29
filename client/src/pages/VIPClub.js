import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Crown, Star, Zap, Trophy, Gift, ShieldCheck, Truck, Unlock, ChevronRight, Flame, Medal, History, Gem } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import SEO from '../components/SEO';
import { useNavigate } from 'react-router-dom';

const VIP_TIERS = [
  {
    level: 'Bronze',
    threshold: 0,
    color: '#cd7f32',
    bg: 'rgba(205,127,50,0.05)',
    border: 'rgba(205,127,50,0.2)',
    gradient: 'from-[#cd7f32]/20 via-[#cd7f32]/10 to-transparent',
    glow: 'bg-[#cd7f32]/10',
    discount: 0,
    icon: (
      <svg className="w-12 h-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M8.21 13.89L7 23l5-3 5 3-1.21-9.12" />
        <circle cx="12" cy="8" r="6" />
        <text x="12" y="10.5" textAnchor="middle" fill="currentColor" fontSize="7" fontWeight="900" style={{ fontFamily: 'Inter, sans-serif' }}>3</text>
      </svg>
    ),
    perks: ['Xaridlar uchun ball yig\'ish', 'Style Feed kirish', 'Bepul yetkazib berish'],
  },
  {
    level: 'Silver',
    threshold: 300,
    color: '#c0c0c0',
    bg: 'rgba(192,192,192,0.05)',
    border: 'rgba(192,192,192,0.2)',
    gradient: 'from-[#c0c0c0]/20 via-[#c0c0c0]/10 to-transparent',
    glow: 'bg-[#c0c0c0]/10',
    discount: 5,
    icon: (
      <svg className="w-12 h-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M8.21 13.89L7 23l5-3 5 3-1.21-9.12" />
        <circle cx="12" cy="8" r="6" />
        <text x="12" y="10.5" textAnchor="middle" fill="currentColor" fontSize="7" fontWeight="900" style={{ fontFamily: 'Inter, sans-serif' }}>2</text>
      </svg>
    ),
    perks: ['5% chegirma', 'Bepul yetkazib berish', 'Maxsus aktsiyalarga kirish', 'Musobaqa imtiyozlari'],
  },
  {
    level: 'Gold',
    threshold: 650,
    color: '#d6b47c',
    bg: 'rgba(214,180,124,0.05)',
    border: 'rgba(214,180,124,0.2)',
    gradient: 'from-[#d6b47c]/20 via-[#d6b47c]/10 to-transparent',
    glow: 'bg-[#d6b47c]/10',
    discount: 10,
    icon: (
      <svg className="w-12 h-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M8.21 13.89L7 23l5-3 5 3-1.21-9.12" />
        <circle cx="12" cy="8" r="6" />
        <text x="12" y="10.5" textAnchor="middle" fill="currentColor" fontSize="7" fontWeight="900" style={{ fontFamily: 'Inter, sans-serif' }}>1</text>
      </svg>
    ),
    perks: ['10% chegirma', 'Bepul yetkazib berish', 'Yangi kolleksiyaga ilk kirish', 'VIP musobaqa'],
  },
  {
    level: 'Diamond',
    threshold: 1000,
    color: '#a8d8ea',
    bg: 'rgba(168,216,234,0.05)',
    border: 'rgba(168,216,234,0.2)',
    gradient: 'from-[#a8d8ea]/20 via-[#a8d8ea]/10 to-transparent',
    glow: 'bg-[#a8d8ea]/10',
    discount: 15,
    icon: <Gem className="w-12 h-12" style={{ color: '#a8d8ea' }} />,
    perks: ['15% chegirma', 'Bepul yetkazib berish', 'Ekskluziv mahsulotlar', 'VIP tadbirlarga taklif'],
  },
];

const HOW_TO_EARN = [
  { icon: <ShieldCheck className="w-5 h-5" />, action: 'Xarid qilish', points: '+3 ball / 10 000 so\'m', desc: 'Har bir xariddan ball to\'plang' },
  { icon: <Unlock className="w-5 h-5" />, action: 'Ro\'yxatdan o\'tish', points: '+30 ball', desc: 'Yangi hisob ochganingiz uchun' },
  { icon: <Star className="w-5 h-5" />, action: 'Izoh qoldirish', points: '+20 ball', desc: 'Mahsulotlarga sharh yozing' },
  { icon: <Trophy className="w-5 h-5" />, action: 'Musobaqada g\'alaba', points: '(Musobaqada belgilangan ballga qarab beriladi)', desc: 'Style Challenge\'da g\'olib bo\'ling' },
  { icon: <Zap className="w-5 h-5" />, action: 'Kunlik kirish', points: '+5 ball', desc: 'Har kuni saytga kiring' },
  { icon: <Gift className="w-5 h-5" />, action: 'Tug\'ilgan kun', points: '+100 ball', desc: 'Tug\'ilgan kuningizda sovg\'a' },
];

const VIPClub = () => {
  const { isAuthenticated, token } = useAuth();
  const navigate = useNavigate();
  const [pointsData, setPointsData] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [badges, setBadges] = useState([]);
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const config = { headers: { Authorization: `Bearer ${token}` } };
        const [pointsRes, leaderboardRes, badgesRes, historyRes] = await Promise.all([
          isAuthenticated ? axios.get('/api/points', config) : Promise.resolve({ data: { success: false } }),
          axios.get('/api/points/leaderboard', isAuthenticated ? config : {}),
          isAuthenticated ? axios.get('/api/badges/my-badges', config) : Promise.resolve({ data: { success: false } }),
          isAuthenticated ? axios.get('/api/points/transactions', config) : Promise.resolve({ data: { success: false } }),
        ]);

        if (pointsRes.data.success) {
          setPointsData(pointsRes.data);
        }
        if (leaderboardRes.data.success) {
          setLeaderboard(leaderboardRes.data.leaderboard);
        }
        if (badgesRes.data.success) {
          setBadges(badgesRes.data.data);
        }
        if (historyRes.data.success) {
          setHistory(historyRes.data.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [isAuthenticated, token]);

  const currentTier = VIP_TIERS.find(t => t.level === pointsData?.points?.level) || VIP_TIERS[0];
  const nextTier = VIP_TIERS[VIP_TIERS.indexOf(currentTier) + 1];
  const progress = nextTier
    ? Math.min(100, ((pointsData?.points?.totalEarned - currentTier.threshold) / (nextTier.threshold - currentTier.threshold)) * 100)
    : 100;

  return (
    <div className="min-h-screen bg-[#070707] text-white pt-32 pb-24 relative overflow-hidden">
      {/* Background Cinematic Glows */}
      <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-[#d6b47c]/5 rounded-full blur-[120px] -translate-y-1/2" />
      <div className="absolute bottom-0 left-1/4 w-[600px] h-[600px] bg-[#d6b47c]/3 rounded-full blur-[150px] translate-y-1/2" />

      <SEO 
        title="VIP Club — Luxe | Эксклюзивный клуб" 
        description="Luxe VIP Club — xaridlar qiling, ballar to'plang, ekskluziv imtiyozlardan foydalaning. Присоединяйтесь к VIP клубу и получайте бонусы." 
        keywords="VIP Club, bonuslar, imtiyozlar, luxe uz, luxury club, программа лояльности, бонусы ташкент"
        breadcrumbSteps={[{ name: 'VIP Club', url: '/vip-club' }]}
      />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        {/* Header Section */}
        <div className="flex flex-col items-center text-center mb-20">
          <div className="inline-flex items-center gap-2.5 bg-gradient-to-r from-[#d6b47c]/20 via-[#d6b47c]/10 to-transparent border-l-2 border-[#d6b47c] px-6 py-2 mb-8">
            <Crown className="w-4 h-4 text-[#d6b47c]" />
            <span className="text-[#d6b47c] text-[10px] tracking-[0.4em] uppercase font-black">Eksklyuziv Imtiyozlar</span>
          </div>
          <h1 className="text-6xl md:text-9xl font-brilliant text-white mb-8 leading-tight">
            Luxe <span className="text-[#d6b47c]">VIP Club</span>
          </h1>
          <p className="text-gray-400 text-lg md:text-xl font-light max-w-3xl leading-relaxed">
            Xarid qilgan sari darajangiz oshadi. Har bir daraja yangi <span className="text-white font-medium italic underline decoration-[#d6b47c]/40 underline-offset-4">eksklyuziv imtiyozlar</span> va shaxsiy imkoniyatlar eshigini ochadi.
          </p>
        </div>

        {/* Cinematic Tab Bar */}
        <div className="flex flex-nowrap justify-center gap-2 mb-20 bg-white/5 backdrop-blur-xl border border-white/10 rounded-[32px] p-2 max-w-4xl mx-auto shadow-2xl overflow-x-auto scrollbar-hide">
          {[
            { id: 'overview', label: 'Darajam', icon: <Crown className="w-4 h-4" /> },
            { id: 'badges', label: 'Nishonlar', icon: <Medal className="w-4 h-4" /> },
            { id: 'leaderboard', label: 'Reyting', icon: <Trophy className="w-4 h-4" /> },
            { id: 'history', label: 'Tarix', icon: <History className="w-4 h-4" /> },
            { id: 'earn', label: 'Ishlash', icon: <Zap className="w-4 h-4" /> }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-shrink-0 flex items-center gap-2 px-6 py-4 text-[11px] font-black uppercase tracking-widest rounded-2xl transition-all ${activeTab === tab.id ? 'bg-[#d6b47c] text-black shadow-[0_10px_20px_rgba(214,180,124,0.3)] scale-105' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* --- OVERVIEW TAB --- */}
        {activeTab === 'overview' && (
          <div className="space-y-24">
            {/* My Card - Membership Card Style */}
            {isAuthenticated && pointsData ? (
              <div className="relative group">
                {/* Dynamic Glow Background */}
                <div className={`absolute -inset-4 rounded-[48px] blur-2xl opacity-20 group-hover:opacity-30 transition-opacity duration-1000 ${currentTier.glow}`} />
                
                <div className="relative overflow-hidden rounded-[40px] bg-gradient-to-br from-white/[0.03] to-transparent backdrop-blur-3xl border border-white/10 p-1">
                  <div className={`absolute inset-0 bg-gradient-to-br ${currentTier.gradient} opacity-50`} />
                  
                  <div className="relative z-10 p-10 md:p-14">
                    {/* Card Header */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-10 mb-16">
                      <div className="flex items-center gap-8">
                        <div className="w-28 h-28 rounded-[32px] bg-white/5 backdrop-blur-xl border border-white/10 flex items-center justify-center text-6xl shadow-2xl">
                          {currentTier.icon}
                        </div>
                        <div>
                          <p className="text-[12px] uppercase tracking-[0.4em] text-gray-400 mb-3 font-black">Joriy Darajangiz</p>
                          <h2 className="text-6xl md:text-8xl font-brilliant text-white tracking-tight leading-none">
                            {currentTier.level}
                          </h2>
                        </div>
                      </div>

                      <div className="flex flex-col items-end text-right">
                        <p className="text-8xl md:text-9xl font-brilliant text-[#d6b47c] leading-none mb-3">
                          {pointsData.points.balance.toLocaleString()}
                        </p>
                        <p className="text-[12px] uppercase tracking-[0.4em] text-gray-400 font-black">To'plangan Ballar</p>
                      </div>
                    </div>

                    {/* Progress Bar Section */}
                    {nextTier && (
                      <div className="mb-16 bg-white/[0.02] p-8 rounded-[32px] border border-white/5">
                        <div className="flex justify-between items-end mb-6">
                          <div className="flex items-center gap-3">
                            <span className="text-sm font-black text-white uppercase tracking-[0.2em]">Progress</span>
                            <span className="text-xs font-bold text-[#d6b47c] bg-[#d6b47c]/10 px-2 py-0.5 rounded-md">{Math.round(progress)}%</span>
                          </div>
                          <div className="text-right">
                            <p className="text-[11px] uppercase tracking-[0.2em] text-gray-500 mb-2 font-black">Keyingi darajagacha</p>
                            <p className="text-xl font-black text-white">{ (nextTier.threshold - pointsData.points.totalEarned).toLocaleString() } <span className="text-xs font-normal text-gray-500">ball</span></p>
                          </div>
                        </div>
                        <div className="relative h-2 bg-white/5 rounded-full overflow-hidden">
                          <div
                            className="absolute top-0 left-0 h-full rounded-full transition-all duration-1000 shadow-[0_0_20px_rgba(214,180,124,0.4)]"
                            style={{ width: `${progress}%`, background: currentTier.color }}
                          />
                        </div>
                        <div className="flex justify-between mt-4 px-1">
                          <span className="text-[10px] uppercase tracking-widest text-gray-400 font-black">{currentTier.level} ({currentTier.threshold.toLocaleString()})</span>
                          <span className="text-[10px] uppercase tracking-widest text-gray-500 font-black">{nextTier.level} ({nextTier.threshold.toLocaleString()})</span>
                        </div>
                      </div>
                    )}

                    {/* Perks Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 pt-12 border-t border-white/5">
                      {currentTier.perks.map((perk, i) => (
                        <div key={i} className="flex items-center gap-4 group">
                          <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/10 group-hover:scale-110 transition-transform">
                            <ShieldCheck className="w-5 h-5" style={{ color: currentTier.color }} />
                          </div>
                          <span className="text-sm text-gray-300 font-bold tracking-wide">{perk}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Decorative Elements */}
                  <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-white/5 rounded-full blur-3xl" />
                  <div className="absolute top-0 right-0 p-10 opacity-10">
                    <Crown className="w-32 h-32" style={{ color: currentTier.color }} />
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-24 rounded-[40px] border border-white/5 bg-white/[0.02] backdrop-blur-xl">
                <div className="w-20 h-20 bg-[#d6b47c]/10 rounded-3xl flex items-center justify-center mx-auto mb-8 border border-[#d6b47c]/20">
                  <Crown className="w-10 h-10 text-[#d6b47c]" />
                </div>
                <h3 className="text-3xl font-serif mb-3">VIP darajangizni ko'ring</h3>
                <p className="text-gray-500 mb-10 max-w-sm mx-auto text-lg font-light">Tizimga kirish orqali o'z ballaringiz, nishonlaringiz va eksklyuziv darajangizni ko'ring.</p>
                <button onClick={() => navigate('/login')} className="px-12 py-5 bg-[#d6b47c] text-black rounded-full font-black text-xs uppercase tracking-[0.2em] hover:scale-105 transition-transform">
                  Tizimga Kirish
                </button>
              </div>
            )}

            {/* All Tiers Grid */}
            <div>
              <div className="flex items-center gap-6 mb-16">
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                <h2 className="text-[10px] uppercase tracking-[0.5em] text-gray-500 font-black">Barcha Darajalar</h2>
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {VIP_TIERS.map((tier) => {
                  const isCurrentTier = pointsData?.points?.level === tier.level;
                  const isLocked = pointsData && pointsData.points.totalEarned < tier.threshold;
                  
                  return (
                    <div
                      key={tier.level}
                      className={`relative group rounded-[32px] p-8 border transition-all duration-500 ${isCurrentTier ? 'bg-white/[0.05] border-[#d6b47c]/40 scale-105 shadow-2xl' : 'bg-white/[0.02] border-white/5 hover:border-white/20'}`}
                    >
                      {isCurrentTier && (
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#d6b47c] text-black text-[9px] font-black px-4 py-1.5 rounded-full uppercase tracking-[0.2em] shadow-lg">
                          Siz bu yerdasiz
                        </div>
                      )}

                      <div className="flex justify-between items-start mb-10">
                        <div className="text-5xl group-hover:scale-110 transition-transform duration-500">{tier.icon}</div>
                        {isLocked && (
                          <div className="p-2 bg-white/5 rounded-xl border border-white/10 text-gray-600">
                            <Unlock className="w-4 h-4" />
                          </div>
                        )}
                      </div>

                      <h3 className="text-4xl font-brilliant text-white mb-3">{tier.level}</h3>
                      <p className="text-[12px] font-black uppercase tracking-widest text-gray-400 mb-10">
                        {tier.threshold.toLocaleString()} <span className="opacity-50">ball dan</span>
                      </p>

                      <div className="space-y-5 mb-12">
                        {tier.perks.map((perk, i) => (
                          <div key={i} className="flex items-start gap-4">
                            <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5" style={{ background: `${tier.color}20` }}>
                              <span className="text-[10px] font-black" style={{ color: tier.color }}>✓</span>
                            </div>
                            <span className="text-sm text-gray-300 font-medium leading-tight">{perk}</span>
                          </div>
                        ))}
                      </div>

                      {tier.discount > 0 ? (
                        <div className="mt-auto py-4 text-center rounded-2xl text-[11px] font-black uppercase tracking-widest border border-white/5" style={{ background: `${tier.color}10`, color: tier.color }}>
                          -{tier.discount}% chegirma
                        </div>
                      ) : (
                        <div className="mt-auto py-4 text-center rounded-2xl text-[11px] font-black uppercase tracking-widest border border-white/5 text-gray-500 bg-white/[0.02]">
                          Luxe Member
                        </div>
                      )}

                      {/* Hover Gradient Overlay */}
                      <div className={`absolute inset-0 bg-gradient-to-b ${tier.gradient} opacity-0 group-hover:opacity-5 transition-opacity pointer-events-none rounded-[32px]`} />
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* --- BADGES TAB --- */}
        {activeTab === 'badges' && (
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-serif text-center mb-8">🎖️ Mening nishonlarim</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
              {badges.map(userBadge => (
                <div key={userBadge._id} className="relative group flex flex-col items-center p-6 rounded-[32px] border border-[#d6b47c]/20 bg-gradient-to-b from-[#d6b47c]/10 to-transparent hover:border-[#d6b47c]/40 transition-all text-center overflow-hidden">
                  <div className="text-6xl mb-4 group-hover:scale-110 transition-transform duration-500">{userBadge.badge.icon}</div>
                  <h3 className="font-bold text-base mb-1 text-white">{userBadge.badge.name}</h3>
                  <p className="text-[11px] text-gray-400 mb-3">{userBadge.badge.description}</p>
                  
                  {/* Rewards Badge */}
                  {userBadge.badge.reward?.points > 0 && (
                    <div className="mt-auto px-3 py-1 bg-[#d6b47c]/20 border border-[#d6b47c]/30 rounded-full text-[10px] text-[#d6b47c] font-black uppercase tracking-widest">
                      +{userBadge.badge.reward.points} ball
                    </div>
                  )}

                  <div className="absolute top-4 right-4 bg-green-500 text-black p-1 rounded-full shadow-lg scale-90">
                    <ShieldCheck className="w-3.5 h-3.5" />
                  </div>
                  
                  {/* Glass highlight effect */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                </div>
              ))}
              {badges.length === 0 && (
                <div className="col-span-full py-20 text-center rounded-3xl border border-white/5 bg-[#111]">
                  <Medal className="w-16 h-16 text-gray-800 mx-auto mb-4" />
                  <p className="text-gray-500">Hali nishonlar yo'q. Musobaqalarda qatnashing va xaridlar qiling!</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* --- HISTORY TAB --- */}
        {activeTab === 'history' && (
          <div className="max-w-2xl mx-auto space-y-4">
            <h2 className="text-2xl font-serif text-center mb-8">⏳ Ballar tarixi</h2>
            {history.map(tx => (
              <div key={tx._id} className="flex items-center justify-between p-5 rounded-3xl border border-white/5 bg-[#111] hover:bg-white/[0.02] transition-all">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${tx.type === 'earned' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                    {tx.type === 'earned' ? '+' : '-'}
                  </div>
                  <div>
                    <p className="font-bold text-sm">{tx.description}</p>
                    <p className="text-[10px] text-gray-500 uppercase tracking-widest">{new Date(tx.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-black ${tx.type === 'earned' ? 'text-green-400' : 'text-red-400'}`}>
                    {tx.type === 'earned' ? '+' : '-'}{tx.amount.toLocaleString()}
                  </p>
                  <p className="text-[10px] text-gray-600">ball</p>
                </div>
              </div>
            ))}
            {history.length === 0 && (
              <div className="text-center py-12 text-gray-600 italic">Hali operatsiyalar mavjud emas</div>
            )}
          </div>
        )}

        {/* --- LEADERBOARD TAB --- */}
        {activeTab === 'leaderboard' && (
          <div className="max-w-2xl mx-auto space-y-4">
            <h2 className="text-2xl font-serif text-center mb-8">🏆 Top 10 Luxe VIP</h2>
            {leaderboard.map((entry, index) => {
              const tier = VIP_TIERS.find(t => t.level === entry.level) || VIP_TIERS[0];
              return (
                <div
                  key={entry._id}
                  className={`flex items-center gap-5 p-5 rounded-3xl border transition-all ${index < 3 ? 'border-[#d6b47c]/30 bg-[#d6b47c]/5' : 'border-white/5 bg-[#111]'}`}
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-lg ${index === 0 ? 'bg-[#d6b47c] text-black' : index === 1 ? 'bg-gray-400 text-black' : index === 2 ? 'bg-[#cd7f32] text-white' : 'bg-white/5 text-gray-400'}`}>
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <p className="font-bold">{entry.user?.username || 'Noma\'lum'}</p>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3" style={{ color: tier.color }}>{tier.icon}</div>
                      <p className="text-[10px] uppercase tracking-widest font-black text-gray-500">{entry.level}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-black text-[#d6b47c]">{entry.balance?.toLocaleString()}</p>
                    <p className="text-xs text-gray-500">ball</p>
                  </div>
                </div>
              );
            })}
            {leaderboard.length === 0 && (
              <div className="text-center py-12 text-gray-600">Hali reytingda hech kim yo'q</div>
            )}
          </div>
        )}

        {/* --- HOW TO EARN TAB --- */}
        {activeTab === 'earn' && (
          <div className="max-w-3xl mx-auto space-y-6">
            <h2 className="text-2xl font-serif text-center mb-8">💰 Qanday ball ishlash mumkin?</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {HOW_TO_EARN.map((item, i) => (
                <div key={i} className="flex items-start gap-5 p-6 rounded-3xl border border-white/5 bg-[#111] hover:border-[#d6b47c]/20 transition-all group">
                  <div className="w-12 h-12 rounded-2xl bg-[#d6b47c]/10 border border-[#d6b47c]/20 flex items-center justify-center text-[#d6b47c] shrink-0 group-hover:bg-[#d6b47c]/20 transition-all">
                    {item.icon}
                  </div>
                  <div>
                    <p className="font-bold mb-1">{item.action}</p>
                    <p className="text-[#d6b47c] text-sm font-black mb-1">{item.points}</p>
                    <p className="text-xs text-gray-500">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {!isAuthenticated && (
              <div className="text-center mt-8">
                <button onClick={() => navigate('/login')} className="px-10 py-4 bg-[#d6b47c] text-black rounded-full font-black text-sm hover:bg-[#e8c98a] transition-all">
                  Hoziroq ball to'play boshlash
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default VIPClub;
