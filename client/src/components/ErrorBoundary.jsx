import React from 'react';
import { RotateCcw, Home, AlertCircle } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#07080c] flex items-center justify-center p-6 text-center relative overflow-hidden selection:bg-[#d6b47c] selection:text-black">
          {/* Ambient Glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#d6b47c]/5 blur-[160px] rounded-full pointer-events-none" />

          <div className="max-w-lg w-full p-10 md:p-14 rounded-[40px] bg-gradient-to-b from-[#14151f]/95 to-[#0b0c12]/95 border border-white/10 backdrop-blur-3xl shadow-[0_30px_100px_rgba(0,0,0,0.85)] relative overflow-hidden z-10">
            {/* Top Gold Hairline Highlight */}
            <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#d6b47c]/40 to-transparent" />

            {/* Pure Icon — No Background Box / Circle */}
            <div className="flex justify-center mb-6">
              <AlertCircle className="w-12 h-12 text-[#d6b47c] stroke-[1.25] drop-shadow-[0_0_20px_rgba(214,180,124,0.35)]" />
            </div>

            {/* Editorial Tagline */}
            <span className="text-[10px] uppercase font-black tracking-[0.35em] text-[#d6b47c] mb-3 block">
              LUXX ATELIER &bull; STATUS
            </span>

            {/* Headline */}
            <h2 className="font-serif text-2xl md:text-3xl text-white font-normal tracking-tight mb-4 leading-snug">
              Sahifani yuklashda uzilish yuz berdi
            </h2>

            {/* Description */}
            <p className="text-sm text-gray-400 font-light max-w-sm mx-auto leading-relaxed mb-10">
              Tarmoq aloqasi yoki yangilanish tufayli sahifa modulini yuklab bo‘lmadi. Iltimos, sahifani qayta yangilab ko‘ring.
            </p>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3.5 justify-center items-stretch sm:items-center">
              <button
                type="button"
                onClick={this.handleReload}
                className="inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-full bg-[#d6b47c] hover:bg-[#e4c892] text-black font-black text-xs uppercase tracking-[0.2em] transition-all duration-300 shadow-[0_10px_30px_rgba(214,180,124,0.25)] hover:scale-105 active:scale-95 cursor-pointer"
              >
                <RotateCcw className="w-4 h-4 stroke-[2.2]" />
                <span>Qayta yuklash</span>
              </button>

              <button
                type="button"
                onClick={this.handleGoHome}
                className="inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-full bg-white/[0.03] hover:bg-white/[0.08] hover:text-white text-gray-300 font-bold text-xs uppercase tracking-[0.2em] transition-all duration-300 border border-white/10 active:scale-95 cursor-pointer"
              >
                <Home className="w-4 h-4" />
                <span>Bosh sahifa</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
