import React from 'react';
import toast from 'react-hot-toast';
import { X } from 'lucide-react';

const formatQuantity = (quantity) => {
  const count = Number(quantity);
  return Number.isFinite(count) && count > 0 ? `${count} dona` : null;
};

const CartToast = ({ toastInstance, title, itemName, meta, quantity, duration }) => {
  const chipText = formatQuantity(quantity) || (meta ? String(meta) : null);

  return (
    <article
      className={`cart-toast ${toastInstance.visible ? 'is-entering' : 'is-leaving'}`}
      role="status"
      aria-live="polite"
    >
      <div className="cart-toast__main">
        <svg className="cart-toast__seal" viewBox="0 0 36 36" fill="none" aria-hidden="true">
          <circle className="cart-toast__ring" cx="18" cy="18" r="16" pathLength="1" />
          <path className="cart-toast__tick" d="M11 18.5l5 5 9-10.5" pathLength="1" />
        </svg>

        <div className="cart-toast__copy">
          <p className="cart-toast__title">{title}</p>
          {(itemName || chipText) && (
            <p className="cart-toast__item">
              {itemName && <span>{itemName}</span>}
              {itemName && chipText && <i aria-hidden="true" />}
              {chipText && <em>{chipText}</em>}
            </p>
          )}
        </div>

        <button
          type="button"
          onClick={() => toast.dismiss(toastInstance.id)}
          className="cart-toast__close"
          aria-label="Xabarni yopish"
        >
          <X size={15} strokeWidth={1.5} />
        </button>
      </div>
      <span className="cart-toast__progress" style={{ '--toast-duration': `${duration}ms` }} />
    </article>
  );
};

export default CartToast;
