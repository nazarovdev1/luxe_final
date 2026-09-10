import React from 'react';
import '@testing-library/jest-dom';
import { render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import LookbookManager from './LookbookManager';
import useProductService from '../server/server';

const service = {
  getAllLooks: vi.fn(),
  createLook: vi.fn(),
  deleteLook: vi.fn(),
  getAllProducts: vi.fn(),
  getImageKitAuth: vi.fn(),
};

vi.mock('../server/server', () => ({ default: vi.fn() }));
vi.mock('../contexts/LanguageContext', () => ({
  useLanguage: () => ({ t: (key) => (key === 'common.sum' ? "so'm" : key) }),
}));
vi.mock('react-hot-toast', () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
    loading: vi.fn(),
  },
}));

describe('LookbookManager', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useProductService.mockReturnValue(service);
    service.getAllLooks.mockResolvedValue({
      success: true,
      data: [{
        _id: 'look-1',
        title: 'Bahor kolleksiyasi',
        description: 'Yangi mavsum',
        heroImage: 'https://example.com/look.jpg',
        items: [{ category: 'Koylaklar', count: 2 }],
      }],
    });
    service.getAllProducts.mockResolvedValue([]);
  });

  it('loads existing public looks into the admin manager', async () => {
    render(<LookbookManager />);

    expect(screen.getByText('Lookbook boshqaruvi')).toBeInTheDocument();
    await waitFor(() => expect(screen.getByText('Bahor kolleksiyasi')).toBeInTheDocument());
    expect(service.getAllLooks).toHaveBeenCalledTimes(1);
    expect(service.getAllProducts).toHaveBeenCalledTimes(1);
  });
});
