import React from 'react';
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import SizeGuideModal from './SizeGuideModal';

vi.mock('../contexts/LanguageContext', () => ({
  useLanguage: () => ({ t: (key) => key }),
}));
vi.mock('../utils/analytics', () => ({ trackEvent: vi.fn() }));

describe('SizeGuideModal', () => {
  it('shows the product-specific size guide and international conversions', () => {
    render(
      <SizeGuideModal
        isOpen
        onClose={vi.fn()}
        product={{
          id: 'product-1',
          name: 'Silk blazer',
          sizeGuide: [{ size: 'M', bust: 92, waist: 72, hips: 98, length: 70 }],
          sizeConversions: { US: '8', EU: '38', UK: '12', RU: '' },
        }}
      />,
    );

    expect(screen.getByRole('button', { name: /silk blazer.*o'lchamlar/i })).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: 'M' })).toBeInTheDocument();
    expect(screen.getByText('US: 8')).toBeInTheDocument();
    expect(screen.getByText('EU: 38')).toBeInTheDocument();
  });
});
