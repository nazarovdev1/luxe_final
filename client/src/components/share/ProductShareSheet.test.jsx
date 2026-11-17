import React from 'react';
import { vi } from 'vitest';
import '@testing-library/jest-dom';
import QRCode from 'qrcode';
import jsQR from 'jsqr';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { useLanguage } from '../../contexts/LanguageContext';
import ProductShareSheet from './ProductShareSheet';
import { buildQrMatrix, productShareUrl, qrTargetUrl, telegramShareUrl } from '../../utils/shareQr';

vi.mock('../../contexts/LanguageContext', () => ({ useLanguage: vi.fn() }));

const product = { _id: '697cb72c1234567890abcdef', name: 'Bordo jun palto', price: 1500000, images: [] };
const url = 'https://luxx.uz/product/bordo-jun-palto-697cb72c1234567890abcdef';

beforeEach(() => {
  useLanguage.mockReturnValue({ language: 'uz', t: (_k, fallback) => fallback });
});

describe('share helpers', () => {
  test('share address is the public product page, with /ru kept for Russian visitors', () => {
    window.history.pushState({}, '', '/mobile/product/x');
    expect(productShareUrl(product, 'https://luxx.uz')).toBe(url);
    window.history.pushState({}, '', '/ru/product/x');
    expect(productShareUrl(product, 'https://luxx.uz')).toBe('https://luxx.uz/ru/product/bordo-jun-palto-697cb72c1234567890abcdef');
    window.history.pushState({}, '', '/');
  });

  test('QR target is tagged for analytics, Telegram link is encoded', () => {
    const short = 'https://luxx.uz/product/697cb72c1234567890abcdef';
    expect(qrTargetUrl(url)).toBe(`${short}?utm_source=qr`);
    expect(qrTargetUrl(`${url}?a=1`)).toBe(`${short}?a=1&utm_source=qr`);
    expect(qrTargetUrl('https://luxx.uz/ru/product/x-697cb72c1234567890abcdef'))
      .toBe('https://luxx.uz/ru/product/697cb72c1234567890abcdef?utm_source=qr');
    expect(telegramShareUrl(url, 'Palto')).toBe(`https://t.me/share/url?url=${encodeURIComponent(url)}&text=Palto`);
  });

  test('styled matrix keeps every data module except a small monogram area', () => {
    const text = qrTargetUrl(url);
    const matrix = buildQrMatrix(text);
    const { modules } = QRCode.create(text, { errorCorrectionLevel: 'H' });
    expect(matrix.size).toBe(modules.size);
    matrix.dots.forEach(({ row, col }) => expect(modules.get(row, col)).toBeTruthy());
    // The cleared centre must stay far below level H's ~30% recovery budget.
    expect((matrix.logo.size ** 2) / (matrix.size ** 2)).toBeLessThan(0.08);
  });
});

// Rasterises the same shapes BrandQrCode draws (round dots, solid eyes and alignment
// rings, dark monogram tile) and asks a real decoder to read them back.
const rasterise = (matrix, cell = 8, quiet = 3) => {
  const width = (matrix.size + quiet * 2) * cell;
  const pixels = new Uint8ClampedArray(width * width * 4).fill(255);
  const ink = (x, y) => {
    const i = (Math.floor(y) * width + Math.floor(x)) * 4;
    pixels[i] = 23; pixels[i + 1] = 20; pixels[i + 2] = 15;
  };
  const origin = quiet * cell;
  const square = (row, col, rows, cols) => {
    for (let y = 0; y < rows * cell; y += 1) for (let x = 0; x < cols * cell; x += 1) ink(origin + col * cell + x, origin + row * cell + y);
  };
  const ring = (row, col, n) => {
    square(row, col, 1, n); square(row + n - 1, col, 1, n); square(row, col, n, 1); square(row, col + n - 1, n, 1);
  };
  matrix.dots.forEach(({ row, col }) => {
    const cx = origin + (col + 0.5) * cell;
    const cy = origin + (row + 0.5) * cell;
    const r = cell * 0.42;
    for (let y = cy - r; y <= cy + r; y += 1) for (let x = cx - r; x <= cx + r; x += 1) {
      if ((x - cx) ** 2 + (y - cy) ** 2 <= r * r) ink(x, y);
    }
  });
  matrix.finders.forEach(([row, col]) => { ring(row, col, 7); square(row + 2, col + 2, 3, 3); });
  matrix.aligns.forEach(([row, col]) => { ring(row - 2, col - 2, 5); square(row, col, 1, 1); });
  square(matrix.logo.start, matrix.logo.start, matrix.logo.size, matrix.logo.size);
  return { pixels, width };
};

describe('styled QR stays scannable', () => {
  test.each([
    'https://luxx.uz/product/697cc0a0a9c7bdfbc1fd3c23?utm_source=qr',
    'https://luxx.uz/ru/product/697cc0a0a9c7bdfbc1fd3c23?utm_source=qr',
  ])('%s', (text) => {
    const { pixels, width } = rasterise(buildQrMatrix(text));
    expect(jsQR(pixels, width, width)?.data).toBe(text);
  });
});

describe('ProductShareSheet', () => {
  test('shows link, QR and Telegram; copies the link; closes on Escape', async () => {
    const writeText = vi.fn().mockResolvedValue();
    Object.defineProperty(navigator, 'clipboard', { value: { writeText }, configurable: true });
    const onClose = vi.fn();
    render(<ProductShareSheet open onClose={onClose} product={product} url={url} />);

    expect(screen.getByRole('dialog', { name: 'Mahsulotni ulashish' })).toBeInTheDocument();
    expect(screen.getByRole('img', { name: /Kamerani tuting/ })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Telegram/ })).toHaveAttribute('href', telegramShareUrl(url, product.name));

    fireEvent.click(screen.getByRole('button', { name: /Havolani nusxalash/ }));
    await waitFor(() => expect(writeText).toHaveBeenCalledWith(url));
    expect(await screen.findByRole('status')).toHaveTextContent('Havola nusxalandi');

    fireEvent.keyDown(window, { key: 'Escape' });
    expect(onClose).toHaveBeenCalled();
  });

  test('renders nothing while closed', () => {
    render(<ProductShareSheet open={false} onClose={() => {}} product={product} url={url} />);
    expect(screen.queryByRole('dialog')).toBeNull();
  });
});
