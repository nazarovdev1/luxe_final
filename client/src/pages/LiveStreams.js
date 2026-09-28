import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Radio, Clock, Users, PlayCircle, CalendarClock, Tv2, Plus, X, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import SEO from '../components/SEO';
import CommunityOpening, { CommunityChapter, useCommunityMotion } from '../components/CommunityOpening';
import { LiveStreamsSkeleton } from '../components/EventSkeletons';

const extractYouTubeId = (url) => {
  if (!url) return null;
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/);
  return match ? match[1] : null;
};

const LiveStreams = () => {
  const { isAdmin, token } = useAuth();
  const { t } = useLanguage();
  const [streams, setStreams] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const pageRef = useRef(null);
  const initialFetchRef = useRef(false);
  useCommunityMotion(pageRef);
  const navigate = useNavigate();

  const fetchStreams = async () => {
    try {
      const res = await axios.get('/api/livestreams');
      if (res.data.success) setStreams(res.data.data);
    } catch {
      toast.error(t('liveStreams.error'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (initialFetchRef.current) return;
    initialFetchRef.current = true;
    fetchStreams();
  }, []);

  const handleCreateStream = async (formData) => {
    try {
      const res = await axios.post('/api/livestreams', formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        toast.success(t('liveStreams.streamCreated'));
        setIsCreateOpen(false);
        fetchStreams();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || t('liveStreams.error'));
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      await axios.put(`/api/livestreams/${id}/status`, { status }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success(t('liveStreams.statusUpdated'));
      fetchStreams();
    } catch {
      toast.error(t('liveStreams.error'));
    }
  };

  const handleDeleteStream = async (id) => {
    if (!await window.luxeConfirm(t('liveStreams.confirmDelete'))) return;
    try {
      const response = await axios.delete(`/api/livestreams/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        toast.success(t('liveStreams.streamDeleted'));
        fetchStreams();
      }
    } catch (err) {
      console.error('Delete Error:', err.response || err);
      toast.error(err.response?.data?.message || t('liveStreams.error'));
    }
  };

  const liveStreams = streams.filter(s => s.status === 'live');
  const scheduledStreams = streams.filter(s => s.status === 'scheduled');
  const endedStreams = streams.filter(s => s.status === 'ended');

  return (
    <div ref={pageRef} className="community-page community-page--live">

      <SEO title="Jonli Efirlar — Luxe" description="Luxe jonli savdo efirlarini tomosha qiling va to'g'ridan-to'g'ri xarid qiling." />

      <CommunityOpening variant="live" description={t('liveStreams.subtitle')}>
        <span>{liveStreams.length} {t('liveStreams.liveNow')}</span>
        {isAdmin && <button type="button" onClick={() => setIsCreateOpen(true)}>+ {t('liveStreams.newStream')}</button>}
      </CommunityOpening>
      <div className="community-page__body community-content">
        <CommunityChapter variant="live" />

        {isLoading ? (
          <LiveStreamsSkeleton />
        ) : (
          <div className="space-y-24">
            {/* 🔴 LIVE NOW */}
            {liveStreams.length > 0 && (
              <section>
                <div className="flex items-center gap-4 mb-10">
                  <h2 className="text-[10px] uppercase tracking-[0.3em] text-red-500 font-black">{t('liveStreams.liveNow')}</h2>
                  <div className="flex-1 h-px bg-gradient-to-r from-red-600/20 to-transparent" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {liveStreams.map(stream => (
                    <StreamCard key={stream._id} stream={stream} isAdmin={isAdmin} onStatusChange={handleStatusChange} onDelete={handleDeleteStream} isLive t={t} />
                  ))}
                </div>
              </section>
            )}

            {/* ⏳ UPCOMING */}
            {scheduledStreams.length > 0 && (
              <section>
                <div className="flex items-center gap-4 mb-10">
                  <h2 className="text-[10px] uppercase tracking-[0.3em] text-gray-500 font-black">{t('liveStreams.scheduled')}</h2>
                  <div className="flex-1 h-px bg-gradient-to-r from-white/10 to-transparent" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {scheduledStreams.map(stream => (
                    <StreamCard key={stream._id} stream={stream} isAdmin={isAdmin} onStatusChange={handleStatusChange} onDelete={handleDeleteStream} t={t} />
                  ))}
                </div>
              </section>
            )}

            {/* 📼 ENDED */}
            {endedStreams.length > 0 && (
              <section>
                <div className="flex items-center gap-4 mb-10">
                  <h2 className="text-[10px] uppercase tracking-[0.3em] text-gray-700 font-black">{t('liveStreams.pastStreams')}</h2>
                  <div className="flex-1 h-px bg-gradient-to-r from-white/5 to-transparent" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {endedStreams.map(stream => (
                    <StreamCard key={stream._id} stream={stream} isAdmin={isAdmin} onStatusChange={handleStatusChange} onDelete={handleDeleteStream} ended t={t} />
                  ))}
                </div>
              </section>
            )}

            {streams.length === 0 && (
              <div className="live-editorial-empty">
                <div className="live-editorial-empty__signal"><i /><span>OFF AIR / 00:00</span></div>
                <div className="live-editorial-empty__copy"><span>THE NEXT LIVE EDIT</span><h3>Keyingi uchrashuv<br /><em>yo‘lda.</em></h3><p>{t('liveStreams.noStreamsHint')}</p></div>
                <div className="live-editorial-empty__frame"><span>LUXX / STUDIO</span><strong>LIVE</strong><span>SOON — 2026</span></div>
              </div>
            )}
          </div>
        )}
      </div>

      {isCreateOpen && (
        <CreateLivestreamModal
          onClose={() => setIsCreateOpen(false)}
          onSubmit={handleCreateStream}
          t={t}
        />
      )}
    </div>
  );
};

const StreamCard = ({ stream, isAdmin, onStatusChange, onDelete, isLive, ended, t }) => {
  const navigate = useNavigate();
  const ytId = extractYouTubeId(stream.videoUrl);

  const formatDate = (date) => {
    if (!date) return '';
    return new Date(date).toLocaleString('uz-UZ', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className={`live-editorial-card relative rounded-[28px] border overflow-hidden transition-all hover:scale-[1.01] ${isLive ? 'border-red-500/30 bg-red-500/5' : ended ? 'border-white/5 bg-[#111] opacity-60' : 'border-[#2a2a2a] bg-[#111]'}`}>
      {isAdmin && (
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(stream._id); }}
          className="absolute top-4 right-4 z-20 p-2 bg-red-500/20 hover:bg-red-500 text-red-500 hover:text-white rounded-xl border border-red-500/30 transition-all backdrop-blur-md group"
          title={t('liveStreams.deleteTitle')}
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
            loading="lazy"
            decoding="async"
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
            {t('liveStreams.soon')}
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
                <img src={p.images?.[0] || p.image} alt={p.name} loading="lazy" decoding="async" className="w-full h-full object-contain" />
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
              {isLive ? t('liveStreams.enterStream') : t('liveStreams.watch')}
            </button>
          )}
          {isAdmin && (
            <select
              value={stream.status}
              onChange={e => onStatusChange(stream._id, e.target.value)}
              className="px-3 py-2 bg-[#1a1a1a] border border-white/10 rounded-full text-xs text-gray-400 outline-none"
            >
              <option value="scheduled">{t('liveStreams.scheduled')}</option>
              <option value="live">{t('liveStreams.liveTag')}</option>
              <option value="ended">{t('liveStreams.ended')}</option>
            </select>
          )}
        </div>
      </div>
    </div>
  );
};

const CreateLivestreamModal = ({ onClose, onSubmit, t }) => {
  const [form, setForm] = useState({
    title: '', description: '', videoUrl: '', scheduledStartTime: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    if (!form.title || !form.videoUrl || !form.scheduledStartTime) {
      return toast.error(t('liveStreams.fillRequired'));
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
          <h2 className="text-xl font-serif">{t('liveStreams.createStream')}</h2>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full"><X className="w-5 h-5" /></button>
        </div>
        {[
          { key: 'title', label: `${t('liveStreams.streamName')} *`, placeholder: t('liveStreams.streamNamePlaceholder') },
          { key: 'videoUrl', label: `${t('liveStreams.youtubeUrl')} *`, placeholder: 'https://youtube.com/watch?v=...' },
          { key: 'description', label: t('liveStreams.description'), placeholder: t('liveStreams.descriptionPlaceholder') },
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
          <label className="block text-xs text-gray-500 mb-1.5 uppercase tracking-widest">{t('liveStreams.startTime')} *</label>
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
          {isLoading ? t('liveStreams.creating') : t('liveStreams.createButton')}
        </button>
      </div>
    </div>
  );
};

export default LiveStreams;
