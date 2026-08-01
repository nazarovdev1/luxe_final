import React from 'react';
import { Star, MessageSquare, ThumbsUp } from 'lucide-react';
import ReviewForm from '../ReviewForm';
import ReviewList from '../ReviewList';

/**
 * ReviewsSection — Luxury product customer reviews layout with rating breakdown and list
 */
export default function ReviewsSection({
  product,
  reviews = [],
  onReviewAdded,
  onReviewDeleted,
  sectionRef,
}) {
  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${i < Math.floor(rating) ? 'fill-[#c9a96e] text-[#c9a96e]' : 'text-white/15'}`}
      />
    ));
  };

  const avgRating = product.rating || 5.0;

  return (
    <section ref={sectionRef} className="border-t border-white/10 pt-16 space-y-10">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <div className="h-px w-8 bg-[#c9a96e]" />
          <span className="text-[10px] uppercase tracking-[0.3em] text-[#c9a96e] font-bold">
            Fikrlar va Sharhlar
          </span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-serif font-normal text-white tracking-tight">
          Mijozlarimiz fikri
        </h2>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[360px_1fr]">
        {/* Left column: Rating summary + Add review form */}
        <div className="space-y-6">
          {/* Rating Summary Card */}
          <div className="p-6 rounded-3xl bg-[#141416]/50 border border-white/10 backdrop-blur-xl space-y-5 shadow-[0_10px_30px_rgba(0,0,0,0.4)]">
            <div className="flex items-center gap-5">
              <div className="text-5xl font-bold text-white tabular-nums font-serif">
                {avgRating.toFixed(1)}
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-1">{renderStars(avgRating)}</div>
                <p className="text-xs text-[#8a8a8d] font-medium">
                  {reviews.length} ta tasdiqlangan sharh
                </p>
              </div>
            </div>

            {/* Star Distribution Progress Bars */}
            <div className="space-y-2.5 pt-4 border-t border-white/10">
              {[5, 4, 3, 2, 1].map((star) => {
                const count = reviews.filter(
                  (r) => Math.floor(r.rating || 0) === star
                ).length;
                const percent = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
                return (
                  <div key={star} className="flex items-center gap-3 text-xs">
                    <span className="text-[#8a8a8d] w-3 text-right font-medium">{star}</span>
                    <Star className="h-3 w-3 text-[#c9a96e] fill-[#c9a96e]" />
                    <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden border border-white/5">
                      <div
                        className="h-full bg-gradient-to-r from-[#c9a96e] to-[#d4b87a] rounded-full transition-all duration-700"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                    <span className="text-[#8a8a8d] w-6 text-right font-medium">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Form Card */}
          <div className="p-6 rounded-3xl bg-[#141416]/50 border border-white/10 backdrop-blur-xl shadow-lg">
            <h3 className="text-sm font-bold uppercase tracking-wider text-white mb-4 flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-[#c9a96e]" />
              Fikr qoldirish
            </h3>
            <ReviewForm productId={product.id || product._id} onReviewAdded={onReviewAdded} />
          </div>
        </div>

        {/* Right column: Reviews List */}
        <div className="rounded-3xl bg-[#141416]/40 border border-white/10 p-6 sm:p-8 backdrop-blur-xl h-fit shadow-lg">
          <ReviewList reviews={reviews} onReviewDeleted={onReviewDeleted} />
        </div>
      </div>
    </section>
  );
}
