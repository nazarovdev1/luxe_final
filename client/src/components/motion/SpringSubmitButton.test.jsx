import React from 'react';
import { vi } from 'vitest';
import '@testing-library/jest-dom';
import { act, fireEvent, render, renderHook, screen } from '@testing-library/react';
import SpringSubmitButton from './SpringSubmitButton';
import useOrderCelebration, { ORDER_SUCCESS_REVEAL_MS } from '../../hooks/useOrderCelebration';
import { SPRING, clamp, isAtRest, makeSpring, stepSpring } from '../../utils/springs';

describe('springs', () => {
  test('use the tuned stiffness and damping values', () => {
    expect(SPRING.submit.width).toEqual([300, 22]);
    expect(SPRING.submit.tick).toEqual([120, 20]);
    expect(SPRING.bottomBar.label).toEqual([300, 26]);
    expect(SPRING.bottomBar.pop).toEqual([520, 14]);
    expect(SPRING.bottomBar.highlight).toEqual([340, 28]);
  });

  test('a spring settles on its target, and an underdamped one overshoots first', () => {
    const s = makeSpring(0, SPRING.bottomBar.pop);
    s.t = 1;
    let peak = 0;
    for (let i = 0; i < 4000; i += 1) { stepSpring(s, 1 / 240); peak = Math.max(peak, s.x); }
    expect(peak).toBeGreaterThan(1.05);
    expect(isAtRest(s)).toBe(true);
    expect(s.x).toBeCloseTo(1, 1);
    expect(clamp(5, 0, 1)).toBe(1);
  });
});

describe('SpringSubmitButton', () => {
  const renderButton = (props = {}) => render(
    <SpringSubmitButton loadingLabel="Yuborilmoqda" successLabel="Qabul qilindi" {...props}>
      Yuborish
    </SpringSubmitButton>,
  );

  test('idle: shows the label and calls onClick', () => {
    const onClick = vi.fn();
    renderButton({ onClick });
    fireEvent.click(screen.getByRole('button', { name: /Yuborish/ }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  test('loading: announces progress and ignores clicks', () => {
    const onClick = vi.fn();
    const { rerender } = renderButton({ onClick });
    rerender(
      <SpringSubmitButton status="loading" onClick={onClick} loadingLabel="Yuborilmoqda" successLabel="Qabul qilindi">Yuborish</SpringSubmitButton>,
    );
    const button = screen.getByRole('button', { name: 'Yuborilmoqda' });
    expect(button).toHaveAttribute('aria-busy', 'true');
    fireEvent.click(button);
    expect(onClick).not.toHaveBeenCalled();
  });

  test('success: names the result, then returns to idle', () => {
    const { rerender } = renderButton({ status: 'success' });
    expect(screen.getByRole('button', { name: 'Qabul qilindi' })).toBeInTheDocument();
    rerender(
      <SpringSubmitButton status="idle" loadingLabel="Yuborilmoqda" successLabel="Qabul qilindi">Yuborish</SpringSubmitButton>,
    );
    expect(screen.getByRole('button', { name: /Yuborish/ })).not.toHaveAttribute('aria-busy');
  });

  test('a disabled button never fires', () => {
    const onClick = vi.fn();
    renderButton({ onClick, disabled: true });
    fireEvent.click(screen.getByRole('button'));
    expect(onClick).not.toHaveBeenCalled();
  });
});

describe('useOrderCelebration', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  test('keeps the cart until the animation ends, then clears it and opens the modal', () => {
    const clearCart = vi.fn();
    const onReveal = vi.fn();
    const { result } = renderHook(() => useOrderCelebration({ clearCart, onReveal }));

    act(() => result.current.celebrate());
    expect(result.current.placed).toBe(true);
    expect(clearCart).not.toHaveBeenCalled();

    act(() => { vi.advanceTimersByTime(ORDER_SUCCESS_REVEAL_MS + 10); });
    expect(clearCart).toHaveBeenCalledTimes(1);
    expect(onReveal).toHaveBeenCalledTimes(1);
  });

  test('leaving early still clears the cart once, so the order is never placed twice', () => {
    const clearCart = vi.fn();
    const onReveal = vi.fn();
    const { result, unmount } = renderHook(() => useOrderCelebration({ clearCart, onReveal }));
    act(() => result.current.celebrate());
    unmount();
    expect(clearCart).toHaveBeenCalledTimes(1);
    expect(onReveal).not.toHaveBeenCalled();
    act(() => { vi.advanceTimersByTime(ORDER_SUCCESS_REVEAL_MS * 2); });
    expect(clearCart).toHaveBeenCalledTimes(1);
  });
});
