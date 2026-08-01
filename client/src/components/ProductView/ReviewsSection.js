import React from 'react';
import { MessageSquare, Star } from 'lucide-react';
import ReviewForm from '../ReviewForm';
import ReviewList from '../ReviewList';

export default function ReviewsSection({ product, reviews = [], onReviewAdded, onReviewDeleted, sectionRef }) {
  const average = reviews.length
    ? reviews.reduce((total, review) => total + Number(review.rating || 0), 0) / reviews.length
    : Number(product.rating || 5);

  return (
    <section ref={sectionRef} className="review-studio">
      <div className="review-studio-heading">
        <div>
          <p>MIJOZLAR FIKRI</p>
          <h2>Ushbu model haqidagi<br />haqiqiy taassurotlar.</h2>
        </div>
        <div className="review-studio-score">
          <strong>{average.toFixed(1)}</strong>
          <span><span className="review-studio-stars">{Array.from({ length: 5 }, (_, index) => <Star key={index} size={15} fill="currentColor" />)}</span><small>{reviews.length ? `${reviews.length} ta sharh` : 'Hali sharhlar yo‘q'}</small></span>
        </div>
      </div>

      <div className="review-studio-layout">
        <aside className="review-composer">
          <div className="review-composer-label"><MessageSquare size={16} /><span>Fikr qoldirish</span></div>
          <h3>Sizning fikringiz<br />boshqalar uchun muhim.</h3>
          <ReviewForm productId={product.id || product._id} onReviewAdded={onReviewAdded} />
        </aside>
        <div className="review-feed">
          {reviews.length === 0 && (
            <div className="review-feed-empty">
              <Star size={23} />
              <div><b>Birinchi fikr sizniki bo‘lsin</b><p>Mahsulot sifati va o‘lchami haqida qisqacha yozing.</p></div>
            </div>
          )}
          {reviews.length > 0 && <ReviewList reviews={reviews} onReviewDeleted={onReviewDeleted} />}
        </div>
      </div>
    </section>
  );
}
