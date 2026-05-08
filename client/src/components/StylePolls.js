import React, { useState } from 'react';
import { BarChart3, CheckCircle, Users, MessageCircle, ArrowRight } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

const DEMO_POLLS = [
  {
    id: 1,
    question: "Qaysi ko'rinishni tanlaysiz?",
    options: [
      { id: 'a', label: 'Klassik elegantiya', image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=300&h=400&fit=crop', votes: 156 },
      { id: 'b', label: 'Zamonaviy sport-chic', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=300&h=400&fit=crop', votes: 132 },
    ],
    totalVotes: 288,
    comments: 24,
    timeLeft: '2 soat',
    category: 'Kundalik',
  },
  {
    id: 2,
    question: "Bahor uchun eng yaxshi rang?",
    options: [
      { id: 'a', label: 'Yashil tonlar', image: 'https://images.unsplash.com/photo-1487222477894-8943e31ef7b2?w=300&h=400&fit=crop', votes: 89 },
      { id: 'b', label: 'Pushti tonlar', image: 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=300&h=400&fit=crop', votes: 112 },
    ],
    totalVotes: 201,
    comments: 18,
    timeLeft: '5 soat',
    category: 'Ranglar',
  },
  {
    id: 3,
    question: "Maxsus kechaga nima kiyish kerak?",
    options: [
      { id: 'a', label: 'Uzun ko\'ylak', image: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=300&h=400&fit=crop', votes: 201 },
      { id: 'b', label: 'Kostyum-shim', image: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=300&h=400&fit=crop', votes: 178 },
    ],
    totalVotes: 379,
    comments: 42,
    timeLeft: '1 kun',
    category: 'Kechki',
  },
];

const StylePolls = () => {
  const [votedPolls, setVotedPolls] = useState({});
  const [showAll, setShowAll] = useState(false);
  const { t } = useLanguage();

  const handleVote = (pollId, optionId) => {
    if (votedPolls[pollId]) return;
    setVotedPolls((prev) => ({ ...prev, [pollId]: optionId }));
    // In production: await axios.post('/api/polls/vote', { pollId, optionId });
  };

  const getPercentage = (votes, total) => {
    if (total === 0) return 0;
    return Math.round((votes / total) * 100);
  };

  const displayedPolls = showAll ? DEMO_POLLS : DEMO_POLLS.slice(0, 2);

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#d6b47c]/10 border border-[#d6b47c]/20 flex items-center justify-center">
            <BarChart3 className="w-5 h-5 text-[#d6b47c]" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-[#f4f1eb]">{t('stylePolls.title')}</h3>
            <p className="text-[11px] text-[#9aa3b2]">{t('stylePolls.subtitle')}</p>
          </div>
        </div>
      </div>

      {/* Polls */}
      <div className="space-y-6">
        {displayedPolls.map((poll) => {
          const hasVoted = !!votedPolls[poll.id];
          const votedOption = votedPolls[poll.id];

          return (
            <div
              key={poll.id}
              className="rounded-[2rem] border border-white/5 bg-[#11131e]/50 overflow-hidden"
            >
              {/* Poll Header */}
              <div className="p-5 pb-3">
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-[#d6b47c]/10 border border-[#d6b47c]/15 text-[#d6b47c] text-[10px] font-medium">
                    {poll.category}
                  </span>
                  <span className="text-[10px] text-[#9aa3b2]">⏱ {poll.timeLeft} qoldi</span>
                </div>
                <h4 className="text-base font-semibold text-[#f4f1eb]">{poll.question}</h4>
              </div>

              {/* Options */}
              <div className="px-5 pb-4">
                <div className="grid grid-cols-2 gap-3">
                  {poll.options.map((option) => {
                    const percentage = getPercentage(
                      option.votes + (votedOption === option.id ? 1 : 0),
                      poll.totalVotes + (hasVoted ? 1 : 0)
                    );
                    const isSelected = votedOption === option.id;
                    const isWinning = hasVoted && percentage === Math.max(
                      ...poll.options.map((o) =>
                        getPercentage(
                          o.votes + (votedOption === o.id ? 1 : 0),
                          poll.totalVotes + (hasVoted ? 1 : 0)
                        )
                      )
                    );

                    return (
                      <button
                        key={option.id}
                        onClick={() => handleVote(poll.id, option.id)}
                        disabled={hasVoted}
                        className={`relative overflow-hidden rounded-2xl border transition-all ${
                          isSelected
                            ? 'border-[#d6b47c]/40 ring-1 ring-[#d6b47c]/20'
                            : hasVoted
                            ? 'border-white/5'
                            : 'border-white/5 hover:border-white/15 cursor-pointer'
                        }`}
                      >
                        {/* Image */}
                        <div className="aspect-[3/4] relative">
                          <img
                            src={option.image}
                            alt={option.label}
                            className="w-full h-full object-cover"
                          />
                          {/* Overlay */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                          {/* Selected indicator */}
                          {isSelected && (
                            <div className="absolute top-3 right-3 w-7 h-7 rounded-full bg-[#d6b47c] flex items-center justify-center">
                              <CheckCircle className="w-4 h-4 text-black" />
                            </div>
                          )}

                          {/* Progress bar (after voting) */}
                          {hasVoted && (
                            <div className="absolute bottom-0 left-0 right-0">
                              <div className="h-1 bg-white/10">
                                <div
                                  className={`h-full transition-all duration-1000 ${isWinning ? 'bg-[#d6b47c]' : 'bg-white/30'}`}
                                  style={{ width: `${percentage}%` }}
                                />
                              </div>
                            </div>
                          )}

                          {/* Label */}
                          <div className="absolute bottom-0 left-0 right-0 p-3">
                            <p className="text-sm font-semibold text-white mb-1">{option.label}</p>
                            {hasVoted && (
                              <div className="flex items-center justify-between">
                                <span className={`text-xs font-bold ${isWinning ? 'text-[#d6b47c]' : 'text-white/60'}`}>
                                  {percentage}%
                                </span>
                                <span className="text-[10px] text-white/40">
                                  {option.votes + (isSelected ? 1 : 0)} ovoz
                                </span>
                              </div>
                            )}
                            {!hasVoted && (
                              <span className="text-[10px] text-white/50">{t('stylePolls.clickToVote')}</span>
                            )}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Poll Footer */}
              <div className="px-5 py-3 border-t border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1.5 text-[#9aa3b2]">
                    <Users className="w-3.5 h-3.5" />
                    <span className="text-xs">{poll.totalVotes + (hasVoted ? 1 : 0)} ovoz</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[#9aa3b2]">
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span className="text-xs">{poll.comments} izoh</span>
                  </div>
                </div>
                {hasVoted && (
                  <span className="text-[10px] text-emerald-400 flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" /> {t('stylePolls.voted')}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Show More */}
      {!showAll && DEMO_POLLS.length > 2 && (
        <button
          onClick={() => setShowAll(true)}
          className="w-full mt-4 py-3 rounded-xl bg-white/[0.02] border border-white/5 text-sm text-[#9aa3b2] hover:bg-white/[0.04] hover:border-white/10 transition-all flex items-center justify-center gap-2"
        >
          Barcha so'rovnomalar <ArrowRight className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};

export default StylePolls;
