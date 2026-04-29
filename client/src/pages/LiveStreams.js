import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Radio, Clock, Users, PlayCircle, CalendarClock, Tv2, Plus, X, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import SEO from '../components/SEO';

const extractYouTubeId = (url) => {
  if (!url) return null;
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/);
  return match ? match[1] : null;
};

const LiveStreams = () => {
  const { isAdmin, token } = useAuth();
  const [streams, setStreams] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const navigate = useNavigate();

  const fetchStreams = async () => {
    try {
      const res = await axios.get('/api/livestreams');
      if (res.data.success) setStreams(res.data.data);
    } catch {
      toast.error('Efirlarni yuklashda xatolik');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchStreams(); }, []);

  const handleCreateStream = async (formData) => {
    try {
      const res = await axios.post('/api/livestreams', formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        toast.success('Efir yaratildi!');
        setIsCreateOpen(false);
        fetchStreams();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Xatolik');
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      await axios.put(`/api/livestreams/${id}/status`, { status }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Holat yangilandi');
      fetchStreams();
    } catch {
      toast.error('Xatolik');
    }
  };

  const handleDeleteStream = async (id) => {
    if (!window.confirm('Haqiqatdan ham ushbu efirni o\'chirmoqchimisiz?')) return;
    try {
      const response = await axios.delete(`/api/livestreams/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        toast.success('Efir o\'chirildi');
        fetchStreams();
      }
    } catch (err) {
      console.error('Delete Error:', err.response || err);
      toast.error(err.response?.data?.message || 'O\'chirishda xatolik');
    }
  };

  const liveStreams = streams.filter(s => s.status === 'live');
  const scheduledStreams = streams.filter(s => s.status === 'scheduled');
  const endedStreams = streams.filter(s => s.status === 'ended');

  return (
    <div className="min-h-screen bg-[#070707] text-white pt-32 pb-24 relative overflow-hidden">
      {/* Background Cinematic Glows - Red for Live */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-red-600/5 rounded-full blur-[120px] -translate-y-1/2" />
      <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-red-600/3 rounded-full blur-[150px] translate-y-1/2" />

      <SEO title="Jonli Efirlar — Luxe" description="Luxe jonli savdo efirlarini tomosha qiling va to'g'ridan-to'g'ri xarid qiling." />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-20 gap-10">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2.5 bg-gradient-to-r from-red-600/20 to-transparent border-l-2 border-red-600 px-4 py-2 mb-6">
              <Radio className="w-4 h-4 text-red-500 animate-pulse" />
              <span className="text-red-500 text-[10px] tracking-[0.3em] uppercase font-black">Jonli Arena</span>
            </div>
            <h1 className="text-6xl md:text-8xl font-brilliant text-white mb-6 leading-[0.9]">
              Live <span className="text-red-600">Commerce</span>
            </h1>
            <p className="text-gray-400 text-lg md:text-xl font-light leading-relaxed pt-4">
              Kiyimlarni jonli ko'rsatuv orqali ko'ring. Tanlagan mahsulotingizni efirdan chiqmasdan turib <span className="text-white font-medium italic underline decoration-red-600/40 underline-offset-4">to'g'ridan-to'g'ri xarid qiling</span>.
            </p>
          </div>
          
          <div className="flex flex-col items-end gap-6">
            {isAdmin && (
              <button
                onClick={() => setIsCreateOpen(true)}
                className="group relative px-10 py-5 bg-transparent overflow-hidden rounded-full"
              >
                <div className="absolute inset-0 bg-red-600 opacity-10 group-hover:opacity-20 transition-opacity" />
                <div className="absolute inset-0 border border-red-600/30 rounded-full" />
                <span className="relative z-10 flex items-center gap-3 text-red-500 text-sm font-black tracking-widest uppercase">
                  <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" /> Yangi efir
                </span>
              </button>
            )}
            <div className="flex items-center gap-8">
              <div className="text-right">
                <p className="text-[10px] uppercase tracking-widest text-gray-500 mb-1">Jonli tomoshabinlar</p>
                <p className="text-2xl font-brilliant text-red-500">{liveStreams.reduce((acc, s) => acc + (s.viewersCount || 0), 0)}</p>
              </div>
              <div className="w-px h-10 bg-white/10" />
              <div className="text-right">
                <p className="text-[10px] uppercase tracking-widest text-gray-500 mb-1">Kelgusi ko'rsatuvlar</p>
                <p className="text-2xl font-brilliant text-white">{scheduledStreams.length}</p>
              </div>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-32 gap-6">
            <div className="w-12 h-12 border-[3px] border-red-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-red-500 text-sm tracking-widest font-medium animate-pulse">Efir kanallari yuklanmoqda...</p>
          </div>
        ) : (
          <div className="space-y-24">
            {/* 🔴 LIVE NOW */}
            {liveStreams.length > 0 && (
              <section>
                <div className="flex items-center gap-4 mb-10">
                  <h2 className="text-[10px] uppercase tracking-[0.3em] text-red-500 font-black">Hozir Efirda</h2>
                  <div className="flex-1 h-px bg-gradient-to-r from-red-600/20 to-transparent" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {liveStreams.map(stream => (
                    <StreamCard key={stream._id} stream={stream} isAdmin={isAdmin} onStatusChange={handleStatusChange} onDelete={handleDeleteStream} isLive />
                  ))}
                </div>
              </section>
            )}

            {/* ⏳ UPCOMING */}
            {scheduledStreams.length > 0 && (
              <section>
                <div className="flex items-center gap-4 mb-10">
                  <h2 className="text-[10px] uppercase tracking-[0.3em] text-gray-500 font-black">Rejalashtirilgan</h2>
                  <div className="flex-1 h-px bg-gradient-to-r from-white/10 to-transparent" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {scheduledStreams.map(stream => (
                    <StreamCard key={stream._id} stream={stream} isAdmin={isAdmin} onStatusChange={handleStatusChange} onDelete={handleDeleteStream} />
                  ))}
                </div>
              </section>
            )}

            {/* 📼 ENDED */}
            {endedStreams.length > 0 && (
              <section>
                <div className="flex items-center gap-4 mb-10">
                  <h2 className="text-[10px] uppercase tracking-[0.3em] text-gray-700 font-black">O'tgan Efirlar</h2>
                  <div className="flex-1 h-px bg-gradient-to-r from-white/5 to-transparent" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {endedStreams.map(stream => (
                    <StreamCard key={stream._id} stream={stream} isAdmin={isAdmin} onStatusChange={handleStatusChange} onDelete={handleDeleteStream} ended />
                  ))}
                </div>
              </section>
            )}

            {streams.length === 0 && (
              <div className="text-center py-32 border border-dashed border-white/5 rounded-[40px] bg-white/[0.02]">
                <Tv2 className="w-20 h-20 text-gray-800 mx-auto mb-6 opacity-20" />
                <h3 className="text-2xl text-gray-400 font-light">Hozircha efirlar mavjud emas</h3>
                <p className="text-gray-600 mt-3 max-w-sm mx-auto">Luxx Live jamoasi tez orada yangi jonli savdo ko'rsatuvlarini boshlaydi. Bizni kuzatib boring!</p>
              </div>
            )}
          </div>
        )}
      </div>

      {isCreateOpen && (
        <CreateLivestreamModal
          onClose={() => setIsCreateOpen(false)}
          onSubmit={handleCreateStream}
        />
      )}
    </div>
  );
};

const StreamCard = ({ stream, isAdmin, onStatusChange, onDelete, isLive, ended }) => {
  const navigate = useNavigate();
  const ytId = extractYouTubeId(stream.videoUrl);

  const formatDate = (date) => {
    if (!date) return '';
    return new Date(date).toLocaleString('uz-UZ', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className={`relative rounded-[28px] border overflow-hidden transition-all hover:scale-[1.01] ${isLive ? 'border-red-500/30 bg-red-500/5' : ended ? 'border-white/5 bg-[#111] opacity-60' : 'border-[#2a2a2a] bg-[#111]'}`}>
      {isAdmin && (
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(stream._id); }}
          className="absolute top-4 right-4 z-20 p-2 bg-red-500/20 hover:bg-red-500 text-red-500 hover:text-white rounded-xl border border-red-500/30 transition-all backdrop-blur-md group"
          title="Efirni o'chirish"
        >
          <Trash2 className="w-4 h-4 group-hover:scale-110 transition-transform" />
        </button>
      )}
      <div
        className="relative aspect-video bg-black flex items-center justify-center cursor-pointer group"
        onClick={() => navigate(`/live/${stream._id}`)}
      >
        {ytId ? (
          <img
            src={`https://img.youtube.com/vi/${ytId}/mqdefault.jpg`}
            className="w-full h-full object-cover group-hover:opacity-80 transition-opacity"
            alt={stream.title}
          />
        ) : (
          <div className="w-full h-full bg-[#0a0a0a] flex items-center justify-center">
            <Tv2 className="w-12 h-12 text-gray-700" />
          </div>
        )}
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
          <PlayCircle className="w-16 h-16 text-white" />
        </div>
        {isLive && (
          <div className="absolute top-4 left-4 flex items-center gap-2 bg-red-600 px-3 py-1.5 rounded-full">
            <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
            <span className="text-white text-xs font-black uppercase tracking-widest">LIVE</span>
          </div>
        )}
        {!isLive && !ended && (
          <div className="absolute top-4 left-4 bg-[#d6b47c] text-black text-xs font-black px-3 py-1.5 rounded-full uppercase tracking-widest">
            Breda
          </div>
        )}
        {stream.viewersCount > 0 && (
          <div className="absolute top-4 right-4 flex items-center gap-1 bg-black/60 px-2 py-1 rounded-full text-xs text-white">
            <Users className="w-3 h-3" /> {stream.viewersCount}
          </div>
        )}
      </div>

      <div className="p-5">
        <h3 className="font-bold mb-1 line-clamp-1">{stream.title}</h3>
        <p className="text-xs text-gray-500 mb-3 line-clamp-2">{stream.description}</p>
        <div className="flex items-center gap-2 text-xs text-gray-500 mb-4">
          <Clock className="w-3.5 h-3.5" />
          {formatDate(stream.scheduledStartTime)}
        </div>

        {stream.featuredProducts?.length > 0 && (
          <div className="flex gap-2 flex-wrap mb-4">
            {stream.featuredProducts.slice(0, 3).map(p => (
              <div key={p._id} className="w-8 h-8 rounded-lg overflow-hidden bg-white border border-white/10" title={p.name}>
                <img src={p.images?.[0] || p.image} className="w-full h-full object-contain" />
              </div>
            ))}
            {stream.featuredProducts.length > 3 && (
              <div className="w-8 h-8 rounded-lg bg-[#d6b47c]/20 flex items-center justify-center text-[10px] font-black text-[#d6b47c]">
                +{stream.featuredProducts.length - 3}
              </div>
            )}
          </div>
        )}

        <div className="flex gap-2">
          {!ended && (
            <button
              onClick={() => navigate(`/live/${stream._id}`)}
              className={`flex-1 py-2.5 rounded-full text-sm font-bold transition-all ${isLive ? 'bg-red-600 hover:bg-red-500 text-white' : 'bg-[#d6b47c] text-black hover:bg-[#e8c98a]'}`}
            >
              {isLive ? '🔴 Efirga kirish' : 'Ko\'rish'}
            </button>
          )}
          {isAdmin && (
            <select
              value={stream.status}
              onChange={e => onStatusChange(stream._id, e.target.value)}
              className="px-3 py-2 bg-[#1a1a1a] border border-white/10 rounded-full text-xs text-gray-400 outline-none"
            >
              <option value="scheduled">Rejalashtirilgan</option>
              <option value="live">Live</option>
              <option value="ended">Tugagan</option>
            </select>
          )}
        </div>
      </div>
    </div>
  );
};

const CreateLivestreamModal = ({ onClose, onSubmit }) => {
  const [form, setForm] = useState({
    title: '', description: '', videoUrl: '', scheduledStartTime: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    if (!form.title || !form.videoUrl || !form.scheduledStartTime) {
      return toast.error('Barcha majburiy maydonlarni to\'ldiring');
    }
    setIsLoading(true);
    await onSubmit({
      title: form.title,
      description: form.description,
      videoUrl: form.videoUrl,
      scheduledStartTime: form.scheduledStartTime,
    });
    setIsLoading(false);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/90 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-[#111] border border-white/10 rounded-[28px] w-full max-w-lg p-8 shadow-2xl space-y-4">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-xl font-serif">Yangi efir yaratish</h2>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full"><X className="w-5 h-5" /></button>
        </div>
        {[
          { key: 'title', label: 'Efir nomi *', placeholder: 'Masalan: Kuzgi kolleksiya taqdimoti' },
          { key: 'videoUrl', label: 'YouTube URL *', placeholder: 'https://youtube.com/watch?v=...' },
          { key: 'description', label: 'Tavsif', placeholder: 'Efir haqida qisqacha...' },
        ].map(f => (
          <div key={f.key}>
            <label className="block text-xs text-gray-500 mb-1.5 uppercase tracking-widest">{f.label}</label>
            <input
              type="text"
              value={form[f.key]}
              onChange={e => setForm({ ...form, [f.key]: e.target.value })}
              className="w-full bg-[#1a1a1a] border border-white/5 rounded-xl p-3 text-sm outline-none focus:border-red-500/40"
              placeholder={f.placeholder}
            />
          </div>
        ))}
        <div>
          <label className="block text-xs text-gray-500 mb-1.5 uppercase tracking-widest">Boshlanish vaqti *</label>
          <input
            type="datetime-local"
            value={form.scheduledStartTime}
            onChange={e => setForm({ ...form, scheduledStartTime: e.target.value })}
            className="w-full bg-[#1a1a1a] border border-white/5 rounded-xl p-3 text-sm outline-none focus:border-red-500/40"
          />
        </div>
        <button
          onClick={handleSubmit}
          disabled={isLoading}
          className="w-full py-4 bg-red-600 hover:bg-red-500 text-white rounded-full font-black text-sm uppercase tracking-widest transition-all disabled:opacity-50 mt-2"
        >
          {isLoading ? 'Yaratilmoqda...' : 'Efir yaratish'}
        </button>
      </div>
    </div>
  );
};

export default LiveStreams;
