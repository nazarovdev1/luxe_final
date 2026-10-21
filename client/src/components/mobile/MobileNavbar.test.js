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

const renderNavbar = ({ route = '/mobile', isAuthenticated = false, totalItems = 0 } = {}) => {
  useAuth.mockReturnValue({ isAuthenticated });
  useCart.mockReturnValue({ totalItems });
  useLanguage.mockReturnValue({ t: (_key, fallback) => fallback, language: 'uz' });

  return render(
    <MemoryRouter initialEntries={[route]}>
      <MobileNavbar />
    </MemoryRouter>,
  );
};

describe('MobileNavbar', () => {
  test.each([
    ['/mobile', 'Asosiy'],
    ['/mobile/products', 'Katalog'],
    ['/mobile/lookbooks', 'Looklar'],
    ['/mobile/cart', 'Savat'],
    ['/mobile/profile', 'Profil'],
  ])('marks %s as the current tab', (route, label) => {
    const { container } = renderNavbar({ route });
    expect(screen.getByRole('link', { name: label })).toHaveAttribute('aria-current', 'page');
    expect(container.querySelectorAll('[aria-current="page"]')).toHaveLength(1);
  });

  test('experimental pages have no tab and mark nothing as current', () => {
    const { container } = renderNavbar({ route: '/mobile/events' });
    expect(screen.queryByRole('link', { name: 'Kashf et' })).not.toBeInTheDocument();
    expect(container.querySelectorAll('[aria-current="page"]')).toHaveLength(0);
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
    const badge = container.querySelector('.m-nav__badge');
    if (expected === null) expect(badge).not.toBeInTheDocument();
    else expect(badge).toHaveTextContent(expected);
  });
});
