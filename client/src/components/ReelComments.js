import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { X, Send, MessageCircle, Trash2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

const ReelComments = ({ reelId, isOpen, onClose, isEmbedded = false }) => {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [text, setText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { user } = useAuth();

  // Fetch comments
  const fetchComments = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/reels/${reelId}/comments`);
      if (response.data.success) {
        setComments(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching comments:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && reelId) {
      fetchComments();
    }
  }, [isOpen, reelId]);

  // Submit comment
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user) {
      toast.error('Izoh qoldirish uchun tizimga kiring');
      return;
    }

    if (!text.trim()) {
      toast.error('Izohni kiriting');
      return;
    }

    try {
      setSubmitting(true);
      const response = await axios.post(
        `/api/reels/${reelId}/comment`,
        { text: text.trim() },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        }
      );

      if (response.data.success) {
        setText('');
        toast.success('Izoh qo\'shildi!');
        fetchComments();
      }
    } catch (error) {
      console.error('Error adding comment:', error);
      toast.error('Xatolik yuz berdi');
    } finally {
      setSubmitting(false);
    }
  };

  // Delete comment
  const handleDelete = async (commentId) => {
    if (!window.confirm('Haqiqatan ham ushbu izohni o\'chirmoqchimisiz?')) return;

    try {
      const response = await axios.delete(`/api/delete-reel-comment/${commentId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });

      if (response.data.success) {
        toast.success('Izoh o\'chirildi');
        fetchComments();
      }
    } catch (error) {
      console.error('Error deleting comment:', error);
      const message = error.response?.data?.message || 'O\'chirishda xatolik yuz berdi';
      toast.error(message);
    }
  };

  if (!isOpen) return null;

  const content = (
    <div 
      className={`flex flex-col h-full bg-[#0f0f12] ${isEmbedded ? 'w-full' : 'relative w-full max-w-[400px] bg-black/90 backdrop-blur-2xl border-l border-white/10 shadow-2xl transition-transform duration-500 ease-out'}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-white/5">
        <div>
          <h3 className="text-white font-black text-xl flex items-center gap-2">
            Izohlar
            <span className="text-xs font-medium text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-full">
              {comments.length}
            </span>
          </h3>
          <p className="text-gray-500 text-[10px] mt-1 uppercase tracking-widest font-bold">Hamjamiyat fikrlari</p>
        </div>
        <button
          onClick={onClose}
          className="w-10 h-10 flex items-center justify-center rounded-full bg-white/5 text-white hover:bg-amber-500 hover:text-black transition-all transform active:scale-90"
        >
          <X size={20} />
        </button>
      </div>

      {/* Comments List */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-6 pb-24 space-y-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-full gap-4">
            <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-gray-500 text-sm animate-pulse">Yuklanmoqda...</p>
          </div>
        ) : comments.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-4 opacity-30">
            <MessageCircle size={48} className="text-gray-600" />
            <div>
              <p className="text-white font-bold text-sm">Izohlar yo'q</p>
            </div>
          </div>
        ) : (
          comments.map((comment) => (
            <div key={comment._id} className="group animate-slide-up">
              <div className="flex items-start gap-4">
                <div className="relative flex-shrink-0">
                  {comment.user?.profileImage ? (
                    <img
                      src={comment.user.profileImage}
                      alt=""
                      className="w-8 h-8 rounded-full object-cover ring-2 ring-white/5"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center text-black font-black text-[10px]">
                      {comment.user?.username?.[0]?.toUpperCase()}
                    </div>
                  )}
                </div>

                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-white text-xs font-black">@{comment.user?.username}</span>
                    <span className="text-[9px] text-gray-500 font-medium">
                      {new Date(comment.createdAt).toLocaleDateString('uz-UZ', { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                  <p className="text-gray-300 text-xs leading-relaxed break-words">
                    {comment.text}
                  </p>
                  
                  <div className="flex items-center gap-3 pt-1">
                    {(user?._id === comment.user?._id || user?.role === 'admin') && (
                      <button
                        onClick={() => handleDelete(comment._id)}
                        className="text-[9px] text-red-500/70 hover:text-red-400 font-bold uppercase tracking-tighter"
                      >
                        O'chirish
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Input Area */}
      <div className={`p-6 border-t border-white/5 bg-black/40 ${isEmbedded ? 'pb-12' : ''}`}>
        <form onSubmit={handleSubmit} className="relative group">
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Izoh yozing..."
            className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-4 pr-12 text-white text-xs focus:outline-none focus:border-amber-500/50 transition-all"
          />
          <button
            type="submit"
            disabled={submitting || !text.trim()}
            className={`absolute right-1.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
              text.trim() ? 'bg-amber-500 text-black' : 'bg-white/5 text-gray-600'
            }`}
          >
            {submitting ? (
              <div className="w-3 h-3 border-2 border-black border-t-transparent rounded-full animate-spin" />
            ) : (
              <Send size={14} fill="currentColor" />
            )}
          </button>
        </form>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .custom-scrollbar::-webkit-scrollbar { width: 3px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
        @keyframes slide-up { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }
        .animate-slide-up { animation: slide-up 0.3s ease-out forwards; }
      `}} />
    </div>
  );

  if (isEmbedded) return content;

  return (
    <div className="fixed inset-0 z-[100] flex justify-end overflow-hidden">
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
      />
      <div 
        className={`relative w-full max-w-[400px] h-full shadow-2xl flex flex-col transition-transform duration-500 ease-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {content}
      </div>
    </div>
  );
};

export default ReelComments;