import React, { useState, useEffect, useRef } from 'react';
import { Rnd } from 'react-rnd';
import { 
    Plus, 
    Trash2, 
    Layers, 
    RotateCw, 
    Save, 
    Download, 
    ChevronLeft, 
    ShoppingBag, 
    Image as ImageIcon,
} from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import html2canvas from 'html2canvas';
import { useNavigate, Navigate } from 'react-router-dom';
import SEO from '../components/SEO';
import { useAuth } from '../contexts/AuthContext';

const LookbookBuilder = () => {
    const navigate = useNavigate();
    const { token, isAuthenticated, isLoading: authLoading } = useAuth();
    const canvasRef = useRef(null);
    const [lookName, setLookName] = useState('Mening yangi obrazim');
    const [activeTab, setActiveTab] = useState('wardrobe'); // 'wardrobe' or 'favorites'
    const [wardrobeItems, setWardrobeItems] = useState([]);
    const [favorites, setFavorites] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [canvasItems, setCanvasItems] = useState([]);
    const [selectedItemId, setSelectedItemId] = useState(null);
    const [isSaving, setIsSaving] = useState(false);

    // Fetch wardrobe and favorites
    useEffect(() => {
        const fetchData = async () => {
            try {
                setIsLoading(true);
                const config = {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                };

                const [wardrobeRes, favoritesRes] = await Promise.all([
                    axios.get('/api/lookbooks/wardrobe', config),
                    axios.get('/api/products?featured=true') // This might not need auth
                ]);

                if (wardrobeRes.data.success) {
                    setWardrobeItems(wardrobeRes.data.data);
                }
                
                if (favoritesRes.data.success) {
                    setFavorites(favoritesRes.data.data.slice(0, 10));
                }
            } catch (error) {
                console.error('Data fetch error:', error);
                toast.error('Ma\'lumotlarni yuklashda xatolik');
            } finally {
                setIsLoading(false);
            }
        };

        if (isAuthenticated && token) {
            fetchData();
        }
    }, [isAuthenticated, token]);

    if (authLoading) return null;
    if (!isAuthenticated) return <Navigate to="/login" replace />;

    const addToCanvas = (product) => {
        const newItem = {
            id: Date.now().toString(),
            product: product._id,
            image: product.images?.[0]?.url || product.image,
            name: product.name,
            x: 50,
            y: 50,
            width: 250,
            height: 250,
            scale: 1,
            rotation: 0,
            zIndex: canvasItems.length + 1
        };
        setCanvasItems([...canvasItems, newItem]);
        setSelectedItemId(newItem.id);
    };

    const removeFromCanvas = (id) => {
        setCanvasItems(canvasItems.filter(item => item.id !== id));
        if (selectedItemId === id) setSelectedItemId(null);
    };

    const updateItem = (id, updates) => {
        setCanvasItems(canvasItems.map(item => 
            item.id === id ? { ...item, ...updates } : item
        ));
    };

    const bringToFront = (id) => {
        const maxZ = Math.max(...canvasItems.map(i => i.zIndex), 0);
        updateItem(id, { zIndex: maxZ + 1 });
    };

    const saveLookbook = async () => {
        if (canvasItems.length === 0) {
            toast.error('Kamida bitta kiyim qo\'shing');
            return;
        }

        try {
            setIsSaving(true);
            const items = canvasItems.map(item => ({
                product: item.product,
                x: item.x,
                y: item.y,
                scale: item.scale,
                rotation: item.rotation,
                zIndex: item.zIndex
            }));

            const response = await axios.post('/api/lookbooks', {
                name: lookName,
                items
            }, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            if (response.data.success) {
                toast.success('Obraz muvaffaqiyatli saqlandi');
            }
        } catch (error) {
            console.error('Save error:', error);
            toast.error('Saqlashda xatolik yuz berdi');
        } finally {
            setIsSaving(false);
        }
    };

    const downloadAsImage = async () => {
        if (!canvasRef.current) return;
        
        const originalSelectedId = selectedItemId;
        setSelectedItemId(null);
        
        setTimeout(async () => {
            try {
                const canvas = await html2canvas(canvasRef.current, {
                    backgroundColor: '#0a0a0a',
                    useCORS: true,
                    scale: 2,
                    logging: false
                });
                
                const link = document.createElement('a');
                link.download = `${lookName}.png`;
                link.href = canvas.toDataURL('image/png');
                link.click();
                toast.success('Rasm yuklab olindi');
            } catch (error) {
                console.error('Download error:', error);
                toast.error('Rasm yuklashda xatolik');
            } finally {
                setSelectedItemId(originalSelectedId);
            }
        }, 100);
    };

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col pt-20">
            <SEO title="Lookbook Builder - Shaxsiy obraz yaratish" description="O'zingiz sotib olgan kiyimlardan yangi obrazlar yarating." />
            
            {/* Header Controls */}
            <div className="h-16 border-b border-[#2a2a2a] bg-[#111111] flex items-center justify-between px-6 shrink-0">
                <div className="flex items-center gap-4">
                    <button 
                        onClick={() => navigate('/lookbooks')}
                        className="p-2 hover:bg-[#2a2a2a] rounded-full transition-colors"
                    >
                        <ChevronLeft className="w-5 h-5 text-[#d6b47c]" />
                    </button>
                    <input 
                        type="text" 
                        value={lookName}
                        onChange={(e) => setLookName(e.target.value)}
                        className="bg-transparent border-none focus:ring-0 text-lg font-medium text-[#d6b47c] w-64 outline-none"
                        placeholder="Obraz nomi..."
                    />
                </div>
                
                <div className="flex items-center gap-3">
                    <button 
                        onClick={downloadAsImage}
                        className="flex items-center gap-2 px-4 py-2 border border-[#2a2a2a] rounded-lg hover:bg-[#2a2a2a] transition-colors text-sm"
                    >
                        <Download className="w-4 h-4" />
                        <span className="hidden sm:inline">Yuklab olish</span>
                    </button>
                    <button 
                        onClick={saveLookbook}
                        disabled={isSaving}
                        className="flex items-center gap-2 px-6 py-2 bg-[#d6b47c] text-[#0a0a0a] rounded-lg font-semibold hover:bg-[#e8c98a] transition-colors text-sm disabled:opacity-50"
                    >
                        <Save className="w-4 h-4" />
                        <span>{isSaving ? 'Saqlanmoqda...' : 'Saqlash'}</span>
                    </button>
                </div>
            </div>

            <div className="flex-1 flex overflow-hidden">
                {/* Sidebar */}
                <aside className="w-20 sm:w-80 border-r border-[#2a2a2a] bg-[#111111] flex flex-col shrink-0">
                    <div className="flex border-b border-[#2a2a2a]">
                        <button 
                            onClick={() => setActiveTab('wardrobe')}
                            className={`flex-1 py-4 text-[10px] sm:text-xs uppercase tracking-widest font-bold transition-colors ${activeTab === 'wardrobe' ? 'text-[#d6b47c] border-b-2 border-[#d6b47c]' : 'text-gray-500'}`}
                        >
                            <span className="hidden sm:inline">Mening shkafim</span>
                            <ShoppingBag className="sm:hidden mx-auto w-5 h-5" />
                        </button>
                        <button 
                            onClick={() => setActiveTab('favorites')}
                            className={`flex-1 py-4 text-[10px] sm:text-xs uppercase tracking-widest font-bold transition-colors ${activeTab === 'favorites' ? 'text-[#d6b47c] border-b-2 border-[#d6b47c]' : 'text-gray-500'}`}
                        >
                            <span className="hidden sm:inline">Sevimlilar</span>
                            <ImageIcon className="sm:hidden mx-auto w-5 h-5" />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-2 sm:p-4 custom-scrollbar">
                        {isLoading ? (
                            <div className="flex items-center justify-center h-full">
                                <div className="w-6 h-6 border-2 border-[#d6b47c] border-t-transparent rounded-full animate-spin"></div>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                                {(activeTab === 'wardrobe' ? wardrobeItems : favorites).map((item) => (
                                    <div 
                                        key={item._id}
                                        className="group relative aspect-square bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg sm:rounded-xl overflow-hidden cursor-pointer hover:border-[#d6b47c] transition-all"
                                        onClick={() => addToCanvas(item)}
                                    >
                                        <img 
                                            src={item.images?.[0] || item.image} 
                                            alt={item.name}
                                            className="w-full h-full object-contain p-2 group-hover:scale-110 transition-transform"
                                            loading="lazy"
                                        />
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                            <Plus className="w-6 h-6 text-[#d6b47c]" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                        {!isLoading && (activeTab === 'wardrobe' ? wardrobeItems : favorites).length === 0 && (
                            <div className="flex flex-col items-center justify-center h-full text-center text-gray-500 px-4">
                                <ShoppingBag className="w-8 h-8 sm:w-12 sm:h-12 mb-4 opacity-20" />
                                <p className="text-xs sm:text-sm">Hozircha kiyimlar yo'q</p>
                            </div>
                        )}
                    </div>
                </aside>

                {/* Main Canvas Area */}
                <main className="flex-1 relative bg-[#0a0a0a] overflow-hidden">
                    {/* Canvas Grid Background */}
                    <div 
                        className="absolute inset-0 opacity-[0.02] pointer-events-none"
                        style={{
                            backgroundImage: 'linear-gradient(#d6b47c 1px, transparent 1px), linear-gradient(90deg, #d6b47c 1px, transparent 1px)',
                            backgroundSize: '40px 40px'
                        }}
                    />

                    <div 
                        ref={canvasRef}
                        className="relative w-full h-full flex items-center justify-center overflow-hidden"
                        onClick={() => setSelectedItemId(null)}
                    >
                        {canvasItems.length === 0 && (
                            <div className="text-center z-0 px-6">
                                <div className="w-20 h-20 bg-[#111111] rounded-full flex items-center justify-center mx-auto mb-6 border border-[#2a2a2a]">
                                    <ImageIcon className="w-8 h-8 text-[#d6b47c]/40" />
                                </div>
                                <h3 className="text-xl text-gray-300 font-medium">Obraz yaratishni boshlang</h3>
                                <p className="text-gray-500 text-sm mt-2 max-w-xs mx-auto">Chap tomondagi shkafingizdan kiyimlarni tanlab, kanvasga joylashtiring.</p>
                            </div>
                        )}

                        {canvasItems.map((item) => (
                            <Rnd
                                key={item.id}
                                size={{ width: item.width, height: item.height }}
                                position={{ x: item.x, y: item.y }}
                                onDragStop={(e, d) => updateItem(item.id, { x: d.x, y: d.y })}
                                onResizeStop={(e, direction, ref, delta, position) => {
                                    updateItem(item.id, {
                                        width: parseInt(ref.style.width),
                                        height: parseInt(ref.style.height),
                                        ...position
                                    });
                                }}
                                style={{ 
                                    zIndex: item.zIndex,
                                    border: selectedItemId === item.id ? '1px solid #d6b47c' : '1px solid transparent',
                                    borderRadius: '4px'
                                }}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedItemId(item.id);
                                }}
                                bounds="parent"
                                dragHandleClassName="drag-handle"
                            >
                                <div className="relative group w-full h-full drag-handle cursor-move">
                                    <img 
                                        src={item.image} 
                                        alt={item.name}
                                        className="w-full h-full object-contain pointer-events-none select-none"
                                        style={{ 
                                            transform: `rotate(${item.rotation}deg)`,
                                            filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.5))'
                                        }}
                                    />
                                    
                                    {selectedItemId === item.id && (
                                        <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-[#111111] border border-[#2a2a2a] rounded-lg p-1 flex items-center gap-1 shadow-2xl z-[1000]">
                                            <button 
                                                onClick={(e) => { e.stopPropagation(); updateItem(item.id, { rotation: (item.rotation - 15) % 360 }); }}
                                                className="p-2 hover:bg-[#2a2a2a] rounded text-gray-400 hover:text-[#d6b47c] transition-colors"
                                                title="Chapga aylantirish"
                                            >
                                                <RotateCw className="w-4 h-4 transform -scale-x-100" />
                                            </button>
                                            <button 
                                                onClick={(e) => { e.stopPropagation(); updateItem(item.id, { rotation: (item.rotation + 15) % 360 }); }}
                                                className="p-2 hover:bg-[#2a2a2a] rounded text-gray-400 hover:text-[#d6b47c] transition-colors"
                                                title="O'ngga aylantirish"
                                            >
                                                <RotateCw className="w-4 h-4" />
                                            </button>
                                            <div className="w-px h-4 bg-[#2a2a2a] mx-1" />
                                            <button 
                                                onClick={(e) => { e.stopPropagation(); bringToFront(item.id); }}
                                                className="p-2 hover:bg-[#2a2a2a] rounded text-gray-400 hover:text-[#d6b47c] transition-colors"
                                                title="Oldinga o'tkazish"
                                            >
                                                <Layers className="w-4 h-4" />
                                            </button>
                                            <button 
                                                onClick={(e) => { e.stopPropagation(); removeFromCanvas(item.id); }}
                                                className="p-2 hover:bg-[#2a2a2a] rounded text-red-500/70 hover:text-red-500 transition-colors"
                                                title="O'chirish"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </Rnd>
                        ))}
                    </div>
                </main>
            </div>

            {/* Custom CSS */}
            <style dangerouslySetInnerHTML={{ __html: `
                .custom-scrollbar::-webkit-scrollbar {
                    width: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #2a2a2a;
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #d6b47c;
                }
            `}} />
        </div>
    );
};

export default LookbookBuilder;
