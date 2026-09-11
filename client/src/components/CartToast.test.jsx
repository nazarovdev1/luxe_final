import React from 'react';
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import CartToast from './CartToast';

vi.mock('react-hot-toast', () => ({ default: { dismiss: vi.fn() } }));

describe('CartToast', () => {
  it('shows the cart update, product name, and quantity in the redesigned receipt card', () => {
    render(
      <CartToast
        toastInstance={{ id: 'toast-1', visible: true }}
        title="Savatga qo'shildi"
        itemName="Bordo Elegant Blazer"
        quantity={2}
        duration={4200}
      />,
    );

    expect(screen.getByText('SAVAT')).toBeInTheDocument();
    expect(screen.getByText("Savatga qo'shildi")).toBeInTheDocument();
    expect(screen.getByText('Bordo Elegant Blazer')).toBeInTheDocument();
    expect(screen.getByText('2 dona')).toBeInTheDocument();
  });
});
