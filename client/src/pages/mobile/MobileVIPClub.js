import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import {
  Crown, Star, ShieldCheck, Flame, Trophy, Zap, Gift,
  ChevronRight, ArrowLeft, Gem, Medal, Lock, History
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import LoginForm from '../../components/LoginForm';
import { useLanguage } from '../../contexts/LanguageContext';

const VIP_TIER_DEFS = [
  {
    key: 'Bronze', threshold: 0, color: '#cd7f32',
    discount: 0, perksKey: 'bronze',
    icon: (
      <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M8.21 13.89L7 23l5-3 5 3-1.21-9.12" /><circle cx="12" cy="8" r="6" />
        <text x="12" y="10.5" textAnchor="middle" fill="currentColor" fontSize="7" fontWeight="900" style={{ fontFamily: 'Inter, sans-serif' }}>3</text>
      </svg>
    ),
  },
  {
    key: 'Silver', threshold: 1000, color: '#c0c0c0',
    discount: 5, perksKey: 'silver',
    icon: (
      <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M8.21 13.89L7 23l5-3 5 3-1.21-9.12" /><circle cx="12" cy="8" r="6" />
        <text x="12" y="10.5" textAnchor="middle" fill="currentColor" fontSize="7" fontWeight="900" style={{ fontFamily: 'Inter, sans-serif' }}>2</text>
      </svg>
    ),
  },
  {
    key: 'Gold', threshold: 5000, color: '#d6b47c',
    discount: 10, perksKey: 'gold',
    icon: (
      <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M8.21 13.89L7 23l5-3 5 3-1.21-9.12" /><circle cx="12" cy="8" r="6" />
        <text x="12" y="10.5" textAnchor="middle" fill="currentColor" fontSize="7" fontWeight="900" style={{ fontFamily: 'Inter, sans-serif' }}>1</text>
      </svg>
    ),
  },
  {
    key: 'Diamond', threshold: 20000, color: '#a8d8ea',
    discount: 15, perksKey: 'diamond',
    icon: <Gem className="w-8 h-8" />,
  },
];

const HOW_TO_EARN_DEFS = [
  { icon: <ShieldCheck className="w-4 h-4" />, key: 'purchase' },
  { icon: <Star className="w-4 h-4" />, key: 'review' },
  { icon: <Flame className="w-4 h-4" />, key: 'sharePost' },
  { icon: <Trophy className="w-4 h-4" />, key: 'challengeWin' },
  { icon: <Zap className="w-4 h-4" />, key: 'dailyLogin' },
  { icon: <Gift className="w-4 h-4" />, key: 'birthday' },
];

const TABS_DEFS = [
  { id: 'overview', labelKey: 'overview' },
  { id: 'badges', labelKey: 'badges' },
  { id: 'leaderboard', labelKey: 'leaderboard' },
  { id: 'history', labelKey: 'history' },
  { id: 'earn', labelKey: 'earn' },
];

export default function MobileVIPClub() {
  const { isAuthenticated, token } = useAuth();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState('overview');
  const [pointsData, setPointsData] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [badges, setBadges] = useState([]);
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const VIP_TIERS = VIP_TIER_DEFS.map(tier => ({
    ...tier,
    perks: tier.perksKey === 'bronze' ? [
      t('mobileVip.tierPerks.bronze.0'),
      t('mobileVip.tierPerks.bronze.1'),
      t('mobileVip.tierPerks.bronze.2'),
    ] : tier.perksKey === 'silver' ? [
      t('mobileVip.tierPerks.silver.0'),
      t('mobileVip.tierPerks.silver.1'),
      t('mobileVip.tierPerks.silver.2'),
    ] : tier.perksKey === 'gold' ? [
      t('mobileVip.tierPerks.gold.0'),
      t('mobileVip.tierPerks.gold.1'),
      t('mobileVip.tierPerks.gold.2'),
      t('mobileVip.tierPerks.gold.3'),
    ] : [
      t('mobileVip.tierPerks.diamond.0'),
      t('mobileVip.tierPerks.diamond.1'),
      t('mobileVip.tierPerks.diamond.2'),
      t('mobileVip.tierPerks.diamond.3'),
      t('mobileVip.tierPerks.diamond.4'),
    ],
  }));

  const HOW_TO_EARN = HOW_TO_EARN_DEFS.map(item => ({
    icon: item.icon,
    action: t(`mobileVip.earn.${item.key}`),
    points: t(`mobileVip.${item.key}Points`),
  }));

  const TABS = TABS_DEFS.map(tab => ({
    id: tab.id,
    label: t(`mobileVip.tabs.${tab.labelKey}`),
  }));

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
        if (pointsRes.data.success) setPointsData(pointsRes.data);
        if (leaderboardRes.data.success) setLeaderboard(leaderboardRes.data.leaderboard);
        if (badgesRes.data.success) setBadges(badgesRes.data.data);
        if (historyRes.data.success) setHistory(historyRes.data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [isAuthenticated, token]);

  const currentTier = VIP_TIERS.find(tier => tier.key === pointsData?.points?.level) || VIP_TIERS[0];
  const nextTier = VIP_TIERS[VIP_TIERS.indexOf(currentTier) + 1];
  const progress = nextTier
    ? Math.min(100, ((pointsData?.points?.totalEarned - currentTier.threshold) / (nextTier.threshold - currentTier.threshold)) * 100)
    : 100;

  return (
    <div className="min-h-screen bg-[#07090f] text-white pb-24 relative overflow-hidden">
      {/* Cinematic Background Glows */}
      <div className="absolute top-0 right-0 w-80 h-80 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/4 opacity-40" style={{ background: `${currentTier.color}40` }} />
      <div className="absolute top-[30%] left-0 w-64 h-64 rounded-full blur-[100px] -translate-x-1/2 opacity-20" style={{ background: `${currentTier.color}30` }} />
      <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full blur-[150px] translate-y-1/3 opacity-30" style={{ background: `${currentTier.color}20` }} />

      <div className="relative z-10">
        {/* Header */}
        <div className="px-5 pt-10 pb-6">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-400 mb-10 active:scale-90 transition-transform">
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm font-medium uppercase tracking-widest">{t('mobileVip.back')}</span>
          </button>

          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-[14px] flex items-center justify-center backdrop-blur-xl border" style={{ background: `${currentTier.color}20`, borderColor: `${currentTier.color}40`, color: currentTier.color }}>
              <Crown className="w-5 h-5" />
            </div>
            <span className="text-[11px] uppercase tracking-[0.4em] font-black" style={{ color: currentTier.color }}>Privileged Access</span>
          </div>
          <h1 className="text-6xl font-brilliant text-white leading-none">
            {t('mobileVip.titlePrefix')} <span style={{ color: currentTier.color }}>{t('mobileVip.titleSuffix')}</span>
          </h1>
          <p className="text-base text-gray-400 mt-4 leading-relaxed max-w-[300px]">
             {t('mobileVip.subtitle')}
          </p>
        </div>

        {/* Tab Bar */}
        <div className="px-5 mb-8">
          <div className="flex gap-1.5 bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[24px] p-1.5 overflow-x-auto scrollbar-hide">
            {TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-shrink-0 px-6 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all duration-500 ${
                  activeTab === tab.id
                    ? 'text-black shadow-[0_8px_20px_rgba(0,0,0,0.4)]'
                    : 'text-gray-500 hover:text-gray-300'
                }`}
                style={activeTab === tab.id ? { background: currentTier.color } : {}}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: currentTier.color }} />
          </div>
        ) : (
          <div className="px-4">

            {/* ── OVERVIEW TAB ── */}
            {activeTab === 'overview' && (
              <div className="space-y-4">
                {isAuthenticated && pointsData ? (
                  <>
                    {/* Membership Card */}
                    <div className="rounded-[28px] p-5 relative overflow-hidden border" style={{ background: `linear-gradient(135deg, ${currentTier.color}15, transparent)`, borderColor: `${currentTier.color}30` }}>
                      <div className="absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl" style={{ background: `${currentTier.color}10` }} />
                      <div className="relative z-10">
                        {/* Tier icon + label */}
                        <div className="flex items-center justify-between mb-6">
                          <div>
                            <p className="text-[10px] uppercase tracking-[0.3em] text-gray-400 font-black mb-1">{t('mobileVip.currentLevel')}</p>
                            <h2 className="text-4xl font-brilliant" style={{ color: currentTier.color }}>{currentTier.key}</h2>
                          </div>
                          <div className="w-16 h-16 rounded-2xl flex items-center justify-center border" style={{ background: `${currentTier.color}15`, borderColor: `${currentTier.color}30`, color: currentTier.color }}>
                            {currentTier.icon}
                          </div>
                        </div>

                        {/* Balance */}
                        <div className="bg-white/5 rounded-2xl p-4 mb-4 border border-white/5">
                          <p className="text-[10px] uppercase tracking-[0.3em] text-gray-400 font-black mb-1">{t('mobileVip.accumulatedPoints')}</p>
                          <p className="text-5xl font-brilliant" style={{ color: currentTier.color }}>
                            {pointsData.points.balance.toLocaleString()}
                          </p>
                        </div>

                        {/* Progress */}
                        {nextTier && (
                          <div>
                            <div className="flex justify-between items-center mb-2">
                              <span className="text-[10px] uppercase tracking-widest text-gray-400 font-black">{currentTier.key}</span>
                              <span className="text-[10px] font-black" style={{ color: currentTier.color }}>{Math.round(progress)}%</span>
                              <span className="text-[10px] uppercase tracking-widest text-gray-500 font-black">{nextTier.key}</span>
                            </div>
                            <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                              <div
                                className="h-full rounded-full transition-all duration-1000"
                                style={{ width: `${progress}%`, background: currentTier.color, boxShadow: `0 0 12px ${currentTier.color}60` }}
                              />
                            </div>
                            <p className="text-[10px] text-gray-500 mt-2 text-center">
                              {t('mobileVip.nextLevelBefore')} <span className="font-black" style={{ color: currentTier.color }}>{(nextTier.threshold - pointsData.points.totalEarned).toLocaleString()} {t('mobileVip.nextLevelSuffix')}</span> {t('mobileVip.nextLevelAfter')}
                            </p>
                          </div>
                        )}

                        {/* Perks */}
                        <div className="mt-4 pt-4 border-t border-white/5 space-y-2.5">
                          {currentTier.perks.map((perk, i) => (
                            <div key={i} className="flex items-center gap-3">
                              <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0" style={{ background: `${currentTier.color}20` }}>
                                <ShieldCheck className="w-3 h-3" style={{ color: currentTier.color }} />
                              </div>
                              <span className="text-sm text-gray-300 font-medium">{perk}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Badges */}
                    {badges.length > 0 && (
                      <div className="rounded-[28px] bg-white/[0.02] border border-white/5 p-5">
                        <h3 className="text-sm font-black uppercase tracking-widest text-gray-400 mb-4 flex items-center gap-2">
                          <Trophy className="w-4 h-4 text-[#d6b47c]" /> {t('mobileVip.badgesTitle')}
                        </h3>
                        <div className="grid grid-cols-3 gap-3">
                          {badges.slice(0, 6).map((badge, i) => (
                            <div key={i} className="rounded-2xl bg-white/5 p-3 text-center border border-white/5">
                              <div className="text-2xl mb-1 flex justify-center">
                                {badge.badge?.icon?.startsWith('http') || badge.badge?.icon?.startsWith('/') ? (
                                  <img src={badge.badge.icon} alt="" className="w-8 h-8 object-contain" onError={(e) => { e.target.style.display = 'none' }} />
                                ) : (
                                  badge.badge?.icon || '🏅'
                                )}
                              </div>
                              <p className="text-[9px] text-gray-400 font-black uppercase tracking-wider leading-tight">{badge.badge?.name}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                ) : !isAuthenticated ? (
                  <div className="rounded-[28px] border border-white/5 bg-white/[0.02] p-8 text-center">
                    <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 bg-[#d6b47c]/10 border border-[#d6b47c]/20">
                      <Crown className="w-8 h-8 text-[#d6b47c]" />
                    </div>
                    <h3 className="text-xl font-brilliant mb-2">{t('mobileVip.loginTitle')}</h3>
                    <p className="text-sm text-gray-400 mb-5">{t('mobileVip.loginDesc')}</p>
                    <button
                      onClick={() => navigate('/mobile/login')}
                      className="w-full py-3.5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] text-black"
                      style={{ background: '#d6b47c' }}
                    >
                      {t('mobileVip.loginButton')}
                    </button>
                  </div>
                ) : null}

                {/* How to Earn */}
                <div className="rounded-[28px] bg-white/[0.02] border border-white/5 p-5">
                  <h3 className="text-sm font-black uppercase tracking-widest text-gray-400 mb-4">{t('mobileVip.howToEarnTitle')}</h3>
                  <div className="space-y-3">
                    {HOW_TO_EARN.map((item, i) => (
                      <div key={i} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center text-[#d6b47c]">
                            {item.icon}
                          </div>
                          <span className="text-sm text-gray-300 font-medium">{item.action}</span>
                        </div>
                        <span className="text-xs font-black text-[#d6b47c]">{item.points}</span>
                      </div>
                    ))}
                  </div>
                </div>
                </div>
            )}
 
            {/* ── BADGES TAB ── */}
            {activeTab === 'badges' && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  {badges.map((userBadge, i) => (
                    <div key={i} className="relative rounded-[28px] p-5 border border-[#d6b47c]/20 bg-[#d6b47c]/5 text-center overflow-hidden">
                      <div className="text-4xl mb-3">{userBadge.badge.icon}</div>
                      <h3 className="text-xs font-black text-white uppercase tracking-wider mb-1 truncate">{userBadge.badge.name}</h3>
                      <p className="text-[9px] text-gray-500 leading-tight mb-2">{userBadge.badge.description}</p>
                      {userBadge.badge.reward?.points > 0 && (
                        <div className="inline-block px-2 py-0.5 bg-[#d6b47c]/20 border border-[#d6b47c]/30 rounded-full text-[8px] text-[#d6b47c] font-black">
                          +{userBadge.badge.reward.points} {t('mobileVip.pointsSuffix')}
                        </div>
                      )}
                      <div className="absolute top-2 right-2 bg-green-500 text-black p-0.5 rounded-full scale-75">
                        <ShieldCheck className="w-3 h-3" />
                      </div>
                    </div>
                  ))}
                  {badges.length === 0 && (
                    <div className="col-span-full py-16 text-center rounded-3xl border border-white/5 bg-white/[0.01]">
                      <Medal className="w-12 h-12 text-gray-800 mx-auto mb-3" />
                      <p className="text-xs text-gray-600">{t('mobileVip.noBadges')}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ── EARN TAB ── */}
            {activeTab === 'earn' && (
              <div className="space-y-3">
                {HOW_TO_EARN.map((item, i) => (
                  <div key={i} className="flex items-center gap-4 p-5 rounded-[28px] border border-white/5 bg-white/[0.02]">
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-[#d6b47c]/10 border border-[#d6b47c]/20 text-[#d6b47c] shrink-0">
                      {item.icon}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-bold text-white">{item.action}</p>
                      <p className="text-[#d6b47c] text-xs font-black">{item.points}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* ── LEADERBOARD TAB ── */}
            {activeTab === 'leaderboard' && (
              <div className="space-y-2">
                {leaderboard.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <Trophy className="w-12 h-12 mx-auto mb-3 opacity-20" />
                    <p className="text-sm">{t('mobileVip.leaderboardEmpty')}</p>
                  </div>
                ) : leaderboard.map((entry, i) => {
                  const tier = VIP_TIERS.find(tierItem => tierItem.key === entry.level) || VIP_TIERS[0];
                  const rankColors = ['#d6b47c', '#c0c0c0', '#cd7f32'];
                  const rankColor = rankColors[i] || '#555';
                  return (
                    <div key={entry.userId} className={`flex items-center gap-3 rounded-2xl p-4 border ${i < 3 ? 'bg-white/[0.03]' : 'bg-white/[0.01]'} border-white/5`}>
                      <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 font-black text-sm" style={{ background: `${rankColor}20`, color: rankColor }}>
                        {i + 1}
                      </div>
                      <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-sm font-bold shrink-0">
                        {entry.user?.username?.charAt(0).toUpperCase() || '?'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-white truncate">{entry.user?.username || t('mobileVip.pointsSuffix')}</p>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[9px] font-black" style={{ color: tier.color }}>{entry.level}</span>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-sm font-black text-[#d6b47c]">{entry.balance?.toLocaleString()}</p>
                        <p className="text-[9px] text-gray-500 uppercase tracking-wider">{t('mobileVip.pointsSuffix')}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* ── HISTORY TAB ── */}
            {activeTab === 'history' && (
              <div className="space-y-2">
                {!isAuthenticated ? (
                  <div className="text-center py-12">
                    <History className="w-12 h-12 mx-auto mb-3 text-gray-700" />
                    <p className="text-sm text-gray-500">{t('mobileVip.historyLoginRequired')}</p>
                    <button onClick={() => navigate('/mobile/login')} className="mt-4 px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest text-black" style={{ background: '#d6b47c' }}>
                      {t('mobileVip.loginShort')}
                    </button>
                  </div>
                ) : history.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <History className="w-12 h-12 mx-auto mb-3 opacity-20" />
                    <p className="text-sm">{t('mobileVip.historyEmpty')}</p>
                  </div>
                ) : history.map((tx, i) => (
                  <div key={i} className="flex items-center gap-3 rounded-2xl bg-white/[0.02] border border-white/5 p-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${tx.amount > 0 ? 'bg-green-500/10' : 'bg-red-500/10'}`}>
                      {tx.amount > 0
                        ? <Zap className="w-4 h-4 text-green-400" />
                        : <Gift className="w-4 h-4 text-red-400" />
                      }
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">{tx.description || tx.type}</p>
                      <p className="text-[10px] text-gray-500">{new Date(tx.createdAt).toLocaleDateString('uz-UZ')}</p>
                    </div>
                    <span className={`text-sm font-black shrink-0 ${tx.amount > 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {tx.amount > 0 ? '+' : ''}{tx.amount}
                    </span>
                  </div>
                ))}
              </div>
            )}

          </div>
        )}
      </div>
    </div>
  );
}
