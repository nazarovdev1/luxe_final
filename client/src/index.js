import React from 'react';
import ReactDOM from 'react-dom/client';
import './services/api';
import './i18n';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

const root = ReactDOM.createRoot(document.getElementById('root'));

// Prevent iOS Safari pinch zoom and multi-finger zoom
if (typeof window !== 'undefined') {
  document.addEventListener('gesturestart', (e) => e.preventDefault(), { passive: false });
  document.addEventListener('gesturechange', (e) => e.preventDefault(), { passive: false });
  document.addEventListener('gestureend', (e) => e.preventDefault(), { passive: false });
}

// Suppress ResizeObserver loop errors which are benign but trigger overlays in dev mode
const isResizeObserverError = (err) => {
  if (!err) return false;
  const msg = typeof err === 'string' ? err : (err.message || (err.reason && err.reason.message) || '');
  return (
    msg.includes('ResizeObserver') && 
    (msg.includes('loop') || msg.includes('limit') || msg.includes('undelivered notifications'))
  );
};

const isChunkLoadError = (err) => {
  if (!err) return false;
  const msg = typeof err === 'string' ? err : (err.message || (err.reason && err.reason.message) || '');
  return (
    msg.includes('Unable to preload CSS') ||
    msg.includes('Failed to fetch dynamically imported module') ||
    msg.includes('error loading dynamically imported module') ||
    msg.includes('Importing a module script failed')
  );
};

const handleChunkError = () => {
  const lastReload = sessionStorage.getItem('luxe_chunk_reload');
  const now = Date.now();
  if (!lastReload || now - parseInt(lastReload, 10) > 10000) {
    sessionStorage.setItem('luxe_chunk_reload', now.toString());
    window.location.reload();
  }
};

window.addEventListener('vite:preload-error', (event) => {
  event.preventDefault();
  handleChunkError();
});

const originalError = console.error;
console.error = (...args) => {
  if (args[0] && (isResizeObserverError(args[0]) || isChunkLoadError(args[0]))) return;
  originalError.apply(console, args);
};

const originalWarn = console.warn;
console.warn = (...args) => {
  if (args[0] && (isResizeObserverError(args[0]) || isChunkLoadError(args[0]))) return;
  originalWarn.apply(console, args);
};

// Error boundary for the window
window.addEventListener('error', (e) => {
  if (isChunkLoadError(e.error) || isChunkLoadError(e.message)) {
    handleChunkError();
  }
  if (isResizeObserverError(e.message) || isResizeObserverError(e.error) || isResizeObserverError(e.filename)) {
    e.stopImmediatePropagation();
    e.preventDefault();
  }
}, true);

// Error boundary for unhandled rejections
window.addEventListener('unhandledrejection', (e) => {
  if (isChunkLoadError(e.reason)) {
    handleChunkError();
  }
  if (isResizeObserverError(e.reason)) {
    e.stopImmediatePropagation();
    e.preventDefault();
  }
}, true);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

if (import.meta.env.DEV) {
  reportWebVitals(console.log);
}
