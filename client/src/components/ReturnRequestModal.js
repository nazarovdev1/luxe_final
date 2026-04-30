import React, { useState } from 'react';
import { X, RotateCcw, RefreshCw, AlertCircle, CheckCircle, Camera, ChevronDown } from 'lucide-react';

const RETURN_REASONS = [
  { value: 'size', label: "O'lcham mos kelmayapti", icon: '📏' },
  { value: 'color', label: 'Rang farq qiladi', icon: '🎨' },
  { value: 'defect', label: 'Nuqson bor', icon: '⚠️' },
  { value: 'not_match', label: "Rasmdagidan farq qiladi", icon: '🖼️' },
  { value: 'changed_mind', label: "Fikrim o'zgarib qoldi", icon: '🤷' },
  { value: 'other', label: 'Boshqa sabab', icon: '📝' },
];

const RETURN_TYPES = [
  {
    value: 'refund',
    label: 'Pulni qaytarish',
    description: "To'lov kartangizga qaytariladi",
    icon: '💰',
    timeline: '3-5 ish kuni',
  },
  {
    value: 'exchange',
    label: 'Almashtirish',
    description: "Boshqa o'lcham yoki rangga almashtiring",
    icon: '🔄',
    timeline: '5-7 ish kuni',
  },
  {
    value: 'store_credit',
    label: 'Do\'kon balansi',
    description: 'Do\'kon hisobingizga qo\'shiladi (+10% bonus)',
    icon: '🏪',
    timeline: '1-2 ish kuni',
  },
];

const ReturnRequestModal = ({ order, onClose }) => {
  const [step, setStep] = useState(1); // 1: select items, 2: reason, 3: type, 4: confirm
  const [selectedItems, setSelectedItems] = useState([]);
  const [reason, setReason] = useState('');
  const [customReason, setCustomReason] = useState('');
  const [returnType, setReturnType] = useState('');
  const [photos, setPhotos] = useState([]);
  const [comment, setComment] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [returnId, setReturnId] = useState('');

  const toggleItem = (idx) => {
    setSelectedItems((prev) =>
      prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx]
    );
  };

  const handlePhotoUpload = (e) => {
    const files = Array.from(e.target.files || []);
    if (photos.length + files.length > 5) return;
    setPhotos((prev) => [...prev, ...files].slice(0, 5));
  };

  const removePhoto = (idx) => {
    setPhotos((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = () => {
    const id = 'RET-' + Date.now().toString(36).toUpperCase();
    setReturnId(id);
    setSubmitted(true);

    // In production, this would call an API:
    // await axios.post('/api/returns', { orderId: order._id, items: selectedItems, reason, returnType, comment, photos });
  };

  const canProceedStep1 = selectedItems.length > 0;
  const canProceedStep2 = reason && (reason !== 'other' || customReason.trim().length > 0);
  const canSubmit = returnType && canProceedStep2;

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('uz-UZ', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  };

  const formatPrice = (val) => Number(val || 0).toLocaleString();

  // Check if order is within return window (14 days)
  const orderDate = new Date(order.createdAt);
  const daysSinceOrder = Math.floor((Date.now() - orderDate.getTime()) / (1000 * 60 * 60 * 24));
  const isWithinReturnWindow = daysSinceOrder <= 14;
  const daysRemaining = 14 - daysSinceOrder;

  if (!isWithinReturnWindow && !submitted) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
        <div className="relative z-10 w-full max-w-md rounded-[2rem] border border-white/10 bg-gradient-to-b from-[#11131e] to-[#0d0f18] p-8 text-center">
          <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-400" />
          </div>
          <h3 className="text-xl font-semibold text-[#f4f1eb] mb-2">Qaytarish muddati o'tgan</h3>
          <p className="text-sm text-[#9aa3b2] mb-6">
            Buyurtma qilinganiga {daysSinceOrder} kun o'tdi. Qaytarish oynasi 14 kun bilan cheklangan.
          </p>
          <button
            onClick={onClose}
            className="px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm hover:bg-white/10 transition-colors"
          >
            Yopish
          </button>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
        <div className="relative z-10 w-full max-w-md rounded-[2rem] border border-white/10 bg-gradient-to-b from-[#11131e] to-[#0d0f18] p-8 text-center">
          <div className="w-20 h-20 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-5">
            <CheckCircle className="w-10 h-10 text-emerald-400" />
          </div>
          <h3 className="text-2xl font-semibold text-[#f4f1eb] mb-2">So'rov yuborildi!</h3>
          <p className="text-sm text-[#9aa3b2] mb-4">
            Qaytarish so'rovingiz muvaffaqiyatli qabul qilindi
          </p>
          <div className="rounded-xl bg-white/[0.03] border border-white/5 p-4 mb-6">
            <p className="text-xs text-[#9aa3b2] mb-1">So'rov raqami</p>
            <p className="text-lg font-bold text-[#d6b47c]">{returnId}</p>
          </div>
          <div className="space-y-2 text-left mb-6">
            <p className="text-xs text-[#9aa3b2]">📌 Keyingi qadamlar:</p>
            <ul className="text-xs text-[#9aa3b2] space-y-1.5 pl-4">
              <li>• 24 soat ichida tasdiqlash SMS keladi</li>
              <li>• Kur'er buyurtma manziliga kelib olib ketadi</li>
              <li>• Tekshiruv 1-2 ish kunida amalga oshiriladi</li>
              <li>• {returnType === 'refund' ? 'Pul 3-5 ish kunida qaytariladi' : returnType === 'exchange' ? "Yangi mahsulot 5-7 kunida yetkaziladi" : "Balans 1-2 kunida to'ldiriladi"}</li>
            </ul>
          </div>
          <button
            onClick={onClose}
            className="w-full py-3.5 rounded-xl bg-[#d6b47c] text-black font-semibold text-sm hover:bg-[#c9a46d] transition-colors"
          >
            Tushundim
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-[2rem] border border-white/10 bg-gradient-to-b from-[#11131e] to-[#0d0f18]">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between p-5 border-b border-white/5 bg-[#11131e]/95 backdrop-blur-sm rounded-t-[2rem]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#d6b47c]/10 border border-[#d6b47c]/20 flex items-center justify-center">
              <RotateCcw className="w-5 h-5 text-[#d6b47c]" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-[#f4f1eb]">Qaytarish / Almashtirish</h3>
              <p className="text-[11px] text-[#9aa3b2]">#{order._id?.slice(-8).toUpperCase()} • {daysRemaining} kun qoldi</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Progress Steps */}
        <div className="px-5 pt-4">
          <div className="flex items-center gap-2">
            {[1, 2, 3, 4].map((s) => (
              <div key={s} className="flex-1 flex items-center gap-2">
                <div className={`flex-1 h-1 rounded-full transition-colors ${
                  s <= step ? 'bg-[#d6b47c]' : 'bg-white/5'
                }`} />
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2 mb-4">
            <span className={`text-[10px] ${step >= 1 ? 'text-[#d6b47c]' : 'text-[#3f4658]'}`}>Mahsulot</span>
            <span className={`text-[10px] ${step >= 2 ? 'text-[#d6b47c]' : 'text-[#3f4658]'}`}>Sabab</span>
            <span className={`text-[10px] ${step >= 3 ? 'text-[#d6b47c]' : 'text-[#3f4658]'}`}>Tur</span>
            <span className={`text-[10px] ${step >= 4 ? 'text-[#d6b47c]' : 'text-[#3f4658]'}`}>Tasdiq</span>
          </div>
        </div>

        <div className="p-5 pt-0">
          {/* Step 1: Select Items */}
          {step === 1 && (
            <div>
              <p className="text-sm text-[#9aa3b2] mb-4">Qaysi mahsulotlarni qaytarmoqchisiz?</p>
              <div className="space-y-3">
                {order.items.map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => toggleItem(idx)}
                    className={`w-full flex items-center gap-4 p-3 rounded-xl border transition-all text-left ${
                      selectedItems.includes(idx)
                        ? 'bg-[#d6b47c]/5 border-[#d6b47c]/30'
                        : 'bg-white/[0.02] border-white/5 hover:border-white/10'
                    }`}
                  >
                    <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                      selectedItems.includes(idx)
                        ? 'bg-[#d6b47c] border-[#d6b47c]'
                        : 'border-white/20'
                    }`}>
                      {selectedItems.includes(idx) && (
                        <svg className="w-3 h-3 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                    {item.image && (
                      <img src={item.image} alt={item.name} className="w-12 h-14 rounded-lg object-cover border border-white/5" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[#f4f1eb] truncate">{item.name}</p>
                      <p className="text-[11px] text-[#9aa3b2]">
                        {item.quantity} dona
                        {item.selectedSize ? ` • ${item.selectedSize}` : ''}
                        {item.selectedColor ? ` • ${item.selectedColor}` : ''}
                      </p>
                    </div>
                    <p className="text-sm font-semibold text-[#f4f1eb]">{formatPrice(item.price)} so'm</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Reason */}
          {step === 2 && (
            <div>
              <p className="text-sm text-[#9aa3b2] mb-4">Qaytarish sababini tanlang</p>
              <div className="space-y-2.5">
                {RETURN_REASONS.map((r) => (
                  <button
                    key={r.value}
                    onClick={() => setReason(r.value)}
                    className={`w-full flex items-center gap-3 p-3.5 rounded-xl border transition-all text-left ${
                      reason === r.value
                        ? 'bg-[#d6b47c]/5 border-[#d6b47c]/30'
                        : 'bg-white/[0.02] border-white/5 hover:border-white/10'
                    }`}
                  >
                    <span className="text-xl">{r.icon}</span>
                    <span className={`text-sm font-medium ${reason === r.value ? 'text-[#d6b47c]' : 'text-[#f4f1eb]'}`}>
                      {r.label}
                    </span>
                  </button>
                ))}
              </div>

              {reason === 'other' && (
                <textarea
                  value={customReason}
                  onChange={(e) => setCustomReason(e.target.value)}
                  placeholder="Sababni batafsil yozing..."
                  className="w-full mt-4 p-3 rounded-xl bg-white/[0.03] border border-white/10 text-white text-sm placeholder:text-[#3f4658] focus:outline-none focus:border-[#d6b47c]/30 resize-none h-24"
                />
              )}

              {/* Photo Upload */}
              <div className="mt-5">
                <p className="text-xs text-[#9aa3b2] mb-2">📸 Rasm biriktirish (ixtiyoriy, maks 5 ta)</p>
                <div className="flex flex-wrap gap-2">
                  {photos.map((photo, idx) => (
                    <div key={idx} className="relative w-16 h-16 rounded-xl overflow-hidden border border-white/10">
                      <img src={URL.createObjectURL(photo)} alt="" className="w-full h-full object-cover" />
                      <button
                        onClick={() => removePhoto(idx)}
                        className="absolute top-0.5 right-0.5 w-5 h-5 rounded-full bg-black/60 flex items-center justify-center"
                      >
                        <X className="w-3 h-3 text-white" />
                      </button>
                    </div>
                  ))}
                  {photos.length < 5 && (
                    <label className="w-16 h-16 rounded-xl border border-dashed border-white/10 flex flex-col items-center justify-center cursor-pointer hover:border-white/20 transition-colors">
                      <Camera className="w-5 h-5 text-[#3f4658]" />
                      <span className="text-[9px] text-[#3f4658] mt-0.5">Yuklash</span>
                      <input type="file" accept="image/*" multiple onChange={handlePhotoUpload} className="hidden" />
                    </label>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Return Type */}
          {step === 3 && (
            <div>
              <p className="text-sm text-[#9aa3b2] mb-4">Qaytarish turini tanlang</p>
              <div className="space-y-3">
                {RETURN_TYPES.map((t) => (
                  <button
                    key={t.value}
                    onClick={() => setReturnType(t.value)}
                    className={`w-full flex items-start gap-4 p-4 rounded-xl border transition-all text-left ${
                      returnType === t.value
                        ? 'bg-[#d6b47c]/5 border-[#d6b47c]/30'
                        : 'bg-white/[0.02] border-white/5 hover:border-white/10'
                    }`}
                  >
                    <span className="text-2xl mt-0.5">{t.icon}</span>
                    <div className="flex-1">
                      <p className={`text-sm font-semibold ${returnType === t.value ? 'text-[#d6b47c]' : 'text-[#f4f1eb]'}`}>
                        {t.label}
                      </p>
                      <p className="text-[11px] text-[#9aa3b2] mt-0.5">{t.description}</p>
                      <p className="text-[10px] text-[#d6b47c]/70 mt-1">⏱ {t.timeline}</p>
                    </div>
                    {t.value === 'store_credit' && (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] text-emerald-400 font-semibold">
                        +10%
                      </span>
                    )}
                  </button>
                ))}
              </div>

              <div className="mt-5">
                <p className="text-xs text-[#9aa3b2] mb-2">Qo'shimcha izoh (ixtiyoriy)</p>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Masalan: Kattaroq o'lchamga almashtirmoqchiman..."
                  className="w-full p-3 rounded-xl bg-white/[0.03] border border-white/10 text-white text-sm placeholder:text-[#3f4658] focus:outline-none focus:border-[#d6b47c]/30 resize-none h-20"
                />
              </div>
            </div>
          )}

          {/* Step 4: Confirmation */}
          {step === 4 && (
            <div>
              <div className="rounded-xl bg-white/[0.03] border border-white/5 p-4 space-y-3">
                <div className="flex justify-between text-xs">
                  <span className="text-[#9aa3b2]">Buyurtma</span>
                  <span className="text-[#f4f1eb]">#{order._id?.slice(-8).toUpperCase()}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-[#9aa3b2]">Mahsulotlar soni</span>
                  <span className="text-[#f4f1eb]">{selectedItems.length} ta</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-[#9aa3b2]">Sabab</span>
                  <span className="text-[#f4f1eb]">{RETURN_REASONS.find((r) => r.value === reason)?.label}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-[#9aa3b2]">Qaytarish turi</span>
                  <span className="text-[#f4f1eb]">{RETURN_TYPES.find((t) => t.value === returnType)?.label}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-[#9aa3b2]">Kutilayotgan vaqt</span>
                  <span className="text-[#d6b47c]">{RETURN_TYPES.find((t) => t.value === returnType)?.timeline}</span>
                </div>
                <div className="border-t border-white/5 pt-3 flex justify-between text-sm">
                  <span className="text-[#9aa3b2]">Qaytariladigan summa</span>
                  <span className="text-[#f4f1eb] font-bold">
                    {formatPrice(
                      selectedItems.reduce((sum, idx) => sum + (order.items[idx]?.price || 0) * (order.items[idx]?.quantity || 1), 0)
                    )} so'm
                  </span>
                </div>
              </div>

              {returnType === 'store_credit' && (
                <div className="mt-3 rounded-xl bg-emerald-500/5 border border-emerald-500/20 p-3 flex items-center gap-3">
                  <span className="text-lg">🎁</span>
                  <div>
                    <p className="text-xs font-semibold text-emerald-400">+10% bonus</p>
                    <p className="text-[10px] text-[#9aa3b2]">Do'kon balansingizga qo'shimcha 10% bonus olasiz</p>
                  </div>
                </div>
              )}

              <div className="mt-4 rounded-xl bg-[#d6b47c]/5 border border-[#d6b47c]/20 p-3">
                <p className="text-[11px] text-[#9aa3b2]">
                  📌 <strong className="text-[#d6b47c]">Eslatma:</strong> Mahsulot tegishli holda (ishlatilmagan, teglar saqlanmagan) qaytarilishi kerak.
                  Kuryer sizning manzilinga kelib mahsulotni olib ketadi.
                </p>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex items-center gap-3 mt-6">
            {step > 1 && (
              <button
                onClick={() => setStep((s) => s - 1)}
                className="flex-1 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm font-medium hover:bg-white/10 transition-colors"
              >
                Ortga
              </button>
            )}
            {step < 4 ? (
              <button
                onClick={() => setStep((s) => s + 1)}
                disabled={
                  (step === 1 && !canProceedStep1) ||
                  (step === 2 && !canProceedStep2)
                }
                className="flex-1 py-3 rounded-xl bg-[#d6b47c] text-black text-sm font-semibold hover:bg-[#c9a46d] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                Davom etish
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                className="flex-1 py-3 rounded-xl bg-[#d6b47c] text-black text-sm font-semibold hover:bg-[#c9a46d] transition-colors"
              >
                So'rov yuborish
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReturnRequestModal;
