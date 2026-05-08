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
    <div className="space-y-10">
      {reviews.map((review) => (
        <article
          key={review._id}
          className="group animate-fade-in"
        >
          <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-[#c9a96e]/20 to-transparent border border-[#c9a96e]/10 flex items-center justify-center text-xs font-bold text-[#c9a96e]">
                {review.user?.username?.charAt(0).toUpperCase() || 'F'}
              </div>
              <div>
                <h4 className="text-sm font-bold text-[#f5f5f3] tracking-wide">{review.user?.username || 'Foydalanuvchi'}</h4>
                <p className="text-[10px] text-[#8a8a8d] uppercase tracking-[0.1em] mt-0.5">{new Date(review.createdAt).toLocaleDateString('uz-UZ')}</p>
              </div>
            </div>

            <div className="flex gap-0.5">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`h-3 w-3 ${i < review.rating ? 'fill-[#c9a96e] text-[#c9a96e]' : 'text-white/10'}`}
                />
              ))}
            </div>
          </div>

          <p className="text-sm leading-relaxed text-[#8a8a8d] group-hover:text-[#f5f5f3] transition-colors duration-500">{review.comment}</p>

          {user && user.isAdmin && (
            <button
              onClick={() => handleDelete(review._id)}
              className="mt-4 text-[10px] font-bold uppercase tracking-widest text-red-400/50 hover:text-red-400 transition-all flex items-center gap-2"
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

