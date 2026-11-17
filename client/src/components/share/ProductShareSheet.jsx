import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Check, Download, Link2, Send, Share2, X } from 'lucide-react';
import BrandQrCode from './BrandQrCode';
import { useLanguage } from '../../contexts/LanguageContext';
import { formatPrice } from '../../utils/productDisplay';
import {
  canvasToBlob,
  qrTargetUrl,
  renderShareCard,
  shareCardFileName,
  telegramShareUrl,
} from '../../utils/shareQr';
import './productShareSheet.css';

const COPY = {
  uz: {
    kicker: 'Yaqiningizga yuboring',
    title: 'Mahsulotni ulashish',
    scan: 'Kamerani tuting — mahsulot ochiladi',
    replay: 'QR kodni qayta ko\'rsatish',
    copy: 'Havolani nusxalash',
    copied: 'Havola nusxalandi',
    telegram: 'Telegram orqali',
    more: 'Boshqa ilovalar',
    save: 'QR kartani saqlash',
    saved: 'Karta saqlandi',
    close: 'Yopish',
    currency: "so'm",
  },
  ru: {
    kicker: 'Отправьте близким',
    title: 'Поделиться товаром',
    scan: 'Наведите камеру — откроется товар',
    replay: 'Показать QR-код заново',
    copy: 'Скопировать ссылку',
    copied: 'Ссылка скопирована',
    telegram: 'Через Telegram',
    more: 'Другие приложения',
    save: 'Сохранить QR-карточку',
    saved: 'Карточка сохранена',
    close: 'Закрыть',
    currency: 'сум',
  },
  en: {
    kicker: 'Send it to someone',
    title: 'Share this piece',
    scan: 'Point a camera here to open it',
    replay: 'Replay the QR code',
    copy: 'Copy link',
    copied: 'Link copied',
    telegram: 'Via Telegram',
    more: 'More apps',
    save: 'Save QR card',
    saved: 'Card saved',
    close: 'Close',
    currency: 'UZS',
  },
};

const firstImage = (product) => {
  const image = product?.images?.[0] ?? product?.image;
  return typeof image === 'object' ? image?.url : image;
};

const copyText = async (text) => {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }
  const field = document.createElement('textarea');
  field.value = text;
  field.setAttribute('readonly', '');
  field.style.position = 'fixed';
  field.style.opacity = '0';
  document.body.appendChild(field);
  field.select();
  document.execCommand('copy');
  field.remove();
};

export default function ProductShareSheet({ open, onClose, product, url }) {
  const { language } = useLanguage();
  const copy = COPY[language] || COPY.uz;
  const [status, setStatus] = useState('');
  const [runKey, setRunKey] = useState(0);
  const [imageReady, setImageReady] = useState(false);
  const closeRef = useRef(null);
  const imageRef = useRef(null);
  const statusTimer = useRef(null);
  // Kept in a ref so a parent passing a fresh arrow each render does not re-run the open effect.
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;
  const qrText = qrTargetUrl(url || '');
  const image = firstImage(product);
  const canNativeShare = typeof navigator !== 'undefined' && typeof navigator.share === 'function';

  useEffect(() => {
    if (!open) return undefined;
    const previousOverflow = document.body.style.overflow;
    const previousFocus = document.activeElement;
    document.body.style.overflow = 'hidden';
    closeRef.current?.focus({ preventScroll: true });
    const onKey = (event) => { if (event.key === 'Escape') onCloseRef.current?.(); };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKey);
      window.clearTimeout(statusTimer.current);
      previousFocus?.focus?.({ preventScroll: true });
    };
  }, [open]);

  // A cached photo can finish loading before React attaches onLoad.
  useEffect(() => {
    if (open && imageRef.current?.complete && imageRef.current.naturalWidth) setImageReady(true);
  }, [open, image]);

  if (!open || !product || !url) return null;

  const flash = (message) => {
    setStatus(message);
    window.clearTimeout(statusTimer.current);
    statusTimer.current = window.setTimeout(() => setStatus(''), 2200);
  };

  const handleCopy = async () => {
    try {
      await copyText(url);
      flash(copy.copied);
    } catch (error) {
      console.error(error);
    }
  };

  const handleNativeShare = async () => {
    try {
      await navigator.share({ title: product.name, url });
    } catch (error) {
      if (error?.name !== 'AbortError') console.error(error);
    }
  };

  const handleSave = async () => {
    const canvas = renderShareCard({ product, qrText, caption: copy.scan });
    const blob = await canvasToBlob(canvas);
    if (!blob) return;
    const name = shareCardFileName(product);
    const file = typeof File === 'function' ? new File([blob], name, { type: 'image/png' }) : null;
    // On phones, hand the card to the share sheet so it can go straight to the gallery or a chat.
    if (file && navigator.canShare?.({ files: [file] }) && window.matchMedia?.('(pointer: coarse)').matches) {
      try {
        await navigator.share({ files: [file], title: product.name });
        flash(copy.saved);
        return;
      } catch (error) {
        if (error?.name === 'AbortError') return;
      }
    }
    const href = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = href;
    link.download = name;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(href), 4000);
    flash(copy.saved);
  };

  return createPortal(
    <div className="share-sheet" role="presentation" onClick={onClose}>
      <section
        className="share-sheet__panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="share-sheet-title"
        onClick={(event) => event.stopPropagation()}
      >
        <span className="share-sheet__grip" aria-hidden="true" />
        <header className="share-sheet__head">
          <div>
            <p className="share-sheet__kicker">{copy.kicker}</p>
            <h2 id="share-sheet-title" className="share-sheet__title">{copy.title}</h2>
          </div>
          <button ref={closeRef} type="button" className="share-sheet__close" onClick={onClose} aria-label={copy.close}>
            <X size={20} strokeWidth={1.6} />
          </button>
        </header>

        <div className="share-sheet__product">
          <div className="share-sheet__thumb">
            {image && !imageReady && <span className="share-sheet__thumb-shimmer" aria-hidden="true" />}
            {image && (
              <img
                ref={imageRef}
                src={image}
                alt=""
                loading="lazy"
                decoding="async"
                onLoad={() => setImageReady(true)}
                className={imageReady ? 'is-ready' : ''}
              />
            )}
          </div>
          <div className="share-sheet__meta">
            <p className="share-sheet__name">{product.name}</p>
            {Number(product.price) > 0 && (
              <p className="share-sheet__price">{formatPrice(product.price)} {copy.currency}</p>
            )}
          </div>
        </div>

        <button
          type="button"
          className="share-sheet__qr"
          onClick={() => setRunKey((key) => key + 1)}
          aria-label={copy.replay}
        >
          <BrandQrCode value={qrText} label={copy.scan} runKey={runKey} />
        </button>
        <p className="share-sheet__scan">{copy.scan}</p>

        <div className="share-sheet__link">
          <span className="share-sheet__url" title={url}>{url.replace(/^https?:\/\//, '')}</span>
          <button type="button" className="share-sheet__copy" onClick={handleCopy}>
            {status === copy.copied ? <Check size={16} strokeWidth={1.8} /> : <Link2 size={16} strokeWidth={1.6} />}
            <span>{status === copy.copied ? copy.copied : copy.copy}</span>
          </button>
        </div>

        <div className="share-sheet__actions">
          <a
            className="share-sheet__action"
            href={telegramShareUrl(url, product.name)}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Send size={18} strokeWidth={1.5} />
            <span>{copy.telegram}</span>
          </a>
          <button type="button" className="share-sheet__action" onClick={handleSave}>
            <Download size={18} strokeWidth={1.5} />
            <span>{copy.save}</span>
          </button>
          {canNativeShare && (
            <button type="button" className="share-sheet__action" onClick={handleNativeShare}>
              <Share2 size={18} strokeWidth={1.5} />
              <span>{copy.more}</span>
            </button>
          )}
        </div>

        <p className="share-sheet__status" role="status" aria-live="polite">{status}</p>
      </section>
    </div>,
    document.body,
  );
}
