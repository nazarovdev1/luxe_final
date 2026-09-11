import React, { useEffect, useRef, useState } from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';
import { registerConfirmDialog } from '../utils/confirmDialog';

const DEFAULT_COPY = {
  title: 'Bu amalni tasdiqlaysizmi?',
  description: '',
  confirmLabel: 'Tasdiqlash',
  cancelLabel: 'Bekor qilish',
};

const getDialogCopy = (options) => {
  const copy = typeof options === 'string' ? { description: options } : options;
  const isDestructive = /o['‘’`]?chir|delete/i.test(copy?.description || '');

  return {
    ...DEFAULT_COPY,
    ...(isDestructive ? { title: "O'chirishni tasdiqlaysizmi?", confirmLabel: "O'chirish", variant: 'destructive' } : {}),
    ...copy,
  };
};

export default function ConfirmDialog() {
  const [dialog, setDialog] = useState(null);
  const resolver = useRef(null);
  const cancelButton = useRef(null);

  const close = (accepted) => {
    const resolve = resolver.current;
    resolver.current = null;
    setDialog(null);
    resolve?.(accepted);
  };

  useEffect(() => registerConfirmDialog((options) => new Promise((resolve) => {
    resolver.current?.(false);
    resolver.current = resolve;
    setDialog(getDialogCopy(options));
  })), []);

  useEffect(() => {
    if (!dialog) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') close(false);
    };

    document.addEventListener('keydown', handleKeyDown);
    const timeout = window.setTimeout(() => cancelButton.current?.focus(), 0);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      window.clearTimeout(timeout);
    };
  }, [dialog]);

  useEffect(() => () => resolver.current?.(false), []);

  if (!dialog) return null;

  const isDestructive = dialog.variant !== 'neutral';
  const Icon = isDestructive ? Trash2 : AlertTriangle;

  return (
    <div className="confirm-dialog-backdrop" role="presentation" onMouseDown={() => close(false)}>
      <section
        className="confirm-dialog"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        aria-describedby="confirm-dialog-description"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className={`confirm-dialog__icon ${isDestructive ? 'is-destructive' : ''}`}>
          <Icon size={19} strokeWidth={1.8} />
        </div>
        <button type="button" className="confirm-dialog__close" onClick={() => close(false)} aria-label="Yopish">
          <X size={18} />
        </button>
        <p className="confirm-dialog__eyebrow">TASDIQLASH</p>
        <h2 id="confirm-dialog-title">{dialog.title}</h2>
        <p id="confirm-dialog-description">{dialog.description}</p>
        <div className="confirm-dialog__actions">
          <button ref={cancelButton} type="button" className="confirm-dialog__cancel" onClick={() => close(false)}>
            {dialog.cancelLabel}
          </button>
          <button type="button" className={isDestructive ? 'confirm-dialog__confirm is-destructive' : 'confirm-dialog__confirm'} onClick={() => close(true)}>
            {dialog.confirmLabel}
          </button>
        </div>
      </section>
    </div>
  );
}
