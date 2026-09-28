import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import LoginForm from './LoginForm';

const mockNavigate = vi.fn();
const mockLogin = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock('../contexts/AuthContext', () => ({
  useAuth: () => ({
    login: mockLogin,
    isAuthenticated: false,
    user: null,
  }),
}));

vi.mock('../contexts/LanguageContext', () => ({
  useLanguage: () => ({
    t: (key) => {
      const translations = {
        'auth.loginTitle': 'Kirish',
        'auth.loginWelcome': 'Xush kelibsiz',
        'auth.loginDescription': 'Luxe hisobingizga kiring',
        'auth.identifierLabel': 'Telefon yoki login',
        'auth.passwordLabel': 'Parol',
        'auth.login': 'Kirish',
        'auth.or': 'YOKI',
        'auth.noAccount': "Hisobingiz yo'qmi?",
        'auth.goRegister': "Ro'yxatdan o'ting",
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
  default: () => <div data-testid="telegram-login-btn">Telegram Login</div>,
}));

vi.mock('./AuthOpening', () => ({
  default: () => <div data-testid="auth-opening-mock" />,
}));

describe('LoginForm Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderComponent = (initialEntries = ['/login']) => {
    return render(
      <MemoryRouter initialEntries={initialEntries} future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <LoginForm />
      </MemoryRouter>
    );
  };

  it('renders login form inputs, labels, and action buttons', () => {
    const { container } = renderComponent();

    expect(container.querySelector('input[name="identifier"]')).toBeTruthy();
    expect(container.querySelector('input[name="password"]')).toBeTruthy();
    expect(container.querySelector('button[type="submit"]')).toBeTruthy();
    expect(screen.getByText('Bosh sahifa')).toBeDefined();
    expect(screen.getByTestId('telegram-login-btn')).toBeDefined();
  });

  it('updates form inputs when user types', () => {
    const { container } = renderComponent();

    const identifierInput = container.querySelector('input[name="identifier"]');
    const passwordInput = container.querySelector('input[name="password"]');

    fireEvent.change(identifierInput, { target: { name: 'identifier', value: '+998901234567' } });
    fireEvent.change(passwordInput, { target: { name: 'password', value: 'secret123' } });

    expect(identifierInput.value).toBe('+998901234567');
    expect(passwordInput.value).toBe('secret123');
  });

  it('toggles password visibility when eye button is clicked', () => {
    const { container } = renderComponent();

    const passwordInput = container.querySelector('input[name="password"]');
    expect(passwordInput.type).toBe('password');

    const toggleButton = passwordInput.parentElement.querySelector('button');
    expect(toggleButton).toBeTruthy();

    fireEvent.click(toggleButton);
    expect(passwordInput.type).toBe('text');

    fireEvent.click(toggleButton);
    expect(passwordInput.type).toBe('password');
  });

  it('calls login and navigates to "/" on successful desktop submission', async () => {
    mockLogin.mockResolvedValueOnce({ success: true });
    const { container } = renderComponent(['/login']);

    const identifierInput = container.querySelector('input[name="identifier"]');
    const passwordInput = container.querySelector('input[name="password"]');
    const submitBtn = container.querySelector('button[type="submit"]');

    fireEvent.change(identifierInput, { target: { name: 'identifier', value: '+998901112233' } });
    fireEvent.change(passwordInput, { target: { name: 'password', value: 'password123' } });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('+998901112233', 'password123');
      expect(mockNavigate).toHaveBeenCalledWith('/');
    });
  });

  it('navigates to "/mobile/profile" on successful mobile login', async () => {
    mockLogin.mockResolvedValueOnce({ success: true });
    const { container } = renderComponent(['/mobile/login']);

    const identifierInput = container.querySelector('input[name="identifier"]');
    const passwordInput = container.querySelector('input[name="password"]');
    const submitBtn = container.querySelector('button[type="submit"]');

    fireEvent.change(identifierInput, { target: { name: 'identifier', value: '+998901112233' } });
    fireEvent.change(passwordInput, { target: { name: 'password', value: 'password123' } });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('+998901112233', 'password123');
      expect(mockNavigate).toHaveBeenCalledWith('/mobile/profile');
    });
  });

  it('displays an error alert when login fails', async () => {
    mockLogin.mockResolvedValueOnce({ success: false, error: 'Login yoki parol noto\'g\'ri' });
    const { container } = renderComponent();

    const identifierInput = container.querySelector('input[name="identifier"]');
    const passwordInput = container.querySelector('input[name="password"]');
    const submitBtn = container.querySelector('button[type="submit"]');

    fireEvent.change(identifierInput, { target: { name: 'identifier', value: '+998901112233' } });
    fireEvent.change(passwordInput, { target: { name: 'password', value: 'wrongpassword' } });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText('Login yoki parol noto\'g\'ri')).toBeDefined();
    });
  });
});
