import React, { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap } from 'gsap';
import toast from 'react-hot-toast';
import { Check, ShoppingBag, X } from 'lucide-react';

gsap.registerPlugin(useGSAP);

const formatQuantity = (quantity) => {
  const count = Number(quantity);
  return Number.isFinite(count) && count > 0 ? `${count} dona` : null;
};

const CartToast = ({ toastInstance, title, itemName, meta, quantity, duration }) => {
  const root = useRef(null);
  const chipText = formatQuantity(quantity) || (meta ? String(meta) : null);

  useGSAP(() => {
    const card = root.current;
    if (!card) return undefined;

    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
      if (toastInstance.visible) {
        gsap.fromTo(card, { autoAlpha: 0, y: -18, scale: 0.975 }, { autoAlpha: 1, y: 0, scale: 1, duration: 0.42, ease: 'power3.out' });
      } else {
        gsap.to(card, { autoAlpha: 0, y: -8, scale: 0.985, duration: 0.18, ease: 'power2.in' });
      }
      return undefined;
    }

    const media = gsap.matchMedia();
    media.add({ reduceMotion: '(prefers-reduced-motion: reduce)' }, (context) => {
      if (context.conditions.reduceMotion) {
        gsap.set(card, { autoAlpha: toastInstance.visible ? 1 : 0 });
        return undefined;
      }

      if (toastInstance.visible) {
        const timeline = gsap.timeline({ defaults: { ease: 'power3.out' } });
        timeline
          .fromTo(card, { autoAlpha: 0, y: -18, scale: 0.975 }, { autoAlpha: 1, y: 0, scale: 1, duration: 0.42 })
          .from('.cart-toast__mark', { scale: 0.55, rotation: -12, duration: 0.34, ease: 'back.out(2)' }, 0.08)
          .from('.cart-toast__copy > *', { autoAlpha: 0, x: -10, duration: 0.28, stagger: 0.06 }, 0.13)
          .from('.cart-toast__close', { autoAlpha: 0, scale: 0.7, duration: 0.2 }, 0.2);
      } else {
        gsap.to(card, { autoAlpha: 0, y: -8, scale: 0.985, duration: 0.18, ease: 'power2.in' });
      }

      return undefined;
    });

    return () => media.revert();
  }, { scope: root, dependencies: [toastInstance.visible], revertOnUpdate: true });

  return (
    <article ref={root} className="cart-toast" aria-live="polite">
      <div className="cart-toast__topline"><span>SAVAT</span><span className="cart-toast__rule" /><span>YANGILANDI</span></div>
      <div className="cart-toast__main">
        <div className="cart-toast__mark" aria-hidden="true"><ShoppingBag className="h-5 w-5" strokeWidth={1.8} /><span><Check className="h-3 w-3" strokeWidth={3} /></span></div>
        <div className="cart-toast__copy">
          <p className="cart-toast__title">{title}</p>
          {itemName && <p className="cart-toast__item">{itemName}</p>}
          {chipText && <span className="cart-toast__chip">{chipText}</span>}
        </div>
        <button type="button" onClick={() => toast.dismiss(toastInstance.id)} className="cart-toast__close" aria-label="Xabarni yopish"><X className="h-4 w-4" /></button>
      </div>
      <div className="cart-toast__bottom"><span>Mahsulot xarid savatingizda</span><span className="cart-toast__progress" style={{ '--toast-duration': `${duration}ms` }} /></div>
    </article>
  );
};

export default CartToast;
