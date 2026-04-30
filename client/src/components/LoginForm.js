import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AlertCircle, ArrowRight, Lock, Eye, EyeOff, User } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import SEO from './SEO';

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
          animation: 'pulse 1s ease-in-out infinite',
          animationDelay: `${i * 120}ms`,
        }}
      />
    ))}
  </span>
);

/* ─── main component ───────────────────────────────────────────── */
const LoginForm = () => {
  const [credentials, setCredentials] = useState({ identifier: '', password: '' });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const isMobileRoute = location.pathname.startsWith('/mobile');
  const registerLink = isMobileRoute ? '/mobile/register' : '/register';

  useEffect(() => { setMounted(true); }, []);

  const handleChange = (e) => {
    setCredentials((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    const result = await login(credentials.identifier, credentials.password);
    if (result.success) {
      navigate(isMobileRoute ? '/mobile/profile' : '/');
    } else {
      setError(result.error);
    }
    setIsLoading(false);
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#060a14]">
      <SEO title="Kirish" noIndex={true} />

      {/* ── inline keyframes ─────────────────────────────────────── */}
      <style>{`
        @keyframes fadeUp   { from { opacity:0; transform:translateY(28px);} to { opacity:1; transform:translateY(0);}}
        @keyframes fadeIn   { from { opacity:0; } to { opacity:1; }}
        @keyframes pulse    { 0%,100%{opacity:.25;transform:scale(.8)} 50%{opacity:1;transform:scale(1.1)}}
        @keyframes shimmer  { 0%{background-position:-200% 0} 100%{background-position:200% 0}}
        @keyframes float    { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)}}
        @keyframes glow     { 0%,100%{opacity:.45} 50%{opacity:.75}}
        @keyframes borderGlow { 0%,100%{border-color:rgba(214,180,124,.12)} 50%{border-color:rgba(214,180,124,.28)}}
        .anim-fade-up  { animation: fadeUp .7s cubic-bezier(.22,1,.36,1) both; }
        .anim-fade-in  { animation: fadeIn .6s ease both; }
        .delay-1 { animation-delay:.12s }
        .delay-2 { animation-delay:.22s }
        .delay-3 { animation-delay:.32s }
        .delay-4 { animation-delay:.42s }
        .delay-5 { animation-delay:.52s }
        .delay-6 { animation-delay:.62s }
        .input-glow:focus-within {
          box-shadow: 0 0 0 1px rgba(214,180,124,.35), 0 0 20px rgba(214,180,124,.08);
        }
      `}</style>

      {/* ── ambient blurs ─────────────────────────────────────────── */}
      <div className="pointer-events-none absolute -top-40 left-1/2 h-[500px] w-[900px] -translate-x-1/2 rounded-full bg-[#d6b47c]/[0.07] blur-[120px]" />
      <div className="pointer-events-none absolute top-1/2 -left-40 h-[400px] w-[400px] rounded-full bg-[#1e3a5f]/[0.15] blur-[100px]" style={{ animation: 'glow 6s ease-in-out infinite' }} />
      <div className="pointer-events-none absolute bottom-0 right-0 h-[400px] w-[500px] rounded-full bg-[#4a2040]/[0.12] blur-[100px]" style={{ animation: 'glow 8s ease-in-out infinite 2s' }} />

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
                src="/login.jpg"
                alt="LUXE editorial"
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
                  <span className="text-[13px] font-medium uppercase tracking-[0.25em] text-[#e8d5b0]">Atelier Access</span>
                </div>

                {/* bottom text */}
                <div className={`max-w-lg ${mounted ? 'anim-fade-up delay-2' : 'opacity-0'}`}>
                  <p className="text-[13px] font-medium uppercase tracking-[0.3em] text-[#8a94a8]">Private Client Desk</p>
                  <h2 className="mt-4 text-[5rem] font-light leading-[1.05] tracking-tight text-white/95">
                    Premium
                    <span
                      className="font-brilliant ml-3 bg-gradient-to-r from-[#e8c87a] via-[#d6b47c] to-[#c49a5c] bg-clip-text text-transparent"
                      style={{ animation: 'float 4s ease-in-out infinite' }}
                    >
                      access
                    </span>
                  </h2>
                  <p className="mt-5 max-w-lg text-[18px] leading-relaxed text-[#7d8699]">
                    Har kirish bilan sizga mos tavsiyalar, tez checkout va shaxsiy fashion tajribasi ochiladi.
                  </p>

                  {/* decorative line */}
                  <div className="mt-8 flex items-center gap-4">
                    <div className="h-px w-16 bg-gradient-to-r from-[#d6b47c]/50 to-transparent" />
                    <span className="text-[10px] uppercase tracking-[0.3em] text-[#d6b47c]/40">LUXX ATELIER © 2026</span>
                  </div>
                </div>
              </div>
            </section>

            {/* ─── RIGHT — login form ──────────────────────────────── */}
            <section className="relative flex flex-col items-center justify-center px-5 py-10 sm:px-8 lg:px-16 xl:px-24">
              {/* subtle grid pattern */}
              <div className="pointer-events-none absolute inset-0 opacity-[0.025]"
                style={{
                  backgroundImage: 'linear-gradient(rgba(214,180,124,.3) 1px, transparent 1px), linear-gradient(90deg, rgba(214,180,124,.3) 1px, transparent 1px)',
                  backgroundSize: '48px 48px',
                }}
              />

              {/* mobile hero banner */}
              <div className={`relative mb-8 w-full overflow-hidden rounded-[1.8rem] lg:hidden ${mounted ? 'anim-fade-up' : 'opacity-0'}`}>
                <div className="relative h-[32vh] min-h-[220px]">
                  <img src="/mobile.jpg" alt="LUXE editorial" className="absolute inset-0 h-full w-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#060a14] via-[#060a14]/40 to-transparent" />
                  <div className="absolute bottom-5 left-5 right-5">
                    <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#d6b47c]/20 bg-black/40 px-3 py-1 backdrop-blur-md">
                      <span className="relative flex h-1.5 w-1.5">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#d6b47c] opacity-50" />
                        <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#d6b47c]" />
                      </span>
                      <span className="text-[11px] uppercase tracking-[0.2em] text-[#e8d5b0]">Atelier Access</span>
                    </div>
                    <p className="text-3xl font-light text-white/95">
                      Premium <span className="font-brilliant bg-gradient-to-r from-[#e8c87a] to-[#c49a5c] bg-clip-text text-transparent">access</span>
                    </p>
                  </div>
                </div>
              </div>

              {/* form container */}
              <div className={`w-full max-w-[420px] ${mounted ? 'anim-fade-up delay-1' : 'opacity-0'}`}>
                {/* header */}
                <div className="text-center lg:text-left">
                  <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[#d6b47c]/[0.08] px-4 py-1.5">
                    <div className="h-1 w-1 rounded-full bg-[#d6b47c]" />
                    <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#d6b47c]">Kirish</span>
                  </div>
                  <h1 className="text-[2rem] font-light tracking-tight text-white/95 sm:text-[2.4rem]">
                    Xush kelibsiz.{' '}
                    <span className="font-brilliant bg-gradient-to-r from-[#e8c87a] via-[#d6b47c] to-[#c49a5c] bg-clip-text text-transparent">
                      LUXX.UZ
                    </span>
                  </h1>
                  <p className="mt-2.5 text-[14px] leading-relaxed text-[#6b7486]">
                    Kabinetingizga kirib buyurtmalarni boshqaring va premium kolleksiya yangiliklarini birinchi bo'lib ko'ring.
                  </p>
                </div>

                {/* form */}
                <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-5">
                  {/* identifier */}
                  <div className={`anim-fade-up delay-2 ${mounted ? '' : 'opacity-0'}`}>
                    <label className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.18em] text-[#7d8699]">
                      Telefon yoki username
                    </label>
                    <div className="input-glow group relative overflow-hidden rounded-2xl border border-white/[0.06] bg-[#0c1424]/80 transition-all duration-300 hover:border-white/[0.1]">
                      <div className="flex items-center gap-3 px-4 py-3.5">
                        <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#d6b47c]/15 to-[#d6b47c]/5">
                          <User className="h-3.5 w-3.5 text-[#d6b47c]/70" />
                        </div>
                        <input
                          name="identifier"
                          type="text"
                          required
                          value={credentials.identifier}
                          onChange={handleChange}
                          className="w-full bg-transparent text-[16px] lg:text-[14px] font-light tracking-wide text-white/90 outline-none placeholder:text-[#3d4758]"
                          placeholder="+998 90 123 45 67"
                        />
                      </div>
                    </div>
                  </div>

                  {/* password */}
                  <div className={`anim-fade-up delay-3 ${mounted ? '' : 'opacity-0'}`}>
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
                          value={credentials.password}
                          onChange={handleChange}
                          className="w-full bg-transparent text-[16px] lg:text-[14px] font-light tracking-wide text-white/90 outline-none placeholder:text-[#3d4758]"
                          placeholder="••••••••"
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

                  {/* error */}
                  {error && (
                    <div className="anim-fade-in flex items-start gap-3 rounded-2xl border border-red-500/10 bg-red-500/[0.06] px-4 py-3.5 backdrop-blur-sm">
                      <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-red-400" />
                      <span className="text-[13px] text-red-300/90">{error}</span>
                    </div>
                  )}

                  {/* submit */}
                  <div className={`anim-fade-up delay-4 mt-2 ${mounted ? '' : 'opacity-0'}`}>
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="group relative flex w-full items-center justify-center gap-2.5 overflow-hidden rounded-2xl py-4 text-[13px] font-semibold uppercase tracking-[0.15em] transition-all duration-300 hover:scale-[1.01] hover:shadow-[0_8px_30px_rgba(214,180,124,.2)] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
                      style={{
                        background: 'linear-gradient(135deg, #e8c87a 0%, #d6b47c 50%, #c49a5c 100%)',
                        color: '#0a0e1a',
                      }}
                    >
                      {/* shimmer effect */}
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
                            Kirish
                            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                          </>
                        )}
                      </span>
                    </button>
                  </div>
                </form>

                {/* divider */}
                <div className={`anim-fade-up delay-5 mt-7 flex items-center gap-4 ${mounted ? '' : 'opacity-0'}`}>
                  <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
                  <span className="text-[10px] uppercase tracking-[0.2em] text-[#3d4758]">yoki</span>
                  <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
                </div>

                {/* Social Login Buttons */}
                <div className={`anim-fade-up delay-5 mt-5 flex flex-col gap-3 ${mounted ? '' : 'opacity-0'}`}>
                  {/* Telegram Login */}
                  <button
                    type="button"
                    onClick={() => {
                      // Telegram OAuth flow
                      const botUsername = 'luxx_uz_bot'; // Replace with actual bot username
                      const redirectUrl = encodeURIComponent(window.location.origin + '/auth/telegram/callback');
                      const telegramAuthUrl = `https://oauth.telegram.org/auth?bot_id=${botUsername}&origin=${redirectUrl}&request_access=write`;
                      window.open(telegramAuthUrl, 'telegram_auth', 'width=450,height=550,scrollbars=no');
                      // In production, listen for the callback message from the popup
                    }}
                    className="group flex w-full items-center justify-center gap-3 rounded-2xl border border-[#2AABEE]/20 bg-[#2AABEE]/[0.06] py-3.5 text-[13px] font-medium tracking-wide text-white transition-all duration-300 hover:border-[#2AABEE]/40 hover:bg-[#2AABEE]/[0.12] hover:shadow-[0_4px_20px_rgba(42,171,238,.1)]"
                  >
                    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.479.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                    </svg>
                    Telegram orqali kirish
                  </button>

                  {/* Google Login */}
                  <button
                    type="button"
                    onClick={() => {
                      // Google OAuth flow
                      const clientId = 'YOUR_GOOGLE_CLIENT_ID'; // Replace with actual client ID
                      const redirectUri = encodeURIComponent(window.location.origin + '/auth/google/callback');
                      const scope = encodeURIComponent('email profile');
                      const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=${scope}&access_type=offline`;
                      window.location.href = googleAuthUrl;
                    }}
                    className="group flex w-full items-center justify-center gap-3 rounded-2xl border border-white/[0.08] bg-white/[0.03] py-3.5 text-[13px] font-medium tracking-wide text-white/80 transition-all duration-300 hover:border-white/[0.15] hover:bg-white/[0.06] hover:text-white"
                  >
                    <svg className="h-5 w-5" viewBox="0 0 24 24">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                    </svg>
                    Google orqali kirish
                  </button>

                  {/* Phone (SMS) Login */}
                  <button
                    type="button"
                    onClick={() => {
                      // Navigate to phone verification flow
                      // In production, this would initiate an SMS OTP flow
                      const phone = prompt('Telefon raqamingizni kiriting:\n+998 XX XXX XX XX');
                      if (phone) {
                        toast.success('SMS kod yuborildi (demo)');
                      }
                    }}
                    className="group flex w-full items-center justify-center gap-3 rounded-2xl border border-[#d6b47c]/15 bg-[#d6b47c]/[0.04] py-3.5 text-[13px] font-medium tracking-wide text-[#d6b47c]/80 transition-all duration-300 hover:border-[#d6b47c]/30 hover:bg-[#d6b47c]/[0.08] hover:text-[#d6b47c]"
                  >
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" />
                    </svg>
                    SMS kod bilan kirish
                  </button>
                </div>

                {/* divider 2 */}
                <div className={`anim-fade-up delay-5 mt-5 flex items-center gap-4 ${mounted ? '' : 'opacity-0'}`}>
                  <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
                  <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
                </div>

                {/* register link */}
                <p className={`anim-fade-up delay-6 mt-6 text-center text-[14px] text-[#5a6478] ${mounted ? '' : 'opacity-0'}`}>
                  Hisobingiz yo'qmi?{' '}
                  <Link
                    to={registerLink}
                    className="relative font-medium text-[#d6b47c] transition-colors hover:text-[#e8c87a]"
                  >
                    Ro'yxatdan o'ting
                    <span className="absolute -bottom-0.5 left-0 h-px w-full origin-left scale-x-0 bg-[#d6b47c]/50 transition-transform hover:scale-x-100" />
                  </Link>
                </p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
