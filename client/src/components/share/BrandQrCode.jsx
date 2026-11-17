import React, { useMemo } from 'react';
import { buildQrMatrix, SHARE_BRAND } from '../../utils/shareQr';

const QUIET = 3;

// Branded, animated QR: ink dots rise outward from the monogram, the gold finder eyes
// draw themselves, then a soft light passes over the plate. Ink on ivory keeps it
// readable by every phone camera (inverted codes fail on some scanners).
export default function BrandQrCode({ value, label, runKey = 0 }) {
  const matrix = useMemo(() => buildQrMatrix(value), [value]);
  const box = matrix.size + QUIET * 2;
  const logo = matrix.logo;

  return (
    <figure className="brand-qr" key={runKey}>
      <svg
        className="brand-qr__svg"
        viewBox={`0 0 ${box} ${box}`}
        role="img"
        aria-label={label}
        shapeRendering="geometricPrecision"
      >
        <rect className="brand-qr__plate" x="0" y="0" width={box} height={box} rx="3" />
        <g transform={`translate(${QUIET} ${QUIET})`}>
          {matrix.dots.map(({ row, col, wave }) => (
            <circle
              key={`${row}-${col}`}
              className="brand-qr__dot"
              cx={col + 0.5}
              cy={row + 0.5}
              r="0.42"
              style={{ '--wave': wave.toFixed(3) }}
            />
          ))}
          {matrix.finders.map(([row, col], index) => (
            <g key={`${row}-${col}`} className="brand-qr__eye" style={{ '--eye': index }}>
              <rect className="brand-qr__eye-ring" x={col + 0.5} y={row + 0.5} width="6" height="6" rx="1.8" />
              <rect className="brand-qr__eye-core" x={col + 2} y={row + 2} width="3" height="3" rx="1" />
            </g>
          ))}
          {matrix.aligns.map(([row, col]) => (
            <g key={`a-${row}-${col}`} className="brand-qr__align">
              <rect x={col - 1.5} y={row - 1.5} width="4" height="4" rx="1.2" />
              <circle cx={col + 0.5} cy={row + 0.5} r="0.55" />
            </g>
          ))}
          <g className="brand-qr__mark">
            <rect
              x={logo.start + 0.4}
              y={logo.start + 0.4}
              width={logo.size - 0.8}
              height={logo.size - 0.8}
              rx="1.4"
            />
            <text x={logo.start + logo.size / 2} y={logo.start + logo.size / 2} dy="0.36em" fontSize={logo.size * 0.62}>
              {SHARE_BRAND.charAt(0)}
            </text>
          </g>
        </g>
      </svg>
      <span className="brand-qr__sheen" aria-hidden="true" />
    </figure>
  );
}
