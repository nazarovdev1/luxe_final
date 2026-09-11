import React from 'react';
import toast from 'react-hot-toast';
import CartToast from '../components/CartToast';

export const showCartToast = ({
  title = "Savatga qo'shildi",
  itemName,
  meta,
  quantity,
  duration = 4200,
} = {}) => toast.custom(
  (toastInstance) => (
    <CartToast
      toastInstance={toastInstance}
      title={title}
      itemName={itemName}
      meta={meta}
      quantity={quantity}
      duration={duration}
    />
  ),
  { duration, position: 'top-right' },
);
