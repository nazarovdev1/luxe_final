import React, { useState } from 'react';
import { Copy, Share2, Users, Gift, TrendingUp, CheckCircle, Send, Link2 } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

const ReferralProgram = ({ user }) => {
  const [copied, setCopied] = useState(false);
  const [shareMethod, setShareMethod] = useState(null);
  const { t } = useLanguage();

  // Generate referral code from user ID or use a stored one
  const referralCode = user
    ? `LUXX${(user._id || user.id || '').slice(-6).toUpperCase()}`
    : 'LUXXDEMO';

  const referralLink = `${window.location.origin}?ref=${referralCode}`;

  // Demo stats - in production these would come from API
  const stats = {
    totalInvited: 7,
    successfulReferrals: 4,
    earnedPoints: 200,
    pendingPoints: 50,
  };

  // Demo referral history
  const referralHistory = [
    { name: 'Nodira K.', date: '2026-04-28', status: 'completed', points: 50 },
    { name: 'Dilnoza S.', date: '2026-04-25', status: 'completed', points: 50 },
    { name: 'Gulnora M.', date: '2026-04-20', status: 'completed', points: 50 },
    { name: 'Shaxlo T.', date: '2026-04-18', status: 'completed', points: 50 },
    { name: 'Kamola R.', date: '2026-04-15', status: 'pending', points: 0 },
    { name: 'Zulfiya A.', date: '2026-04-10', status: 'pending', points: 0 },
    { name: 'Malika B.', date: '2026-04-05', status: 'expired', points: 0 },
  ];

  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralLink).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleShare = (method) => {
    setShareMethod(method);
    const text = `🎉 LUXX.UZ premium moda do'koniga taklif qilaman! Ro'yxatdan o'ting va 30 ball oling: ${referralLink}`;

    switch (method) {
      case 'telegram':
        window.open(`https://t.me/share/url?url=${encodeURIComponent(referralLink)}&text=${encodeURIComponent(text)}`, '_blank');
        break;
      case 'whatsapp':
        window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
        break;
      case 'instagram':
        navigator.clipboard.writeText(text);
        break;
      default:
        break;
    }
    setTimeout(() => setShareMethod(null), 2000);
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('uz-UZ', {
      day: 'numeric',
      month: 'short',
    });
  };

  return (
    <div className="rounded-[2rem] border border-white/5 bg-[#111]/50 overflow-hidden">
      {/* Header */}
      <div className="relative p-6 pb-4">
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#d6b47c]/5 rounded-full blur-3xl" />
        <div className="flex items-center gap-3 mb-1">
          <div className="w-10 h-10 rounded-xl bg-[#d6b47c]/10 border border-[#d6b47c]/20 flex items-center justify-center">
            <Users className="w-5 h-5 text-[#d6b47c]" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-[#f4f1eb]">{t('referralProgram.title')}</h3>
            <p className="text-[11px] text-[#9aa3b2]">{t('referralProgram.subtitle')}</p>
          </div>
        </div>
      </div>

      {/* How it Works */}
      <div className="px-6 pb-4">
        <div className="grid grid-cols-3 gap-3">
          {[
            { step: '1', icon: <Link2 className="w-4 h-4" />, label: t('referralProgram.step1') },
            { step: '2', icon: <Users className="w-4 h-4" />, label: t('referralProgram.step2') },
            { step: '3', icon: <Gift className="w-4 h-4" />, label: t('referralProgram.step3') },
          ].map((s) => (
            <div key={s.step} className="text-center p-3 rounded-xl bg-white/[0.02] border border-white/5">
              <div className="w-7 h-7 rounded-lg bg-[#d6b47c]/10 flex items-center justify-center text-[#d6b47c] mx-auto mb-2">
                {s.icon}
              </div>
              <p className="text-[10px] text-[#9aa3b2] leading-tight">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="px-6 pb-4">
        <div className="grid grid-cols-4 gap-2">
          {[
            { label: "Taklif qilingan", value: stats.totalInvited, icon: <Send className="w-3.5 h-3.5" /> },
            { label: "Muvaffaqiyatli", value: stats.successfulReferrals, icon: <CheckCircle className="w-3.5 h-3.5" /> },
            { label: "Olingan ball", value: stats.earnedPoints, icon: <TrendingUp className="w-3.5 h-3.5" /> },
            { label: "Kutilmoqda", value: stats.pendingPoints, icon: <Gift className="w-3.5 h-3.5" /> },
          ].map((stat) => (
            <div key={stat.label} className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5 text-center">
              <div className="text-[#d6b47c] flex items-center justify-center mb-1">{stat.icon}</div>
              <p className="text-lg font-bold text-[#f4f1eb]">{stat.value}</p>
              <p className="text-[9px] text-[#9aa3b2]">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Referral Link */}
      <div className="px-6 pb-4">
        <p className="text-xs text-[#9aa3b2] mb-2">{t('referralProgram.yourLink')}</p>
        <div className="flex items-center gap-2">
          <div className="flex-1 flex items-center gap-2 px-4 py-3 rounded-xl bg-[#0d1423] border border-white/5 overflow-hidden">
            <Link2 className="w-4 h-4 text-[#d6b47c] flex-shrink-0" />
            <span className="text-xs text-[#f4f1eb] truncate">{referralLink}</span>
          </div>
          <button
            onClick={handleCopyLink}
            className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium transition-all flex-shrink-0 ${
              copied
                ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
                : 'bg-[#d6b47c]/10 border border-[#d6b47c]/20 text-[#d6b47c] hover:bg-[#d6b47c]/20'
            }`}
          >
            {copied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            {copied ? t('common.copied') : t('referralProgram.share')}
          </button>
        </div>
      </div>

      {/* Share Buttons */}
      <div className="px-6 pb-4">
        <p className="text-xs text-[#9aa3b2] mb-2">{t('referralProgram.share')}</p>
        <div className="flex gap-2">
          <button
            onClick={() => handleShare('telegram')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all ${
              shareMethod === 'telegram'
                ? 'bg-[#2AABEE]/20 border border-[#2AABEE]/30 text-[#2AABEE]'
                : 'bg-[#2AABEE]/5 border border-[#2AABEE]/15 text-[#2AABEE]/80 hover:bg-[#2AABEE]/10'
            }`}
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.479.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
            </svg>
            Telegram
          </button>
          <button
            onClick={() => handleShare('whatsapp')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all ${
              shareMethod === 'whatsapp'
                ? 'bg-[#25D366]/20 border border-[#25D366]/30 text-[#25D366]'
                : 'bg-[#25D366]/5 border border-[#25D366]/15 text-[#25D366]/80 hover:bg-[#25D366]/10'
            }`}
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            WhatsApp
          </button>
          <button
            onClick={() => handleShare('instagram')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all ${
              shareMethod === 'instagram'
                ? 'bg-pink-500/20 border border-pink-500/30 text-pink-400'
                : 'bg-pink-500/5 border border-pink-500/15 text-pink-400/80 hover:bg-pink-500/10'
            }`}
          >
            <Share2 className="w-4 h-4" />
            {shareMethod === 'instagram' ? t('common.copied') : 'Instagram'}
          </button>
        </div>
      </div>

      {/* Bonus Info */}
      <div className="mx-6 mb-4 rounded-xl bg-gradient-to-r from-[#d6b47c]/10 to-transparent border border-[#d6b47c]/20 p-3">
        <div className="flex items-start gap-3">
          <Gift className="w-5 h-5 text-[#d6b47c] flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-semibold text-[#d6b47c]">{t('referralProgram.referrerPoints')}</p>
            <p className="text-xs text-[#d6b47c]/70">{t('referralProgram.newUserPoints')}</p>
            <p className="text-[10px] text-[#9aa3b2] mt-1">{t('referralProgram.firstPurchaseNote')}</p>
          </div>
        </div>
      </div>

      {/* Referral History */}
      <div className="px-6 pb-6">
        <p className="text-xs text-[#9aa3b2] mb-3 flex items-center gap-2">
          <Users className="w-3.5 h-3.5" /> {t('referralProgram.invitedUsers')}
        </p>
        <div className="space-y-2 max-h-[200px] overflow-y-auto pr-1">
          {referralHistory.map((ref, idx) => (
            <div key={idx} className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.02] border border-white/5">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#d6b47c]/10 flex items-center justify-center text-xs font-bold text-[#d6b47c]">
                  {ref.name.charAt(0)}
                </div>
                <div>
                  <p className="text-xs font-medium text-[#f4f1eb]">{ref.name}</p>
                  <p className="text-[10px] text-[#9aa3b2]">{formatDate(ref.date)}</p>
                </div>
              </div>
              <div className="text-right">
                {ref.status === 'completed' && (
                  <span className="text-xs font-semibold text-emerald-400">+{ref.points} ball</span>
                )}
                {ref.status === 'pending' && (
                  <span className="text-[10px] text-yellow-400/70 bg-yellow-400/5 px-2 py-0.5 rounded-full">{t('referralProgram.pending')}</span>
                )}
                {ref.status === 'expired' && (
                  <span className="text-[10px] text-[#3f4658]">{t('referralProgram.expired')}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ReferralProgram;
