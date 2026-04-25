import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AlertCircle, ArrowRight, CheckCheck, Lock, Eye, EyeOff, Phone, UserPlus } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import SEO from './SEO';

const BENEFITS = [
  'Shaxsiy tavsiya asosidagi mahsulotlar',
  "Lookbook va drop yangiliklari birinchi bo'lib",
  "Buyurtmalar holatini bir joyda kuzatish",
];

/* ─── floating‑particle canvas ─────────────────────────────────── */
const ParticleCanvas = () => {
  const canvasRef = useRef(null);
  useEffect(() => {
    const c = canvasRef.current;
    if (!c) return;
    const ctx = c.getContext('2d');
    let raf;
    const particles = [];
    const resize = () => { c.width = c.offsetWidth; c.height = c.offsetHeight; };
    resize();
    window.addEventListener('resize', resize);

    for (let i = 0; i < 45; i++) {
      particles.push({
        x: Math.random() * c.width,
        y: Math.random() * c.height,
        r: Math.random() * 1.6 + 0.4,
        dx: (Math.random() - 0.5) * 0.3,
        dy: (Math.random() - 0.5) * 0.3,
        o: Math.random() * 0.35 + 0.08,
      });
    }

    const draw = () => {
      ctx.clearRect(0, 0, c.width, c.height);
      particles.forEach((p) => {
        p.x += p.dx; p.y += p.dy;
        if (p.x < 0) p.x = c.width;
        if (p.x > c.width) p.x = 0;
        if (p.y < 0) p.y = c.height;
        if (p.y > c.height) p.y = 0;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(214,180,124,${p.o})`;
        ctx.fill();
      });
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize); };
  }, []);
  return <canvas ref={canvasRef} className="absolute inset-0 h-full w-full pointer-events-none" />;
};

/* ─── dot‑loader ───────────────────────────────────────────────── */
const DotLoader = () => (
  <span className="inline-flex items-center gap-1.5">
    {[0, 1, 2].map((i) => (
      <span
        key={i}
        className="h-1.5 w-1.5 rounded-full bg-[#0a0e1a]"
        style={{
          animation: 'pulse-dot 1s ease-in-out infinite',
          animationDelay: `${i * 120}ms`,
        }}
      />
    ))}
  </span>
);

/* ─── input field component ────────────────────────────────────── */
const FormInput = ({ icon: Icon, label, delay, mounted, ...inputProps }) => (
  <div className={`anim-fade-up ${delay} ${mounted ? '' : 'opacity-0'}`}>
    <label className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.18em] text-[#7d8699]">
      {label}
    </label>
    <div className="input-glow group relative overflow-hidden rounded-2xl border border-white/[0.06] bg-[#0c1424]/80 transition-all duration-300 hover:border-white/[0.1]">
      <div className="flex items-center gap-3 px-4 py-3.5">
        <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#d6b47c]/15 to-[#d6b47c]/5">
          <Icon className="h-3.5 w-3.5 text-[#d6b47c]/70" />
        </div>
        <input
          {...inputProps}
          className="w-full bg-transparent text-[16px] lg:text-[14px] font-light tracking-wide text-white/90 outline-none placeholder:text-[#3d4758]"
        />
      </div>
    </div>
  </div>
);

/* ─── main component ───────────────────────────────────────────── */
const RegisterForm = () => {
  const [formData, setFormData] = useState({
    username: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [mounted, setMounted] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const isMobileRoute = location.pathname.startsWith('/mobile');
  const loginLink = isMobileRoute ? '/mobile/login' : '/login';

  useEffect(() => { setMounted(true); }, []);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Parollar mos kelmaydi');
      return;
    }

    if (formData.password.length < 6) {
      setError("Parol kamida 6 ta belgidan iborat bo'lishi kerak");
      return;
    }

    setIsLoading(true);
    const result = await register(formData.username, formData.phone, formData.password);
    if (!result.success) {
      setError(result.error);
    } else {
      navigate(isMobileRoute ? '/mobile/profile' : '/');
    }
    setIsLoading(false);
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#060a14]">
      <SEO title="Ro'yxatdan o'tish" noIndex={true} />

      {/* ── inline keyframes ─────────────────────────────────────── */}
      <style>{`
        @keyframes fadeUp     { from { opacity:0; transform:translateY(28px);} to { opacity:1; transform:translateY(0);}}
        @keyframes fadeIn     { from { opacity:0; } to { opacity:1; }}
        @keyframes pulse-dot  { 0%,100%{opacity:.25;transform:scale(.8)} 50%{opacity:1;transform:scale(1.1)}}
        @keyframes shimmer    { 0%{background-position:-200% 0} 100%{background-position:200% 0}}
        @keyframes float      { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)}}
        @keyframes glow       { 0%,100%{opacity:.45} 50%{opacity:.75}}
        .anim-fade-up  { animation: fadeUp .7s cubic-bezier(.22,1,.36,1) both; }
        .anim-fade-in  { animation: fadeIn .6s ease both; }
        .delay-1 { animation-delay:.1s }
        .delay-2 { animation-delay:.18s }
        .delay-3 { animation-delay:.26s }
        .delay-4 { animation-delay:.34s }
        .delay-5 { animation-delay:.42s }
        .delay-6 { animation-delay:.5s }
        .delay-7 { animation-delay:.58s }
        .delay-8 { animation-delay:.66s }
        .input-glow:focus-within {
          box-shadow: 0 0 0 1px rgba(214,180,124,.35), 0 0 20px rgba(214,180,124,.08);
        }
      `}</style>

      {/* ── ambient blurs ─────────────────────────────────────────── */}
      <div className="pointer-events-none absolute -top-40 left-1/2 h-[500px] w-[900px] -translate-x-1/2 rounded-full bg-[#d6b47c]/[0.07] blur-[120px]" />
      <div className="pointer-events-none absolute top-1/2 -right-40 h-[400px] w-[400px] rounded-full bg-[#1e3a5f]/[0.15] blur-[100px]" style={{ animation: 'glow 6s ease-in-out infinite' }} />
      <div className="pointer-events-none absolute bottom-0 left-0 h-[400px] w-[500px] rounded-full bg-[#4a2040]/[0.12] blur-[100px]" style={{ animation: 'glow 8s ease-in-out infinite 2s' }} />

      <ParticleCanvas />

      {/* ── main grid ─────────────────────────────────────────────── */}
      <div className="relative flex min-h-screen w-full">
        <div
          className={`w-full transition-opacity duration-700 ${mounted ? 'opacity-100' : 'opacity-0'}`}
        >
          <div className="grid min-h-screen grid-cols-1 lg:grid-cols-2">

            {/* ─── LEFT  — editorial image ─────────────────────────── */}
            <section className="relative hidden lg:block">
              <img
                src="/testphoto.png"
                alt="LUXE editorial onboarding"
                className="absolute inset-0 h-full w-full object-cover"
              />
              {/* cinematic overlays */}
              <div className="absolute inset-0 bg-gradient-to-r from-[#060a14]/80 via-transparent to-[#060a14]" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#060a14] via-transparent to-[#060a14]/60" />
              <div className="absolute inset-0 mix-blend-overlay bg-gradient-to-br from-[#d6b47c]/[0.04] to-transparent" />

              <div className="relative flex h-full flex-col justify-between p-12">
                {/* top badge */}
                <div className={`anim-fade-up inline-flex w-fit items-center gap-2.5 rounded-full border border-[#d6b47c]/20 bg-black/40 px-5 py-2 backdrop-blur-md ${mounted ? '' : 'opacity-0'}`}>
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#d6b47c] opacity-50" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-[#d6b47c]" />
                  </span>
                  <span className="text-[13px] font-medium uppercase tracking-[0.25em] text-[#e8d5b0]">Yangi akkaunt</span>
                </div>

                {/* bottom area */}
                <div className={`max-w-lg ${mounted ? 'anim-fade-up delay-2' : 'opacity-0'}`}>
                  <p className="text-[13px] font-medium uppercase tracking-[0.3em] text-[#8a94a8]">Atelier Membership</p>
                  <h2 className="mt-4 text-[5rem] font-light leading-[1.05] tracking-tight text-white/95">
                    New
                    <span
                      className="font-brilliant ml-3 bg-gradient-to-r from-[#e8c87a] via-[#d6b47c] to-[#c49a5c] bg-clip-text text-transparent"
                      style={{ animation: 'float 4s ease-in-out infinite' }}
                    >
                      profile
                    </span>
                  </h2>

                  {/* benefits */}
                  <div className="mt-6 space-y-3">
                    {BENEFITS.map((item, i) => (
                      <div
                        key={item}
                        className={`anim-fade-up flex items-center gap-3 rounded-xl border border-white/[0.04] bg-white/[0.03] px-4 py-3 backdrop-blur-sm`}
                        style={{ animationDelay: `${0.3 + i * 0.1}s` }}
                      >
                        <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-lg bg-[#d6b47c]/10">
                          <CheckCheck className="h-3 w-3 text-[#d6b47c]" />
                        </span>
                        <p className="text-[16px] text-[#b0b8c8]">{item}</p>
                      </div>
                    ))}
                  </div>

                  {/* decorative line */}
                  <div className="mt-8 flex items-center gap-4">
                    <div className="h-px w-16 bg-gradient-to-r from-[#d6b47c]/50 to-transparent" />
                    <span className="text-[12px] uppercase tracking-[0.3em] text-[#d6b47c]/40">LUXX ATELIER © 2026</span>
                  </div>
                </div>
              </div>
            </section>

            {/* ─── RIGHT — register form ───────────────────────────── */}
            <section className="relative flex flex-col items-center justify-center px-5 py-8 sm:px-8 lg:px-14 xl:px-20">
              {/* subtle grid pattern */}
              <div className="pointer-events-none absolute inset-0 opacity-[0.025]"
                style={{
                  backgroundImage: 'linear-gradient(rgba(214,180,124,.3) 1px, transparent 1px), linear-gradient(90deg, rgba(214,180,124,.3) 1px, transparent 1px)',
                  backgroundSize: '48px 48px',
                }}
              />

              {/* mobile hero banner */}
              <div className={`relative mb-6 w-full overflow-hidden rounded-[1.8rem] lg:hidden ${mounted ? 'anim-fade-up' : 'opacity-0'}`}>
                <div className="relative h-[28vh] min-h-[200px]">
                  <img src="/mobile.jpg" alt="LUXE editorial" className="absolute inset-0 h-full w-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#060a14] via-[#060a14]/40 to-transparent" />
                  <div className="absolute bottom-5 left-5 right-5">
                    <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#d6b47c]/20 bg-black/40 px-3 py-1 backdrop-blur-md">
                      <span className="relative flex h-1.5 w-1.5">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#d6b47c] opacity-50" />
                        <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#d6b47c]" />
                      </span>
                      <span className="text-[11px] uppercase tracking-[0.2em] text-[#e8d5b0]">Yangi akkaunt</span>
                    </div>
                    <p className="text-3xl font-light text-white/95">
                      New <span className="font-brilliant bg-gradient-to-r from-[#e8c87a] to-[#c49a5c] bg-clip-text text-transparent">profile</span>
                    </p>
                  </div>
                </div>
              </div>

              {/* form container */}
              <div className={`w-full max-w-[440px] ${mounted ? 'anim-fade-up delay-1' : 'opacity-0'}`}>
                {/* header */}
                <div className="text-center lg:text-left">
                  <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[#d6b47c]/[0.08] px-4 py-1.5">
                    <div className="h-1 w-1 rounded-full bg-[#d6b47c]" />
                    <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#d6b47c]">Ro'yxatdan o'tish</span>
                  </div>
                  <h1 className="text-[1.8rem] font-light tracking-tight text-white/95 sm:text-[2.2rem]">
                    Yangi{' '}
                    <span className="font-brilliant bg-gradient-to-r from-[#e8c87a] via-[#d6b47c] to-[#c49a5c] bg-clip-text text-transparent">
                      akkaunt
                    </span>
                  </h1>
                  <p className="mt-2 text-[13px] leading-relaxed text-[#6b7486]">
                    Bir necha qadamda ro'yxatdan o'ting va LUXE platformasidagi premium imkoniyatlarni ishga tushiring.
                  </p>
                </div>

                {/* form */}
                <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-6">
                  {/* username */}
                  <FormInput
                    icon={UserPlus}
                    label="Foydalanuvchi nomi"
                    delay="delay-2"
                    mounted={mounted}
                    name="username"
                    type="text"
                    required
                    value={formData.username}
                    onChange={handleChange}
                    placeholder="username"
                  />

                  {/* phone */}
                  <FormInput
                    icon={Phone}
                    label="Telefon raqam"
                    delay="delay-3"
                    mounted={mounted}
                    name="phone"
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+998 90 123 45 67"
                  />

                  {/* password row */}
                  <div className={`grid grid-cols-1 gap-4 sm:grid-cols-2`}>
                    {/* password */}
                    <div className={`anim-fade-up delay-4 ${mounted ? '' : 'opacity-0'}`}>
                      <label className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.18em] text-[#7d8699]">
                        Parol
                      </label>
                      <div className="input-glow group relative overflow-hidden rounded-2xl border border-white/[0.06] bg-[#0c1424]/80 transition-all duration-300 hover:border-white/[0.1]">
                        <div className="flex items-center gap-3 px-4 py-3.5">
                          <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#d6b47c]/15 to-[#d6b47c]/5">
                            <Lock className="h-3.5 w-3.5 text-[#d6b47c]/70" />
                          </div>
                          <input
                            name="password"
                            type={showPassword ? 'text' : 'password'}
                            required
                            value={formData.password}
                            onChange={handleChange}
                            className="w-full bg-transparent text-[16px] lg:text-[14px] font-light tracking-wide text-white/90 outline-none placeholder:text-[#3d4758]"
                            placeholder="Kamida 6 ta"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="rounded-lg p-1 text-[#5a6478] transition-colors hover:bg-white/5 hover:text-[#d6b47c]/70"
                          >
                            {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* confirm */}
                    <div className={`anim-fade-up delay-5 ${mounted ? '' : 'opacity-0'}`}>
                      <label className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.18em] text-[#7d8699]">
                        Tasdiqlash
                      </label>
                      <div className="input-glow group relative overflow-hidden rounded-2xl border border-white/[0.06] bg-[#0c1424]/80 transition-all duration-300 hover:border-white/[0.1]">
                        <div className="flex items-center gap-3 px-4 py-3.5">
                          <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#d6b47c]/15 to-[#d6b47c]/5">
                            <Lock className="h-3.5 w-3.5 text-[#d6b47c]/70" />
                          </div>
                          <input
                            name="confirmPassword"
                            type={showConfirm ? 'text' : 'password'}
                            required
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            className="w-full bg-transparent text-[16px] lg:text-[14px] font-light tracking-wide text-white/90 outline-none placeholder:text-[#3d4758]"
                            placeholder="Qayta kirit"
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirm(!showConfirm)}
                            className="rounded-lg p-1 text-[#5a6478] transition-colors hover:bg-white/5 hover:text-[#d6b47c]/70"
                          >
                            {showConfirm ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* error */}
                  {error && (
                    <div className="anim-fade-in flex items-start gap-3 rounded-2xl border border-red-500/10 bg-red-500/[0.06] px-4 py-3 backdrop-blur-sm">
                      <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-red-400" />
                      <span className="text-[13px] text-red-300/90">{error}</span>
                    </div>
                  )}

                  {/* submit */}
                  <div className={`anim-fade-up delay-6 mt-2 ${mounted ? '' : 'opacity-0'}`}>
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="group relative flex w-full items-center justify-center gap-2.5 overflow-hidden rounded-2xl py-4 text-[13px] font-semibold uppercase tracking-[0.15em] transition-all duration-300 hover:scale-[1.01] hover:shadow-[0_8px_30px_rgba(214,180,124,.2)] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
                      style={{
                        background: 'linear-gradient(135deg, #e8c87a 0%, #d6b47c 50%, #c49a5c 100%)',
                        color: '#0a0e1a',
                      }}
                    >
                      {/* shimmer */}
                      <div
                        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity group-hover:opacity-100"
                        style={{
                          background: 'linear-gradient(90deg, transparent, rgba(255,255,255,.2), transparent)',
                          backgroundSize: '200% 100%',
                          animation: 'shimmer 2s infinite',
                        }}
                      />
                      <span className="relative z-10 flex items-center gap-2.5">
                        {isLoading ? (
                          <DotLoader />
                        ) : (
                          <>
                            Ro'yxatdan o'tish
                            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                          </>
                        )}
                      </span>
                    </button>
                  </div>
                </form>

                {/* divider */}
                <div className={`anim-fade-up delay-7 mt-5 flex items-center gap-4 ${mounted ? '' : 'opacity-0'}`}>
                  <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
                  <span className="text-[10px] uppercase tracking-[0.2em] text-[#3d4758]">yoki</span>
                  <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
                </div>

                {/* login link */}
                <p className={`anim-fade-up delay-8 mt-5 text-center text-[14px] text-[#5a6478] ${mounted ? '' : 'opacity-0'}`}>
                  Hisobingiz bormi?{' '}
                  <Link
                    to={loginLink}
                    className="relative font-medium text-[#d6b47c] transition-colors hover:text-[#e8c87a]"
                  >
                    Kirish
                    <span className="absolute -bottom-0.5 left-0 h-px w-full origin-left scale-x-0 bg-[#d6b47c]/50 transition-transform hover:scale-x-100" />
                  </Link>
                </p>

                {/* mobile benefits */}
                <div className={`anim-fade-up delay-8 mt-5 space-y-2.5 lg:hidden ${mounted ? '' : 'opacity-0'}`}>
                  {BENEFITS.map((item) => (
                    <div key={item} className="flex items-center gap-2.5 rounded-xl border border-white/[0.04] bg-white/[0.03] px-3.5 py-2.5">
                      <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-lg bg-[#d6b47c]/10">
                        <CheckCheck className="h-3 w-3 text-[#d6b47c]" />
                      </span>
                      <p className="text-[14px] text-[#b0b8c8]">{item}</p>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterForm;
