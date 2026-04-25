import React from 'react';
import { Star, Trash2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

const API_BASE = process.env.REACT_APP_API_URL || 'http://127.0.0.1:3003/api';

const ReviewList = ({ reviews, onReviewDeleted }) => {
  const { user } = useAuth();

  const handleDelete = async (reviewId) => {
    if (!window.confirm("Haqiqatan ham bu sharhni o'chirmoqchimisiz?")) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/reviews/${reviewId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Xatolik yuz berdi');
      }

      toast.success("Sharh o'chirildi");
      if (onReviewDeleted) {
        onReviewDeleted(reviewId);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  if (!reviews || reviews.length === 0) {
    return (
      <div className="py-8 text-center">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-white/5 mb-3">
          <Star className="h-6 w-6 text-white/20" />
        </div>
        <p className="text-sm text-white/50">Hozircha sharhlar yo'q. Birinchi bo'lib fikr bildiring!</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {reviews.map((review) => (
        <article
          key={review._id}
          className="border-b border-white/5 pb-6 last:border-0"
        >
          <div className="mb-3 flex flex-wrap items-center gap-x-4 gap-y-2">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-[#f4f1eb]">{review.user?.username || 'Foydalanuvchi'}</span>
              <span className="text-xs text-neutral-600">•</span>
              <span className="text-xs text-neutral-400">{new Date(review.createdAt).toLocaleDateString('uz-UZ')}</span>
            </div>

            <div className="flex gap-0.5">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`h-3.5 w-3.5 sm:h-4 sm:w-4 ${i < review.rating ? 'fill-[#d6b47c] text-[#d6b47c]' : 'text-neutral-600'}`}
                />
              ))}
            </div>
          </div>

          <p className="text-sm leading-relaxed text-white/80">{review.comment}</p>

          {user && user.isAdmin && (
            <button
              onClick={() => handleDelete(review._id)}
              className="mt-3 text-xs text-red-400 hover:text-red-300 transition-colors flex items-center gap-1"
            >
              <Trash2 className="h-3 w-3" />
              O'chirish
            </button>
          )}
        </article>
      ))}
    </div>
  );
};

export default ReviewList;

