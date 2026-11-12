import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import '@testing-library/jest-dom';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { apiFetch } from '../../services/api';
import { useLanguage } from '../../contexts/LanguageContext';
import { useCart } from '../../contexts/CartContext';
import BundleEditorial from './BundleEditorial';
import { getEditorialPrices, normalizeEditorialProduct } from './bundleEditorialData';
import { getBundleColour } from './BundleMobileOptions';

vi.mock('../../services/api', () => ({ apiFetch: vi.fn() }));
vi.mock('../../contexts/LanguageContext', () => ({ useLanguage: vi.fn() }));
vi.mock('../../contexts/CartContext', () => ({ useCart: vi.fn() }));
vi.mock('../../utils/toast', () => ({ showCartToast: vi.fn() }));
vi.mock('../SEO', () => ({ default: () => null }));
vi.mock('react-hot-toast', () => ({ default: { error: vi.fn(), success: vi.fn() } }));

const addLookToCart = vi.fn();
const suit = { _id: 'suit', name: 'Norka suit', price: 1000000, stock: 2, colors: ['Black'], sizes: ['40'], image: '/suit.jpg' };
const jacket = {
  _id: 'jacket', name: 'Silk jacket', price: 2000000, stock: 3, colors: ['Dark blue'], sizes: ['38', '48'], image: '/jacket.jpg',
  variants: [{ _id: '38', size: '38', color: 'Dark blue', stock: 3 }, { _id: '48', size: '48', color: 'Dark blue', stock: 0 }],
};
const bundle = { _id: 'edit', title: { uz: 'Norka to‘plami', en: 'The Norka edit' }, products: [suit, jacket], originalPrice: 3000000, discountedPrice: 2700000, discountType: 'percentage', discountValue: 10 };
const app = (mobile = false, query = '') => <MemoryRouter initialEntries={[`/bundle/edit${query}`]}><Routes><Route path="/bundle/:id" element={<BundleEditorial mobile={mobile} />} /></Routes></MemoryRouter>;
const action = (name) => within(document.querySelector('.bde-summary')).getByRole('button', { name });

beforeEach(() => {
  vi.clearAllMocks();
  useLanguage.mockReturnValue({ language: 'uz' });
  useCart.mockReturnValue({ addLookToCart });
  apiFetch.mockResolvedValue({ success: true, data: bundle });
  Element.prototype.scrollIntoView = vi.fn();
});

describe('the complete bundle edit', () => {
  it('asks for missing options, disables sold out sizes, and adds the whole discounted set', async () => {
    render(app());
    await screen.findByRole('heading', { name: 'Norka to‘plami', level: 1 });
    fireEvent.click(action('O‘lchamlarni tanlash'));
    expect(screen.getByRole('alert')).toHaveTextContent('Rang va o‘lchamni tanlang');
    expect(addLookToCart).not.toHaveBeenCalled();
    expect(screen.getByRole('button', { name: 'O‘lcham: 48' })).toBeDisabled();
    fireEvent.click(screen.getByRole('button', { name: 'O‘lcham: 38' }));
    fireEvent.click(action('To‘plamni savatga'));
    await waitFor(() => expect(addLookToCart).toHaveBeenCalledWith(
      expect.objectContaining({ _id: 'edit', discountValue: 10, products: expect.arrayContaining([expect.objectContaining({ id: 'jacket', price: 2000000 })]) }),
      { suit: { color: 'Black', size: '40' }, jacket: { color: 'Dark blue', size: '38' } },
    ));
  });

  it('keeps selected options when the language changes without fetching again', async () => {
    const view = render(app());
    fireEvent.click(await screen.findByRole('button', { name: 'O‘lcham: 38' }));
    useLanguage.mockReturnValue({ language: 'en' });
    view.rerender(app());
    expect(screen.getByRole('heading', { name: 'The Norka edit', level: 1 })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Size: 38' })).toHaveAttribute('aria-pressed', 'true');
    expect(apiFetch).toHaveBeenCalledTimes(1);
  });

  it('does not invent sizes for products without size options', async () => {
    apiFetch.mockResolvedValue({ success: true, data: { ...bundle, products: [{ ...suit, sizes: [] }] } });
    render(app(true));
    await screen.findByRole('heading', { name: 'Norka to‘plami' });
    expect(screen.queryByRole('button', { name: /O‘lcham:/ })).not.toBeInTheDocument();
    expect(action('To‘plamni savatga')).toBeEnabled();
    expect(screen.getByRole('link', { name: 'Kolleksiyalar' })).toHaveAttribute('href', '/mobile/bundles');
  });

  it('switches gallery photos without losing the selected sizes', async () => {
    render(app());
    fireEvent.click(await screen.findByRole('button', { name: 'O‘lcham: 38' }));
    const thumbnails = within(document.querySelector('.bde-gallery__thumbs'));
    fireEvent.click(thumbnails.getByRole('button', { name: 'Surat 2' }));
    expect(document.querySelector('.bde-gallery__main img')).toHaveAttribute('src', '/jacket.jpg');
    expect(screen.getByRole('button', { name: 'O‘lcham: 38' })).toHaveAttribute('aria-pressed', 'true');
  });

  it('provides retry for a failed load and cancels requests when leaving', async () => {
    apiFetch.mockResolvedValueOnce({ success: false, status: 503 }).mockResolvedValueOnce({ success: true, data: bundle });
    const view = render(app());
    fireEvent.click(await screen.findByRole('button', { name: 'Qayta urinish' }));
    await screen.findByRole('heading', { name: 'Norka to‘plami' });
    const signal = apiFetch.mock.calls[1][1].signal;
    view.unmount();
    expect(signal.aborted).toBe(true);
  });

  it('shows an explicit missing page rather than a blank screen', async () => {
    apiFetch.mockResolvedValue({ success: false, status: 404 });
    render(app());
    expect(await screen.findByRole('heading', { name: 'Bu to‘plam topilmadi.' })).toBeInTheDocument();
    expect(screen.getAllByRole('link', { name: 'Kolleksiyalar' })).toHaveLength(2);
  });
});

describe('bundle payload compatibility', () => {
  it('resolves legacy photo objects and keeps multiword colours intact', () => {
    const product = normalizeEditorialProduct({ ...suit, image: '/placeholder.jpg', images: [{ ...'https://example.com/suit.jpg' }], colors: ['Dark blue'], sizes: ['38 40'] });
    expect(product.image).toBe('https://example.com/suit.jpg');
    expect(product.colors).toEqual(['Dark blue']);
    expect(product.sizes).toEqual(['38', '40']);
  });

  it('preserves a zero price and calculates a missing fixed discount price', () => {
    expect(getEditorialPrices({ originalPrice: 1000, discountedPrice: 0 }, [])).toEqual({ original: 1000, discounted: 0, savings: 1000 });
    expect(getEditorialPrices({ discountType: 'fixed', discountValue: 200 }, [{ price: 1000 }])).toEqual({ original: 1000, discounted: 800, savings: 200 });
  });
});

describe('final mobile Studio controls', () => {
  it.each(['', '?template=maison', '?template=atelier'])('uses Studio without preview controls for %s', async (query) => {
    render(app(true, query));
    await screen.findByRole('heading', { name: 'Norka to‘plami', level: 1 });
    expect(document.querySelector('.bmt-studio__track')).toBeInTheDocument();
    expect(document.querySelector('.bmt-picker')).not.toBeInTheDocument();
    expect(document.querySelector('.bmt-maison')).not.toBeInTheDocument();
    expect(document.querySelector('.bmt-atelier')).not.toBeInTheDocument();
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1);
  });

  it('uses named colour swatches and segmented sizes on mobile', async () => {
    apiFetch.mockResolvedValue({ success: true, data: { ...bundle, products: [{ ...suit, colors: ['#1b1b19'] }, jacket] } });
    render(app(true));
    const black = await screen.findByRole('button', { name: 'Rang: Qora' });
    expect(black).toHaveClass('bmo-colour');
    expect(black).toHaveAttribute('aria-pressed', 'true');
    expect(black.querySelector('svg')).not.toBeInTheDocument();
    expect(screen.getByText('Qora')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'O‘lcham: 48' })).toBeDisabled();
    fireEvent.click(screen.getByRole('button', { name: 'O‘lcham: 38' }));
    expect(screen.getByRole('button', { name: 'O‘lcham: 38' })).toHaveClass('bmo-size');
    expect(screen.getByRole('button', { name: 'O‘lcham: 38' })).toHaveAttribute('aria-pressed', 'true');
  });

  it('clears an incompatible size when the colour changes and submits the original colour value', async () => {
    const garment = {
      ...jacket, colors: ['#000', '#fff'],
      variants: [
        { color: '#000', size: '38', stock: 2 },
        { color: '#000', size: '48', stock: 0 },
        { color: '#fff', size: '48', stock: 2 },
      ],
    };
    apiFetch.mockResolvedValue({ success: true, data: { ...bundle, products: [garment] } });
    render(app(true));
    fireEvent.click(await screen.findByRole('button', { name: 'Rang: Qora' }));
    fireEvent.click(screen.getByRole('button', { name: 'O‘lcham: 38' }));
    fireEvent.click(screen.getByRole('button', { name: 'Rang: Oq' }));
    expect(screen.getByRole('button', { name: 'O‘lcham: 38' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'O‘lcham: 38' })).toHaveAttribute('aria-pressed', 'false');
    expect(screen.getByRole('button', { name: 'O‘lcham: 48' })).toBeEnabled();
    fireEvent.click(screen.getByRole('button', { name: 'O‘lcham: 48' }));
    fireEvent.click(action('To‘plamni savatga'));
    await waitFor(() => expect(addLookToCart).toHaveBeenCalledWith(
      expect.objectContaining({ _id: 'edit' }),
      { jacket: { color: '#fff', size: '48' } },
    ));
    expect(apiFetch).toHaveBeenCalledTimes(1);
  });

  it('keeps the desktop gallery and option controls intact', async () => {
    render(app(false, '?template=studio'));
    await screen.findByRole('heading', { name: 'Norka to‘plami' });
    expect(document.querySelector('.bde-gallery__stage')).toBeInTheDocument();
    expect(document.querySelector('.bmo')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'O‘lcham: 38' })).toHaveClass('bde-choice');
  });

  it('localizes common colours and preserves unfamiliar names', () => {
    expect(getBundleColour('#000', 'uz')).toEqual({ label: 'Qora', css: '#000' });
    expect(getBundleColour('#1b1b19', 'en').label).toBe('Black');
    expect(getBundleColour('#fff', 'ru').label).toBe('Белый');
    expect(getBundleColour('Custom taupe')).toEqual({ label: 'Custom taupe', css: undefined });
  });
});
