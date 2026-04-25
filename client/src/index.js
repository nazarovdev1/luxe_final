import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

const root = ReactDOM.createRoot(document.getElementById('root'));

// Suppress resize observer error which is often benign in React dev mode
const resizeObserverLoopErr = 'ResizeObserver loop completed with undelivered notifications.';
const originalError = console.error;
console.error = (...args) => {
  if (typeof args[0] === 'string' && args[0].includes(resizeObserverLoopErr)) {
    return;
  }
  originalError.call(console, ...args);
};

window.addEventListener('error', (e) => {
  if (e.message === resizeObserverLoopErr ||
    (e.message && e.message.includes('ResizeObserver loop'))) {
    e.stopImmediatePropagation();
  }
});

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Performance monitoring
reportWebVitals(console.log);