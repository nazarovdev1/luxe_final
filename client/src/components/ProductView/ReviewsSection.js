import React from 'react';
import { Star } from 'lucide-react';
import ReviewForm from '../ReviewForm';
import ReviewList from '../ReviewList';

/**
 * ReviewsSection — Premium reviews layout with form and list
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
        className={`h-4 w-4 ${i < Math.floor(rating) ? 'fill-[#c9a96e] text-[#c9a96e]' : 'text-[#2a2a2d]'}`}
      />
    ));
  };

  return (
    <section ref={sectionRef} className="border-t border-white/5 pt-16">
      {/* Section header */}
      <div className="flex items-center gap-3 mb-10">
        <div className="h-px w-8 bg-[#c9a96e]" />
        <span className="text-[10px] uppercase tracking-[0.25em] text-[#c9a96e] font-bold">
          Fikrlar
        </span>
      </div>
      <h2 className="text-2xl lg:text-3xl font-brilliant text-[#f5f5f3] mb-10">
        Mijozlar fikri
      </h2>

      <div className="grid grid-cols-1 gap-12 lg:grid-cols-[340px_1fr]">
        {/* Left: Rating summary + Review form */}
        <div className="space-y-6">
          {/* Rating overview */}
          <div className="p-6 rounded-xl bg-white/[0.02] border border-white/5">
            <div className="flex items-center gap-4 mb-4">
              <div className="text-4xl font-bold text-[#f5f5f3] tabular-nums">
                {(product.rating || 0).toFixed(1)}
              </div>
              <div>
                <div className="flex items-center gap-0.5 mb-1">
                  {renderStars(product.rating || 0)}
                </div>
                <p className="text-sm text-[#8a8a8d]">
                  {reviews.length} ta umumiy sharh
                </p>
              </div>
            </div>

            {/* Rating distribution bar */}
            {reviews.length > 0 && (
              <div className="space-y-2 pt-4 border-t border-white/5">
                {[5, 4, 3, 2, 1].map((star) => {
                  const count = reviews.filter(
                    (r) => Math.floor(r.rating || 0) === star
                  ).length;
                  const percent = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
                  return (
                    <div key={star} className="flex items-center gap-2">
                      <span className="text-[10px] text-[#6b6b6e] w-3 text-right">{star}</span>
                      <Star className="h-3 w-3 text-[#c9a96e] fill-[#c9a96e]" />
                      <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#c9a96e] rounded-full transition-all duration-700"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                      <span className="text-[10px] text-[#6b6b6e] w-6">{count}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Review form */}
          <div className="p-6 rounded-xl bg-white/[0.02] border border-white/5">
            <ReviewForm productId={product.id || product._id} onReviewAdded={onReviewAdded} />
          </div>
        </div>

        {/* Right: Review list */}
        <div className="rounded-xl bg-white/[0.02] border border-white/5 p-6 lg:p-8 h-fit">
          <ReviewList reviews={reviews} onReviewDeleted={onReviewDeleted} />
        </div>
      </div>
    </section>
  );
}
