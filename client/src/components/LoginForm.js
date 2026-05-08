import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AlertCircle, ArrowRight, ArrowLeft, Lock, Eye, EyeOff, User } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import SEO from './SEO';
import TelegramLoginButton from './TelegramLoginButton';

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
  const { t } = useLanguage();
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
      <SEO title={t('auth.loginTitle')} noIndex={true} />

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
        input:-webkit-autofill,
        input:-webkit-autofill:hover, 
        input:-webkit-autofill:focus, 
        input:-webkit-autofill:active {
          transition: background-color 5000s ease-in-out 0s;
          -webkit-text-fill-color: rgba(255, 255, 255, 0.9) !important;
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
                  <span className="text-[13px] font-medium uppercase tracking-[0.25em] text-[#e8d5b0]">{t('auth.atelierAccess')}</span>
                </div>

                {/* bottom text */}
                <div className={`max-w-lg ${mounted ? 'anim-fade-up delay-2' : 'opacity-0'}`}>
                  <p className="text-[13px] font-medium uppercase tracking-[0.3em] text-[#8a94a8]">{t('auth.privateClient')}</p>
                  <h2 className="mt-4 text-[5rem] font-light leading-[1.05] tracking-tight text-white/95">
                    {t('auth.premiumAccess')}
                    <span
                      className="font-brilliant ml-3 bg-gradient-to-r from-[#e8c87a] via-[#d6b47c] to-[#c49a5c] bg-clip-text text-transparent"
                      style={{ animation: 'float 4s ease-in-out infinite' }}
                    >
                      {t('auth.accessWord')}
                    </span>
                  </h2>
                  <p className="mt-5 max-w-lg text-[18px] leading-relaxed text-[#7d8699]">
                    {t('auth.leftDescription')}
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
              
              {/* ─── Back Button ──────────────────────────────── */}
              <div className={`absolute left-4 top-4 lg:left-10 lg:top-10 z-[100] ${mounted ? 'anim-fade-up' : 'opacity-0'}`}>
                <Link 
                  to="/" 
                  className="group flex items-center gap-3 rounded-full border border-white/10 bg-[#060a14]/40 px-4 py-2.5 backdrop-blur-md transition-all duration-500 hover:bg-white/5 hover:border-[#d6b47c]/50 hover:shadow-[0_0_20px_rgba(214,180,124,0.15)]"
                >
                  <ArrowLeft className="w-4 h-4 text-[#d6b47c] transition-transform duration-500 group-hover:-translate-x-1" />
                  <span className="hidden sm:block text-[11px] font-bold tracking-[0.2em] text-[#e8d5b0] transition-colors group-hover:text-white">{t('common.mainPage')}</span>
                </Link>
              </div>
              {/* subtle grid pattern */}
              <div className="pointer-events-none absolute inset-0 opacity-[0.025]"
                style={{
                  backgroundImage: 'linear-gradient(rgba(214,180,124,.3) 1px, transparent 1px), linear-gradient(90deg, rgba(214,180,124,.3) 1px, transparent 1px)',
                  backgroundSize: '48px 48px',
                }}
              />

              {/* removed mobile hero banner as requested */}

              {/* form container */}
              <div className={`w-full max-w-[420px] ${mounted ? 'anim-fade-up delay-1' : 'opacity-0'}`}>
                {/* header */}
                <div className="hidden lg:block text-left mb-8">
                  <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[#d6b47c]/[0.08] px-4 py-1.5">
                    <div className="h-1 w-1 rounded-full bg-[#d6b47c]" />
                    <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#d6b47c]">{t('auth.loginTitle')}</span>
                  </div>
                  <h1 className="text-[2rem] font-light tracking-tight text-white/95 sm:text-[2.4rem]">
                    {t('auth.loginWelcome')}{' '}
                    <span className="font-brilliant bg-gradient-to-r from-[#e8c87a] via-[#d6b47c] to-[#c49a5c] bg-clip-text text-transparent">
                      LUXX.UZ
                    </span>
                  </h1>
                  <p className="mt-2.5 text-[14px] leading-relaxed text-[#6b7486]">
                    {t('auth.loginDescription')}
                  </p>
                </div>

                {/* mobile WOW header */}
                <div className="lg:hidden text-center mb-10 mt-4 relative">
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-[#d6b47c]/10 rounded-full blur-[40px] pointer-events-none"></div>
                  <h1 className="relative text-4xl font-brilliant tracking-wide bg-gradient-to-r from-[#e8c87a] via-[#d6b47c] to-[#c49a5c] bg-clip-text text-transparent drop-shadow-[0_2px_15px_rgba(214,180,124,0.25)]">
                    {t('auth.loginTitle')}
                  </h1>
                  <div className="flex justify-center mt-3">
                     <div className="h-[1px] w-16 bg-gradient-to-r from-transparent via-[#d6b47c]/40 to-transparent"></div>
                  </div>
                </div>

                {/* form */}
                <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-5">
                  {/* identifier */}
                  <div className={`anim-fade-up delay-2 ${mounted ? '' : 'opacity-0'}`}>
                    <label className="mb-2.5 block text-[10px] font-semibold uppercase tracking-[0.2em] text-[#8a94a8]">
                      {t('auth.identifierLabel')}
                    </label>
                    <div className="group relative rounded-2xl border border-white/[0.05] bg-white/[0.01] backdrop-blur-sm transition-all duration-500 focus-within:border-[#d6b47c]/40 focus-within:bg-[#d6b47c]/[0.02] focus-within:shadow-[0_0_20px_rgba(214,180,124,0.05)] hover:border-white/[0.1]">
                      <div className="flex items-center gap-4 px-4 py-4">
                        <User className="w-4 h-4 text-[#d6b47c]/50 shrink-0 transition-colors duration-500 group-focus-within:text-[#d6b47c]" />
                        <input
                          name="identifier"
                          type="text"
                          required
                          value={credentials.identifier}
                          onChange={handleChange}
                          className="w-full bg-transparent text-[16px] lg:text-[14px] font-light tracking-wider text-white/95 outline-none placeholder:text-[#4a5468]"
                          placeholder="+998 90 123 45 67"
                        />
                      </div>
                    </div>
                  </div>

                  {/* password */}
                  <div className={`anim-fade-up delay-3 ${mounted ? '' : 'opacity-0'}`}>
                    <label className="mb-2.5 block text-[10px] font-semibold uppercase tracking-[0.2em] text-[#8a94a8]">
                      {t('auth.passwordLabel')}
                    </label>
                    <div className="group relative rounded-2xl border border-white/[0.05] bg-white/[0.01] backdrop-blur-sm transition-all duration-500 focus-within:border-[#d6b47c]/40 focus-within:bg-[#d6b47c]/[0.02] focus-within:shadow-[0_0_20px_rgba(214,180,124,0.05)] hover:border-white/[0.1]">
                      <div className="flex items-center gap-4 px-4 py-4">
                        <Lock className="w-4 h-4 text-[#d6b47c]/50 shrink-0 transition-colors duration-500 group-focus-within:text-[#d6b47c]" />
                        <input
                          name="password"
                          type={showPassword ? 'text' : 'password'}
                          required
                          value={credentials.password}
                          onChange={handleChange}
                          className="w-full bg-transparent text-[16px] lg:text-[14px] font-light tracking-wider text-white/95 outline-none placeholder:text-[#4a5468]"
                          placeholder="••••••••"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="p-1.5 text-[#4a5468] transition-colors hover:text-[#d6b47c] shrink-0 rounded-lg hover:bg-[#d6b47c]/10"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
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
                  <div className={`anim-fade-up delay-4 mt-6 ${mounted ? '' : 'opacity-0'}`}>
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="group relative flex w-full items-center justify-center gap-3 overflow-hidden rounded-2xl py-4 text-[12px] font-bold uppercase tracking-[0.25em] transition-all duration-500 hover:scale-[1.02] hover:shadow-[0_10px_30px_rgba(214,180,124,0.25)] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
                      style={{
                        background: 'linear-gradient(135deg, #e8c87a 0%, #d6b47c 50%, #c49a5c 100%)',
                        color: '#0a0e1a',
                      }}
                    >
                      <div
                        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                        style={{
                          background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)',
                          backgroundSize: '200% 100%',
                          animation: 'shimmer 2s infinite',
                        }}
                      />
                      <span className="relative z-10 flex items-center gap-3 py-0.5">
                        {isLoading ? (
                          <DotLoader />
                        ) : (
                          <>
                            {t('auth.login')}
                            <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1.5" />
                          </>
                        )}
                      </span>
                    </button>
                  </div>
                </form>

                {/* divider */}
                <div className={`anim-fade-up delay-5 mt-7 flex items-center gap-4 ${mounted ? '' : 'opacity-0'}`}>
                  <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
                  <span className="text-[10px] uppercase tracking-[0.2em] text-[#3d4758]">{t('auth.or')}</span>
                  <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
                </div>

                {/* Telegram Login */}
                <div className={`anim-fade-up delay-5 mt-6 flex justify-center ${mounted ? '' : 'opacity-0'}`}>
                  <TelegramLoginButton botName="luxeecomercebot" />
                </div>

                {/* register link */}
                <p className={`anim-fade-up delay-6 mt-6 text-center text-[14px] text-[#5a6478] ${mounted ? '' : 'opacity-0'}`}>
                  {t('auth.noAccount')}{' '}
                  <Link
                    to={registerLink}
                    className="relative font-medium text-[#d6b47c] transition-colors hover:text-[#e8c87a]"
                  >
                    {t('auth.goRegister')}
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
