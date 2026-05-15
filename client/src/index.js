import React from 'react';
import ReactDOM from 'react-dom/client';
import './i18n';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

const root = ReactDOM.createRoot(document.getElementById('root'));

// Suppress ResizeObserver loop errors which are benign but trigger overlays in dev mode
const isResizeObserverError = (err) => {
  if (!err) return false;
  const msg = typeof err === 'string' ? err : (err.message || (err.reason && err.reason.message) || '');
  return (
    msg.includes('ResizeObserver') && 
    (msg.includes('loop') || msg.includes('limit') || msg.includes('undelivered notifications'))
  );
};

const originalError = console.error;
console.error = (...args) => {
  if (args[0] && isResizeObserverError(args[0])) return;
  originalError.apply(console, args);
};

const originalWarn = console.warn;
console.warn = (...args) => {
  if (args[0] && isResizeObserverError(args[0])) return;
  originalWarn.apply(console, args);
};

// Error boundary for the window
window.addEventListener('error', (e) => {
  if (isResizeObserverError(e.message) || isResizeObserverError(e.error) || isResizeObserverError(e.filename)) {
    e.stopImmediatePropagation();
    e.preventDefault();
  }
}, true);

// Error boundary for unhandled rejections
window.addEventListener('unhandledrejection', (e) => {
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

// Performance monitoring
reportWebVitals(console.log);