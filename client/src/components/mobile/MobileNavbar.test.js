import React from 'react';
import { vi } from 'vitest';
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';
import { useLanguage } from '../../contexts/LanguageContext';
import MobileNavbar from './MobileNavbar';

vi.mock('../../contexts/AuthContext', () => ({ useAuth: vi.fn() }));
vi.mock('../../contexts/CartContext', () => ({ useCart: vi.fn() }));
vi.mock('../../contexts/LanguageContext', () => ({ useLanguage: vi.fn() }));

const setLanguage = vi.fn();

const renderNavbar = ({
  route = '/mobile',
  isAuthenticated = false,
  totalItems = 0,
} = {}) => {
  useAuth.mockReturnValue({ isAuthenticated });
  useCart.mockReturnValue({ totalItems });
  useLanguage.mockReturnValue({
    t: (_key, fallback) => fallback,
    language: 'uz',
    setLanguage,
    availableLanguages: [
      { code: 'uz', label: 'UZ' },
      { code: 'ru', label: 'RU' },
      { code: 'en', label: 'EN' },
    ],
  });

  return render(
    <MemoryRouter initialEntries={[route]}>
      <MobileNavbar />
    </MemoryRouter>,
  );
};

describe('MobileNavbar', () => {
  test.each([
    ['/mobile', 'Asosiy', '0'],
    ['/mobile/products', "Do'kon", '1'],
    ['/mobile/lookbooks', 'Lookbook', '2'],
    ['/mobile/cart', 'Savat', '3'],
    ['/mobile/profile', 'Profil', '4'],
  ])('moves the active capsule for %s', (route, label, index) => {
    const { container } = renderNavbar({ route });

    expect(screen.getByRole('link', { name: label })).toHaveAttribute('aria-current', 'page');
    expect(container.querySelector('.mobile-bottom-nav__pill')).toHaveStyle(`--active-index: ${index}`);
    expect(container.querySelector('.mobile-bottom-nav__indicator')).toHaveClass('mobile-bottom-nav__indicator--visible');
    expect(container.querySelectorAll('[aria-current="page"]')).toHaveLength(1);
  });

  test('opens lookbooks from the centre tab and does not mark unrelated pages as lookbooks', () => {
    renderNavbar({ route: '/mobile/events' });
    const link = screen.getByRole('link', { name: 'Lookbook' });
    expect(link).toHaveAttribute('href', '/mobile/lookbooks');
    expect(link).not.toHaveAttribute('aria-current');
    expect(screen.queryByRole('link', { name: 'Kashf et' })).not.toBeInTheDocument();
  });

  test('routes guests to login and authenticated users to profile', () => {
    const guestView = renderNavbar();
    expect(screen.getByRole('link', { name: 'Profil' })).toHaveAttribute('href', '/mobile/login');
    guestView.unmount();

    renderNavbar({ isAuthenticated: true });
    expect(screen.getByRole('link', { name: 'Profil' })).toHaveAttribute('href', '/mobile/profile');
  });

  test.each([
    [0, null],
    [1, '1'],
    [9, '9'],
    [10, '9+'],
  ])('renders cart count %s as %s', (totalItems, expected) => {
    const { container } = renderNavbar({ totalItems });
    const badge = container.querySelector('.mobile-bottom-nav__badge');

    if (expected === null) {
      expect(badge).not.toBeInTheDocument();
    } else {
      expect(badge).toHaveTextContent(expected);
    }
  });

  test('keeps the language control out of the dock', () => {
    renderNavbar();
    expect(screen.queryByRole('button', { name: "Tilni o'zgartirish" })).not.toBeInTheDocument();
  });
});
