import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { ArrowRight, BarChart3, CheckCircle, ImageOff, Loader2, MessageCircle, Users } from 'lucide-react';
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

const BrokenImage = () => (
  <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-[#0d0f16] text-[#586071]">
    <ImageOff className="h-8 w-8" />
    <span className="text-[10px] uppercase tracking-[0.18em]">Rasm yo'q</span>
  </div>
);

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
      toast.error("So'rovnomalarni yuklashda xato");
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
      toast.error(error.response?.data?.message || 'Ovoz berishda xato');
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
      <section className="mx-auto w-full max-w-7xl px-6">
        <div className="rounded-[28px] border border-white/10 bg-[#0c0e14]/80 p-8">
          <div className="flex items-center justify-center gap-3 text-[#d6b47c]">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span className="text-sm">So'rovnomalar yuklanmoqda...</span>
          </div>
        </div>
      </section>
    );
  }

  if (polls.length === 0) {
    return (
      <section className="mx-auto w-full max-w-7xl px-6">
        <div className="rounded-[28px] border border-dashed border-white/10 bg-[#0c0e14]/70 p-8 text-center">
          <BarChart3 className="mx-auto mb-4 h-10 w-10 text-[#d6b47c]/50" />
          <h3 className="text-lg font-semibold text-[#f4f1eb]">{t('stylePolls.title')}</h3>
          <p className="mt-2 text-sm text-[#7f8797]">
            Hozircha so'rovnomalar yo'q.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto w-full max-w-7xl px-6">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-[#d6b47c]/25 bg-[#d6b47c]/10">
            <BarChart3 className="h-5 w-5 text-[#d6b47c]" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-[#f4f1eb]">{t('stylePolls.title')}</h3>
            <p className="text-xs text-[#9aa3b2]">{t('stylePolls.subtitle')}</p>
          </div>
        </div>
      </div>

      <div className="space-y-5">
        {displayedPolls.map((poll) => {
          const hasVoted = Boolean(votedPolls[poll._id]);
          const votedOption = votedPolls[poll._id];
          const totalVotes = poll.totalVotes || poll.options.reduce((sum, option) => sum + (option.votes || 0), 0);

          return (
            <article
              key={poll._id}
              className="overflow-hidden rounded-[28px] border border-white/10 bg-[#0b0d13] shadow-[0_24px_80px_rgba(0,0,0,0.32)]"
            >
              <div className="border-b border-white/10 px-5 py-4 sm:px-6">
                <div className="mb-3 flex flex-wrap items-center gap-2">
                  <span className="rounded-full border border-[#d6b47c]/25 bg-[#d6b47c]/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#d6b47c]">
                    {poll.category || 'Community'}
                  </span>
                  {poll.timeLeft && (
                    <span className="text-[11px] text-[#9aa3b2]">{poll.timeLeft} qoldi</span>
                  )}
                </div>
                <h4 className="text-lg font-semibold leading-tight text-[#f4f1eb]">{poll.question}</h4>
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
                      className={`group relative min-h-[360px] overflow-hidden bg-[#0f1118] text-left transition-all md:min-h-[430px] ${
                        hasVoted ? 'cursor-default' : 'cursor-pointer hover:bg-[#141824]'
                      }`}
                    >
                      <div className="absolute inset-0">
                        <PollImage src={option.image} alt={option.label} />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/24 to-black/5" />
                        {hasVoted && (
                          <div
                            className={`absolute inset-x-0 bottom-0 h-1.5 ${isWinning ? 'bg-[#d6b47c]' : 'bg-white/45'} transition-all duration-700`}
                            style={{ width: `${percentage}%` }}
                          />
                        )}
                      </div>

                      {isSelected && (
                        <div className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-[#d6b47c] text-black shadow-lg">
                          <CheckCircle className="h-5 w-5" />
                        </div>
                      )}

                      <div className="relative z-10 flex h-full min-h-[360px] flex-col justify-end p-5 md:min-h-[430px] sm:p-6">
                        <div className="flex items-end justify-between gap-4">
                          <div className="min-w-0">
                            <p className="text-base font-bold text-white sm:text-lg">{option.label}</p>
                            <p className="mt-1 text-xs text-white/55">
                              {hasVoted ? `${option.votes || 0} ovoz` : t('stylePolls.clickToVote')}
                            </p>
                          </div>

                          <div className="text-right">
                            {isVoting ? (
                              <Loader2 className="h-5 w-5 animate-spin text-[#d6b47c]" />
                            ) : hasVoted ? (
                              <span className={`text-2xl font-black ${isWinning ? 'text-[#d6b47c]' : 'text-white/70'}`}>
                                {percentage}%
                              </span>
                            ) : (
                              <span className="rounded-full border border-white/20 bg-black/35 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white/80">
                                Tanlash
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 sm:px-6">
                <div className="flex items-center gap-5 text-[#9aa3b2]">
                  <span className="flex items-center gap-1.5 text-xs">
                    <Users className="h-3.5 w-3.5" />
                    {totalVotes} ovoz
                  </span>
                  <span className="flex items-center gap-1.5 text-xs">
                    <MessageCircle className="h-3.5 w-3.5" />
                    Natijalar real vaqtga yaqin yangilanadi
                  </span>
                </div>

                {hasVoted && (
                  <span className="flex items-center gap-1.5 text-xs text-emerald-400">
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
          className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.03] py-3 text-sm text-[#9aa3b2] transition-all hover:border-[#d6b47c]/25 hover:bg-[#d6b47c]/5 hover:text-[#f4f1eb]"
        >
          Barcha so'rovnomalar <ArrowRight className="h-4 w-4" />
        </button>
      )}
    </section>
  );
};

export default StylePolls;
