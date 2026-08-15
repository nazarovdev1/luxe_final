import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import '@testing-library/jest-dom';
import { render, screen, fireEvent } from '@testing-library/react';
import PriceDropAlert, { formatUzPhone } from './PriceDropAlert';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';

vi.mock('../contexts/AuthContext', () => ({
  useAuth: vi.fn(),
}));

vi.mock('../contexts/LanguageContext', () => ({
  useLanguage: vi.fn(),
}));

vi.mock('../services/api', () => ({
  apiFetch: vi.fn().mockResolvedValue({ success: true }),
}));

describe('PriceDropAlert Component', () => {
  const dummyProduct = {
    _id: 'prod_123',
    name: 'Printli Jaket SET',
    price: 1549000,
    image: '/test.jpg',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    useLanguage.mockReturnValue({
      t: (key, options) => {
        if (options && typeof options === 'object') {
          if (key === 'priceDropAlert.alertDesc') {
            return `Mahsulot narxi ${options.price} ga tushganda sizga ${options.method} orqali xabar yuboramiz.`;
          }
          return options.defaultValue || key;
        }
        return options || key;
      },
    });
  });

  it('correctly formats Uzbek phone numbers with +998 prefix', () => {
    expect(formatUzPhone('')).toBe('+998 ');
    expect(formatUzPhone('90')).toBe('+998 90');
    expect(formatUzPhone('90123')).toBe('+998 90 123');
    expect(formatUzPhone('901234567')).toBe('+998 90 123 45 67');
    expect(formatUzPhone('+998901234567')).toBe('+998 90 123 45 67');
  });

  it('renders trigger button properly', () => {
    useAuth.mockReturnValue({ isAuthenticated: false, user: null });
    render(<PriceDropAlert product={dummyProduct} />);
    expect(screen.getByText('Narx tushganda darhol xabar olamiz')).toBeInTheDocument();
  });

  it('opens modal on click and shows phone input for guest users', () => {
    useAuth.mockReturnValue({ isAuthenticated: false, user: null });
    render(<PriceDropAlert product={dummyProduct} />);

    const openBtn = screen.getByRole('button', { name: /ochish/i });
    fireEvent.click(openBtn);

    expect(screen.getByText('Printli Jaket SET')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('+998 90 123 45 67')).toBeInTheDocument();
  });

  it('locks body scrolling with fixed position when modal is open', () => {
    useAuth.mockReturnValue({ isAuthenticated: false, user: null });
    const { unmount } = render(<PriceDropAlert product={dummyProduct} />);

    const openBtn = screen.getByRole('button', { name: /ochish/i });
    fireEvent.click(openBtn);

    expect(document.body.style.position).toBe('fixed');
    expect(document.body.style.overflow).toBe('hidden');
    expect(document.body.style.touchAction).toBe('none');

    // Close modal
    const closeBtn = screen.getByLabelText('Yopish');
    fireEvent.click(closeBtn);

    expect(document.body.style.position).toBe('');
    expect(document.body.style.overflow).toBe('');

    unmount();
  });

  it('hides phone input and shows Telegram connected badge when user is logged in via Telegram', () => {
    useAuth.mockReturnValue({
      isAuthenticated: true,
      user: {
        _id: 'user_tg_1',
        telegramId: '123456789',
        telegramUsername: 'luxx_vip',
      },
    });

    render(<PriceDropAlert product={dummyProduct} />);

    const openBtn = screen.getByRole('button', { name: /ochish/i });
    fireEvent.click(openBtn);

    // Telegram badge is shown
    expect(screen.getByText('Telegram hisobingiz ulangan')).toBeInTheDocument();
    expect(screen.getByText('@luxx_vip')).toBeInTheDocument();
    // Phone input is not shown
    expect(screen.queryByPlaceholderText('+998 90 123 45 67')).not.toBeInTheDocument();
  });

  it('prefills phone input with account phone number when standard user is logged in', () => {
    useAuth.mockReturnValue({
      isAuthenticated: true,
      user: {
        _id: 'user_regular_1',
        phone: '+998901234567',
      },
    });

    render(<PriceDropAlert product={dummyProduct} />);

    const openBtn = screen.getByRole('button', { name: /ochish/i });
    fireEvent.click(openBtn);

    const input = screen.getByPlaceholderText('+998 90 123 45 67');
    expect(input.value).toBe('+998 90 123 45 67');
  });
});
