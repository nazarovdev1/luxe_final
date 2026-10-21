import React from 'react';
import { vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Checkout from './Checkout';

const createOrder = vi.fn();
const clearCart = vi.fn();

vi.mock('../../contexts/CartContext', () => ({
  useCart: () => ({
    items: [{ id: 'c1', productId: 'p1', name: 'Max Mara palto', price: 2800000, image: '/x.jpg', quantity: 1, selectedSize: '38' }],
    lookItems: [],
    clearCart,
  }),
}));
vi.mock('../../contexts/AuthContext', () => ({
  useAuth: () => ({ user: { _id: 'u1', username: 'Aziza' }, isAuthenticated: true, loading: false, token: 't' }),
}));
vi.mock('../../contexts/LanguageContext', () => ({
  useLanguage: () => ({ t: (key) => key, language: 'uz' }),
}));
vi.mock('../../server/server', () => ({
  default: () => ({ createOrder, validatePromo: vi.fn(), validateGiftCard: vi.fn(), validateCoupon: vi.fn() }),
}));
vi.mock('../../components/OrderSuccessModal', () => ({ default: ({ isOpen }) => (isOpen ? <p>order-success</p> : null) }));
vi.mock('../../components/CheckoutMap', () => ({
  default: ({ onPositionChange }) => <button type="button" onClick={() => onPositionChange({ lat: 41.3, lng: 69.2 })}>pick-on-map</button>,
}));
vi.mock('axios', () => ({ default: { get: vi.fn(() => Promise.resolve({ data: {} })) } }));

const renderCheckout = () => render(<MemoryRouter><Checkout /></MemoryRouter>);
const next = () => fireEvent.click(screen.getByRole('button', { name: /Davom etish|Buyurtma berish/ }));

describe('mobile checkout', () => {
  beforeEach(() => {
    createOrder.mockReset();
    clearCart.mockReset();
  });

  it('keeps the customer on step 1 until name and phone are valid', () => {
    renderCheckout();
    next();
    expect(screen.getByText('Ismingizni kiriting')).toBeTruthy();
    expect(screen.getByText("Siz bilan qanday bog'lanamiz?")).toBeTruthy();
  });

  it('walks through the three steps and sends the order with the same payload shape', async () => {
    createOrder.mockResolvedValue({ success: true, orderId: 'o1', total: 2800000 });
    renderCheckout();

    fireEvent.change(document.querySelector('input[name="firstName"]'), { target: { value: 'Aziza' } });
    fireEvent.change(document.querySelector('input[name="phone"]'), { target: { value: '+998 90 123 45 67' } });
    next();

    expect(await screen.findByText('Qayerga yetkazamiz?')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'checkoutPage.regions_0' }));
    fireEvent.change(document.querySelector('input[name="street"]'), { target: { value: 'Amir Temur 12' } });
    fireEvent.click(await screen.findByText('pick-on-map'));
    next();

    expect(await screen.findByText('Buyurtmani tekshiring')).toBeTruthy();
    fireEvent.click(document.querySelector('.mo-agree input'));
    next();

    await waitFor(() => expect(createOrder).toHaveBeenCalledTimes(1));
    const payload = createOrder.mock.calls[0][0];
    expect(payload.customer).toMatchObject({ name: 'Aziza', phone: '+998901234567', address: 'checkoutPage.regions_0, Amir Temur 12' });
    expect(payload.items[0]).toMatchObject({ product: 'p1', quantity: 1, price: 2800000, selectedSize: '38' });
    expect(payload.paymentMethod).toBe('cash_on_delivery');
    expect(payload.totals.total).toBe(2800000);
    expect(await screen.findByText('order-success')).toBeTruthy();
    expect(clearCart).toHaveBeenCalled();
  });
});
