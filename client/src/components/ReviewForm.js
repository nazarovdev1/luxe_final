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
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-[#f5f5f3] mb-6">O'z fikringizni qoldiring</h3>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onMouseEnter={() => setHoveredRating(star)}
              onMouseLeave={() => setHoveredRating(0)}
              onClick={() => setRating(star)}
              className="group transition-transform active:scale-90"
            >
              <Star
                className={`h-6 w-6 transition-all duration-300 ${star <= (hoveredRating || rating) ? 'fill-[#c9a96e] text-[#c9a96e] drop-shadow-[0_0_8px_rgba(201,169,110,0.4)]' : 'text-white/10 group-hover:text-white/20'}`}
                strokeWidth={1.5}
              />
            </button>
          ))}
        </div>
      </div>

      <div>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          className="h-32 w-full resize-none rounded-2xl border border-white/5 bg-white/[0.02] p-5 text-sm text-[#f5f5f3] placeholder-[#6b6b6e] outline-none focus:border-[#c9a96e]/30 focus:bg-white/[0.04] transition-all duration-500"
          placeholder="Mahsulot haqida taassurotlaringizni yozing..."
        />
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-2xl bg-[#c9a96e] py-4 text-[11px] font-black uppercase tracking-[0.2em] text-[#0a0a0b] transition-all hover:bg-[#d4b87a] hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 shadow-[0_10px_20px_rgba(201,169,110,0.15)]"
      >
        {isSubmitting ? 'Yuborilmoqda...' : 'Sharhni yuborish'}
      </button>
    </form>
  );
};

export default ReviewForm;

