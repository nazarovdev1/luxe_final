import React, { useEffect, useState } from 'react';
import { Crown, Gem, Gift, LogOut, Medal, Phone, RefreshCw } from 'lucide-react';
import axios from 'axios';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import ReferralProgram from '../components/ReferralProgram';
import MyGiftCards from '../components/MyGiftCards';

const Profile = () => {
    const [badges, setBadges] = useState([]);
    const [points, setPoints] = useState(null);
    const [pointTransactions, setPointTransactions] = useState([]);
    const { user, isAuthenticated, logout } = useAuth();
    const { t } = useLanguage();

    const displayName = user?.username || t('profile.userFallback', 'Foydalanuvchi');
    const displayPhone = user?.phone?.startsWith('tg_') ? t('profile.telegramUser', 'Telegram foydalanuvchi') : user?.phone;
    const pointsBalance = points?.balance ?? 0;
    const totalEarned = points?.totalEarned ?? 0;
    const currentLevel = points?.level || t('profile.levelUnavailable', 'Daraja mavjud emas');

    useEffect(() => {
        const fetchProfileData = async () => {
            if (!isAuthenticated) return;

            const token = localStorage.getItem('token');
            const config = { headers: { Authorization: `Bearer ${token}` } };

            try {
                const [badgesRes, pointsRes, transactionsRes] = await Promise.all([
                    axios.get('/api/badges/my-badges', config),
                    axios.get('/api/points', config),
                    axios.get('/api/points/transactions', config)
                ]);

                if (badgesRes.data.success) setBadges(badgesRes.data.data || []);
                if (pointsRes.data.success) setPoints(pointsRes.data.points);
                if (transactionsRes.data.success) setPointTransactions(transactionsRes.data.data || []);
            } catch (err) {
                console.error(err);
            }
        };

        fetchProfileData();
    }, [isAuthenticated]);

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    return (
        <div className="min-h-screen bg-black pt-32 pb-12 px-4 sm:px-6 lg:px-8">
            <div className="pointer-events-none fixed inset-0 z-0">
                <div className="absolute top-0 left-1/4 h-96 w-96 rounded-full bg-white/5 blur-3xl opacity-20" />
                <div className="absolute bottom-0 right-1/4 h-96 w-96 rounded-full bg-[#d6b47c]/5 blur-3xl opacity-30" />
            </div>

            <div className="relative z-10 max-w-5xl mx-auto">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-light text-white mb-4 tracking-tight">
                        {t('profile.welcome')}, {displayName}
                    </h1>
                    <p className="text-gray-400 font-light text-lg">
                        Profil ma'lumotlaringiz, VIP daraja va ballar holati.
                    </p>
                </div>

                <div className="rounded-[32px] bg-[#111] border border-white/10 p-6 text-left">
                    <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                        <div className="flex items-center gap-4">
                            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 text-2xl font-semibold text-white">
                                {displayName.charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <p className="text-xs uppercase tracking-[0.22em] text-gray-500">{t('profile.account')}</p>
                                <h2 className="mt-1 text-2xl font-medium text-white">{displayName}</h2>
                                <p className="mt-1 flex items-center gap-2 text-sm text-gray-400">
                                    <Phone className="h-4 w-4 text-[#d6b47c]" />
                                    {displayPhone || t('profile.phoneUnavailable')}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={logout}
                            className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-gray-300 transition-colors hover:bg-white/10 hover:text-white"
                        >
                            <LogOut className="h-4 w-4" />
                            {t('profile.logout')}
                        </button>
                    </div>

                    <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
                        <div className="rounded-2xl border border-white/5 bg-white/[0.03] p-4">
                            <p className="text-[11px] uppercase tracking-[0.16em] text-gray-500">{t('profile.points')}</p>
                            <p className="mt-2 text-2xl font-semibold text-[#d6b47c]">{pointsBalance.toLocaleString()}</p>
                        </div>
                        <div className="rounded-2xl border border-white/5 bg-white/[0.03] p-4">
                            <p className="text-[11px] uppercase tracking-[0.16em] text-gray-500">Jami to'plangan</p>
                            <p className="mt-2 text-2xl font-semibold text-white">{totalEarned.toLocaleString()} <span className="text-xs text-gray-500">pts</span></p>
                        </div>
                        <div className="rounded-2xl border border-[#d6b47c]/20 bg-[#d6b47c]/10 p-4">
                            <p className="text-[11px] uppercase tracking-[0.16em] text-[#d6b47c]">{t('profile.vipStatus')}</p>
                            <p className="mt-2 text-2xl font-semibold text-white">{currentLevel}</p>
                        </div>
                    </div>
                </div>

                <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Link to="/vip-club" className="relative overflow-hidden flex flex-col bg-[#111] border border-[#d6b47c]/20 p-8 rounded-[32px] hover:border-[#d6b47c]/40 transition-all group text-left">
                        <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
                            <Crown className="w-24 h-24 text-[#d6b47c]" />
                        </div>

                        <div className="flex items-center gap-6 mb-6">
                            <div className="w-16 h-16 rounded-2xl bg-[#d6b47c]/10 flex items-center justify-center text-[#d6b47c]">
                                <Crown className="w-8 h-8" />
                            </div>
                            <div>
                                <p className="text-xs text-[#d6b47c] font-black uppercase tracking-widest mb-1">{t('profile.vipStatus')}</p>
                                <h3 className="text-3xl font-serif text-white">{currentLevel}</h3>
                            </div>
                        </div>

                        {points && points.level !== 'Diamond' && (
                            <div className="mt-auto pt-4 border-t border-white/5">
                                <div className="flex justify-between text-xs mb-2">
                                    <span className="text-gray-400">Keyingi darajagacha</span>
                                    <span className="text-white font-medium">
                                        {points.level === 'Bronze' ? 300 - points.totalEarned :
                                            points.level === 'Silver' ? 650 - points.totalEarned :
                                                1000 - points.totalEarned} ball
                                    </span>
                                </div>
                                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-gradient-to-r from-[#d6b47c] to-[#f0d0a4] transition-all duration-1000"
                                        style={{
                                            width: `${Math.min(100, (points.totalEarned / (
                                                points.level === 'Bronze' ? 300 :
                                                    points.level === 'Silver' ? 650 : 1000
                                            )) * 100)}%`
                                        }}
                                    />
                                </div>
                            </div>
                        )}

                        <div className="flex items-center justify-between mt-4">
                            <p className="text-sm text-gray-400">Jami to'plangan: <span className="text-white font-semibold">{totalEarned.toLocaleString()} pts</span></p>
                            <div className="flex items-center gap-2 bg-white/5 px-3 py-1 rounded-full text-xs text-white">
                                <Gem className="w-3.5 h-3.5 text-amber-300" />
                                {pointsBalance.toLocaleString()} balans
                            </div>
                        </div>
                    </Link>

                    <div className="bg-[#111] border border-white/5 p-8 rounded-[32px] text-left flex flex-col h-full">
                        <p className="text-xs text-gray-500 font-black uppercase tracking-widest mb-6 flex items-center gap-2">
                            <RefreshCw className="w-3.5 h-3.5" /> Ballar tarixi
                        </p>
                        <div className="space-y-4 overflow-y-auto max-h-[220px] pr-2 scrollbar-thin scrollbar-thumb-white/10">
                            {pointTransactions.length > 0 ? (
                                pointTransactions.map((tx) => (
                                    <div key={tx._id} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                                        <div className="min-w-0">
                                            <p className="text-xs text-white truncate">{tx.description}</p>
                                            <p className="text-[10px] text-gray-500">{new Date(tx.createdAt || tx.date).toLocaleDateString('uz-UZ')}</p>
                                        </div>
                                        <span className={`text-xs font-bold ${tx.amount > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                                            {tx.amount > 0 ? '+' : ''}{tx.amount}
                                        </span>
                                    </div>
                                ))
                            ) : (
                                <p className="text-xs text-gray-600 italic py-4">Hali ballar tarixi yo'q</p>
                            )}
                        </div>
                    </div>
                </div>

                <div className="mt-8 bg-[#111] border border-white/5 p-6 rounded-[32px] text-left">
                    <p className="text-xs text-gray-500 font-black uppercase tracking-widest mb-4 flex items-center gap-2">
                        <Medal className="w-3.5 h-3.5" /> Erishilgan nishonlar
                    </p>
                    <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                        {badges.map(b => (
                            <div key={b._id} className="group relative flex flex-col items-center gap-2 shrink-0">
                                <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-2xl group-hover:bg-white/10 group-hover:border-white/20 transition-all cursor-help">
                                    {b.badge.icon}
                                </div>
                                <span className="text-[10px] text-gray-400 uppercase tracking-tighter opacity-0 group-hover:opacity-100 transition-opacity">{b.badge.name}</span>
                            </div>
                        ))}
                        {badges.length === 0 && <p className="text-xs text-gray-600 italic px-2">Hali nishonlar yo'q</p>}
                    </div>
                </div>

                <div className="mt-8">
                    <ReferralProgram user={user} />
                </div>

                <div className="mt-8 bg-[#111] border border-white/5 p-8 rounded-[32px] text-left">
                    <p className="text-xs text-gray-500 font-black uppercase tracking-widest mb-6 flex items-center gap-2">
                        <Gift className="w-3.5 h-3.5" /> Mening sovg'a kartalarim
                    </p>
                    <MyGiftCards />
                </div>
            </div>
        </div>
    );
};

export default Profile;
