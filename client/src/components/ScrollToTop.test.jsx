import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, useNavigate } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import ScrollToTop from './ScrollToTop';

function Navigation() {
  const navigate = useNavigate();
  return <><ScrollToTop /><button onClick={() => navigate('/?look=example')}>Open look</button><button onClick={() => navigate('/products')}>Catalog</button><button onClick={() => navigate(-1)}>Back</button></>;
}

describe('scroll restoration', () => {
  beforeEach(() => { vi.clearAllMocks(); });
  const setup = () => render(<MemoryRouter initialEntries={['/']} future={{ v7_startTransition: true, v7_relativeSplatPath: true }}><Navigation /></MemoryRouter>);

  it('keeps the scroll position when a look opens on the same page', () => {
    setup();
    fireEvent.click(screen.getByText('Open look'));
    expect(window.scrollTo).not.toHaveBeenCalled();
  });

  it('scrolls to the top when navigating to a different page', () => {
    setup();
    fireEvent.click(screen.getByText('Catalog'));
    expect(window.scrollTo).toHaveBeenCalledWith(0, 0);
  });

  it('preserves browser back restoration after a page change', () => {
    setup();
    fireEvent.click(screen.getByText('Catalog'));
    vi.clearAllMocks();
    fireEvent.click(screen.getByText('Back'));
    expect(window.scrollTo).not.toHaveBeenCalled();
  });
});
