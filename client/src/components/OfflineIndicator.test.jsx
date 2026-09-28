import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import OfflineIndicator from './OfflineIndicator';

vi.mock('../contexts/LanguageContext', () => ({
  useLanguage: () => ({
    t: (key, fallback) => {
      const translations = {
        'offline.offlineMode': 'Oflayn rejim - saqlangan mahsulotlarni ko\'rishingiz mumkin',
        'offline.onlineRestored': 'Internet aloqasi tiklandi',
        'offline.updateAvailable': 'Yangi versiya mavjud',
      };
      return translations[key] || fallback || key;
    },
  }),
}));

describe('OfflineIndicator Component', () => {
  it('does not display any banner when online and was not previously offline', () => {
    const { container } = render(<OfflineIndicator isOnline={true} updateAvailable={false} />);
    expect(container.querySelector('.fixed.top-0')).toBeNull();
  });

  it('displays the red offline banner when isOnline is false', () => {
    render(<OfflineIndicator isOnline={false} updateAvailable={false} />);
    expect(screen.getByText(/Oflayn rejim/i)).toBeDefined();
  });

  it('displays the green restored banner when recovering from offline to online', () => {
    const { rerender } = render(<OfflineIndicator isOnline={false} updateAvailable={false} />);
    expect(screen.getByText(/Oflayn rejim/i)).toBeDefined();

    rerender(<OfflineIndicator isOnline={true} updateAvailable={false} />);
    expect(screen.getByText(/Internet aloqasi tiklandi/i)).toBeDefined();
  });

  it('displays update button and fires onUpdate callback when updateAvailable is true', () => {
    const handleUpdate = vi.fn();
    render(<OfflineIndicator isOnline={true} updateAvailable={true} onUpdate={handleUpdate} />);

    const updateButton = screen.getByRole('button', { name: /Yangi versiya mavjud/i });
    expect(updateButton).toBeDefined();

    fireEvent.click(updateButton);
    expect(handleUpdate).toHaveBeenCalledTimes(1);
  });
});
