import React, { useState, useEffect } from 'react';
import { Eye, ShoppingBag, Zap } from 'lucide-react';

const MobileBundleSocialProof = () => {
    const [viewers, setViewers] = useState(24);
    const [purchases, setPurchases] = useState(8);

    useEffect(() => {
        const vInterval = setInterval(() => {
            setViewers(prev => Math.max(15, Math.min(65, prev + (Math.random() > 0.5 ? 1 : -1))));
        }, 5000);
        
        const pInterval = setInterval(() => {
            if (Math.random() > 0.9) setPurchases(prev => prev + 1);
        }, 15000);

        return () => {
            clearInterval(vInterval);
            clearInterval(pInterval);
        };
    }, []);

    return (
        <div className="px-5 mt-[-2rem] relative z-20 grid grid-cols-2 gap-3">
            <div className="rounded-2xl bg-white/[0.03] border border-white/5 backdrop-blur-xl p-4 flex flex-col gap-1 shadow-2xl">
                <div className="flex items-center gap-2 text-rose-400">
                    <Eye className="w-4 h-4 animate-pulse" />
                    <span className="text-lg font-black tracking-tight">{viewers}</span>
                </div>
                <p className="text-[10px] text-neutral-500 uppercase tracking-widest font-bold">Kishi ko'rmoqda</p>
            </div>

            <div className="rounded-2xl bg-white/[0.03] border border-white/5 backdrop-blur-xl p-4 flex flex-col gap-1 shadow-2xl">
                <div className="flex items-center gap-2 text-emerald-400">
                    <ShoppingBag className="w-4 h-4" />
                    <span className="text-lg font-black tracking-tight">{purchases}</span>
                </div>
                <p className="text-[10px] text-neutral-500 uppercase tracking-widest font-bold">Bugun sotib oldi</p>
            </div>

            <div className="col-span-2 rounded-2xl bg-gradient-to-r from-amber-500/10 to-transparent border border-amber-500/10 p-3 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center">
                    <Zap className="w-4 h-4 text-amber-300" />
                </div>
                <p className="text-[10px] text-amber-200/80 font-bold uppercase tracking-wider">
                    Ushbu to'plam uchun maxsus chegirma yana <span className="text-white">48 soat</span> amal qiladi
                </p>
            </div>
        </div>
    );
};

export default MobileBundleSocialProof;
