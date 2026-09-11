import React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import ConfirmDialog from './ConfirmDialog';
import { requestConfirmation } from '../utils/confirmDialog';

describe('ConfirmDialog', () => {
  it('shows a branded destructive confirmation and resolves the user choice', async () => {
    render(<ConfirmDialog />);

    let confirmation;
    await act(async () => {
      confirmation = requestConfirmation("Haqiqatan ham mahsulotni o'chirmoqchimisiz?");
    });

    expect(await screen.findByText("O'chirishni tasdiqlaysizmi?")).toBeTruthy();
    expect(screen.getByRole('button', { name: "O'chirish" })).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: 'Bekor qilish' }));

    await expect(confirmation).resolves.toBe(false);
  });
});
