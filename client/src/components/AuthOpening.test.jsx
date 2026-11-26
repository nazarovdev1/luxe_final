import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import AuthOpening from './AuthOpening';

describe('AuthOpening Component', () => {
  beforeEach(() => {
    // Ensure matchMedia mock is available
    window.matchMedia = window.matchMedia || vi.fn().mockImplementation((query) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));
  });

  it('renders the stitch opening for login, in the visitor\'s language', () => {
    const { container } = render(<AuthOpening variant="login" language="ru" />);
    expect(container.querySelectorAll('.stitch-op__half')).toHaveLength(2);
    expect(screen.getAllByText('Luxx').length).toBeGreaterThan(0);
    expect(screen.getAllByText('ОТОБРАНО ВРУЧНУЮ · ТАШКЕНТ')).toHaveLength(2);
  });

  it('stays out of the mobile app, which has its own section opening', () => {
    window.history.pushState({}, '', '/mobile/login');
    try {
      const { container } = render(<AuthOpening variant="login" />);
      expect(container.innerHTML).toBe('');
    } finally {
      window.history.pushState({}, '', '/');
    }
  });

  it('renders the register variant with 3D VIP Pass Noir details', () => {
    render(<AuthOpening variant="register" />);
    expect(screen.getByText('MAISON LUXX')).toBeDefined();
    expect(screen.getByText(/VIP PRIVILÈGE • NOIR/i)).toBeDefined();
    expect(screen.getByText(/NOUVEAU MEMBRE • 2026/i)).toBeDefined();
  });

  it('respects prefers-reduced-motion without breaking', () => {
    window.matchMedia = vi.fn().mockImplementation((query) => ({
      matches: query.includes('prefers-reduced-motion'),
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));

    const { container } = render(<AuthOpening variant="login" />);
    expect(container.firstChild).toBeNull();
  });
});
