import React from 'react';
import '@testing-library/jest-dom';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import BundleManager from './BundleManager';
import useProductService from '../server/server';

const service = {
  getAllBundles: vi.fn(),
  createBundle: vi.fn(),
  updateBundle: vi.fn(),
  deleteBundle: vi.fn(),
  getAllProducts: vi.fn(),
};

vi.mock('../server/server', () => ({ default: vi.fn() }));
vi.mock('../contexts/LanguageContext', () => ({
  useLanguage: () => ({ t: (key) => (key === 'common.sum' ? "so'm" : key) }),
}));
vi.mock('react-hot-toast', () => ({
  toast: { error: vi.fn(), success: vi.fn() },
}));

describe('BundleManager', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useProductService.mockReturnValue(service);
    service.getAllBundles.mockResolvedValue({
      success: true,
      data: [{
        _id: 'bundle-1',
        title: 'Classic set',
        description: 'Two piece set',
        products: [{ _id: 'product-1', name: 'Black jacket', price: 100000 }],
        discountType: 'percentage',
        discountValue: 10,
      }],
    });
    service.getAllProducts.mockResolvedValue([{ id: 'product-1', name: 'Black jacket', price: 100000 }]);
    service.updateBundle.mockResolvedValue({
      success: true,
      data: { _id: 'bundle-1', title: 'Updated set', products: [{ _id: 'product-1', name: 'Black jacket' }] },
    });
  });

  it('opens an existing bundle in edit mode and sends its updated values', async () => {
    render(<BundleManager />);

    await waitFor(() => expect(screen.getAllByText('Classic set').length).toBeGreaterThan(0));
    fireEvent.click(screen.getByRole('button', { name: /classic set to'plamini tahrirlash/i }));

    expect(screen.getByText("To'plamni tahrirlash")).toBeInTheDocument();
    fireEvent.change(screen.getByDisplayValue('Classic set'), { target: { value: 'Updated set' } });
    fireEvent.click(screen.getByRole('button', { name: "O'zgarishlarni saqlash" }));

    await waitFor(() => expect(service.updateBundle).toHaveBeenCalledWith(
      'bundle-1',
      expect.objectContaining({
        title: 'Updated set',
        products: ['product-1'],
        discountType: 'percentage',
        discountValue: 10,
      }),
      null,
    ));
  });
});
