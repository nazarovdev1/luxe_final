import React, { useState } from 'react';
import { Camera, Heart, X, Upload, Star, Sparkles, CheckCircle } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

const DEMO_PHOTOS = [
  {
    id: 1,
    user: 'Madina K.',
    avatar: null,
    image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=300&h=400&fit=crop',
    rating: 5,
    date: '2026-04-28',
    likes: 24,
    comment: "Ajoyif sifat, juda chiroyli!",
    size: 'M',
  },
  {
    id: 2,
    user: 'Dilnoza S.',
    avatar: null,
    image: 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=300&h=400&fit=crop',
    rating: 4,
    date: '2026-04-25',
    likes: 18,
    comment: "Rang biroz boshqacha ekan, lekin baribir yoqdi",
    size: 'S',
  },
  {
    id: 3,
    user: 'Gulnora M.',
    avatar: null,
    image: 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=300&h=400&fit=crop',
    rating: 5,
    date: '2026-04-20',
    likes: 31,
    comment: "Eng sevimli ko'ylagim bo'ldi!",
    size: 'L',
  },
  {
    id: 4,
    user: 'Shaxlo T.',
    avatar: null,
    image: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=300&h=400&fit=crop',
    rating: 5,
    date: '2026-04-18',
    likes: 15,
    comment: "Do'konga kelganidan yaxshiroq",
    size: 'M',
  },
  {
    id: 5,
    user: 'Kamola R.',
    avatar: null,
    image: 'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=300&h=400&fit=crop',
    rating: 4,
    date: '2026-04-15',
    likes: 12,
    comment: "Juda qulay va chiroyli",
    size: 'S',
  },
  {
    id: 6,
    user: 'Nodira A.',
    avatar: null,
    image: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=300&h=400&fit=crop',
    rating: 5,
    date: '2026-04-12',
    likes: 27,
    comment: "Barchaga tavsiya qilaman!",
    size: 'XS',
  },
];

const CustomerPhotoReviews = ({ productName }) => {
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [likedPhotos, setLikedPhotos] = useState(new Set());
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadImages, setUploadImages] = useState([]);
  const [uploadComment, setUploadComment] = useState('');
  const [uploadRating, setUploadRating] = useState(5);
  const [uploadSize, setUploadSize] = useState('');
  const [uploaded, setUploaded] = useState(false);
  const { t } = useLanguage();

  const toggleLike = (photoId) => {
    setLikedPhotos((prev) => {
      const next = new Set(prev);
      if (next.has(photoId)) {
        next.delete(photoId);
      } else {
        next.add(photoId);
      }
      return next;
    });
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files || []);
    if (uploadImages.length + files.length > 4) return;
    setUploadImages((prev) => [...prev, ...files].slice(0, 4));
  };

  const removeUploadImage = (idx) => {
    setUploadImages((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleUploadSubmit = () => {
    setUploaded(true);
    // In production: await axios.post('/api/reviews', { images: uploadImages, comment, rating, size, productName });
    setTimeout(() => {
      setShowUploadModal(false);
      setUploaded(false);
      setUploadImages([]);
      setUploadComment('');
    }, 2000);
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-3 h-3 ${i < rating ? 'text-[#c9a96e] fill-[#c9a96e]' : 'text-white/10'}`}
      />
    ));
  };

  return (
    <div>
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-10">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#c9a96e]/10 border border-[#c9a96e]/20 flex items-center justify-center">
            <Camera className="w-6 h-6 text-[#c9a96e]" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-[#f5f5f3] tracking-wide uppercase">{t('customerPhotoReviews.title')}</h3>
            <p className="text-xs font-bold text-[#8a8a8d] uppercase tracking-[0.1em] mt-1">{DEMO_PHOTOS.length} {t('customerPhotoReviews.reviewCount')}</p>
          </div>
        </div>
        <button
          onClick={() => setShowUploadModal(true)}
          className="flex items-center justify-center gap-3 px-8 py-3.5 rounded-2xl bg-[#c9a96e] text-[#0a0a0b] text-[11px] font-black uppercase tracking-[0.2em] hover:bg-[#d4b87a] hover:scale-[1.02] active:scale-[0.98] transition-all shadow-[0_10px_20px_rgba(201,169,110,0.2)]"
        >
          <Upload className="w-4 h-4" strokeWidth={3} />
          {t('customerPhotoReviews.shareStyle')}
        </button>
      </div>

      {/* Photo Grid - Instagram style */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {DEMO_PHOTOS.map((photo, idx) => (
          <button
            key={photo.id}
            onClick={() => setSelectedPhoto(photo)}
            className="relative aspect-[3/4] rounded-2xl overflow-hidden group cursor-pointer border border-white/5 animate-fade-in-up"
            style={{ animationDelay: `${idx * 100}ms` }}
          >
            <img
              src={photo.image}
              alt={photo.user}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0b] via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />
            
            {/* Info Overlay */}
            <div className="absolute inset-x-0 bottom-0 p-4 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] text-white font-black uppercase tracking-widest">{photo.user}</span>
                <div className="flex gap-0.5">
                   {renderStars(photo.rating)}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Heart className={`w-3.5 h-3.5 ${likedPhotos.has(photo.id) ? 'text-red-500 fill-red-500' : 'text-white/60'}`} />
                <span className="text-[10px] text-white/60 font-bold">{photo.likes + (likedPhotos.has(photo.id) ? 1 : 0)}</span>
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Photo Detail Modal */}
      {selectedPhoto && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
          <div className="absolute inset-0 bg-[#0a0a0b]/90 backdrop-blur-xl animate-fade-in" onClick={() => setSelectedPhoto(null)} />
          <div className="relative z-10 w-full max-w-4xl rounded-[2.5rem] border border-white/10 bg-[#0a0a0b] overflow-hidden shadow-[0_40px_80px_rgba(0,0,0,0.8)] animate-scale-in">
            <div className="flex flex-col md:flex-row h-full">
              {/* Image Side */}
              <div className="w-full md:w-3/5 relative aspect-[3/4] md:aspect-auto">
                <img
                  src={selectedPhoto.image}
                  alt={selectedPhoto.user}
                  className="w-full h-full object-cover"
                />
                <button
                  onClick={() => setSelectedPhoto(null)}
                  className="absolute top-6 left-6 md:hidden w-10 h-10 rounded-full bg-black/40 backdrop-blur-xl border border-white/10 flex items-center justify-center text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Content Side */}
              <div className="w-full md:w-2/5 p-8 md:p-10 flex flex-col justify-between bg-gradient-to-b from-white/[0.02] to-transparent">
                <div>
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#c9a96e]/20 to-transparent border border-[#c9a96e]/10 flex items-center justify-center text-sm font-black text-[#c9a96e]">
                        {selectedPhoto.user.charAt(0)}
                      </div>
                      <div>
                        <h4 className="text-base font-black text-[#f5f5f3] tracking-wide">{selectedPhoto.user}</h4>
                        <p className="text-[10px] text-[#8a8a8d] uppercase tracking-[0.15em] mt-1">{t('customerPhotoReviews.certifiedBuyer')}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setSelectedPhoto(null)}
                      className="hidden md:flex w-10 h-10 rounded-full bg-white/5 border border-white/10 items-center justify-center text-[#8a8a8d] hover:text-[#f5f5f3] hover:bg-white/10 transition-all"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="space-y-6">
                    <div className="flex items-center gap-4">
                      <div className="flex gap-1">
                        {renderStars(selectedPhoto.rating)}
                      </div>
                      <div className="w-px h-3 bg-white/10" />
                      {selectedPhoto.size && (
                        <span className="text-[10px] font-black uppercase tracking-widest text-[#c9a96e]">
                          O'lcham: {selectedPhoto.size}
                        </span>
                      )}
                    </div>

                    <p className="text-lg font-medium text-[#f5f5f3] leading-relaxed">"{selectedPhoto.comment}"</p>
                    
                    <p className="text-[11px] text-[#8a8a8d] font-bold uppercase tracking-[0.1em]">
                      {new Date(selectedPhoto.date).toLocaleDateString('uz-UZ', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                  </div>
                </div>

                <div className="pt-8 mt-8 border-t border-white/5">
                  <button
                    onClick={() => toggleLike(selectedPhoto.id)}
                    className={`flex items-center justify-center gap-3 w-full py-4 rounded-2xl border transition-all duration-500 ${
                      likedPhotos.has(selectedPhoto.id)
                        ? 'bg-red-500/10 border-red-500/20 text-red-500'
                        : 'bg-white/5 border-white/10 text-[#f5f5f3] hover:bg-white/10'
                    }`}
                  >
                    <Heart className={`w-5 h-5 ${likedPhotos.has(selectedPhoto.id) ? 'fill-current' : ''}`} />
                    <span className="text-xs font-black uppercase tracking-[0.2em]">
                      {selectedPhoto.likes + (likedPhotos.has(selectedPhoto.id) ? 1 : 0)} kishiga yoqdi
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-[#0a0a0b]/90 backdrop-blur-xl animate-fade-in" onClick={() => !uploaded && setShowUploadModal(false)} />
          <div className="relative z-10 w-full max-w-lg rounded-[2.5rem] border border-white/10 bg-[#0a0a0b] overflow-hidden shadow-2xl animate-scale-in">
            {/* Header */}
            <div className="p-8 border-b border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-[#c9a96e]/10 border border-[#c9a96e]/20 flex items-center justify-center">
                  <Camera className="w-6 h-6 text-[#c9a96e]" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-[#f5f5f3] tracking-wide uppercase">{t('customerPhotoReviews.photoReview')}</h3>
                  <p className="text-[10px] font-bold text-[#8a8a8d] uppercase tracking-widest mt-1">{t('customerPhotoReviews.shareStyle')}</p>
                </div>
              </div>
              {!uploaded && (
                <button
                  onClick={() => setShowUploadModal(false)}
                  className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[#8a8a8d] hover:text-[#f5f5f3] transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>

            {uploaded ? (
              <div className="p-12 text-center">
                <div className="w-20 h-20 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center mx-auto mb-6 animate-bounce">
                  <CheckCircle className="w-10 h-10 text-green-500" />
                </div>
                <h4 className="text-2xl font-black text-[#f5f5f3] uppercase tracking-wider mb-4">{t('customerPhotoReviews.success')}</h4>
                <p className="text-[#8a8a8d] text-sm leading-relaxed mb-8 max-w-xs mx-auto">{t('customerPhotoReviews.successDesc')} <span className="text-[#c9a96e] font-black">{t('customerPhotoReviews.bonusPoints')}</span></p>
                <button
                  onClick={() => setShowUploadModal(false)}
                  className="w-full py-4 rounded-2xl bg-[#f5f5f3] text-[#0a0a0b] text-[11px] font-black uppercase tracking-[0.2em]"
                >
                  Yopish
                </button>
              </div>
            ) : (
              <div className="p-8 space-y-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
                {/* Image Upload */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <p className="text-[10px] font-black text-white uppercase tracking-[0.2em]">{t('customerPhotoReviews.imagesMax')}</p>
                    <span className="text-[10px] font-bold text-[#8a8a8d] uppercase tracking-widest">{uploadImages.length}/4</span>
                  </div>
                  <div className="flex flex-wrap gap-4">
                    {uploadImages.map((img, idx) => (
                      <div key={idx} className="relative w-24 h-24 rounded-2xl overflow-hidden border border-white/10 shadow-lg">
                        <img src={URL.createObjectURL(img)} alt="" className="w-full h-full object-cover" />
                        <button
                          onClick={() => removeUploadImage(idx)}
                          className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/60 backdrop-blur-md flex items-center justify-center hover:bg-red-500 transition-colors"
                        >
                          <X className="w-3 h-3 text-white" />
                        </button>
                      </div>
                    ))}
                    {uploadImages.length < 4 && (
                      <label className="w-24 h-24 rounded-2xl border border-dashed border-white/10 bg-white/[0.02] flex flex-col items-center justify-center cursor-pointer hover:border-[#c9a96e]/40 hover:bg-[#c9a96e]/5 transition-all group">
                        <Camera className="w-6 h-6 text-[#3f4658] group-hover:text-[#c9a96e] transition-colors" />
                        <span className="text-[9px] font-black text-[#3f4658] group-hover:text-[#c9a96e] mt-2 uppercase tracking-widest">{t('customerPhotoReviews.upload')}</span>
                        <input type="file" accept="image/*" multiple onChange={handleImageUpload} className="hidden" />
                      </label>
                    )}
                  </div>
                </div>

                {/* Rating */}
                <div className="space-y-4">
                  <p className="text-[10px] font-black text-white uppercase tracking-[0.2em]">{t('customerPhotoReviews.rateQuality')}</p>
                  <div className="flex gap-3">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => setUploadRating(star)}
                        className="transition-transform hover:scale-125 active:scale-90"
                      >
                        <Star className={`w-8 h-8 ${star <= uploadRating ? 'text-[#c9a96e] fill-[#c9a96e] drop-shadow-[0_0_8px_rgba(201,169,110,0.4)]' : 'text-white/5'}`} />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Size worn */}
                <div className="space-y-4">
                  <p className="text-[10px] font-black text-white uppercase tracking-[0.2em]">{t('customerPhotoReviews.selectedSize')}</p>
                  <div className="flex flex-wrap gap-2">
                    {['XS', 'S', 'M', 'L', 'XL', 'XXL'].map((size) => (
                      <button
                        key={size}
                        onClick={() => setUploadSize(size)}
                        className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all duration-300 ${
                          uploadSize === size
                            ? 'bg-[#c9a96e] border-[#c9a96e] text-[#0a0a0b] shadow-[0_8px_16px_rgba(201,169,110,0.2)]'
                            : 'bg-white/[0.02] border-white/5 text-[#8a8a8d] hover:border-white/20'
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Comment */}
                <div className="space-y-4">
                  <p className="text-[10px] font-black text-white uppercase tracking-[0.2em]">{t('customerPhotoReviews.yourImpression')}</p>
                  <textarea
                    value={uploadComment}
                    onChange={(e) => setUploadComment(e.target.value)}
                    placeholder="Mahsulot haqida o'z fikringizni yozing..."
                    className="w-full p-5 rounded-2xl bg-white/[0.02] border border-white/5 text-[#f5f5f3] text-sm placeholder-[#3f4658] outline-none focus:border-[#c9a96e]/30 transition-all duration-500 resize-none h-32"
                  />
                </div>

                {/* Bonus info */}
                <div className="rounded-2xl bg-gradient-to-r from-[#c9a96e]/10 to-transparent border border-[#c9a96e]/20 p-5">
                  <div className="flex items-center gap-3">
                    <Sparkles className="w-5 h-5 text-[#c9a96e]" />
                    <p className="text-xs font-bold text-[#f5f5f3]/80 leading-relaxed uppercase tracking-wide">
                       Foto sharh uchun <span className="text-[#c9a96e] font-black">+15 VIP BALL</span> olasiz!
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleUploadSubmit}
                  disabled={uploadImages.length === 0}
                  className="w-full py-5 rounded-2xl bg-[#c9a96e] text-[#0a0a0b] text-[11px] font-black uppercase tracking-[0.3em] hover:bg-[#d4b87a] active:scale-[0.98] transition-all disabled:opacity-30 shadow-[0_12px_24px_rgba(201,169,110,0.2)]"
                >
                  Tafsilotlarni yuborish
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerPhotoReviews;
