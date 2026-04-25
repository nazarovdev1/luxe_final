import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { useProducts } from '../contexts/ProductContext';
import { Search, X, Gem, TrendingUp, Package, ArrowUpRight } from 'lucide-react';

const SearchModal = ({ isOpen, onClose }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const { products } = useProducts();
  const navigate = useNavigate();

  // Search logic
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setSearchResults([]);
      return;
    }

    const filtered = products.filter(product =>
      product.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setSearchResults(filtered);
  }, [searchQuery, products]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, onClose]);

  const handleProductClick = (productId) => {
    navigate(`/product/${productId}`);
    onClose();
    setSearchQuery('');
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  // Use Portal to render outside root hierarchy to cover Navbar
  if (typeof document === 'undefined') return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] bg-black/68 backdrop-blur-md animate-in fade-in duration-300"
      onClick={handleOverlayClick}
    >
      <div className="absolute top-[74px] right-4 md:right-6 lg:right-[420px] w-[92vw] max-w-[430px] max-h-[82vh] overflow-hidden rounded-[26px] bg-gradient-to-br from-[#0f1626]/96 via-[#111a2b]/97 to-[#0a111d]/95 shadow-[0_30px_70px_rgba(0,0,0,0.62)] animate-in fade-in zoom-in duration-300">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_10%,rgba(244,241,235,0.12),transparent_30%),radial-gradient(circle_at_90%_16%,rgba(141,155,184,0.18),transparent_36%),radial-gradient(circle_at_16%_96%,rgba(214,180,124,0.1),transparent_30%)]" />
        <div className="pointer-events-none absolute inset-y-0 left-0 w-px bg-gradient-to-b from-transparent via-[#f4f1eb]/35 to-transparent" />

        <div className="relative p-4 sm:p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#f4f1eb]/10">
                <Search className="h-4 w-4 text-[#f4f1eb]" />
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-[0.22em] text-[#9aa3b2]">Editorial Search</p>
                <h2 className="text-lg font-semibold text-[#f4f1eb] leading-tight">Qidirish</h2>
              </div>
            </div>
            <button
              onClick={onClose}
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#171f31]/85 text-[#9aa3b2] hover:bg-[#1f2940] hover:text-[#f4f1eb] transition-colors"
              aria-label="Qidiruvni yopish"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#c7ceda] w-4 h-4" />
            <input
              type="text"
              placeholder="Mahsulot nomini kiriting..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-[48px] pl-10 pr-3 rounded-xl bg-[#0a1221]/90 text-[#f4f1eb] text-sm placeholder:text-[#8f98a8] shadow-[inset_0_1px_0_rgba(255,255,255,0.1)] focus:outline-none focus:ring-2 focus:ring-[#f4f1eb]/50"
              autoFocus
            />
            <kbd className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md bg-[#202a40] px-1.5 py-0.5 text-[10px] text-[#c7ceda]">
              ESC
            </kbd>
          </div>

          <div className="mt-4 h-px w-full bg-gradient-to-r from-transparent via-[#9aa3b2]/35 to-transparent" />
        </div>

        <div className="relative max-h-[45vh] overflow-y-auto px-4 pb-4 sm:px-5">
          {searchQuery.trim() === '' ? (
            <div className="rounded-2xl bg-gradient-to-br from-[#131c2e] to-[#0f1626] p-6 text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
              <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#f4f1eb]/10">
                <Search className="h-7 w-7 text-[#f4f1eb]" />
              </div>
              <h3 className="text-[#f4f1eb] font-semibold text-base mb-1">Mavsumiy Topilmalar</h3>
              <p className="text-[#9aa3b2] text-sm">Mahsulot topish uchun nomini yozing</p>

              <div className="mt-6 flex flex-wrap justify-center gap-2.5">
                {['Ko\'ylak', 'Libos', 'Yubka'].map((term) => (
                  <button
                    key={term}
                    onClick={() => setSearchQuery(term)}
                    className="inline-flex items-center gap-1.5 rounded-full bg-[#202a40] px-4 py-2 text-sm text-[#c7ceda] hover:bg-[#283550] hover:text-[#f4f1eb] transition-colors"
                  >
                    <TrendingUp className="w-3 h-3" />
                    {term}
                  </button>
                ))}
              </div>
            </div>
          ) : searchResults.length === 0 ? (
            <div className="rounded-2xl bg-gradient-to-br from-[#141d2f] to-[#0f1626] p-10 text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
              <div className="w-20 h-20 mx-auto mb-5 rounded-2xl bg-[#f4f1eb]/8 flex items-center justify-center">
                <Package className="w-9 h-9 text-[#9aa3b2]" />
              </div>
              <h3 className="text-[#f4f1eb] font-semibold text-lg mb-2">Natija topilmadi</h3>
              <p className="text-[#9aa3b2]">"{searchQuery}" uchun mahsulot topilmadi</p>
            </div>
          ) : (
            <div className="pt-1 pb-2">
              <div className="mb-3 px-1 flex items-center gap-2">
                <span className="text-sm text-[#c7ceda] font-medium">{searchResults.length} ta natija</span>
                <div className="flex-1 h-px bg-gradient-to-r from-[#9aa3b2]/35 to-transparent" />
              </div>
              <div className="space-y-2">
                {searchResults.map((product) => (
                  <div
                    key={product.id}
                    onClick={() => handleProductClick(product.id)}
                    className="group flex items-center gap-3 p-3 rounded-2xl bg-gradient-to-br from-[#141d2f] to-[#0f1626] cursor-pointer shadow-[inset_0_1px_0_rgba(255,255,255,0.07)] hover:from-[#19243a] hover:to-[#121b2c] transition-colors"
                  >
                    <div className="relative shrink-0">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-14 h-14 object-cover rounded-xl shadow-[0_8px_16px_rgba(2,6,16,0.45)]"
                      />
                    </div>
                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                      <div className="flex items-center gap-2 mb-0.5">
                        {product.badge && (
                          <span className={`shrink-0 text-[9px] px-1.5 py-0.5 rounded uppercase font-semibold tracking-wider ${product.badge === 'NEW'
                            ? 'bg-[#2d3442] text-[#f4f1eb]'
                            : 'bg-[#f4f1eb] text-[#111827]'
                            }`}>
                            {product.badge}
                          </span>
                        )}
                        <h3 className="text-[#f4f1eb] font-medium truncate">
                          {product.name}
                        </h3>
                      </div>
                      <p className="text-[#9aa3b2] text-xs">{product.category}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-[#f4f1eb] font-semibold text-sm">{product.price}</div>
                      <span className="inline-flex items-center gap-1 text-[11px] text-[#c7ceda] mt-0.5">
                        Ko'rish <ArrowUpRight className="h-3 w-3" />
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="relative p-4 bg-[#0b111e]/80">
          <div className="h-px w-full mb-3 bg-gradient-to-r from-transparent via-[#9aa3b2]/35 to-transparent" />
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-[#9aa3b2]">
              <kbd className="px-2 py-1 bg-[#1c263b] rounded-lg text-[10px] text-[#c7ceda]">ESC</kbd>
              <span>yopish</span>
            </div>
            <div className="flex items-center gap-2 text-[#9aa3b2]">
              <kbd className="px-2 py-1 bg-[#1c263b] rounded-lg text-[10px] text-[#c7ceda]">ENTER</kbd>
              <span>tanlash</span>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default SearchModal;
