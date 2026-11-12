import React from 'react';
import { vi } from 'vitest';
import '@testing-library/jest-dom';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, useNavigate } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';
import MobileLanguageSwitch from './MobileLanguageSwitch';
import MobileTabOpening from './MobileTabOpening';

vi.mock('../../contexts/LanguageContext', () => ({ useLanguage: vi.fn() }));

const setLanguage = vi.fn();

beforeEach(() => {
  setLanguage.mockClear();
  useLanguage.mockReturnValue({
    t: (_key, fallback) => fallback,
    language: 'uz',
    setLanguage,
    availableLanguages: [{ code: 'uz' }, { code: 'ru' }, { code: 'en' }],
  });
});

describe('MobileLanguageSwitch', () => {
  test('marks the current language and switches on tap', () => {
    render(<MobileLanguageSwitch />);

    expect(screen.getByRole('button', { name: 'UZ' })).toHaveAttribute('aria-pressed', 'true');
    fireEvent.click(screen.getByRole('button', { name: 'RU' }));
    expect(setLanguage).toHaveBeenCalledWith('ru');

    fireEvent.click(screen.getByRole('button', { name: 'UZ' }));
    expect(setLanguage).toHaveBeenCalledTimes(1);
  });
});

let navigateTo;
const NavigateProbe = () => {
  navigateTo = useNavigate();
  return null;
};

const renderOpening = (route = '/mobile') => render(
  <MemoryRouter initialEntries={[route]}>
    <NavigateProbe />
    <MobileTabOpening />
  </MemoryRouter>,
);

describe('MobileTabOpening', () => {
  test('stays quiet on the first page load', () => {
    renderOpening('/mobile/products');
    expect(screen.queryByTestId('mobile-tab-opening')).not.toBeInTheDocument();
  });

  test('plays with the section name when the visitor changes tab, then clears itself', () => {
    renderOpening('/mobile');
    act(() => navigateTo('/mobile/lookbooks'));

    const opening = screen.getByTestId('mobile-tab-opening');
    expect(opening).toHaveTextContent('Lookbook');

    fireEvent.animationEnd(opening);
    expect(screen.queryByTestId('mobile-tab-opening')).not.toBeInTheDocument();
  });

  test('does not replay for moves inside the same section', () => {
    renderOpening('/mobile/products');
    act(() => navigateTo('/mobile/bundles'));
    expect(screen.queryByTestId('mobile-tab-opening')).not.toBeInTheDocument();
  });
});
