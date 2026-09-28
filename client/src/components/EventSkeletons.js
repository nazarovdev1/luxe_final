import React from 'react';
import { Radio, Trophy, Crown, Award, Play, Gift, ShieldCheck, Heart, MessageCircle, Share2, Bookmark } from 'lucide-react';

/**
 * Common luxury shimmer overlay
 */
const ShimmerWave = ({ tint = 'gold' }) => {
  const gradient = tint === 'crimson'
    ? 'via-red-500/15'
    : tint === 'emerald'
    ? 'via-emerald-400/15'
    : 'via-[#d6b47c]/15';

  return (
    <div
      className={`absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent ${gradient} to-transparent pointer-events-none`}
    />
  );
};

/* ==========================================================================
   1. LIVE STREAMS SKELETON (Desktop)
   ========================================================================== */
export const LiveStreamsSkeleton = () => {
  return (
    <div className="space-y-16 animate-fade-in" aria-busy="true" aria-label="Efir kanallari yuklanmoqda">
      {/* Studio Frequency & Live Radar Status */}
      <div className="relative overflow-hidden rounded-2xl bg-[#12131a] border border-white/10 p-5 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20">
            <Radio className="w-5 h-5 text-red-500 animate-pulse" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
          </div>
          <div>
            <div className="h-4 w-44 bg-white/10 rounded-md mb-2" />
            <div className="h-3 w-64 bg-white/5 rounded-md" />
          </div>
        </div>

        {/* EQ frequency bars placeholder */}
        <div className="flex items-end gap-1.5 h-6">
          {[40, 75, 55, 90, 60, 85, 45, 95, 70, 50].map((h, i) => (
            <div
              key={i}
              className="w-1 bg-red-500/40 rounded-full animate-pulse"
              style={{ height: `${h}%`, animationDelay: `${i * 100}ms` }}
            />
          ))}
        </div>
        <ShimmerWave tint="crimson" />
      </div>

      {/* Live Now Grid */}
      <section>
        <div className="flex items-center gap-4 mb-8">
          <div className="h-3 w-28 bg-red-500/30 rounded-full" />
          <div className="flex-1 h-px bg-gradient-to-r from-red-600/20 to-transparent" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="relative overflow-hidden rounded-[32px] bg-[#12131a] border border-white/10 shadow-2xl flex flex-col"
            >
              {/* 16:9 Thumbnail Frame */}
              <div className="relative aspect-video bg-[#181924] flex items-center justify-center">
                {/* Badge top-left */}
                <div className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-red-500/30">
                  <div className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                  <div className="w-12 h-2.5 bg-red-400/40 rounded" />
                </div>

                {/* Viewer count top-right */}
                <div className="absolute top-4 right-4 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/10">
                  <div className="w-14 h-2.5 bg-white/30 rounded" />
                </div>

                {/* Center play icon watermark */}
                <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                  <Play className="w-6 h-6 text-white/20 translate-x-0.5" />
                </div>
              </div>

              {/* Card Meta Body */}
              <div className="p-7 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white/10" />
                  <div className="space-y-1.5 flex-1">
                    <div className="h-4 w-3/4 bg-white/15 rounded" />
                    <div className="h-3 w-1/3 bg-white/5 rounded" />
                  </div>
                </div>

                <div className="h-3.5 w-5/6 bg-white/10 rounded" />

                {/* Product chips */}
                <div className="flex gap-2 pt-2">
                  <div className="h-7 w-24 bg-white/5 rounded-xl border border-white/5" />
                  <div className="h-7 w-28 bg-white/5 rounded-xl border border-white/5" />
                </div>
              </div>

              <ShimmerWave tint="crimson" />
            </div>
          ))}
        </div>
      </section>

      {/* Upcoming Grid */}
      <section>
        <div className="flex items-center gap-4 mb-8">
          <div className="h-3 w-32 bg-white/20 rounded-full" />
          <div className="flex-1 h-px bg-white/5" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="relative overflow-hidden rounded-[24px] bg-[#12131a] border border-white/10 p-4 space-y-4"
            >
              <div className="aspect-video bg-[#181924] rounded-2xl relative">
                <div className="absolute bottom-3 left-3 px-2.5 py-1 rounded-lg bg-black/70 border border-white/10">
                  <div className="w-16 h-2 bg-[#d6b47c]/40 rounded" />
                </div>
              </div>
              <div className="space-y-2">
                <div className="h-4 w-4/5 bg-white/15 rounded" />
                <div className="h-3 w-1/2 bg-white/5 rounded" />
              </div>
              <ShimmerWave tint="gold" />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

/* ==========================================================================
   2. CHALLENGES SKELETON (Desktop)
   ========================================================================== */
export const ChallengesSkeleton = () => {
  return (
    <div className="space-y-16 animate-fade-in" aria-busy="true" aria-label="Tanlovlar yuklanmoqda">
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_1.5fr] gap-8 items-start">
        {/* Sticky Editorial Card Placeholder */}
        <div className="relative overflow-hidden rounded-[40px] bg-[#0f1016] border border-[#d6b47c]/20 p-8 md:p-10 shadow-2xl">
          {/* Card Top */}
          <div className="flex items-center justify-between mb-8 pb-6 border-b border-white/5">
            <div className="h-6 w-24 bg-[#d6b47c]/20 rounded-full" />
            <div className="h-4 w-16 bg-white/10 rounded" />
          </div>

          {/* Trophy & Prize Pool Banner */}
          <div className="flex items-center gap-4 p-5 rounded-2xl bg-gradient-to-r from-[#d6b47c]/10 to-transparent border border-[#d6b47c]/20 mb-8">
            <div className="w-12 h-12 rounded-xl bg-[#d6b47c]/20 flex items-center justify-center">
              <Trophy className="w-6 h-6 text-[#d6b47c]/60" />
            </div>
            <div className="space-y-2 flex-1">
              <div className="h-3 w-20 bg-[#d6b47c]/30 rounded" />
              <div className="h-5 w-40 bg-[#d6b47c]/50 rounded" />
            </div>
          </div>

          {/* Title & Description Lines */}
          <div className="space-y-4 mb-10">
            <div className="h-8 w-4/5 bg-white/15 rounded-lg" />
            <div className="h-4 w-full bg-white/10 rounded" />
            <div className="h-4 w-3/4 bg-white/5 rounded" />
          </div>

          {/* Countdown Clock Tiles (Days, Hours, Mins, Secs) */}
          <div className="grid grid-cols-4 gap-3 p-5 rounded-3xl bg-white/[0.02] border border-white/5 mb-8">
            {[1, 2, 3, 4].map((slot) => (
              <div key={slot} className="text-center space-y-1.5">
                <div className="h-7 w-10 mx-auto bg-[#d6b47c]/20 rounded-lg" />
                <div className="h-2.5 w-8 mx-auto bg-white/10 rounded" />
              </div>
            ))}
          </div>

          {/* Action button */}
          <div className="h-14 w-full rounded-full bg-[#d6b47c]/20" />

          <ShimmerWave tint="gold" />
        </div>

        {/* Submissions Runway Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((card) => (
            <div
              key={card}
              className="relative overflow-hidden rounded-[32px] bg-[#12131a] border border-white/10 aspect-[3/4] flex flex-col justify-between p-6 shadow-xl"
            >
              {/* Card top tags */}
              <div className="flex items-center justify-between">
                <div className="h-6 w-16 bg-white/10 rounded-full" />
                <div className="h-6 w-12 bg-[#d6b47c]/20 rounded-full" />
              </div>

              {/* Bottom user meta */}
              <div className="space-y-3 pt-6 border-t border-white/5 bg-gradient-to-t from-black/80 to-transparent -mx-6 -mb-6 p-6">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-white/20" />
                  <div className="space-y-1 flex-1">
                    <div className="h-3 w-28 bg-white/20 rounded" />
                    <div className="h-2.5 w-16 bg-white/10 rounded" />
                  </div>
                </div>
                <div className="h-10 w-full rounded-2xl bg-white/10" />
              </div>

              <ShimmerWave tint="gold" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

/* ==========================================================================
   3. ECO IMPACT SKELETON (Desktop)
   ========================================================================== */
export const EcoImpactSkeleton = () => {
  return (
    <div className="space-y-16 animate-fade-in" aria-busy="true" aria-label="Eko-ta'sir tahlil qilinmoqda">
      {/* Central Eco Rank Medallion */}
      <div className="flex flex-col items-center">
        <div className="relative overflow-hidden flex items-center gap-8 bg-[#101915] border border-emerald-500/20 px-12 py-8 rounded-[40px] shadow-2xl">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 flex items-center justify-center">
            <Award className="w-8 h-8 text-emerald-400" />
          </div>
          <div className="space-y-2">
            <div className="h-3 w-24 bg-white/10 rounded" />
            <div className="h-10 w-36 bg-emerald-400/30 rounded-lg" />
          </div>
          <ShimmerWave tint="emerald" />
        </div>
        <div className="h-3 w-40 bg-white/10 rounded-full mt-6" />
      </div>

      {/* 3-Column Bento Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          { color: 'border-blue-500/20' },
          { color: 'border-teal-500/20' },
          { color: 'border-emerald-500/20' }
        ].map((card, idx) => (
          <div
            key={idx}
            className={`relative overflow-hidden rounded-[36px] bg-[#0e1614] border ${card.color} p-8 space-y-6 shadow-xl`}
          >
            <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center">
              <div className="w-7 h-7 rounded-lg bg-emerald-400/30" />
            </div>
            <div className="space-y-2">
              <div className="h-8 w-24 bg-white/20 rounded-lg" />
              <div className="h-4 w-32 bg-white/10 rounded" />
            </div>
            <div className="h-3 w-full bg-white/5 rounded" />
            <ShimmerWave tint="emerald" />
          </div>
        ))}
      </div>

      {/* Tree Planting Progress Bar Card */}
      <div className="relative overflow-hidden rounded-[36px] bg-[#0e1614] border border-emerald-500/20 p-10 space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-5 w-48 bg-white/20 rounded-lg" />
            <div className="h-3 w-64 bg-white/10 rounded" />
          </div>
          <div className="h-8 w-24 bg-emerald-500/20 rounded-full" />
        </div>
        <div className="h-4 w-full bg-white/5 rounded-full overflow-hidden">
          <div className="h-full w-2/5 bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full animate-pulse" />
        </div>
        <ShimmerWave tint="emerald" />
      </div>
    </div>
  );
};

/* ==========================================================================
   4. VIP CLUB SKELETON (Desktop)
   ========================================================================== */
export const VIPClubSkeleton = () => {
  return (
    <div className="space-y-16 animate-fade-in" aria-busy="true" aria-label="VIP Club ma'lumotlari yuklanmoqda">
      {/* Sculpted Membership Card Placeholder */}
      <div className="relative group max-w-4xl mx-auto">
        <div className="relative overflow-hidden rounded-[40px] bg-[#12131d] border border-[#d6b47c]/30 p-10 md:p-14 shadow-2xl">
          {/* Card Top */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-10 mb-14">
            <div className="flex items-center gap-8">
              <div className="w-24 h-24 rounded-[32px] bg-white/5 border border-white/10 flex items-center justify-center">
                <Crown className="w-10 h-10 text-[#d6b47c]/50" />
              </div>
              <div className="space-y-2">
                <div className="h-3 w-28 bg-[#d6b47c]/30 rounded" />
                <div className="h-10 w-48 bg-white/20 rounded-lg" />
                <div className="h-3 w-32 bg-white/10 rounded" />
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-white/5 border border-white/10 space-y-2">
              <div className="h-3 w-24 bg-white/10 rounded" />
              <div className="h-8 w-32 bg-[#d6b47c]/40 rounded-lg" />
            </div>
          </div>

          {/* Progress Bar Track */}
          <div className="space-y-3 mb-12">
            <div className="h-3 w-full bg-white/5 rounded-full overflow-hidden">
              <div className="h-full w-3/5 bg-gradient-to-r from-[#d6b47c]/50 to-[#d6b47c] rounded-full animate-pulse" />
            </div>
            <div className="flex justify-between">
              <div className="h-2.5 w-20 bg-white/10 rounded" />
              <div className="h-2.5 w-28 bg-white/10 rounded" />
            </div>
          </div>

          {/* Perks Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 pt-10 border-t border-white/5">
            {[1, 2, 3, 4, 5, 6].map((perk) => (
              <div key={perk} className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5 text-[#d6b47c]/40" />
                </div>
                <div className="h-3.5 w-28 bg-white/15 rounded" />
              </div>
            ))}
          </div>

          <ShimmerWave tint="gold" />
        </div>
      </div>
    </div>
  );
};

/* ==========================================================================
   5. LIVE STREAM VIEW SKELETON
   ========================================================================== */
export const LiveStreamViewSkeleton = () => {
  return (
    <div className="min-h-screen bg-[#0a0b10] text-white flex flex-col pt-16" aria-busy="true">
      {/* Top Header Placeholder */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-[#0a0b10]/95 backdrop-blur-xl border-b border-white/10 px-6 py-4 flex items-center gap-4">
        <div className="w-8 h-8 rounded-full bg-white/10" />
        <div className="space-y-1 flex-1">
          <div className="h-4 w-52 bg-white/20 rounded" />
          <div className="h-2.5 w-28 bg-white/10 rounded" />
        </div>
      </div>

      <div className="flex-1 max-w-7xl mx-auto w-full p-4 lg:p-8 grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8">
        {/* Main Cinema Player Frame */}
        <div className="space-y-6">
          <div className="relative overflow-hidden aspect-video rounded-[32px] bg-[#12131d] border border-white/10 flex items-center justify-center shadow-2xl">
            <div className="w-20 h-20 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center">
              <Radio className="w-8 h-8 text-red-500 animate-pulse" />
            </div>
            <ShimmerWave tint="crimson" />
          </div>

          {/* Shoppable Products Horizontal Carousel */}
          <div className="space-y-3">
            <div className="h-3 w-36 bg-white/20 rounded" />
            <div className="grid grid-cols-3 gap-4">
              {[1, 2, 3].map((p) => (
                <div key={p} className="relative overflow-hidden rounded-2xl bg-[#12131d] border border-white/10 p-3 flex gap-3">
                  <div className="w-14 h-14 bg-white/5 rounded-xl shrink-0" />
                  <div className="space-y-1.5 flex-1">
                    <div className="h-3 w-full bg-white/15 rounded" />
                    <div className="h-3 w-16 bg-[#d6b47c]/30 rounded" />
                  </div>
                  <ShimmerWave tint="gold" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Live Chat Stream Placeholder */}
        <div className="relative overflow-hidden rounded-[32px] bg-[#12131d] border border-white/10 p-6 flex flex-col justify-between h-[600px] shadow-2xl">
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-4 border-b border-white/5">
              <div className="w-2 h-2 rounded-full bg-red-500" />
              <div className="h-3 w-24 bg-white/20 rounded" />
            </div>

            {/* Chat message bubbles */}
            {[1, 2, 3, 4, 5].map((msg) => (
              <div key={msg} className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-full bg-white/10 shrink-0" />
                <div className="space-y-1.5 flex-1">
                  <div className="h-2.5 w-20 bg-[#d6b47c]/30 rounded" />
                  <div className="h-3 w-4/5 bg-white/10 rounded" />
                </div>
              </div>
            ))}
          </div>

          {/* Chat input box */}
          <div className="h-12 w-full rounded-2xl bg-white/5 border border-white/10" />
          <ShimmerWave tint="crimson" />
        </div>
      </div>
    </div>
  );
};

/* ==========================================================================
   6. REELS SKELETON (Desktop & Mobile)
   ========================================================================== */
export const ReelsSkeleton = () => {
  return (
    <div className="min-h-screen bg-[#07080d] flex items-center justify-center p-4">
      {/* 9:16 Vertical Video Frame */}
      <div className="relative overflow-hidden w-full max-w-[420px] aspect-[9/16] rounded-[36px] bg-[#10111a] border border-white/10 flex flex-col justify-between p-6 shadow-2xl">
        {/* Top Header */}
        <div className="flex items-center justify-between z-10">
          <div className="h-7 w-20 bg-white/10 rounded-full" />
          <div className="h-7 w-12 bg-white/10 rounded-full" />
        </div>

        {/* Floating Action Bar Right */}
        <div className="absolute right-5 bottom-24 flex flex-col items-center gap-5 z-10">
          <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md border border-white/10 flex items-center justify-center">
            <Heart className="w-5 h-5 text-white/30" />
          </div>
          <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md border border-white/10 flex items-center justify-center">
            <MessageCircle className="w-5 h-5 text-white/30" />
          </div>
          <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md border border-white/10 flex items-center justify-center">
            <Bookmark className="w-5 h-5 text-white/30" />
          </div>
          <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md border border-white/10 flex items-center justify-center">
            <Share2 className="w-5 h-5 text-white/30" />
          </div>
        </div>

        {/* Bottom Author & Audio Info */}
        <div className="space-y-3 pr-16 z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/20 border border-white/20" />
            <div className="space-y-1">
              <div className="h-3 w-28 bg-white/30 rounded" />
              <div className="h-2 w-16 bg-white/15 rounded" />
            </div>
          </div>
          <div className="h-3.5 w-5/6 bg-white/20 rounded" />
          <div className="h-3 w-2/3 bg-white/10 rounded" />
        </div>

        <ShimmerWave tint="gold" />
      </div>
    </div>
  );
};

/* ==========================================================================
   7. MOBILE LIVE SKELETON
   ========================================================================== */
export const MobileLiveSkeleton = () => {
  return (
    <div className="space-y-4 animate-fade-in" aria-busy="true">
      {[1, 2, 3].map((card) => (
        <div
          key={card}
          className="relative overflow-hidden rounded-[24px] bg-[#12131d] border border-white/10 p-3 space-y-3"
        >
          <div className="relative aspect-video rounded-2xl bg-[#181926] flex items-center justify-center">
            <div className="absolute top-3 left-3 px-2 py-0.5 rounded-full bg-red-500/20 border border-red-500/30">
              <div className="w-10 h-2 bg-red-400 rounded" />
            </div>
            <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center">
              <Play className="w-5 h-5 text-white/20 translate-x-0.5" />
            </div>
          </div>
          <div className="px-1 space-y-2">
            <div className="h-4 w-4/5 bg-white/20 rounded" />
            <div className="h-3 w-1/2 bg-white/10 rounded" />
          </div>
          <ShimmerWave tint="crimson" />
        </div>
      ))}
    </div>
  );
};

/* ==========================================================================
   8. MOBILE CHALLENGES SKELETON
   ========================================================================== */
export const MobileChallengesSkeleton = () => {
  return (
    <div className="min-h-screen bg-[#07090f] p-5 space-y-6 animate-fade-in" aria-busy="true">
      <div className="h-8 w-44 bg-white/20 rounded-xl" />
      <div className="relative overflow-hidden rounded-[28px] bg-[#12131d] border border-[#d6b47c]/20 p-5 space-y-5">
        <div className="flex items-center justify-between">
          <div className="h-5 w-24 bg-[#d6b47c]/20 rounded-full" />
          <div className="h-4 w-14 bg-white/10 rounded" />
        </div>
        <div className="space-y-2">
          <div className="h-6 w-3/4 bg-white/20 rounded-lg" />
          <div className="h-3 w-full bg-white/10 rounded" />
        </div>
        <div className="grid grid-cols-4 gap-2 p-3 rounded-2xl bg-white/5">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="text-center space-y-1">
              <div className="h-5 w-7 mx-auto bg-[#d6b47c]/30 rounded" />
              <div className="h-2 w-6 mx-auto bg-white/10 rounded" />
            </div>
          ))}
        </div>
        <ShimmerWave tint="gold" />
      </div>

      <div className="grid grid-cols-2 gap-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="relative overflow-hidden aspect-[3/4] rounded-2xl bg-[#12131d] border border-white/10 p-3 flex flex-col justify-end">
            <div className="space-y-1.5 bg-black/60 backdrop-blur p-2 rounded-xl">
              <div className="h-2.5 w-16 bg-white/20 rounded" />
              <div className="h-2 w-10 bg-white/10 rounded" />
            </div>
            <ShimmerWave tint="gold" />
          </div>
        ))}
      </div>
    </div>
  );
};

/* ==========================================================================
   9. MOBILE ECO IMPACT SKELETON
   ========================================================================== */
export const MobileEcoImpactSkeleton = () => {
  return (
    <div className="space-y-4 animate-fade-in" aria-busy="true">
      <div className="relative overflow-hidden rounded-[28px] border border-emerald-500/20 bg-[#101915] p-5 flex items-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 flex items-center justify-center shrink-0">
          <Award className="w-7 h-7 text-emerald-400" />
        </div>
        <div className="space-y-1.5 flex-1">
          <div className="h-2.5 w-20 bg-white/10 rounded" />
          <div className="h-6 w-32 bg-emerald-400/30 rounded-lg" />
          <div className="h-2 w-24 bg-white/5 rounded" />
        </div>
        <ShimmerWave tint="emerald" />
      </div>

      <div className="grid grid-cols-3 gap-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="relative overflow-hidden rounded-2xl bg-[#0e1614] border border-emerald-500/20 p-4 space-y-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-400/20" />
            <div className="h-4 w-12 bg-white/20 rounded" />
            <div className="h-2 w-14 bg-white/10 rounded" />
            <ShimmerWave tint="emerald" />
          </div>
        ))}
      </div>
    </div>
  );
};

/* ==========================================================================
   10. MOBILE VIP CLUB SKELETON
   ========================================================================== */
export const MobileVIPClubSkeleton = () => {
  return (
    <div className="space-y-4 px-5 animate-fade-in" aria-busy="true">
      <div className="relative overflow-hidden rounded-[28px] p-5 border border-[#d6b47c]/20 bg-[#12131d] space-y-5">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="h-2.5 w-20 bg-white/10 rounded" />
            <div className="h-6 w-28 bg-[#d6b47c]/30 rounded-lg" />
          </div>
          <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center">
            <Crown className="w-6 h-6 text-[#d6b47c]/50" />
          </div>
        </div>

        <div className="space-y-1.5">
          <div className="h-2.5 w-full bg-white/5 rounded-full overflow-hidden">
            <div className="h-full w-1/2 bg-[#d6b47c]/50 rounded-full" />
          </div>
          <div className="flex justify-between">
            <div className="h-2 w-14 bg-white/10 rounded" />
            <div className="h-2 w-16 bg-white/10 rounded" />
          </div>
        </div>
        <ShimmerWave tint="gold" />
      </div>

      <div className="grid grid-cols-2 gap-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="relative overflow-hidden rounded-2xl bg-[#12131d] border border-white/10 p-4 flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-4 h-4 text-[#d6b47c]/40" />
            </div>
            <div className="h-3 w-16 bg-white/20 rounded" />
            <ShimmerWave tint="gold" />
          </div>
        ))}
      </div>
    </div>
  );
};

/* ==========================================================================
   11. MY GIFT CARDS SKELETON
   ========================================================================== */
export const MyGiftCardsSkeleton = () => {
  return (
    <div className="space-y-6 animate-fade-in" aria-busy="true">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[1, 2].map((i) => (
          <div
            key={i}
            className="relative overflow-hidden rounded-[28px] bg-gradient-to-br from-[#1c1815] to-[#0f0e0d] border border-[#d6b47c]/30 p-8 space-y-6 shadow-2xl"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#d6b47c]/10 border border-[#d6b47c]/20 flex items-center justify-center">
                  <Gift className="w-5 h-5 text-[#d6b47c]" />
                </div>
                <div className="space-y-1">
                  <div className="h-3 w-20 bg-[#d6b47c]/30 rounded" />
                  <div className="h-5 w-32 bg-white/20 rounded" />
                </div>
              </div>
              <div className="h-6 w-16 bg-emerald-500/20 rounded-full" />
            </div>

            {/* Secret Code placeholder with lock pattern */}
            <div className="p-4 rounded-2xl bg-black/40 border border-white/5 flex items-center justify-between">
              <div className="h-4 w-36 bg-white/20 rounded tracking-widest" />
              <div className="h-7 w-20 bg-white/10 rounded-xl" />
            </div>

            <ShimmerWave tint="gold" />
          </div>
        ))}
      </div>
    </div>
  );
};

/* ==========================================================================
   12. BUNDLE DETAIL SKELETON (Desktop & Mobile)
   ========================================================================== */
export const BundleDetailSkeleton = () => {
  return (
    <div className="min-h-screen bg-[#0a0a0b] py-12 px-4 sm:px-6 lg:px-8 animate-fade-in" aria-busy="true">
      <div className="max-w-7xl mx-auto space-y-12">
        <div className="h-5 w-32 bg-white/10 rounded-full" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Main Visual Skeleton */}
          <div className="lg:col-span-7 relative overflow-hidden rounded-[36px] bg-[#14151f] border border-white/10 aspect-[4/3] flex items-center justify-center">
            <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center">
              <Crown className="w-8 h-8 text-[#d6b47c]/30" />
            </div>
            <ShimmerWave tint="gold" />
          </div>

          {/* Bundle Info Card Skeleton */}
          <div className="lg:col-span-5 relative overflow-hidden rounded-[36px] bg-[#12131d] border border-[#d6b47c]/20 p-8 space-y-6">
            <div className="h-4 w-28 bg-[#d6b47c]/30 rounded-full" />
            <div className="h-8 w-4/5 bg-white/20 rounded-xl" />
            <div className="h-4 w-full bg-white/10 rounded" />
            <div className="h-4 w-2/3 bg-white/5 rounded" />

            <div className="p-6 rounded-2xl bg-white/5 space-y-3">
              <div className="h-3 w-20 bg-white/10 rounded" />
              <div className="h-8 w-40 bg-[#d6b47c]/40 rounded-lg" />
            </div>

            <div className="h-14 w-full bg-[#d6b47c]/20 rounded-full" />
            <ShimmerWave tint="gold" />
          </div>
        </div>
      </div>
    </div>
  );
};

/* ==========================================================================
   13. MOBILE BUNDLES SKELETON
   ========================================================================== */
export const MobileBundlesSkeleton = () => {
  return (
    <div className="space-y-6 animate-fade-in" aria-busy="true">
      {[1, 2].map((i) => (
        <div
          key={i}
          className="relative overflow-hidden rounded-[32px] bg-[#12131d] border border-white/10 p-5 space-y-4 shadow-xl"
        >
          <div className="aspect-[16/10] rounded-2xl bg-[#181926] relative overflow-hidden flex items-center justify-center">
            <Crown className="w-10 h-10 text-[#d6b47c]/20" />
            <ShimmerWave tint="gold" />
          </div>
          <div className="space-y-2">
            <div className="h-3 w-24 bg-[#d6b47c]/30 rounded-full" />
            <div className="h-6 w-3/4 bg-white/20 rounded-lg" />
            <div className="h-3.5 w-1/2 bg-white/10 rounded" />
          </div>
          <div className="flex items-center justify-between pt-2">
            <div className="h-6 w-28 bg-[#d6b47c]/40 rounded-lg" />
            <div className="h-10 w-24 bg-white/10 rounded-full" />
          </div>
          <ShimmerWave tint="gold" />
        </div>
      ))}
    </div>
  );
};
/* ==========================================================================
   14. PRODUCT VIEW SKELETON (Desktop & Mobile)
   ========================================================================== */
export const ProductViewSkeleton = () => {
  return (
    <div className="min-h-screen bg-[#0a0a0b] py-10 px-4 sm:px-6 lg:px-8 animate-fade-in" aria-busy="true">
      <div className="max-w-7xl mx-auto">
        {/* Breadcrumb skeleton */}
        <div className="flex items-center gap-3 mb-10">
          <div className="h-3 w-16 bg-white/10 rounded" />
          <div className="h-3 w-3 bg-white/10 rounded" />
          <div className="h-3 w-24 bg-white/10 rounded" />
          <div className="h-3 w-3 bg-white/10 rounded" />
          <div className="h-3 w-32 bg-[#d6b47c]/30 rounded" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Gallery Column (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="relative overflow-hidden aspect-[3/4] rounded-[36px] bg-[#12131d] border border-white/10 flex items-center justify-center shadow-2xl">
              <Crown className="w-16 h-16 text-[#d6b47c]/20" />
              <ShimmerWave tint="gold" />
            </div>

            {/* Thumbnail row */}
            <div className="grid grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="relative overflow-hidden aspect-square rounded-2xl bg-[#14151f] border border-white/5">
                  <ShimmerWave tint="gold" />
                </div>
              ))}
            </div>
          </div>

          {/* Info Panel Column (5 cols) */}
          <div className="lg:col-span-5 relative overflow-hidden rounded-[36px] bg-[#12131d] border border-[#d6b47c]/20 p-8 md:p-10 space-y-6 shadow-2xl">
            <div className="h-4 w-28 bg-[#d6b47c]/30 rounded-full" />
            <div className="space-y-3">
              <div className="h-8 w-4/5 bg-white/20 rounded-xl" />
              <div className="h-4 w-3/5 bg-white/10 rounded" />
            </div>

            {/* Price Box */}
            <div className="p-6 rounded-3xl bg-white/5 border border-white/10 space-y-2">
              <div className="h-3 w-16 bg-white/10 rounded" />
              <div className="h-8 w-44 bg-[#d6b47c]/50 rounded-lg" />
            </div>

            {/* Color Swatches */}
            <div className="space-y-3 pt-2">
              <div className="h-3 w-20 bg-white/10 rounded" />
              <div className="flex gap-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="w-9 h-9 rounded-full bg-white/10 border border-white/10" />
                ))}
              </div>
            </div>

            {/* Size Selector */}
            <div className="space-y-3 pt-2">
              <div className="h-3 w-16 bg-white/10 rounded" />
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="w-12 h-10 rounded-xl bg-white/5 border border-white/10" />
                ))}
              </div>
            </div>

            {/* Add to Cart CTA */}
            <div className="h-14 w-full bg-[#d6b47c]/25 rounded-full" />

            <ShimmerWave tint="gold" />
          </div>
        </div>
      </div>
    </div>
  );
};


