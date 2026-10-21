import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import SEO from '../../components/SEO';
import TelegramLoginButton from '../../components/TelegramLoginButton';
import { Field, TopBar } from '../ui';
import './auth.css';

const WORDS = {
  uz: {
    loginKicker: 'Luxx · Shaxsiy kabinet',
    loginTitle: ['Xush', 'kelibsiz.'],
    loginLead: 'Buyurtmalaringiz, sevimlilaringiz va fitting yozuvlaringiz bir joyda.',
    registerKicker: 'Luxx · Yangi hisob',
    registerTitle: ['Atelierga', 'qo\'shiling.'],
    registerLead: 'Bir daqiqa — va buyurtmalaringizni kuzatib borasiz.',
    identifier: 'Telefon yoki foydalanuvchi nomi',
    username: 'Foydalanuvchi nomi',
    phone: 'Telefon raqam',
    password: 'Parol',
    confirm: 'Parolni takrorlang',
    login: 'Kirish',
    register: "Ro'yxatdan o'tish",
    busy: 'Tekshirilmoqda',
    or: 'yoki',
    noAccount: "Hisobingiz yo'qmi?",
    haveAccount: 'Hisobingiz bormi?',
    mismatch: 'Parollar mos kelmadi.',
    short: "Parol kamida 6 belgidan iborat bo'lsin.",
    show: "Parolni ko'rsatish",
  },
  ru: {
    loginKicker: 'Luxx · Личный кабинет',
    loginTitle: ['С возвращением', 'в Luxx.'],
    loginLead: 'Заказы, избранное и записи на примерку — в одном месте.',
    registerKicker: 'Luxx · Новый аккаунт',
    registerTitle: ['Добро пожаловать', 'в ателье.'],
    registerLead: 'Минута — и вы сможете следить за заказами.',
    identifier: 'Телефон или имя пользователя',
    username: 'Имя пользователя',
    phone: 'Телефон',
    password: 'Пароль',
    confirm: 'Повторите пароль',
    login: 'Войти',
    register: 'Создать аккаунт',
    busy: 'Проверяем',
    or: 'или',
    noAccount: 'Нет аккаунта?',
    haveAccount: 'Уже есть аккаунт?',
    mismatch: 'Пароли не совпадают.',
    short: 'Пароль — минимум 6 символов.',
    show: 'Показать пароль',
  },
  en: {
    loginKicker: 'Luxx · Your account',
    loginTitle: ['Welcome', 'back.'],
    loginLead: 'Your orders, favourites and fitting bookings in one place.',
    registerKicker: 'Luxx · New account',
    registerTitle: ['Join the', 'atelier.'],
    registerLead: 'One minute, and you can follow every order.',
    identifier: 'Phone or username',
    username: 'Username',
    phone: 'Phone number',
    password: 'Password',
    confirm: 'Repeat the password',
    login: 'Sign in',
    register: 'Create account',
    busy: 'Checking',
    or: 'or',
    noAccount: 'No account yet?',
    haveAccount: 'Already have an account?',
    mismatch: 'The passwords do not match.',
    short: 'Use at least 6 characters.',
    show: 'Show password',
  },
};

const PasswordField = ({ label, show, onToggle, toggleLabel, ...props }) => (
  <div className="ma-password">
    <Field label={label} type={show ? 'text' : 'password'} {...props} />
    <button type="button" className="m-icon-btn" onClick={onToggle} aria-label={toggleLabel} aria-pressed={show}>
      {show ? <EyeOff className="h-[18px] w-[18px]" strokeWidth={1.5} /> : <Eye className="h-[18px] w-[18px]" strokeWidth={1.5} />}
    </button>
  </div>
);

export default function Auth({ mode = 'login' }) {
  const { language } = useLanguage();
  const w = WORDS[language] || WORDS.uz;
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isLogin = mode === 'login';
  const after = location.state?.from || '/mobile/profile';

  const [form, setForm] = useState({ identifier: '', username: '', phone: '', password: '', confirm: '' });
  const [show, setShow] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const change = (event) => setForm((prev) => ({ ...prev, [event.target.name]: event.target.value }));

  const submit = async (event) => {
    event.preventDefault();
    setError('');
    if (!isLogin) {
      if (form.password !== form.confirm) { setError(w.mismatch); return; }
      if (form.password.length < 6) { setError(w.short); return; }
    }
    setBusy(true);
    const result = isLogin
      ? await login(form.identifier, form.password)
      : await register(form.username, form.phone, form.password);
    setBusy(false);
    if (result?.success) navigate(after, { replace: true });
    else setError(result?.error || '');
  };

  const title = isLogin ? w.loginTitle : w.registerTitle;

  return (
    <div className="m-page--bare ma">
      <SEO title={isLogin ? w.login : w.register} noIndex />
      <TopBar title="" />
      <div className="ma-body m-pad">
        <p className="m-kicker">{isLogin ? w.loginKicker : w.registerKicker}</p>
        <h1 className="ma-title">{title[0]} <em>{title[1]}</em></h1>
        <p className="m-body">{isLogin ? w.loginLead : w.registerLead}</p>

        <form className="ma-form" onSubmit={submit} noValidate>
          {isLogin ? (
            <Field label={w.identifier} name="identifier" value={form.identifier} onChange={change} autoComplete="username" required />
          ) : (
            <>
              <Field label={w.username} name="username" value={form.username} onChange={change} autoComplete="username" required />
              <Field label={w.phone} name="phone" type="tel" inputMode="tel" value={form.phone} onChange={change} autoComplete="tel" required />
            </>
          )}
          <PasswordField
            label={w.password}
            name="password"
            value={form.password}
            onChange={change}
            autoComplete={isLogin ? 'current-password' : 'new-password'}
            show={show}
            onToggle={() => setShow((value) => !value)}
            toggleLabel={w.show}
            required
          />
          {!isLogin && (
            <Field label={w.confirm} name="confirm" type={show ? 'text' : 'password'} value={form.confirm} onChange={change} autoComplete="new-password" required />
          )}

          {error && <p className="ma-error" role="alert">{error}</p>}

          <button type="submit" className={`m-btn m-btn--solid m-btn--block ${busy ? 'is-busy' : ''}`} disabled={busy}>
            {busy ? w.busy : isLogin ? w.login : w.register}
          </button>
        </form>

        <div className="ma-or"><span>{w.or}</span></div>
        <div className="ma-telegram"><TelegramLoginButton botName="luxeecomercebot" /></div>

        <p className="ma-switch">
          {isLogin ? w.noAccount : w.haveAccount}{' '}
          <Link to={isLogin ? '/mobile/register' : '/mobile/login'} state={location.state}>{isLogin ? w.register : w.login}</Link>
        </p>
      </div>
    </div>
  );
}
