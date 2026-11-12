import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import '@testing-library/jest-dom';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { apiFetch } from '../../services/api';
import { useCart } from '../../contexts/CartContext';
import translations from '../../data/translations';
import MobileLookDetail from './MobileLookDetail';

const cachedProducts = [];
vi.mock('../../services/api', () => ({ apiFetch: vi.fn() }));
vi.mock('../../contexts/CartContext', () => ({ useCart: vi.fn() }));
vi.mock('../../contexts/ProductContext', () => ({ useProducts: () => ({ products: cachedProducts }) }));
vi.mock('../../contexts/LanguageContext', () => ({
  useLanguage: () => ({ t: (key) => key.split('.').reduce((value, part) => value?.[part], translations.uz) || key }),
}));
vi.mock('react-hot-toast', () => ({ default: { success: vi.fn(), error: vi.fn() } }));

const product = {
  _id: 'dress', name: 'Silk dress', price: 1250000, stock: 2, colors: ['Black'], sizes: ['S', 'M'],
  image: '/placeholder.jpg', images: [{ ...'https://example.com/dress.jpg', _id: 'legacy-image' }],
  variants: [{ _id: 'variant-s', color: 'Black', size: 'S', stock: 2, isActive: true }, { _id: 'variant-m', color: 'Black', size: 'M', stock: 0 }],
};
const addToCart = vi.fn();
const mount = () => render(<MemoryRouter initialEntries={['/mobile/lookbooks/evening']}><Routes><Route path="/mobile/lookbooks/:id" element={<MobileLookDetail />} /></Routes></MemoryRouter>);

beforeEach(() => {
  vi.clearAllMocks();
  useCart.mockReturnValue({ addToCart, totalItems: 0 });
  Element.prototype.scrollIntoView = vi.fn();
  apiFetch.mockResolvedValue({ success: true, data: { _id: 'evening', title: 'Evening silhouette', heroImage: '/evening.jpg', products: [product] } });
});

describe('mobile look selection', () => {
  it('requires a size and adds the selected available variant to the cart', async () => {
    mount();
    await screen.findByText('Silk dress');
    expect(document.querySelector('.mlb-product img')).toHaveAttribute('src', 'https://example.com/dress.jpg');
    expect(apiFetch).toHaveBeenCalledWith('/api/looks/evening', expect.objectContaining({ signal: expect.any(AbortSignal) }));
    fireEvent.click(screen.getByRole('button', { name: 'Barchasini savatga' }));
    expect(screen.getByRole('alert')).toHaveTextContent("O'lcham tanlang");
    expect(addToCart).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole('button', { name: 'S', exact: true }));
    fireEvent.click(screen.getByRole('button', { name: 'Barchasini savatga' }));
    await waitFor(() => expect(addToCart).toHaveBeenCalledWith(expect.objectContaining({ id: 'dress' }), 'Black', 'S', 1, product.variants[0]));
  });

  it('does not add a sold out variant', async () => {
    mount();
    fireEvent.click(await screen.findByRole('button', { name: 'M', exact: true }));
    fireEvent.click(screen.getByRole('button', { name: 'Barchasini savatga' }));
    expect(screen.getByRole('alert')).toHaveTextContent('Tugagan');
    expect(addToCart).not.toHaveBeenCalled();
  });

  it('provides a way back for a missing look', async () => {
    apiFetch.mockResolvedValue({ success: false, status: 404 });
    mount();
    expect(await screen.findByText('Look topilmadi')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Lookbookga qaytish' })).toHaveAttribute('href', '/mobile/lookbooks');
  });
});
