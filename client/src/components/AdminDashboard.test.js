import React from 'react';
import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import axios from 'axios';
import AdminDashboard from './AdminDashboard';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useProducts } from '../contexts/ProductContext';

vi.mock('axios');
vi.mock('../contexts/AuthContext', () => ({ useAuth: vi.fn() }));
vi.mock('../contexts/LanguageContext', () => ({ useLanguage: vi.fn() }));
vi.mock('../contexts/ProductContext', () => ({ useProducts: vi.fn() }));

vi.mock('./ProductForm', () => ({ default: () => <div>Product form</div> }));
vi.mock('./AdminOrders', () => ({ default: () => <div>Orders panel</div> }));
vi.mock('./AdminUsers', () => ({ default: () => <div>Users panel</div> }));
vi.mock('./AdminAnnouncements', () => ({ default: () => <div>Announcements panel</div> }));
vi.mock('./LookbookManager', () => ({ default: () => <div>Lookbook panel</div> }));
vi.mock('./BundleManager', () => ({ default: () => <div>Bundles panel</div> }));
vi.mock('./AdminPromos', () => ({ default: () => <div>Promos panel</div> }));
vi.mock('./AdminCoupons', () => ({ default: () => <div>Coupons panel</div> }));
vi.mock('./AdminChallenges', () => ({ default: () => <div>Challenges panel</div> }));
vi.mock('./AdminBadges', () => ({ default: () => <div>Badges panel</div> }));
vi.mock('./AdminReels', () => ({ default: () => <div>Reels panel</div> }));
vi.mock('./AdminStylePolls', () => ({ default: () => <div>Community panel</div> }));
vi.mock('./admin/BlogManager', () => ({ default: () => <div>Blog panel</div> }));

const renderDashboard = () => render(
  <MemoryRouter>
    <AdminDashboard />
  </MemoryRouter>,
);

describe('AdminDashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    axios.get.mockImplementation(() => new Promise(() => {}));
    useAuth.mockReturnValue({ logout: vi.fn(), token: 'test-token' });
    useLanguage.mockReturnValue({ t: (key) => key });
    useProducts.mockReturnValue({
      products: [],
      removeProduct: vi.fn(),
      isLoading: false,
    });
  });

  it('renders the overview without an undeclared tab configuration error', () => {
    renderDashboard();

    expect(screen.getByText('THE DAILY EDIT')).toBeInTheDocument();
    expect(screen.getByText('Console')).toBeInTheDocument();
  });

  it('uses the selected tab configuration in the page header', () => {
    renderDashboard();

    fireEvent.click(screen.getByRole('button', { name: /Buyurtmalar/ }));

    expect(screen.getByText('HOLAT VA YETKAZIB BERISHNI NAZORAT QILISH')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Buyurtmalar' })).toBeInTheDocument();
    expect(screen.getByText('Orders panel')).toBeInTheDocument();
  });
});
