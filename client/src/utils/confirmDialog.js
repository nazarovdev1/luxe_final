import toast from 'react-hot-toast';

let openDialog = null;

export const registerConfirmDialog = (handler) => {
  openDialog = handler;

  return () => {
    if (openDialog === handler) {
      openDialog = null;
    }
  };
};

export const requestConfirmation = (options) => {
  if (!openDialog) {
    return Promise.resolve(false);
  }

  return openDialog(typeof options === 'string' ? { description: options } : options);
};

if (typeof window !== 'undefined') {
  window.luxeConfirm = requestConfirmation;
  window.luxeNotify = { error: (message) => toast.error(message) };
}
