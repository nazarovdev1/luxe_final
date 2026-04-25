import React, { useEffect, useState } from 'react';
import {
  CheckCircle,
  Clock,
  Mail,
  MapPin,
  Phone,
  Send,
  Shield,
  Gem,
  Truck,
  User,
  MessageSquare,
  X,
  XCircle,
  ArrowUpRight,
} from 'lucide-react';

const API_BASE = process.env.REACT_APP_API_URL || 'http://127.0.0.1:3003/api';

const CONTACT_METHODS = [
  {
    id: 'phone',
    title: 'Telefon',
    value: '+998 88 429 99 69',
    href: 'tel:+998884299969',
    icon: Phone,
    tone: 'from-emerald-500/25 to-emerald-700/25 border-emerald-300/20 text-emerald-100',
  },
  {
    id: 'telegram',
    title: 'Telegram',
    value: '@luxeecommercebot',
    href: 'https://t.me/luxeecommercebot',
    icon: Send,
    tone: 'from-sky-500/25 to-blue-700/25 border-sky-300/20 text-sky-100',
  },
  {
    id: 'email',
    title: 'Email',
    value: 'support@luxx.uz',
    href: 'mailto:support@luxx.uz',
    icon: Mail,
    tone: 'from-amber-500/25 to-orange-700/25 border-amber-300/20 text-amber-100',
  },
];

const TRUST_NOTES = [
  { icon: Truck, text: 'Toshkent bo\'ylab tez yetkazish' },
  { icon: Shield, text: 'Xavfsiz xarid va maxfiylik himoyasi' },
  { icon: Clock, text: 'Har kuni: 09:00 - 22:00' },
  { icon: Gem, text: 'Premium service support' },
];

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [showErrorToast, setShowErrorToast] = useState(false);

  useEffect(() => {
    if (!showSuccessToast) return;
    const timer = setTimeout(() => setShowSuccessToast(false), 4000);
    return () => clearTimeout(timer);
  }, [showSuccessToast]);

  useEffect(() => {
    if (!showErrorToast) return;
    const timer = setTimeout(() => setShowErrorToast(false), 4000);
    return () => clearTimeout(timer);
  }, [showErrorToast]);

  const handleChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const sendToTelegram = async (name, phone, message) => {
    const response = await fetch(`${API_BASE}/contact`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, phone, message }),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || 'Server error');
    }

    return result;
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (!formData.name.trim() || !formData.phone.trim() || !formData.message.trim()) {
        setShowErrorToast(true);
        return;
      }

      const phoneRegex = /^[\+]?[0-9\-\s\(\)]{7,15}$/;
      if (!phoneRegex.test(formData.phone.trim())) {
        setShowErrorToast(true);
        return;
      }

      await sendToTelegram(formData.name.trim(), formData.phone.trim(), formData.message.trim());

      setShowSuccessToast(true);
      setFormData({ name: '', phone: '', message: '' });
    } catch (error) {
      console.error('Error submitting form:', error);
      setShowErrorToast(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="contact" className="relative overflow-hidden bg-[#05070c] py-16 sm:py-20">
      <div className="pointer-events-none absolute -top-20 left-1/2 h-64 w-[46rem] -translate-x-1/2 rounded-full bg-[#d6b47c]/20 blur-3xl" />
      <div className="pointer-events-none absolute top-52 -left-20 h-64 w-64 rounded-full bg-[#1e3a6b]/25 blur-3xl" />
      <div className="pointer-events-none absolute bottom-10 -right-16 h-72 w-72 rounded-full bg-[#7a5a2a]/20 blur-3xl" />

      <div className="relative mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-[2rem] border border-white/10 bg-gradient-to-br from-[#121726]/95 via-[#0f1424]/95 to-[#121a2d]/95 p-6 sm:p-8 lg:p-10">
          <div className="grid gap-8 lg:grid-cols-[1.1fr_1fr] lg:items-end">
            <div>
              <p className="inline-flex items-center gap-2 rounded-full border border-[#d6b47c]/40 bg-[#d6b47c]/10 px-3 py-1 text-xs uppercase tracking-[0.22em] text-[#f4deb5]">
                <Gem className="h-3.5 w-3.5" />
                Contact Atelier
              </p>
              <h2 className="mt-4 text-3xl leading-tight text-[#f4f1eb] sm:text-5xl font-semibold">
                Biz bilan bog'laning
                <br />
              </h2>
              <p className="mt-4 max-w-2xl text-sm sm:text-base text-neutral-300 leading-relaxed">
                Buyurtma, o'lcham, yetkazish yoki premium tavsiya bo'yicha savol bo'lsa,
                jamoamiz qisqa vaqt ichida javob qaytaradi.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {TRUST_NOTES.map(item => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.text}
                    className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-neutral-200"
                  >
                    <Icon className="mb-2 h-4 w-4 text-[#d6b47c]" />
                    {item.text}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_1.05fr]">
            <div className="space-y-6">
              <div className="rounded-3xl border border-white/10 bg-black/25 p-5 sm:p-6">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-xl font-semibold text-[#f4f1eb]">Direct aloqalar</h3>
                  <span className="text-xs uppercase tracking-[0.2em] text-neutral-400">24/7 online</span>
                </div>

                <div className="mt-5 space-y-3">
                  {CONTACT_METHODS.map(method => {
                    const Icon = method.icon;
                    const external = method.href.startsWith('http');

                    return (
                      <a
                        key={method.id}
                        href={method.href}
                        target={external ? '_blank' : undefined}
                        rel={external ? 'noreferrer' : undefined}
                        className={`group flex items-center justify-between gap-4 rounded-2xl border bg-gradient-to-r px-4 py-3 transition-all hover:translate-x-1 ${method.tone}`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/20 bg-black/25">
                            <Icon className="h-5 w-5" />
                          </span>
                          <div className="min-w-0">
                            <p className="text-xs uppercase tracking-wide text-neutral-300">{method.title}</p>
                            <p className="text-base font-semibold text-white truncate">{method.value}</p>
                          </div>
                        </div>
                        <ArrowUpRight className="h-4 w-4 text-neutral-200 group-hover:text-white" />
                      </a>
                    );
                  })}
                </div>
              </div>

              <div className="overflow-hidden rounded-3xl border border-white/10 bg-black/25">
                <div className="flex items-center gap-2 border-b border-white/10 px-5 py-3 text-sm text-neutral-200">
                  <MapPin className="h-4 w-4 text-[#d6b47c]" />
                  Toshkent, O'zbekiston
                </div>
                <iframe
                  title="Luxx.uz manzil"
                  src="https://www.openstreetmap.org/export/embed.html?bbox=69.1803%2C41.2646%2C69.3200%2C41.3500&layer=mapnik&marker=41.2995%2C69.2401"
                  className="h-56 w-full border-0"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-black/30 p-6 sm:p-7">
              <h3 className="text-2xl font-semibold text-[#f4f1eb]">Xabar yuboring</h3>
              <p className="mt-2 text-sm text-neutral-400">Formani to'ldiring, jamoamiz siz bilan bog'lanadi.</p>

              <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                <div>
                  <label className="mb-2 block text-sm text-neutral-300">Ismingiz</label>
                  <div className="relative">
                    <User className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Ismingizni kiriting"
                      className="h-12 w-full rounded-xl border border-white/15 bg-white/[0.03] pl-11 pr-4 text-white placeholder:text-neutral-500 outline-none transition-colors focus:border-[#d6b47c]/70"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm text-neutral-300">Telefon raqam</label>
                  <div className="relative">
                    <Phone className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="+998 90 123 45 67"
                      className="h-12 w-full rounded-xl border border-white/15 bg-white/[0.03] pl-11 pr-4 text-white placeholder:text-neutral-500 outline-none transition-colors focus:border-[#d6b47c]/70"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm text-neutral-300">Xabaringiz</label>
                  <div className="relative">
                    <MessageSquare className="pointer-events-none absolute left-4 top-4 h-4 w-4 text-neutral-500" />
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      rows={5}
                      placeholder="Savolingizni yozing..."
                      className="w-full resize-none rounded-xl border border-white/15 bg-white/[0.03] pl-11 pr-4 py-3 text-white placeholder:text-neutral-500 outline-none transition-colors focus:border-[#d6b47c]/70"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#d6b47c] to-[#ad7f3b] text-[#0f1117] font-semibold transition-transform hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSubmitting ? (
                    <span className="h-5 w-5 animate-spin rounded-full border-2 border-[#0f1117] border-t-transparent" />
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      Yuborish
                    </>
                  )}
                </button>

                <p className="flex items-center justify-center gap-2 text-xs text-neutral-500">
                  <Shield className="h-3.5 w-3.5" />
                  Sizning ma'lumotlaringiz xavfsiz saqlanadi.
                </p>
              </form>
            </div>
          </div>
        </div>
      </div>

      {showSuccessToast && (
        <div className="fixed bottom-4 right-4 z-50 flex items-center gap-3 rounded-xl border border-emerald-300/30 bg-emerald-600 px-5 py-3 text-white shadow-2xl">
          <CheckCircle className="h-5 w-5" />
          <div>
            <p className="text-sm font-semibold">Xabar yuborildi</p>
            <p className="text-xs opacity-90">Tez orada siz bilan bog'lanamiz.</p>
          </div>
          <button onClick={() => setShowSuccessToast(false)}>
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {showErrorToast && (
        <div className="fixed bottom-4 right-4 z-50 flex items-center gap-3 rounded-xl border border-rose-300/30 bg-rose-600 px-5 py-3 text-white shadow-2xl">
          <XCircle className="h-5 w-5" />
          <div>
            <p className="text-sm font-semibold">Xatolik yuz berdi</p>
            <p className="text-xs opacity-90">Iltimos formani to'g'ri to'ldiring.</p>
          </div>
          <button onClick={() => setShowErrorToast(false)}>
            <X className="h-4 w-4" />
          </button>
        </div>
      )}
    </section>
  );
};

export default Contact;
