import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Edit, Trash2, Eye, X, Youtube, Link, Image, Tag, Package, Upload } from 'lucide-react';
import toast from 'react-hot-toast';
import { uploadVideoToAppwrite } from '../utils/appwrite';

const AdminReels = () => {
  const [reels, setReels] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingReel, setEditingReel] = useState(null);
  const [videoFile, setVideoFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    videoUrl: '',
    duration: 0,
    category: 'new-arrivals',
    taggedProducts: [],
    isActive: true
  });

  // Fetch reels
  const fetchReels = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/reels?limit=100');
      if (response.data.success) {
        setReels(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching reels:', error);
      toast.error('Reellarni yuklashda xatolik');
    } finally {
      setLoading(false);
    }
  };

  // Fetch products for tagging
  const fetchProducts = async () => {
    try {
      const response = await axios.get('/api/products?limit=100');
      if (response.data.success) {
        setProducts(response.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  useEffect(() => {
    fetchReels();
    fetchProducts();
  }, []);

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title || (!formData.videoUrl && !videoFile)) {
      toast.error('Sarlavha va video kiritilishi shart');
      return;
    }

    try {
      setIsUploading(true);
      let finalVideoUrl = formData.videoUrl;

      // Upload to Appwrite if file selected
      if (videoFile) {
        toast.loading('Video Appwrite\'ga yuklanmoqda...', { id: 'admin-upload' });
        try {
          finalVideoUrl = await uploadVideoToAppwrite(videoFile);
          toast.success('Video yuklandi!', { id: 'admin-upload' });
        } catch (err) {
          toast.error('Xatolik: ' + err.message, { id: 'admin-upload' });
          setIsUploading(false);
          return;
        }
      }

      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      const payload = { ...formData, videoUrl: finalVideoUrl };

      if (editingReel) {
        await axios.put(`/api/reels/${editingReel._id}`, payload, { headers });
        toast.success('Reel yangilandi!');
      } else {
        await axios.post('/api/reels', payload, { headers });
        toast.success('Reel qo\'shildi!');
      }

      setShowForm(false);
      setEditingReel(null);
      setVideoFile(null);
      resetForm();
      fetchReels();
    } catch (error) {
      console.error('Error saving reel:', error);
      toast.error('Xatolik yuz berdi');
    } finally {
      setIsUploading(false);
    }
  };

  // Handle delete
  const handleDelete = async (id) => {
    if (!window.confirm('Haqiqatan ham bu reelli o\'chirmoqchimisiz?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`/api/reels/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Reel o\'chirildi!');
      fetchReels();
    } catch (error) {
      console.error('Error deleting reel:', error);
      toast.error('Xatolik yuz berdi');
    }
  };

  // Handle edit
  const handleEdit = (reel) => {
    setEditingReel(reel);
    setFormData({
      title: reel.title,
      description: reel.description || '',
      videoUrl: reel.videoUrl,
      duration: reel.duration || 0,
      category: reel.category,
      taggedProducts: reel.taggedProducts?.map(p => p._id) || [],
      isActive: reel.isActive
    });
    setShowForm(true);
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      videoUrl: '',
      duration: 0,
      category: 'new-arrivals',
      taggedProducts: [],
      isActive: true
    });
  };

  // Handle product selection
  const toggleProduct = (productId) => {
    setFormData(prev => ({
      ...prev,
      taggedProducts: prev.taggedProducts.includes(productId)
        ? prev.taggedProducts.filter(id => id !== productId)
        : [...prev.taggedProducts, productId]
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-400"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {showForm ? (
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-6 border border-slate-700">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Youtube className="w-5 h-5 text-amber-400" />
              {editingReel ? 'Reelni tahrirlash' : 'Yangi reel qo\'shish'}
            </h2>
            <button
              onClick={() => {
                setShowForm(false);
                setEditingReel(null);
                resetForm();
              }}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <X size={24} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Sarlavha *</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-amber-500"
                placeholder="Reel sarlavhasi"
                maxLength={100}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Tavsif</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-amber-500"
                placeholder="Reel haqida qisqa ma'lumot"
                rows={3}
                maxLength={500}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                <Upload size={16} className="text-amber-400" />
                Video Yuklash (Appwrite)
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="file"
                  accept="video/*"
                  onChange={(e) => setVideoFile(e.target.files[0])}
                  className="flex-1 px-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-amber-500 text-sm file:mr-4 file:py-1 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-amber-600 file:text-white hover:file:bg-amber-700"
                />
                {videoFile && (
                  <button 
                    type="button" 
                    onClick={() => setVideoFile(null)}
                    className="p-2 text-red-400 hover:text-red-300 transition-colors"
                  >
                    <X size={18} />
                  </button>
                )}
              </div>
              {videoFile && (
                <p className="text-[10px] text-amber-500 mt-1 ml-1">Tanlandi: {videoFile.name}</p>
              )}
            </div>

            <div className="relative py-2">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-700"></div>
              </div>
              <div className="relative flex justify-center text-[10px] uppercase font-bold text-slate-500 bg-[#0f111a] px-2">yoki</div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Video URL *</label>
              <div className="relative">
                <Link className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="url"
                  value={formData.videoUrl}
                  onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                  className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-amber-500"
                  placeholder="https://ik.imagekit.io/..."
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">ImageKit, YouTube yoki Appwrite video linkini kiriting</p>
            </div>





            <div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-4 h-4 rounded border-slate-600 text-amber-500 focus:ring-amber-500"
                />
                <span className="text-sm text-gray-300">Aktiv (saytda ko'rsatish)</span>
              </label>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                className="flex-1 bg-amber-600 hover:bg-amber-700 text-white font-medium py-2.5 px-4 rounded-lg transition-colors"
              >
                {editingReel ? 'Saqlash' : 'Qo\'shish'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditingReel(null);
                  resetForm();
                }}
                className="px-6 py-2.5 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
              >
                Bekor qilish
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Youtube className="w-5 h-5 text-amber-400" />
              Reels ({reels.length})
            </h2>
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-white font-medium py-2.5 px-4 rounded-lg transition-colors"
            >
              <Plus size={20} />
              Yangi reel
            </button>
          </div>

          {reels.length === 0 ? (
            <div className="text-center py-20 bg-slate-900/50 rounded-2xl border border-slate-700">
              <Youtube className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">Reels yo'q</h3>
              <p className="text-gray-400 mb-4">Hali hech qanday reel qo'shilmagan</p>
              <button
                onClick={() => setShowForm(true)}
                className="bg-amber-600 hover:bg-amber-700 text-white font-medium py-2.5 px-6 rounded-lg transition-colors"
              >
                Birinchi reelli qo'shing
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {reels.map((reel) => (
                <div
                  key={reel._id}
                  className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl overflow-hidden border border-slate-700 hover:border-amber-500/50 transition-all"
                >
                  <div className="aspect-video relative bg-slate-900 flex items-center justify-center">
                    {reel.thumbnailUrl ? (
                      <img
                        src={reel.thumbnailUrl}
                        alt={reel.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Youtube className="w-12 h-12 text-slate-700" />
                    )}
                    {!reel.isActive && (
                      <div className="absolute top-2 right-2 bg-black/70 text-red-400 text-xs px-2 py-1 rounded-full">
                        Noaktiv
                      </div>
                    )}
                    <div className="absolute bottom-2 left-2 flex gap-2">
                      {reel.category && (
                        <span className="bg-amber-600 text-white text-xs px-2 py-1 rounded-full">
                          {reel.category}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="p-4">
                    <h3 className="font-semibold text-white mb-1 truncate">{reel.title}</h3>
                    {reel.description && (
                      <p className="text-sm text-gray-400 mb-3 line-clamp-2">{reel.description}</p>
                    )}

                    <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
                      <span>👁️ {reel.views || 0}</span>
                      <span>❤️ {reel.likes?.length || 0}</span>
                      <span>📤 {reel.shares || 0}</span>
                    </div>

                    {reel.taggedProducts && reel.taggedProducts.length > 0 && (
                      <div className="text-xs text-gray-500 mb-3">
                        <Tag size={12} className="inline mr-1" />
                        {reel.taggedProducts.length} mahsulot bog'langan
                      </div>
                    )}

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => window.open(`/reels`, '_blank')}
                        className="flex-1 flex items-center justify-center gap-1 bg-slate-700 hover:bg-slate-600 text-white text-sm py-2 rounded-lg transition-colors"
                      >
                        <Eye size={16} />
                        Ko'rish
                      </button>
                      <button
                        onClick={() => handleEdit(reel)}
                        className="flex-1 flex items-center justify-center gap-1 bg-amber-600 hover:bg-amber-700 text-white text-sm py-2 rounded-lg transition-colors"
                      >
                        <Edit size={16} />
                        Tahrirlash
                      </button>
                      <button
                        onClick={() => handleDelete(reel._id)}
                        className="p-2 bg-red-600/20 hover:bg-red-600/40 text-red-400 rounded-lg transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminReels;