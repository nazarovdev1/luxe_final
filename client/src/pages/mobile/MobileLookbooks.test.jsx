import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { apiFetch } from '../../services/api';
import translations from '../../data/translations';
import MobileLookbooks from './MobileLookbooks';

vi.mock('../../services/api', () => ({ apiFetch: vi.fn() }));
vi.mock('../../contexts/LanguageContext', () => ({
  useLanguage: () => ({ t: (key) => key.split('.').reduce((value, part) => value?.[part], translations.uz) || key }),
}));

const looks = [
  { _id: 'evening', title: 'Evening silhouette', heroImage: '/evening.jpg', tags: ['Oqshom'], products: [{ _id: 'dress', category: 'Libos' }] },
  { _id: 'city', title: 'City tailoring', heroImage: '/city.jpg', tags: ['Kundalik'], products: [{ _id: 'suit', category: 'Kostyum' }] },
  { _id: 'hidden', title: 'Hidden look', isActive: false, products: [] },
];
const mount = () => render(<MemoryRouter><MobileLookbooks /></MemoryRouter>);

beforeEach(() => vi.clearAllMocks());

describe('mobile lookbook browsing', () => {
  it('opens real look details and filters by both tags and product categories', async () => {
    apiFetch.mockResolvedValue({ success: true, data: looks });
    mount();
    expect(await screen.findByRole('link', { name: /Evening silhouette/ })).toHaveAttribute('href', '/mobile/lookbooks/evening');
    expect(screen.queryByText('Hidden look')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Kostyum' }));
    expect(screen.getByRole('link', { name: /City tailoring/ })).toBeInTheDocument();
    expect(screen.queryByText('Evening silhouette')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Barchasi' }));
    fireEvent.click(screen.getByRole('button', { name: 'Oqshom' }));
    expect(screen.getByText('Evening silhouette')).toBeInTheDocument();
    expect(screen.queryByText('City tailoring')).not.toBeInTheDocument();
  });

  it('shows a skeleton while loading and an honest empty state when there are no looks', async () => {
    let resolve;
    apiFetch.mockReturnValue(new Promise((done) => { resolve = done; }));
    mount();
    expect(screen.getByRole('status')).toHaveAccessibleName('Looklarni yuklash...');
    resolve({ success: true, data: [] });
    expect(await screen.findByText('Yangi obrazlar tayyorlanmoqda')).toBeInTheDocument();
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it('recovers from a network error through retry', async () => {
    apiFetch.mockResolvedValueOnce({ success: false }).mockResolvedValueOnce({ success: true, data: looks });
    mount();
    fireEvent.click(await screen.findByRole('button', { name: 'Qayta urinish' }));
    expect(await screen.findByText('Evening silhouette')).toBeInTheDocument();
    expect(apiFetch).toHaveBeenCalledTimes(2);
  });

  it('aborts its request when leaving the page', () => {
    apiFetch.mockReturnValue(new Promise(() => {}));
    const view = mount();
    const signal = apiFetch.mock.calls[0][1].signal;
    view.unmount();
    expect(signal.aborted).toBe(true);
  });
});
