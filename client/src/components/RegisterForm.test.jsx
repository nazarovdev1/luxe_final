import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import RegisterForm from './RegisterForm';

const mockNavigate = vi.fn();
const mockRegister = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock('../contexts/AuthContext', () => ({
  useAuth: () => ({
    register: mockRegister,
    isAuthenticated: false,
    user: null,
  }),
}));

vi.mock('../contexts/LanguageContext', () => ({
  useLanguage: () => ({
    t: (key) => {
      const translations = {
        'auth.registerTitle': "Ro'yxatdan o'tish",
        'auth.registerWelcome': 'Eksklyuziv dunyo',
        'auth.registerDescription': 'Luxe a\'zosi bo\'ling',
        'auth.usernameLabel': 'Foydalanuvchi nomi',
        'auth.phoneLabel': 'Telefon raqam',
        'auth.passwordLabel': 'Parol',
        'auth.confirmLabel': 'Parolni tasdiqlang',
        'auth.passwordMismatch': 'Parollar mos kelmadi',
        'auth.passwordMinLength': 'Parol kamida 6 ta belgidan iborat bo\'lishi kerak',
        'auth.benefit1': 'Eksklyuziv chegirmalar',
        'auth.benefit2': 'Bepul yetkazib berish',
        'auth.benefit3': '24/7 VIP konsyerj',
        'auth.register': "A'zo bo'lish",
        'auth.haveAccount': 'Hisobingiz bormi?',
        'auth.loginLink': 'Kirish',
        'common.mainPage': 'Bosh sahifa',
      };
      return translations[key] || key;
    },
    language: 'uz',
  }),
}));

vi.mock('./SEO', () => ({
  default: () => null,
}));

vi.mock('./TelegramLoginButton', () => ({
  default: () => <div data-testid="telegram-register-btn">Telegram Register</div>,
}));

vi.mock('./AuthOpening', () => ({
  default: () => <div data-testid="auth-opening-register-mock" />,
}));

describe('RegisterForm Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderComponent = (initialEntries = ['/register']) => {
    return render(
      <MemoryRouter initialEntries={initialEntries} future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <RegisterForm />
      </MemoryRouter>
    );
  };

  it('renders registration form fields, benefits list, and action buttons', () => {
    const { container } = renderComponent();

    expect(container.querySelector('input[name="username"]')).toBeTruthy();
    expect(container.querySelector('input[name="phone"]')).toBeTruthy();
    expect(container.querySelector('input[name="password"]')).toBeTruthy();
    expect(container.querySelector('input[name="confirmPassword"]')).toBeTruthy();
    expect(container.querySelector('button[type="submit"]')).toBeTruthy();
    expect(screen.getByText('Eksklyuziv chegirmalar')).toBeDefined();
    expect(screen.getByText('Bepul yetkazib berish')).toBeDefined();
    expect(screen.getByText('24/7 VIP konsyerj')).toBeDefined();
    expect(screen.getByTestId('telegram-register-btn')).toBeDefined();
  });

  it('shows error if password and confirmPassword do not match', async () => {
    const { container } = renderComponent();

    const usernameInput = container.querySelector('input[name="username"]');
    const phoneInput = container.querySelector('input[name="phone"]');
    const passwordInput = container.querySelector('input[name="password"]');
    const confirmPasswordInput = container.querySelector('input[name="confirmPassword"]');
    const submitBtn = container.querySelector('button[type="submit"]');

    fireEvent.change(usernameInput, { target: { name: 'username', value: 'luxe_vip' } });
    fireEvent.change(phoneInput, { target: { name: 'phone', value: '+998901234567' } });
    fireEvent.change(passwordInput, { target: { name: 'password', value: 'pass1234' } });
    fireEvent.change(confirmPasswordInput, { target: { name: 'confirmPassword', value: 'pass9999' } });

    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText('Parollar mos kelmadi')).toBeDefined();
      expect(mockRegister).not.toHaveBeenCalled();
    });
  });

  it('shows error if password length is less than 6 characters', async () => {
    const { container } = renderComponent();

    const usernameInput = container.querySelector('input[name="username"]');
    const phoneInput = container.querySelector('input[name="phone"]');
    const passwordInput = container.querySelector('input[name="password"]');
    const confirmPasswordInput = container.querySelector('input[name="confirmPassword"]');
    const submitBtn = container.querySelector('button[type="submit"]');

    fireEvent.change(usernameInput, { target: { name: 'username', value: 'luxe_vip' } });
    fireEvent.change(phoneInput, { target: { name: 'phone', value: '+998901234567' } });
    fireEvent.change(passwordInput, { target: { name: 'password', value: '123' } });
    fireEvent.change(confirmPasswordInput, { target: { name: 'confirmPassword', value: '123' } });

    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText("Parol kamida 6 ta belgidan iborat bo'lishi kerak")).toBeDefined();
      expect(mockRegister).not.toHaveBeenCalled();
    });
  });

  it('calls register and navigates to "/" on successful desktop registration', async () => {
    mockRegister.mockResolvedValueOnce({ success: true });
    const { container } = renderComponent(['/register']);

    const usernameInput = container.querySelector('input[name="username"]');
    const phoneInput = container.querySelector('input[name="phone"]');
    const passwordInput = container.querySelector('input[name="password"]');
    const confirmPasswordInput = container.querySelector('input[name="confirmPassword"]');
    const submitBtn = container.querySelector('button[type="submit"]');

    fireEvent.change(usernameInput, { target: { name: 'username', value: 'luxe_user' } });
    fireEvent.change(phoneInput, { target: { name: 'phone', value: '+998901234567' } });
    fireEvent.change(passwordInput, { target: { name: 'password', value: 'password123' } });
    fireEvent.change(confirmPasswordInput, { target: { name: 'confirmPassword', value: 'password123' } });

    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(mockRegister).toHaveBeenCalledWith('luxe_user', '+998901234567', 'password123');
      expect(mockNavigate).toHaveBeenCalledWith('/');
    });
  });

  it('navigates to "/mobile/profile" on successful mobile registration', async () => {
    mockRegister.mockResolvedValueOnce({ success: true });
    const { container } = renderComponent(['/mobile/register']);

    const usernameInput = container.querySelector('input[name="username"]');
    const phoneInput = container.querySelector('input[name="phone"]');
    const passwordInput = container.querySelector('input[name="password"]');
    const confirmPasswordInput = container.querySelector('input[name="confirmPassword"]');
    const submitBtn = container.querySelector('button[type="submit"]');

    fireEvent.change(usernameInput, { target: { name: 'username', value: 'luxe_user' } });
    fireEvent.change(phoneInput, { target: { name: 'phone', value: '+998901234567' } });
    fireEvent.change(passwordInput, { target: { name: 'password', value: 'password123' } });
    fireEvent.change(confirmPasswordInput, { target: { name: 'confirmPassword', value: 'password123' } });

    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(mockRegister).toHaveBeenCalledWith('luxe_user', '+998901234567', 'password123');
      expect(mockNavigate).toHaveBeenCalledWith('/mobile/profile');
    });
  });
});
