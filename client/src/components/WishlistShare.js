import React, { useState } from 'react';
import { Share2, Copy, CheckCircle, Eye, Heart, X, Link2, Gift } from 'lucide-react';

const WishlistShare = ({ favorites = [], userName = 'Foydalanuvchi' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [shareMethod, setShareMethod] = useState(null);
  const [shareAsGiftList, setShareAsGiftList] = useState(false);

  const wishlistCode = Buffer.from(`wl_${Date.now()}`).toString('base64').slice(0, 10).toLowerCase();
  const shareUrl = `${window.location.origin}/wishlist/${wishlistCode}`;
  const displayName = userName || 'Foydalanuvchi';

  const shareText = shareAsGiftList
    ? `🎁 ${displayName} ning sovg'a ro'yxati! Eng yaxshi sovg'ani tanlang: ${shareUrl}`
    : `💝 ${displayName} ning sevimli mahsulotlari LUXX.UZ da: ${shareUrl}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleShare = (method) => {
    setShareMethod(method);
    switch (method) {
      case 'telegram':
        window.open(`https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`, '_blank');
        break;
      case 'whatsapp':
        window.open(`https://wa.me/?text=${encodeURIComponent(shareText)}`, '_blank');
        break;
      case 'copy':
        navigator.clipboard.writeText(shareText);
        break;
      default:
        break;
    }
    setTimeout(() => setShareMethod(null), 2000);
  };

  const itemCount = favorites.length;

  return (
    <>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#d6b47c]/10 border border-[#d6b47c]/20 text-[#d6b47c] text-sm font-medium hover:bg-[#d6b47c]/20 hover:border-[#d6b47c]/30 transition-all"
      >
        <Share2 className="w-4 h-4" />
        Ulashish
      </button>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setIsOpen(false)} />
          <div className="relative z-10 w-full max-w-md rounded-[2rem] border border-white/10 bg-gradient-to-b from-[#11131e] to-[#0d0f18] overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-white/5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#d6b47c]/10 border border-[#d6b47c]/20 flex items-center justify-center">
                  <Heart className="w-5 h-5 text-[#d6b47c]" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-[#f4f1eb]">Sevimlilarim</h3>
                  <p className="text-[11px] text-[#9aa3b2]">{itemCount} ta mahsulot</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-white/10 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-5">
              {/* Preview */}
              <div className="rounded-xl bg-white/[0.03] border border-white/5 p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-[#d6b47c]/10 flex items-center justify-center text-sm font-bold text-[#d6b47c]">
                    {displayName.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#f4f1eb]">{displayName} ning tanlovlari</p>
                    <p className="text-[10px] text-[#9aa3b2]">LUXX.UZ premium kolleksiyadan</p>
                  </div>
                </div>
                {/* Mini product grid */}
                <div className="grid grid-cols-4 gap-1.5">
                  {favorites.slice(0, 8).map((item, idx) => (
                    <div key={idx} className="aspect-square rounded-lg overflow-hidden border border-white/5 bg-[#0d1423]">
                      {item.images?.[0] ? (
                        <img src={item.images[0]} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Heart className="w-4 h-4 text-[#3f4658]" />
                        </div>
                      )}
                    </div>
                  ))}
                  {itemCount > 8 && (
                    <div className="aspect-square rounded-lg bg-white/[0.03] border border-white/5 flex items-center justify-center">
                      <span className="text-xs text-[#9aa3b2]">+{itemCount - 8}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Gift List Toggle */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/5">
                <div className="flex items-center gap-3">
                  <Gift className="w-4 h-4 text-[#d6b47c]" />
                  <div>
                    <p className="text-xs font-medium text-[#f4f1eb]">Sovg'a ro'yxati sifatida</p>
                    <p className="text-[10px] text-[#9aa3b2]">Do'stlaringizga sovg'a sifatida ko'rsating</p>
                  </div>
                </div>
                <button
                  onClick={() => setShareAsGiftList(!shareAsGiftList)}
                  className={`relative w-11 h-6 rounded-full transition-colors ${shareAsGiftList ? 'bg-[#d6b47c]' : 'bg-[#2d3442]'}`}
                >
                  <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${shareAsGiftList ? 'translate-x-5' : ''}`} />
                </button>
              </div>

              {/* Share Link */}
              <div>
                <p className="text-xs text-[#9aa3b2] mb-2">Havola</p>
                <div className="flex items-center gap-2">
                  <div className="flex-1 flex items-center gap-2 px-3 py-2.5 rounded-xl bg-[#0d1423] border border-white/5 overflow-hidden">
                    <Link2 className="w-4 h-4 text-[#d6b47c] flex-shrink-0" />
                    <span className="text-xs text-[#f4f1eb] truncate">{shareUrl}</span>
                  </div>
                  <button
                    onClick={handleCopy}
                    className={`flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-medium transition-all flex-shrink-0 ${
                      copied
                        ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
                        : 'bg-white/5 border border-white/10 text-[#f4f1eb] hover:bg-white/10'
                    }`}
                  >
                    {copied ? <CheckCircle className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {/* Share Buttons */}
              <div>
                <p className="text-xs text-[#9aa3b2] mb-2">Yoki orqali ulashing</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleShare('telegram')}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium transition-all ${
                      shareMethod === 'telegram'
                        ? 'bg-[#2AABEE]/20 border border-[#2AABEE]/30 text-[#2AABEE]'
                        : 'bg-[#2AABEE]/5 border border-[#2AABEE]/15 text-[#2AABEE]/80 hover:bg-[#2AABEE]/10'
                    }`}
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.479.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                    </svg>
                    Telegram
                  </button>
                  <button
                    onClick={() => handleShare('whatsapp')}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium transition-all ${
                      shareMethod === 'whatsapp'
                        ? 'bg-[#25D366]/20 border border-[#25D366]/30 text-[#25D366]'
                        : 'bg-[#25D366]/5 border border-[#25D366]/15 text-[#25D366]/80 hover:bg-[#25D366]/10'
                    }`}
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                    </svg>
                    WhatsApp
                  </button>
                  <button
                    onClick={() => handleShare('copy')}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium transition-all ${
                      shareMethod === 'copy'
                        ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
                        : 'bg-white/5 border border-white/10 text-[#f4f1eb] hover:bg-white/10'
                    }`}
                  >
                    {shareMethod === 'copy' ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    {shareMethod === 'copy' ? 'Nusxalandi!' : 'Matn nusxa'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default WishlistShare;
