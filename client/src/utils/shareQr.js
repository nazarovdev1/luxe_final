import QRCode from 'qrcode';
import { productPath } from './productUrl';
import { urlLanguage, withLanguagePrefix } from '../config/localizedRoutes';
import { formatPrice } from './productDisplay';

// Brand shown on the QR card. One place to change if the store is renamed.
export const SHARE_BRAND = 'LUXX';
export const SHARE_DOMAIN = 'luxx.uz';

// Public product address for the current language (never the /mobile one), so it opens
// the right app on any phone and gives Telegram/Instagram the product's own preview.
export const productShareUrl = (product, origin = typeof window !== 'undefined' ? window.location.origin : `https://${SHARE_DOMAIN}`) =>
  `${origin}${withLanguagePrefix(productPath(product), urlLanguage())}`;

// The QR carries the short /product/<id> form (the page redirects to the named address)
// so the code stays sparse and quick to scan, plus a source tag for analytics.
// The page canonicalises to the clean address, so search engines are unaffected.
export const qrTargetUrl = (url) => {
  const short = url.replace(/\/product\/[^/?#]*-([a-f0-9]{24})(?=[?#]|$)/i, '/product/$1');
  const separator = short.includes('?') ? '&' : '?';
  return `${short}${separator}utm_source=qr`;
};

export const telegramShareUrl = (url, text = '') =>
  `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`;

const FINDER = 7;

// Centres of the 5×5 alignment patterns (ISO/IEC 18004, same table as the qrcode package).
const alignmentCentres = (version, size) => {
  if (version === 1) return [];
  const count = Math.floor(version / 7) + 2;
  const step = size === 145 ? 26 : Math.ceil((size - 13) / (2 * count - 2)) * 2;
  const coords = [size - 7];
  for (let i = 1; i < count - 1; i += 1) coords[i] = coords[i - 1] - step;
  coords.push(6);
  coords.reverse();
  const last = coords.length - 1;
  const centres = [];
  coords.forEach((row, i) => coords.forEach((col, j) => {
    if ((i === 0 && j === 0) || (i === 0 && j === last) || (i === last && j === 0)) return;
    centres.push([row, col]);
  }));
  return centres;
};

// Builds the QR module grid. High error correction leaves room for the monogram in the middle.
// Finder and alignment patterns are drawn as solid shapes: scanners locate the code by
// their ring ratios, and a ring broken into round dots stops many of them from reading it.
export const buildQrMatrix = (text) => {
  const qr = QRCode.create(text, { errorCorrectionLevel: 'H' });
  const { modules } = qr;
  const size = modules.size;
  const finders = [[0, 0], [0, size - FINDER], [size - FINDER, 0]];
  const aligns = alignmentCentres(qr.version, size);
  const inFinder = (row, col) => finders.some(([r, c]) => row >= r && row < r + FINDER && col >= c && col < c + FINDER)
    || aligns.some(([r, c]) => Math.abs(row - r) <= 2 && Math.abs(col - c) <= 2);

  // Clear square for the monogram: at most ~6% of the area, well within level H.
  const logo = Math.max(5, Math.round(size * 0.22)) | 1;
  const logoStart = Math.floor((size - logo) / 2);
  const inLogo = (row, col) => row >= logoStart && row < logoStart + logo && col >= logoStart && col < logoStart + logo;

  const center = (size - 1) / 2;
  const maxDistance = Math.hypot(center, center);
  const dots = [];
  for (let row = 0; row < size; row += 1) {
    for (let col = 0; col < size; col += 1) {
      if (!modules.get(row, col) || inFinder(row, col) || inLogo(row, col)) continue;
      // 0 at the centre, 1 at the corners: drives the outward reveal.
      dots.push({ row, col, wave: Math.hypot(row - center, col - center) / maxDistance });
    }
  }
  return { size, dots, finders, aligns, logo: { start: logoStart, size: logo } };
};

const wrapLines = (ctx, text, maxWidth, maxLines) => {
  const words = String(text).split(/\s+/).filter(Boolean);
  const lines = [];
  let line = '';
  words.forEach((word) => {
    const next = line ? `${line} ${word}` : word;
    if (ctx.measureText(next).width > maxWidth && line) {
      lines.push(line);
      line = word;
    } else {
      line = next;
    }
  });
  if (line) lines.push(line);
  if (lines.length > maxLines) {
    const kept = lines.slice(0, maxLines);
    kept[maxLines - 1] = `${kept[maxLines - 1].replace(/\s+\S*$/, '')}…`;
    return kept;
  }
  return lines;
};

const roundedRect = (ctx, x, y, w, h, r) => {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
};

// Draws the branded QR plate (ivory card, ink dots, gold finder eyes, monogram).
export const drawQrPlate = (ctx, matrix, x, y, side) => {
  const quiet = 3;
  const cell = side / (matrix.size + quiet * 2);
  const ox = x + quiet * cell;
  const oy = y + quiet * cell;

  ctx.fillStyle = '#f7f1e6';
  roundedRect(ctx, x, y, side, side, cell * 3);
  ctx.fill();

  ctx.fillStyle = '#17140f';
  matrix.dots.forEach(({ row, col }) => {
    ctx.beginPath();
    ctx.arc(ox + (col + 0.5) * cell, oy + (row + 0.5) * cell, cell * 0.42, 0, Math.PI * 2);
    ctx.fill();
  });

  matrix.finders.forEach(([row, col]) => {
    const fx = ox + col * cell;
    const fy = oy + row * cell;
    ctx.strokeStyle = '#7a5a26';
    ctx.lineWidth = cell;
    roundedRect(ctx, fx + cell / 2, fy + cell / 2, cell * 6, cell * 6, cell * 1.8);
    ctx.stroke();
    ctx.fillStyle = '#17140f';
    roundedRect(ctx, fx + cell * 2, fy + cell * 2, cell * 3, cell * 3, cell);
    ctx.fill();
  });

  matrix.aligns.forEach(([row, col]) => {
    const ax = ox + (col - 2) * cell;
    const ay = oy + (row - 2) * cell;
    ctx.strokeStyle = '#17140f';
    ctx.lineWidth = cell;
    roundedRect(ctx, ax + cell / 2, ay + cell / 2, cell * 4, cell * 4, cell * 1.2);
    ctx.stroke();
    ctx.fillStyle = '#17140f';
    ctx.beginPath();
    ctx.arc(ax + cell * 2.5, ay + cell * 2.5, cell * 0.55, 0, Math.PI * 2);
    ctx.fill();
  });

  const logoX = ox + matrix.logo.start * cell;
  const logoY = oy + matrix.logo.start * cell;
  const logoSide = matrix.logo.size * cell;
  ctx.fillStyle = '#17140f';
  roundedRect(ctx, logoX + cell * 0.4, logoY + cell * 0.4, logoSide - cell * 0.8, logoSide - cell * 0.8, cell * 1.4);
  ctx.fill();
  ctx.fillStyle = '#d6b47c';
  ctx.font = `600 ${logoSide * 0.62}px Georgia, "Times New Roman", serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(SHARE_BRAND.charAt(0), logoX + logoSide / 2, logoY + logoSide / 2 + logoSide * 0.04);
};

// A 1080×1350 card (Instagram/Telegram portrait) with the QR, name and price.
// Product photos are left out on purpose: cross-origin images would taint the canvas.
export const renderShareCard = ({ product, qrText, caption }) => {
  const canvas = document.createElement('canvas');
  canvas.width = 1080;
  canvas.height = 1350;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  const backdrop = ctx.createLinearGradient(0, 0, 1080, 1350);
  backdrop.addColorStop(0, '#16161a');
  backdrop.addColorStop(1, '#0b0b0d');
  ctx.fillStyle = backdrop;
  ctx.fillRect(0, 0, 1080, 1350);

  ctx.strokeStyle = 'rgba(214, 180, 124, 0.35)';
  ctx.lineWidth = 2;
  roundedRect(ctx, 48, 48, 984, 1254, 36);
  ctx.stroke();

  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  ctx.fillStyle = '#d6b47c';
  ctx.font = '500 44px Georgia, "Times New Roman", serif';
  ctx.letterSpacing = '18px';
  ctx.fillText(SHARE_BRAND, 540 + 9, 150);
  ctx.letterSpacing = '0px';

  ctx.fillStyle = '#f4efe6';
  ctx.font = '400 50px Georgia, "Times New Roman", serif';
  const lines = wrapLines(ctx, product?.name || '', 860, 2);
  lines.forEach((line, index) => ctx.fillText(line, 540, 250 + index * 64));

  const price = Number(product?.price) || 0;
  if (price) {
    ctx.fillStyle = '#d6b47c';
    ctx.font = '600 38px system-ui, -apple-system, "Segoe UI", sans-serif';
    ctx.fillText(`${formatPrice(price)} so'm`, 540, 250 + lines.length * 64 + 30);
  }

  drawQrPlate(ctx, buildQrMatrix(qrText), 260, 470, 560);

  ctx.fillStyle = 'rgba(244, 239, 230, 0.72)';
  ctx.font = '400 32px system-ui, -apple-system, "Segoe UI", sans-serif';
  ctx.fillText(caption, 540, 1140);
  ctx.fillStyle = '#d6b47c';
  ctx.font = '500 34px system-ui, -apple-system, "Segoe UI", sans-serif';
  ctx.fillText(SHARE_DOMAIN, 540, 1215);
  return canvas;
};

export const canvasToBlob = (canvas) => new Promise((resolve) => {
  if (!canvas?.toBlob) { resolve(null); return; }
  canvas.toBlob((blob) => resolve(blob), 'image/png');
});

export const shareCardFileName = (product) =>
  `${SHARE_DOMAIN.replace('.', '-')}-${(productPath(product).split('/').pop() || 'product').slice(0, 60)}.png`;
