import { useEffect, useRef, useState } from 'react';
import axios from 'axios';

export const PENDING_ORDERS_POLL_MS = 60 * 1000;

// Polls the staff-only counter so new orders are visible even when Telegram is down.
export default function usePendingOrders(token, { onIncrease } = {}) {
  const [counts, setCounts] = useState({ pending: 0, unnotified: 0 });
  const previousPending = useRef(null);
  const onIncreaseRef = useRef(onIncrease);
  onIncreaseRef.current = onIncrease;

  useEffect(() => {
    if (!token) return undefined;
    let cancelled = false;

    const load = async () => {
      try {
        const res = await axios.get('/api/orders/pending-count', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = res?.data?.data;
        if (cancelled || !res?.data?.success || !data) return;
        setCounts({ pending: data.pending || 0, unnotified: data.unnotified || 0 });
        if (previousPending.current !== null && data.pending > previousPending.current) {
          onIncreaseRef.current?.(data.pending - previousPending.current);
        }
        previousPending.current = data.pending || 0;
      } catch {
        // Polling is best-effort; the orders tab still loads the full list.
      }
    };

    load();
    const timer = setInterval(load, PENDING_ORDERS_POLL_MS);
    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, [token]);

  return counts;
}
