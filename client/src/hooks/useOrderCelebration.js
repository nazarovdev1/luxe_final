import { useCallback, useEffect, useRef, useState } from 'react';

// How long the button's success animation plays before the order modal takes over.
export const ORDER_SUCCESS_REVEAL_MS = 1250;

// After an order is created the checkout button plays its success animation. The cart is
// emptied and the confirmation modal opens when it ends, so the order summary does not
// vanish under the animation. If the shopper leaves in the meantime the cart is still
// cleared on unmount: the order exists and must not be placed twice.
export default function useOrderCelebration({ clearCart, onReveal }) {
  const [placed, setPlaced] = useState(false);
  const pending = useRef(false);
  const timer = useRef(0);
  const latest = useRef({ clearCart, onReveal });
  latest.current = { clearCart, onReveal };

  const flush = useCallback((reveal) => {
    if (!pending.current) return;
    pending.current = false;
    window.clearTimeout(timer.current);
    latest.current.clearCart();
    if (reveal) latest.current.onReveal();
  }, []);

  const celebrate = useCallback(() => {
    if (pending.current) return;
    pending.current = true;
    setPlaced(true);
    timer.current = window.setTimeout(() => flush(true), ORDER_SUCCESS_REVEAL_MS);
  }, [flush]);

  useEffect(() => () => flush(false), [flush]);

  return { placed, celebrate };
}
