import React, { useState } from 'react';
import { Camera, Heart, X, Upload, Image, Star, ChevronLeft, ChevronRight } from 'lucide-react';

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
        className={`w-3 h-3 ${i < rating ? 'text-[#d6b47c] fill-[#d6b47c]' : 'text-[#3f4658]'}`}
      />
    ));
  };

  return (
    <div>
      {/* Section Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#d6b47c]/10 border border-[#d6b47c]/20 flex items-center justify-center">
            <Camera className="w-5 h-5 text-[#d6b47c]" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-[#f4f1eb]">Xaridorlar Kiyinishdi</h3>
            <p className="text-[11px] text-[#9aa3b2]">{DEMO_PHOTOS.length} ta foto sharh</p>
          </div>
        </div>
        <button
          onClick={() => setShowUploadModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#d6b47c]/10 border border-[#d6b47c]/20 text-[#d6b47c] text-sm font-medium hover:bg-[#d6b47c]/20 transition-all"
        >
          <Upload className="w-4 h-4" />
          Rasm yuklash
        </button>
      </div>

      {/* Photo Grid - Instagram style */}
      <div className="grid grid-cols-3 gap-2">
        {DEMO_PHOTOS.map((photo) => (
          <button
            key={photo.id}
            onClick={() => setSelectedPhoto(photo)}
            className="relative aspect-[3/4] rounded-xl overflow-hidden group cursor-pointer border border-white/5"
          >
            <img
              src={photo.image}
              alt={photo.user}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            {/* Like count */}
            <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="flex items-center gap-1">
                <Heart className={`w-3.5 h-3.5 ${likedPhotos.has(photo.id) ? 'text-red-400 fill-red-400' : 'text-white'}`} />
                <span className="text-xs text-white font-medium">{photo.likes + (likedPhotos.has(photo.id) ? 1 : 0)}</span>
              </div>
              <div className="flex items-center gap-0.5">
                {renderStars(photo.rating)}
              </div>
            </div>
            {/* User badge */}
            <div className="absolute top-2 left-2 bg-black/40 backdrop-blur-sm rounded-full px-2 py-0.5">
              <span className="text-[10px] text-white font-medium">{photo.user}</span>
            </div>
          </button>
        ))}
      </div>

      {/* Photo Detail Modal */}
      {selectedPhoto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setSelectedPhoto(null)} />
          <div className="relative z-10 w-full max-w-lg rounded-[2rem] border border-white/10 bg-gradient-to-b from-[#11131e] to-[#0d0f18] overflow-hidden">
            {/* Close */}
            <button
              onClick={() => setSelectedPhoto(null)}
              className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-black/40 backdrop-blur-sm border border-white/10 flex items-center justify-center text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Image */}
            <div className="relative aspect-[3/4] max-h-[60vh]">
              <img
                src={selectedPhoto.image}
                alt={selectedPhoto.user}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Info */}
            <div className="p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-[#d6b47c]/10 flex items-center justify-center text-sm font-bold text-[#d6b47c]">
                  {selectedPhoto.user.charAt(0)}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-[#f4f1eb]">{selectedPhoto.user}</p>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-0.5">{renderStars(selectedPhoto.rating)}</div>
                    {selectedPhoto.size && (
                      <span className="text-[10px] bg-white/5 px-1.5 py-0.5 rounded text-[#9aa3b2] border border-white/5">
                        {selectedPhoto.size}
                      </span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => toggleLike(selectedPhoto.id)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
                >
                  <Heart className={`w-4 h-4 ${likedPhotos.has(selectedPhoto.id) ? 'text-red-400 fill-red-400' : 'text-[#9aa3b2]'}`} />
                  <span className="text-xs text-[#f4f1eb]">{selectedPhoto.likes + (likedPhotos.has(selectedPhoto.id) ? 1 : 0)}</span>
                </button>
              </div>
              <p className="text-sm text-[#c7ceda]">{selectedPhoto.comment}</p>
              <p className="text-[10px] text-[#9aa3b2] mt-2">
                {new Date(selectedPhoto.date).toLocaleDateString('uz-UZ', { day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => !uploaded && setShowUploadModal(false)} />
          <div className="relative z-10 w-full max-w-md rounded-[2rem] border border-white/10 bg-gradient-to-b from-[#11131e] to-[#0d0f18] overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-white/5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#d6b47c]/10 border border-[#d6b47c]/20 flex items-center justify-center">
                  <Camera className="w-5 h-5 text-[#d6b47c]" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-[#f4f1eb]">Foto Sharh</h3>
                  <p className="text-[11px] text-[#9aa3b2]">Mahsulotni qanday kiydingiz?</p>
                </div>
              </div>
              {!uploaded && (
                <button
                  onClick={() => setShowUploadModal(false)}
                  className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-white/10 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {uploaded ? (
              <div className="p-6 text-center">
                <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-4">
                  <Star className="w-8 h-8 text-emerald-400 fill-emerald-400" />
                </div>
                <h4 className="text-xl font-semibold text-[#f4f1eb] mb-2">Rahmat!</h4>
                <p className="text-sm text-[#9aa3b2]">Foto sharhingiz moderatsiyadan o'tgandan keyin e'lon qilinadi. +15 ball oldingiz!</p>
              </div>
            ) : (
              <div className="p-5 space-y-4">
                {/* Image Upload */}
                <div>
                  <p className="text-xs text-[#9aa3b2] mb-2">Rasmlar (maks 4 ta)</p>
                  <div className="flex flex-wrap gap-2">
                    {uploadImages.map((img, idx) => (
                      <div key={idx} className="relative w-20 h-20 rounded-xl overflow-hidden border border-white/10">
                        <img src={URL.createObjectURL(img)} alt="" className="w-full h-full object-cover" />
                        <button
                          onClick={() => removeUploadImage(idx)}
                          className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 flex items-center justify-center"
                        >
                          <X className="w-3 h-3 text-white" />
                        </button>
                      </div>
                    ))}
                    {uploadImages.length < 4 && (
                      <label className="w-20 h-20 rounded-xl border border-dashed border-white/10 flex flex-col items-center justify-center cursor-pointer hover:border-[#d6b47c]/30 transition-colors">
                        <Camera className="w-5 h-5 text-[#3f4658]" />
                        <span className="text-[9px] text-[#3f4658] mt-1">Yuklash</span>
                        <input type="file" accept="image/*" multiple onChange={handleImageUpload} className="hidden" />
                      </label>
                    )}
                  </div>
                </div>

                {/* Rating */}
                <div>
                  <p className="text-xs text-[#9aa3b2] mb-2">Baholang</p>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => setUploadRating(star)}
                        className="p-1 transition-transform hover:scale-110"
                      >
                        <Star className={`w-6 h-6 ${star <= uploadRating ? 'text-[#d6b47c] fill-[#d6b47c]' : 'text-[#3f4658]'}`} />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Size worn */}
                <div>
                  <p className="text-xs text-[#9aa3b2] mb-2">Qaysi o'lcham kiydingiz?</p>
                  <div className="flex gap-2">
                    {['XS', 'S', 'M', 'L', 'XL', 'XXL'].map((size) => (
                      <button
                        key={size}
                        onClick={() => setUploadSize(size)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                          uploadSize === size
                            ? 'bg-[#d6b47c]/10 border-[#d6b47c]/30 text-[#d6b47c]'
                            : 'bg-white/[0.02] border-white/5 text-[#9aa3b2] hover:border-white/10'
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Comment */}
                <div>
                  <p className="text-xs text-[#9aa3b2] mb-2">Fikringiz</p>
                  <textarea
                    value={uploadComment}
                    onChange={(e) => setUploadComment(e.target.value)}
                    placeholder="Mahsulot haqida fikringizni yozing..."
                    className="w-full p-3 rounded-xl bg-white/[0.03] border border-white/10 text-white text-sm placeholder:text-[#3f4658] focus:outline-none focus:border-[#d6b47c]/30 resize-none h-20"
                  />
                </div>

                {/* Bonus info */}
                <div className="rounded-xl bg-[#d6b47c]/5 border border-[#d6b47c]/20 p-3">
                  <p className="text-[11px] text-[#9aa3b2]">
                    📸 Foto sharh uchun <span className="text-[#d6b47c] font-semibold">+15 ball</span> olasiz!
                  </p>
                </div>

                <button
                  onClick={handleUploadSubmit}
                  disabled={uploadImages.length === 0}
                  className="w-full py-3 rounded-xl bg-[#d6b47c] text-black font-semibold text-sm hover:bg-[#c9a46d] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  Yuborish
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
