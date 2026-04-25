import React, { useState } from 'react';
import { Star } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';

const API_BASE = process.env.REACT_APP_API_URL || 'http://127.0.0.1:3003/api';

const ReviewForm = ({ productId, onReviewAdded }) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [hoveredRating, setHoveredRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { isAuthenticated } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isAuthenticated) {
      toast.error('Sharh qoldirish uchun tizimga kiring');
      return;
    }

    if (rating === 0) {
      toast.error("Iltimos, baho qo'ying");
      return;
    }

    if (!comment.trim()) {
      toast.error('Iltimos, fikringizni yozing');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`${API_BASE}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          productId,
          rating,
          comment,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Xatolik yuz berdi');
      }

      const newReview = await response.json();
      toast.success('Sharhingiz qabul qilindi!');
      setRating(0);
      setComment('');

      if (onReviewAdded) {
        onReviewAdded(newReview);
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="py-6 border-b border-white/5">
        <p className="mb-3 text-sm text-white/50">Sharh qoldirish uchun tizimga kiring</p>
        <a
          href="/login"
          className="inline-flex items-center justify-center rounded-lg border border-white/20 bg-transparent px-6 py-2 text-xs font-bold uppercase tracking-widest text-white transition-all hover:bg-white hover:text-black"
        >
          Kirish
        </a>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mb-8 border-b border-white/5 pb-8">
      <h3 className="mb-4 text-base font-medium text-white">Fikr bildirish</h3>

      <div className="mb-4">
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onMouseEnter={() => setHoveredRating(star)}
              onMouseLeave={() => setHoveredRating(0)}
              onClick={() => setRating(star)}
              className="group focus:outline-none"
            >
              <Star
                className={`h-6 w-6 transition-all ${star <= (hoveredRating || rating) ? 'fill-[#d6b47c] text-[#d6b47c]' : 'text-neutral-600 group-hover:text-neutral-500'}`}
                strokeWidth={1.5}
              />
            </button>
          ))}
        </div>
      </div>

      <div className="mb-4">
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          className="h-28 w-full resize-none rounded-2xl border border-white/10 bg-black/20 p-4 text-sm text-[#f4f1eb] placeholder-neutral-500 outline-none focus:border-[#d6b47c]/50 focus:bg-black/40 shadow-[inset_0_2px_10px_rgba(0,0,0,0.2)] transition-all"
          placeholder="Mahsulot haqida fikringiz..."
        />
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-2xl bg-[#f4f1eb] py-3.5 text-xs font-bold uppercase tracking-widest text-[#0a1220] transition-all hover:bg-white hover:-translate-y-0.5 shadow-lg disabled:opacity-50 disabled:hover:translate-y-0"
      >
        {isSubmitting ? 'Yuborilmoqda...' : 'Yuborish'}
      </button>
    </form>
  );
};

export default ReviewForm;

