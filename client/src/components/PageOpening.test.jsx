import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import PageOpening from './PageOpening';

const setReducedMotion = (reduce) => {
  window.matchMedia = vi.fn().mockImplementation((query) => ({
    matches: reduce && query.includes('reduce'),
    media: query,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  }));
};

describe('PageOpening', () => {
  beforeEach(() => {
    sessionStorage.clear();
    setReducedMotion(false);
  });
  afterEach(() => vi.restoreAllMocks());

  it('shows on the first visit and hides the site navbar while it plays', () => {
    const events = [];
    window.addEventListener('luxx:chrome-visibility', (event) => events.push(event.detail.hidden));
    render(<PageOpening id="test" build={() => {}}><p>Opening art</p></PageOpening>);
    expect(screen.getByText('Opening art')).toBeTruthy();
    expect(events).toContain(true);
  });

  it('can be skipped with the button', () => {
    render(<PageOpening id="test" build={() => {}}><p>Opening art</p></PageOpening>);
    act(() => { fireEvent.click(screen.getByRole('button', { name: /o‘tkazib yuborish/i })); });
    expect(screen.queryByText('Opening art')).toBeNull();
  });

  it('plays again on every visit', () => {
    const first = render(<PageOpening id="test" build={() => {}}><p>Opening art</p></PageOpening>);
    act(() => { fireEvent.click(screen.getByRole('button', { name: /o‘tkazib yuborish/i })); });
    first.unmount();
    render(<PageOpening id="test" build={() => {}}><p>Opening art</p></PageOpening>);
    expect(screen.getByText('Opening art')).toBeTruthy();
  });

  it('never plays for visitors who prefer reduced motion', () => {
    setReducedMotion(true);
    render(<PageOpening id="test" build={() => {}}><p>Opening art</p></PageOpening>);
    expect(screen.queryByText('Opening art')).toBeNull();
  });
});
