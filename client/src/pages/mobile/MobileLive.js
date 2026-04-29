import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Radio, Clock, Users, PlayCircle, CalendarClock, Tv2, Plus, X, Trash2, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const extractYouTubeId = (url) => {
  if (!url) return null;
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/);
  return match ? match[1] : null;
};

const STATUS_CONFIG = {
  live: { label: '● JONLI EFIR', color: '#ef4444', bg: 'bg-red-500/10', border: 'border-red-500/30' },
  scheduled: { label: 'REJALASHTIRILGAN', color: '#d6b47c', bg: 'bg-[#d6b47c]/10', border: 'border-[#d6b47c]/30' },
  ended: { label: 'YAKUNLANDI', color: '#6b7280', bg: 'bg-gray-500/10', border: 'border-gray-500/20' },
};

const StreamCard = ({ stream, isAdmin, onDelete, onNavigate }) => {
  const videoId = extractYouTubeId(stream.videoUrl);
  const cfg = STATUS_CONFIG[stream.status] || STATUS_CONFIG.ended;

  return (
    <div className="rounded-[24px] border border-white/5 bg-white/[0.02] overflow-hidden">
      {/* Thumbnail */}
      <div className="relative aspect-video bg-black/50">
        {videoId ? (
          <img
            src={`https://img.youtube.com/vi/${videoId}/hqdefault.jpg`}
            alt={stream.title}
            className="w-full h-full object-cover opacity-80"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Tv2 className="w-10 h-10 text-gray-700" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />

        {/* Status badge */}
        <div className={`absolute top-3 left-3 px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${cfg.bg} border ${cfg.border}`} style={{ color: cfg.color }}>
          {stream.status === 'live' && <span className="inline-block w-1.5 h-1.5 rounded-full bg-red-500 mr-1.5 animate-pulse" />}
          {cfg.label}
        </div>

        {/* Admin delete */}
        {isAdmin && (
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(stream._id); }}
            className="absolute top-3 right-3 w-8 h-8 bg-black/60 backdrop-blur rounded-xl flex items-center justify-center border border-white/10"
          >
            <Trash2 className="w-3.5 h-3.5 text-red-400" />
          </button>
        )}

        {/* Play button */}
        {stream.status !== 'ended' && (
          <button
            onClick={() => onNavigate(stream._id)}
            className="absolute inset-0 flex items-center justify-center"
          >
            <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-full flex items-center justify-center border border-white/30">
              <PlayCircle className="w-6 h-6 text-white" />
            </div>
          </button>
        )}
      </div>

      {/* Info */}
      <div className="p-4">
        <h3 className="text-base font-bold text-white mb-2 line-clamp-1">{stream.title}</h3>
        {stream.description && (
          <p className="text-xs text-gray-400 mb-3 line-clamp-2">{stream.description}</p>
        )}
        <div className="flex items-center gap-4 text-[10px] text-gray-500 font-black uppercase tracking-wide">
          {stream.scheduledAt && (
            <span className="flex items-center gap-1">
              <CalendarClock className="w-3 h-3" />
              {new Date(stream.scheduledAt).toLocaleDateString('uz-UZ')}
            </span>
          )}
          {stream.viewerCount > 0 && (
            <span className="flex items-center gap-1">
              <Users className="w-3 h-3" />
              {stream.viewerCount}
            </span>
          )}
        </div>

        {stream.status !== 'ended' && (
          <button
            onClick={() => onNavigate(stream._id)}
            className={`mt-3 w-full py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
              stream.status === 'live'
                ? 'bg-red-600 text-white'
                : 'border border-[#d6b47c]/30 text-[#d6b47c] bg-[#d6b47c]/10'
            }`}
          >
            {stream.status === 'live' ? '● Jonli Efirga Kirish' : 'Xabar olish'}
          </button>
        )}
      </div>
    </div>
  );
};

const CreateStreamModal = ({ onClose, onSubmit }) => {
  const [form, setForm] = useState({ title: '', description: '', videoUrl: '', scheduledAt: '' });

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur flex items-end">
      <div className="w-full bg-[#0f0f0f] rounded-t-[32px] p-6 border-t border-white/10">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-brilliant text-white">Yangi Efir</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center">
            <X className="w-4 h-4 text-gray-400" />
          </button>
        </div>
        <div className="space-y-3">
          {['title', 'description', 'videoUrl'].map(field => (
            <div key={field}>
              <label className="text-[10px] uppercase tracking-widest text-gray-500 font-black mb-1 block">
                {field === 'title' ? 'Sarlavha' : field === 'description' ? 'Tavsif' : 'YouTube URL'}
              </label>
              <input
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-red-500/50"
                placeholder={field === 'videoUrl' ? 'https://youtube.com/...' : ''}
                value={form[field]}
                onChange={e => setForm(p => ({ ...p, [field]: e.target.value }))}
              />
            </div>
          ))}
          <div>
            <label className="text-[10px] uppercase tracking-widest text-gray-500 font-black mb-1 block">Sana</label>
            <input
              type="datetime-local"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-red-500/50"
              value={form.scheduledAt}
              onChange={e => setForm(p => ({ ...p, scheduledAt: e.target.value }))}
            />
          </div>
          <button
            onClick={() => onSubmit(form)}
            className="w-full py-3.5 bg-red-600 text-white rounded-xl font-black text-xs uppercase tracking-widest mt-2"
          >
            Efir Yaratish
          </button>
        </div>
      </div>
    </div>
  );
};

export default function MobileLive() {
  const { isAdmin, token } = useAuth();
  const navigate = useNavigate();
  const [streams, setStreams] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all');

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

  const handleCreate = async (formData) => {
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

  const handleDelete = async (id) => {
    if (!window.confirm('Haqiqatdan ham o\'chirmoqchimisiz?')) return;
    try {
      const res = await axios.delete(`/api/livestreams/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        toast.success('O\'chirildi');
        fetchStreams();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'O\'chirishda xatolik');
    }
  };

  const liveStreams = streams.filter(s => s.status === 'live');
  const scheduledStreams = streams.filter(s => s.status === 'scheduled');
  const endedStreams = streams.filter(s => s.status === 'ended');

  const filteredStreams =
    activeFilter === 'live' ? liveStreams :
    activeFilter === 'scheduled' ? scheduledStreams :
    activeFilter === 'ended' ? endedStreams :
    streams;

  const FILTERS = [
    { id: 'all', label: 'Hammasi', count: streams.length },
    { id: 'live', label: '● Jonli', count: liveStreams.length },
    { id: 'scheduled', label: 'Rejalashtirilgan', count: scheduledStreams.length },
    { id: 'ended', label: 'Yakunlangan', count: endedStreams.length },
  ];

  return (
    <div className="min-h-screen bg-[#07090f] text-white pb-24 relative overflow-hidden">
      {/* Cinematic Background Glows */}
      <div className="absolute top-0 left-1/2 w-80 h-80 bg-red-600/15 rounded-full blur-[100px] -translate-y-1/2 -translate-x-1/2" />
      <div className="absolute top-[20%] right-0 w-64 h-64 bg-[#d6b47c]/5 rounded-full blur-[80px] translate-x-1/3" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-red-900/5 rounded-full blur-[120px] translate-y-1/3 -translate-x-1/4" />

      {isCreateOpen && <CreateStreamModal onClose={() => setIsCreateOpen(false)} onSubmit={handleCreate} />}

      <div className="relative z-10">
        {/* Header */}
        <div className="px-5 pt-10 pb-6">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-400 mb-10 active:scale-90 transition-transform">
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm font-medium uppercase tracking-widest">Orqaga</span>
          </button>

          <div className="flex items-center justify-between">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-red-500/30 bg-red-500/10 text-red-500 mb-4 backdrop-blur-xl">
                <Radio className="w-3.5 h-3.5 animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em]">Live Arena</span>
              </div>
              <h1 className="text-6xl font-brilliant text-white leading-none">
                Live <span className="text-red-600">Arena</span>
              </h1>
            </div>

            {isAdmin && (
              <button
                onClick={() => setIsCreateOpen(true)}
                className="w-14 h-14 bg-red-600 text-white rounded-[24px] flex items-center justify-center shadow-xl shadow-red-600/20 active:scale-90 transition-all"
              >
                <Plus className="w-8 h-8" />
              </button>
            )}
          </div>
          
          <p className="text-base text-gray-400 mt-6 leading-relaxed max-w-[300px]">
            Ekskluziv <span className="text-white font-bold">fashion shoularni</span> jonli efirda tomosha qiling va xarid qiling.
          </p>
        </div>

        {/* Live indicator */}
        {liveStreams.length > 0 && (
          <div className="flex items-center gap-2 mb-4 px-3 py-2 bg-red-500/10 border border-red-500/20 rounded-2xl">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            <span className="text-xs text-red-400 font-black uppercase tracking-wider">{liveStreams.length} ta jonli efir davom etmoqda</span>
          </div>
        )}

        {/* Filters */}
        <div className="flex gap-2 overflow-x-auto scrollbar-hide mb-5 pb-1">
          {FILTERS.map(f => (
            <button
              key={f.id}
              onClick={() => setActiveFilter(f.id)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${
                activeFilter === f.id
                  ? 'bg-red-600 text-white'
                  : 'bg-white/5 text-gray-500 border border-white/5'
              }`}
            >
              {f.label} {f.count > 0 && `(${f.count})`}
            </button>
          ))}
        </div>

        {/* Stream list */}
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-48 rounded-[24px] bg-white/5 animate-pulse" />
            ))}
          </div>
        ) : filteredStreams.length === 0 ? (
          <div className="text-center py-16">
            <Tv2 className="w-14 h-14 text-gray-800 mx-auto mb-4" />
            <h3 className="text-lg text-gray-500">Efirlar yo'q</h3>
            {isAdmin && (
              <button onClick={() => setIsCreateOpen(true)} className="mt-4 px-6 py-3 bg-red-600 text-white rounded-xl text-xs font-black uppercase tracking-widest">
                Efir Qo'shish
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredStreams.map(stream => (
              <StreamCard
                key={stream._id}
                stream={stream}
                isAdmin={isAdmin}
                onDelete={handleDelete}
                onNavigate={(id) => navigate(`/mobile/live/${id}`)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
