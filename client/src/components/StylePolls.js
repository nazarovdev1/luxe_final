import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { ArrowRight, BarChart3, CheckCircle, Crown, ImageOff, Loader2, MessageCircle, Users } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

const getVisitorKey = () => {
  const storageKey = 'luxx_style_poll_voter';
  try {
    const existing = localStorage.getItem(storageKey);
    if (existing) return existing;

    const next = `visitor_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    localStorage.setItem(storageKey, next);
    return next;
  } catch {
    return `visitor_${Date.now()}`;
  }
};

const getStoredVotes = () => {
  try {
    return JSON.parse(localStorage.getItem('luxx_style_poll_votes') || '{}');
  } catch {
    return {};
  }
};

const storeVote = (pollId, optionId) => {
  try {
    const votes = getStoredVotes();
    votes[pollId] = optionId;
    localStorage.setItem('luxx_style_poll_votes', JSON.stringify(votes));
  } catch {
    // Local storage may be unavailable in private contexts.
  }
};

const BrokenImage = () => {
  const { t } = useLanguage();

  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-[#0d0f16] text-[#586071]">
      <ImageOff className="h-8 w-8" />
      <span className="text-[10px] uppercase tracking-[0.18em]">{t('stylePolls.noImage')}</span>
    </div>
  );
};

const PollImage = ({ src, alt }) => {
  const [failed, setFailed] = useState(false);

  if (!src || failed) return <BrokenImage />;

  return (
    <img
      src={src}
      alt={alt}
      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
      onError={() => setFailed(true)}
      loading="lazy"
    />
  );
};

const StylePolls = () => {
  const [polls, setPolls] = useState([]);
  const [votedPolls, setVotedPolls] = useState(getStoredVotes);
  const [showAll, setShowAll] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [votingId, setVotingId] = useState(null);
  const { t } = useLanguage();

  const fetchPolls = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get('/api/style-polls');
      if (response.data.success) {
        setPolls(response.data.data || []);
      }
    } catch (error) {
      toast.error(t('stylePolls.errorLoad'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPolls();
  }, []);

  const displayedPolls = useMemo(
    () => showAll ? polls : polls.slice(0, 2),
    [polls, showAll]
  );

  const handleVote = async (pollId, optionId) => {
    if (votedPolls[pollId] || votingId) return;

    setVotingId(`${pollId}:${optionId}`);
    try {
      const response = await axios.post(`/api/style-polls/${pollId}/vote`, {
        optionId,
        voterKey: getVisitorKey()
      });

      if (response.data.success) {
        setPolls((prev) => prev.map((poll) => poll._id === pollId ? response.data.data : poll));
        setVotedPolls((prev) => ({ ...prev, [pollId]: optionId }));
        storeVote(pollId, optionId);
      }
    } catch (error) {
      if (error.response?.status === 409) {
        setVotedPolls((prev) => ({ ...prev, [pollId]: optionId }));
        storeVote(pollId, optionId);
      }
      toast.error(error.response?.data?.message || t('stylePolls.voteError'));
    } finally {
      setVotingId(null);
    }
  };

  const getPercentage = (votes, total) => {
    if (!total) return 0;
    return Math.round((votes / total) * 100);
  };

  if (isLoading) {
    return (
      <section className="w-full">
        <div className="relative overflow-hidden rounded-[0_60px_0_0] border border-[#c1a88e]/20 bg-gradient-to-b from-[#18181b] via-[#111114] to-[#09090b] p-8 md:p-12 shadow-2xl">
          <div className="absolute inset-0 -translate-x-full animate-[shimmer_2.2s_infinite] bg-gradient-to-r from-transparent via-[#d6b47c]/10 to-transparent pointer-events-none" />
          <div className="flex flex-col gap-4 max-w-md">
            <div className="w-36 h-5 rounded-full bg-white/10 animate-pulse" />
            <div className="w-64 h-8 rounded-full bg-white/10 animate-pulse" />
            <div className="w-80 h-4 rounded-full bg-white/5 animate-pulse" />
          </div>
        </div>
      </section>
    );
  }

  if (polls.length === 0) {
    return (
      <section className="w-full">
        <div className="relative overflow-hidden rounded-[0_60px_0_0] border border-[#c1a88e]/25 bg-gradient-to-br from-[#1c1817] via-[#141010] to-[#0c0909] p-8 md:p-12 shadow-2xl">
          {/* Subtle gold ambient glow */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-[#d6b47c]/5 rounded-full blur-3xl pointer-events-none -translate-y-1/2 translate-x-1/3" />
          
          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
            <div className="max-w-xl">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-[#d6b47c]/30 bg-[#d6b47c]/10 text-[#d6b47c] text-[10px] font-bold uppercase tracking-[0.2em] mb-4">
                <Crown className="w-3.5 h-3.5" />
                <span>STYLE BATTLE & SO'ROVNOMALAR</span>
              </div>
              <h3 className="font-serif text-2xl md:text-3xl lg:text-4xl text-[#f7efe6] font-normal tracking-tight uppercase leading-tight mb-3">
                Yangi Uslub Duellari <em className="italic text-[#d6b47c] font-normal">Tez Kunda</em>
              </h3>
              <p className="text-sm md:text-base text-[#ad9b91] font-light leading-relaxed">
                Mavsumiy eng sara obrazlar, ranglar kombinatsiyasi va trendlar bo‘yicha eksklyuziv hamjamiyat so‘rovnomalari tayyorlanmoqda.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full md:w-auto">
              <div className="flex items-center gap-3 px-6 py-4 rounded-full bg-white/[0.03] border border-[#c1a88e]/30 backdrop-blur-md shadow-lg">
                <div className="w-2.5 h-2.5 rounded-full bg-[#d6b47c] animate-pulse" />
                <span className="text-xs uppercase tracking-widest text-[#f4f1eb] font-semibold">Tez orada ochiladi</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="w-full">
      <div className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#c1a88e]/20 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-[#d6b47c]/30 bg-[#d6b47c]/10 text-[#d6b47c] text-[10px] font-bold uppercase tracking-[0.2em] mb-3">
            <Crown className="w-3.5 h-3.5" />
            <span>HAMJAMIYAT OVOZI</span>
          </div>
          <h3 className="font-serif text-3xl md:text-4xl text-[#f7efe6] font-normal tracking-tight uppercase">
            Style <em className="italic text-[#d6b47c]">Duellari</em>
          </h3>
          <p className="mt-1 text-xs md:text-sm text-[#ad9b91] font-light">
            {t('stylePolls.subtitle') || 'Sevimli obrazingizga ovoz bering va trendlarni birgalikda tanlang.'}
          </p>
        </div>
      </div>

      <div className="space-y-8">
        {displayedPolls.map((poll) => {
          const hasVoted = Boolean(votedPolls[poll._id]);
          const votedOption = votedPolls[poll._id];
          const totalVotes = poll.totalVotes || poll.options.reduce((sum, option) => sum + (option.votes || 0), 0);

          return (
            <article
              key={poll._id}
              className="overflow-hidden rounded-[0_48px_0_0] border border-[#c1a88e]/25 bg-[#141111] shadow-[0_24px_80px_rgba(0,0,0,0.32)]"
            >
              <div className="border-b border-white/10 px-6 py-5">
                <div className="mb-3 flex flex-wrap items-center gap-2">
                  <span className="rounded-full border border-[#d6b47c]/30 bg-[#d6b47c]/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-[#d6b47c]">
                    {poll.category || 'Editorial Duel'}
                  </span>
                  {poll.timeLeft && (
                    <span className="text-[11px] text-[#ad9b91]">{poll.timeLeft} {t('stylePolls.remaining')}</span>
                  )}
                </div>
                <h4 className="font-serif text-xl sm:text-2xl font-normal leading-tight text-[#f7efe6]">{poll.question}</h4>
              </div>

              <div className="grid grid-cols-1 gap-px bg-white/10 md:grid-cols-2">
                {poll.options.map((option) => {
                  const percentage = getPercentage(option.votes || 0, totalVotes);
                  const isSelected = votedOption === option._id;
                  const isWinning = hasVoted && percentage === Math.max(
                    ...poll.options.map((item) => getPercentage(item.votes || 0, totalVotes))
                  );
                  const isVoting = votingId === `${poll._id}:${option._id}`;

                  return (
                    <button
                      key={option._id}
                      type="button"
                      onClick={() => handleVote(poll._id, option._id)}
                      disabled={hasVoted || Boolean(votingId)}
                      className={`group relative min-h-[360px] overflow-hidden bg-[#0f0c0c] text-left transition-all md:min-h-[430px] ${
                        hasVoted ? 'cursor-default' : 'cursor-pointer hover:bg-[#181313]'
                      }`}
                    >
                      <div className="absolute inset-0">
                        <PollImage src={option.image} alt={option.label} />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/35 to-transparent" />
                        {hasVoted && (
                          <div
                            className={`absolute inset-x-0 bottom-0 h-1.5 ${isWinning ? 'bg-[#d6b47c]' : 'bg-white/45'} transition-all duration-700`}
                            style={{ width: `${percentage}%` }}
                          />
                        )}
                      </div>

                      {isSelected && (
                        <div className="absolute right-5 top-5 flex h-9 w-9 items-center justify-center rounded-full bg-[#d6b47c] text-black shadow-lg z-10">
                          <CheckCircle className="h-5 w-5" />
                        </div>
                      )}

                      <div className="relative z-10 flex h-full min-h-[360px] flex-col justify-end p-6 md:min-h-[430px]">
                        <div className="flex items-end justify-between gap-4">
                          <div className="min-w-0">
                            <p className="font-serif text-lg sm:text-xl font-normal text-white">{option.label}</p>
                            <p className="mt-1 text-xs text-white/60">
                              {hasVoted ? `${option.votes || 0} ${t('stylePolls.vote')}` : t('stylePolls.clickToVote')}
                            </p>
                          </div>

                          <div className="text-right flex-shrink-0">
                            {isVoting ? (
                              <Loader2 className="h-5 w-5 animate-spin text-[#d6b47c]" />
                            ) : hasVoted ? (
                              <span className={`text-2xl sm:text-3xl font-serif ${isWinning ? 'text-[#d6b47c]' : 'text-white/70'}`}>
                                {percentage}%
                              </span>
                            ) : (
                              <span className="rounded-full border border-white/30 bg-black/40 px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest text-white group-hover:bg-[#d6b47c] group-hover:text-black group-hover:border-[#d6b47c] transition-all">
                                {t('stylePolls.select')}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 bg-[#0e0b0b]">
                <div className="flex items-center gap-5 text-[#ad9b91]">
                  <span className="flex items-center gap-1.5 text-xs">
                    <Users className="h-3.5 w-3.5 text-[#d6b47c]" />
                    {totalVotes} {t('stylePolls.vote')}
                  </span>
                  <span className="flex items-center gap-1.5 text-xs">
                    <MessageCircle className="h-3.5 w-3.5 text-[#d6b47c]" />
                    {t('stylePolls.liveUpdates')}
                  </span>
                </div>

                {hasVoted && (
                  <span className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold">
                    <CheckCircle className="h-3.5 w-3.5" />
                    {t('stylePolls.voted')}
                  </span>
                )}
              </div>
            </article>
          );
        })}
      </div>

      {!showAll && polls.length > 2 && (
        <button
          type="button"
          onClick={() => setShowAll(true)}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-full border border-[#c1a88e]/30 bg-white/[0.02] py-4 text-xs font-bold uppercase tracking-[0.2em] text-[#d6b47c] transition-all hover:bg-[#d6b47c] hover:text-black"
        >
          {t('stylePolls.viewAll')} <ArrowRight className="h-4 w-4" />
        </button>
      )}
    </section>
  );
};

export default StylePolls;
