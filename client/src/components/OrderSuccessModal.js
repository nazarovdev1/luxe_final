import React from 'react';
import { CheckCircle, ArrowRight, ShoppingBag, Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';

const OrderSuccessModal = ({ isOpen, onClose, orderId, isMobile = false }) => {
    const navigate = useNavigate();
    const { t } = useLanguage();

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center px-4 overflow-hidden">
            {/* Backdrop */}
            <div 
                className="absolute inset-0 bg-black/90 backdrop-blur-md animate-in fade-in duration-500"
                onClick={onClose}
            />

            {/* Modal Content */}
            <div className={`relative w-full ${isMobile ? 'max-w-sm' : 'max-w-md'} bg-[#0a0a0a] border border-white/10 rounded-[40px] p-8 shadow-[0_0_100px_rgba(214,180,124,0.15)] animate-in zoom-in-95 fade-in duration-500`}>
                {/* Ambient Glow */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-40 bg-[#d6b47c]/20 blur-[60px] rounded-full -translate-y-1/2" />

                <div className="text-center relative z-10">
                    <div className="mx-auto w-24 h-24 rounded-full bg-[#d6b47c]/10 border border-[#d6b47c]/20 flex items-center justify-center mb-8 animate-bounce-slow">
                        <CheckCircle className="w-12 h-12 text-[#d6b47c]" />
                    </div>

                    <h2 className="text-3xl font-brilliant text-white mb-4 tracking-tight">{t('checkoutPage.thankYou')}</h2>
                    <p className="text-gray-400 text-sm mb-2 font-medium">{t('checkoutPage.orderSuccess')}</p>
                    {orderId && (
                        <p className="text-[10px] font-black text-[#d6b47c] uppercase tracking-[0.2em] mb-10">
                            ID: #{orderId.slice(-8).toUpperCase()}
                        </p>
                    )}

                    <div className="space-y-4">
                        <button
                            onClick={() => {
                                onClose();
                                navigate(isMobile ? '/mobile/orders' : '/orders');
                            }}
                            className="w-full py-4 bg-white text-black text-xs font-black tracking-[0.2em] rounded-2xl flex items-center justify-center gap-3 active:scale-[0.98] transition-all shadow-[0_10px_30px_rgba(255,255,255,0.1)]"
                        >
                            BUYURTMALARIM
                            <ShoppingBag className="w-4 h-4" />
                        </button>

                        <button
                            onClick={() => {
                                onClose();
                                navigate(isMobile ? '/mobile' : '/');
                            }}
                            className="w-full py-4 bg-white/[0.03] border border-white/10 text-white text-xs font-black tracking-[0.2em] rounded-2xl flex items-center justify-center gap-3 active:scale-[0.98] transition-all"
                        >
                            ASOSIY SAHIFA
                            <Home className="w-4 h-4" />
                        </button>
                    </div>

                    <p className="mt-8 text-[10px] text-gray-600 font-medium leading-relaxed italic">
                        Operatorlarimiz tez orada siz bilan bog'lanishadi
                    </p>
                </div>
            </div>

            <style>{`
                @keyframes bounce-slow {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-10px); }
                }
                .animate-bounce-slow {
                    animation: bounce-slow 3s ease-in-out infinite;
                }
            `}</style>
        </div>
    );
};

export default OrderSuccessModal;
