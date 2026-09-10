import React from 'react';
import '@testing-library/jest-dom';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import axios from 'axios';
import AdminBadges from './AdminBadges';
import { useAuth } from '../contexts/AuthContext';

vi.mock('axios');
vi.mock('../contexts/AuthContext', () => ({ useAuth: vi.fn() }));

describe('AdminBadges', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuth.mockReturnValue({ token: 'test-token' });
    axios.get.mockResolvedValue({ data: { success: true, data: [] } });
  });

  it('lets admins choose a modern Lucide icon instead of typing an emoji', async () => {
    render(<AdminBadges />);

    fireEvent.click(screen.getByRole('button', { name: /yangi nishon/i }));
    const crown = screen.getByRole('button', { name: 'Toj' });
    fireEvent.click(crown);

    expect(crown).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByText('Toj')).toBeInTheDocument();
    expect(screen.queryByText('Ikonka (Emoji)')).not.toBeInTheDocument();
    await waitFor(() => expect(axios.get).toHaveBeenCalledWith('/api/badges'));
  });

  it('submits the selected icon name to the badge API', async () => {
    axios.post.mockResolvedValue({ data: { success: true } });
    render(<AdminBadges />);

    await waitFor(() => expect(axios.get).toHaveBeenCalledWith('/api/badges'));
    fireEvent.click(screen.getByRole('button', { name: /yangi nishon/i }));
    fireEvent.click(screen.getByRole('button', { name: 'Qimmatbaho tosh' }));
    fireEvent.change(screen.getByPlaceholderText('Masalan: VIP Xaridor'), { target: { value: 'Gem Collector' } });
    fireEvent.change(screen.getAllByRole('textbox')[1], { target: { value: 'Collect gems' } });
    fireEvent.change(screen.getByRole('spinbutton'), { target: { value: '100' } });
    fireEvent.click(screen.getByRole('button', { name: 'Saqlash' }));

    await waitFor(() => expect(axios.post).toHaveBeenCalledWith(
      '/api/badges',
      expect.objectContaining({ name: 'Gem Collector', description: 'Collect gems', icon: 'Gem', threshold: '100' }),
      { headers: { Authorization: 'Bearer test-token' } },
    ));
  });
});
