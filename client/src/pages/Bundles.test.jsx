import React from 'react';
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { BundleList } from './Bundles';

vi.mock('../contexts/LanguageContext', () => ({ useLanguage: () => ({ language: 'uz' }) }));
vi.mock('../server/server', () => ({
  default: () => ({
    getAllBundles: () => Promise.resolve({
      success: true,
      data: [
        {
          _id: 'set-1',
          title: 'Kechki to‘plam',
          isActive: true,
          originalPrice: 3000000,
          discountedPrice: 2700000,
          products: [
            { _id: 'p1', name: 'Palto', price: 2000000, images: [{ url: '/palto.jpg' }] },
            { _id: 'p2', name: 'Yubka', price: 1000000, image: '/yubka.jpg' },
          ],
        },
        { _id: 'set-2', title: 'Yashirin', isActive: false, products: [{ _id: 'p3', name: 'Shim', price: 1 }] },
      ],
    }),
  }),
}));

describe('BundleList', () => {
  it('lists only active sets, their pieces and what the customer saves', async () => {
    render(<MemoryRouter><BundleList basePath="/mobile" /></MemoryRouter>);

    expect(await screen.findByText('Kechki to‘plam')).toBeInTheDocument();
    expect(screen.queryByText('Yashirin')).not.toBeInTheDocument();
    expect(screen.getByText('Palto')).toBeInTheDocument();
    expect(screen.getByText("2 700 000 so'm")).toBeInTheDocument();
    expect(screen.getByText("300 000 so'm tejaysiz")).toBeInTheDocument();
    expect(screen.getByRole('link')).toHaveAttribute('href', '/mobile/bundle/set-1');
  });
});
