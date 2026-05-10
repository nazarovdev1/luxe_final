import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ShoppingBag, Users, Send, ArrowLeft, Radio, Trash2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { io } from 'socket.io-client';

const extractYouTubeId = (url) => {
  if (!url) return null;
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/);
  return match ? match[1] : null;
};

const LiveStreamView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated, isAdmin, token } = useAuth();
  const { addToCart } = useCart();
  const [stream, setStream] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [newMsg, setNewMsg] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const socket = useRef();
  const chatEndRef = useRef(null);

  useEffect(() => {
    const fetchStream = async () => {
      try {
        const res = await axios.get(`/api/livestreams/${id}`);
        if (res.data.success) setStream(res.data.data);
      } catch {
        toast.error('Efir topilmadi');
        navigate('/live');
      } finally {
        setIsLoading(false);
      }
    };

    const fetchChatHistory = async () => {
      try {
        const res = await axios.get(`/api/live-chat/${id}`);
        if (res.data.success) setChatMessages(res.data.data);
      } catch (err) {
        console.error('Chat history error:', err);
      }
    };

    fetchStream();
    fetchChatHistory();

    // Socket setup
    const socketUrl = process.env.NODE_ENV === 'production' 
      ? window.location.origin 
      : 'http://localhost:3003';
    
    socket.current = io(socketUrl);
    socket.current.emit('join_stream', id);

    socket.current.on('receive_message', (msg) => {
      setChatMessages(prev => [...prev, msg]);
    });

    socket.current.on('message_deleted', (msgId) => {
      setChatMessages(prev => prev.filter(m => m._id !== msgId));
    });

    return () => {
      if (socket.current) socket.current.disconnect();
    };
  }, [id, navigate]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) return toast.error('Chat uchun tizimga kiring');
    if (!newMsg.trim()) return;

    try {
      const res = await axios.post(`/api/live-chat/${id}`, 
        { text: newMsg },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data.success) {
        socket.current.emit('send_message', {
          streamId: id,
          ...res.data.data
        });
        setNewMsg('');
      }
    } catch (err) {
      toast.error('Xabar yuborishda xatolik');
    }
  };

  const handleDeleteMessage = async (msgId) => {
    if (!window.confirm('Xabarni o\'chirmoqchimisiz?')) return;

    try {
      const res = await axios.delete(`/api/live-chat/${msgId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.data.success) {
        socket.current.emit('delete_message', { streamId: id, messageId: msgId });
        toast.success('Xabar o\'chirildi');
      }
    } catch (err) {
      toast.error('Xabarni o\'chirishda xatolik');
    }
  };

  const handleAddToCart = (product) => {
    addToCart(product);
    toast.success(`${product.name} savatchaga qo'shildi!`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!stream) return null;

  const ytId = extractYouTubeId(stream.videoUrl);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col">
      {/* Top Bar */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-[#0a0a0a]/90 backdrop-blur-xl border-b border-white/5 px-4 py-3 flex items-center gap-4">
        <button onClick={() => navigate('/live')} className="p-2 hover:bg-white/5 rounded-full">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="font-bold truncate">{stream.title}</h1>
          <div className="flex items-center gap-3 text-xs text-gray-500">
            {stream.status === 'live' && (
              <span className="flex items-center gap-1 text-red-400">
                <Radio className="w-3 h-3" /> LIVE
              </span>
            )}
            <span className="flex items-center gap-1">
              <Users className="w-3 h-3" /> {stream.viewersCount || 0} tomosha
            </span>
          </div>
        </div>
      </div>

      <div className="pt-16 flex flex-col lg:flex-row h-screen">
        {/* Left: Video + Products */}
        <div className="flex-1 flex flex-col">
          {/* Video */}
          <div className="relative bg-black aspect-video w-full">
            {ytId ? (
              <iframe
                src={`https://www.youtube.com/embed/${ytId}?autoplay=1&mute=1`}
                className="w-full h-full"
                allow="autoplay; encrypted-media"
                allowFullScreen
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-600">
                <div className="text-center">
                  <Radio className="w-16 h-16 mx-auto mb-4 text-red-500/30" />
                  <p>Efir URL mavjud emas</p>
                </div>
              </div>
            )}

            {stream.status === 'live' && (
              <div className="absolute top-4 left-4 flex items-center gap-2 bg-red-600 px-3 py-1.5 rounded-full">
                <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
                <span className="text-white text-xs font-black uppercase tracking-widest">LIVE</span>
              </div>
            )}
          </div>

          {/* Featured Products */}
          {stream.featuredProducts?.length > 0 && (
            <div className="p-4 border-t border-white/5">
              <p className="text-xs uppercase tracking-[0.15em] text-gray-500 font-bold mb-3">Efirdagi mahsulotlar</p>
              <div className="flex gap-3 overflow-x-auto pb-2">
                {stream.featuredProducts.map(product => (
                  <div key={product._id} className="shrink-0 w-36 bg-[#111] border border-white/5 rounded-2xl overflow-hidden hover:border-[#d6b47c]/30 transition-all">
                    <div className="aspect-square bg-white p-2">
                      <img src={product.images?.[0]?.url || product.image} className="w-full h-full object-contain" alt={product.name} />
                    </div>
                    <div className="p-3">
                      <p className="text-xs font-bold line-clamp-1 mb-1">{product.name}</p>
                      <p className="text-[10px] text-[#d6b47c] font-black mb-2">{product.price?.toLocaleString()} so'm</p>
                      <button
                        onClick={() => handleAddToCart(product)}
                        className="w-full py-1.5 bg-[#d6b47c] text-black rounded-full text-[10px] font-black hover:bg-[#e8c98a] transition-all flex items-center justify-center gap-1"
                      >
                        <ShoppingBag className="w-3 h-3" /> Sotib olish
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right: Chat */}
        <div className="w-full lg:w-80 xl:w-96 border-l border-white/5 flex flex-col bg-[#0d0d0d] h-full max-h-screen">
          <div className="p-4 border-b border-white/5">
            <h3 className="font-bold text-sm">Jonli chat</h3>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
            {chatMessages.map(msg => {
              const isOwn = user?._id === msg.user?._id;
              const canDelete = isAdmin || isOwn;
              const time = new Date(msg.createdAt).toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' });

              return (
                <div key={msg._id} className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'}`}>
                  <div className="flex items-start gap-2 max-w-[85%] group">
                    {isOwn && canDelete && (
                      <button 
                        onClick={() => handleDeleteMessage(msg._id)}
                        className="p-1.5 text-gray-600 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <div className={`rounded-2xl px-4 py-2.5 ${isOwn ? 'bg-[#d6b47c]/20 border border-[#d6b47c]/30' : 'bg-white/5 border border-white/5'}`}>
                      {!isOwn && (
                        <div className="flex items-center justify-between gap-4 mb-1">
                          <p className="text-[10px] text-[#d6b47c] font-bold">{msg.user?.username}</p>
                          {isAdmin && (
                            <button 
                              onClick={() => handleDeleteMessage(msg._id)}
                              className="p-1 text-gray-600 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      )}
                      <p className="text-sm">{msg.text}</p>
                    </div>
                  </div>
                  <p className="text-[10px] text-gray-600 mt-1">{time}</p>
                </div>
              );
            })}
            <div ref={chatEndRef} />
          </div>

          <form onSubmit={handleSendMessage} className="p-4 border-t border-white/5">
            <div className="flex gap-2">
              <input
                type="text"
                value={newMsg}
                onChange={e => setNewMsg(e.target.value)}
                placeholder={isAuthenticated ? 'Xabar yozing...' : 'Chat uchun kiring'}
                disabled={!isAuthenticated}
                className="flex-1 bg-[#1a1a1a] border border-white/5 rounded-full px-4 py-2.5 text-sm outline-none focus:border-[#d6b47c]/40 transition-all disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={!isAuthenticated || !newMsg.trim()}
                className="p-2.5 bg-[#d6b47c] text-black rounded-full hover:bg-[#e8c98a] transition-all disabled:opacity-30"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LiveStreamView;
