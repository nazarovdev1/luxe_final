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

  it('renders the login variant with LUXX Monograph and Crown icon', () => {
    render(<AuthOpening variant="login" />);
    expect(screen.getByText('LUXX')).toBeDefined();
    expect(screen.getByText(/AUTHENTICATING PRIVATE CLIENT/i)).toBeDefined();
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
