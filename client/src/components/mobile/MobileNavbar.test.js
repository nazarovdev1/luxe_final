import React from 'react';
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';
import { useLanguage } from '../../contexts/LanguageContext';
import MobileNavbar from './MobileNavbar';

jest.mock('../../contexts/AuthContext', () => ({ useAuth: jest.fn() }));
jest.mock('../../contexts/CartContext', () => ({ useCart: jest.fn() }));
jest.mock('../../contexts/LanguageContext', () => ({ useLanguage: jest.fn() }));

const renderNavbar = ({
  route = '/mobile',
  isAuthenticated = false,
  totalItems = 0,
} = {}) => {
  useAuth.mockReturnValue({ isAuthenticated });
  useCart.mockReturnValue({ totalItems });
  useLanguage.mockReturnValue({ t: (_key, fallback) => fallback });

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
    ['/mobile/events', 'Kashf et', '2'],
    ['/mobile/cart', 'Savat', '3'],
    ['/mobile/profile', 'Profil', '4'],
  ])('moves the active capsule for %s', (route, label, index) => {
    const { container } = renderNavbar({ route });

    expect(screen.getByRole('link', { name: label })).toHaveAttribute('aria-current', 'page');
    expect(container.querySelector('.mobile-bottom-nav__pill')).toHaveStyle(`--active-index: ${index}`);
    expect(container.querySelector('.mobile-bottom-nav__indicator')).toHaveClass('mobile-bottom-nav__indicator--visible');
    expect(container.querySelectorAll('[aria-current="page"]')).toHaveLength(1);
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
});
