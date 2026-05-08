import React from 'react';
import { X, Search, SlidersHorizontal, Check } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

const FilterDrawer = ({
  isOpen,
  onClose,
  categories,
  selectedCategory,
  onCategoryChange,
  searchText,
  onSearchChange,
  sortBy,
  onSortChange
}) => {
  const { t } = useLanguage();
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />
      
      {/* Drawer */}
      <div className="relative w-full max-w-md h-full bg-[#0a0a0b] border-l border-white/10 shadow-2xl animate-page-slide-right flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-white/5">
          <h2 className="text-xl font-semibold text-[#f5f5f3]">Filtrlash</h2>
          <button 
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/5 text-[#6b6b6e] hover:text-[#f5f5f3] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
          {/* Search */}
          <div className="space-y-3">
            <label className="text-xs uppercase tracking-[0.2em] text-[#6b6b6e] font-medium">{t('common.search')}</label>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6b6b6e]" />
              <input 
                type="text"
                value={searchText}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Mahsulot nomini kiriting..."
                className="w-full bg-[#141416] border border-white/5 rounded-xl py-3 pl-12 pr-4 text-sm text-[#f5f5f3] focus:outline-none focus:border-[#c9a96e] transition-colors"
              />
            </div>
          </div>
          
          {/* Categories */}
          <div className="space-y-3">
            <label className="text-xs uppercase tracking-[0.2em] text-[#6b6b6e] font-medium">{t('common.filter')}</label>
            <div className="grid grid-cols-1 gap-2">
              {categories.map((cat) => (
                <button
                  key={cat.name}
                  onClick={() => onCategoryChange(cat.name)}
                  className={`flex items-center justify-between px-4 py-3 rounded-xl border transition-all ${
                    selectedCategory === cat.name
                      ? 'bg-[#c9a96e]/10 border-[#c9a96e] text-[#c9a96e]'
                      : 'bg-[#141416] border-white/5 text-[#8a8a8d] hover:border-white/20'
                  }`}
                >
                  <span className="text-sm font-medium">{cat.name}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-xs opacity-60">{cat.count}</span>
                    {selectedCategory === cat.name && <Check className="w-4 h-4" />}
                  </div>
                </button>
              ))}
            </div>
          </div>
          
          {/* Sort By */}
          <div className="space-y-3">
            <label className="text-xs uppercase tracking-[0.2em] text-[#6b6b6e] font-medium">Saralash</label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: 'Featured', value: 'featured' },
                { label: 'Yangi', value: 'newest' },
                { label: 'Reyting', value: 'rating' },
                { label: 'Arzon', value: 'price-low' },
                { label: 'Qimmat', value: 'price-high' }
              ].map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => onSortChange(opt.value)}
                  className={`px-4 py-3 rounded-xl border text-sm font-medium transition-all ${
                    sortBy === opt.value
                      ? 'bg-[#c9a96e]/10 border-[#c9a96e] text-[#c9a96e]'
                      : 'bg-[#141416] border-white/5 text-[#8a8a8d] hover:border-white/20'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>
        
        <div className="p-6 border-t border-white/5">
          <button 
            onClick={onClose}
            className="w-full py-4 rounded-xl bg-[#c9a96e] text-[#0a0a0b] font-bold hover:bg-[#d4b87a] transition-all shadow-xl shadow-[#c9a96e]/10"
          >
            Natijalarni ko'rish
          </button>
        </div>
      </div>
    </div>
  );
};

export default FilterDrawer;
