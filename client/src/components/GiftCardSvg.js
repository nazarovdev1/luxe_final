import React, { useId } from 'react';

const formatPrice = (value) => {
  return Number(value || 0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
};

const clampText = (value, maxLength) => {
  const text = (value || '').trim();
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength - 3)}...`;
};

const GiftIcon = ({ x = 1395, y = 150, color = '#d6a06c' }) => (
  <g transform={`translate(${x} ${y})`} fill="none" stroke={color} strokeWidth="14" strokeLinecap="round" strokeLinejoin="round" opacity="0.92">
    <rect x="-52" y="18" width="104" height="86" rx="10" />
    <path d="M0 18v86M-62 18H62M-48 52H48" />
    <path d="M-8 18c-44-18-50-62-18-68 28-5 36 26 26 68Z" />
    <path d="M8 18c44-18 50-62 18-68-28-5-36 26-26 68Z" />
  </g>
);

const Star = ({ x, y, color, scale = 1, opacity = 0.85 }) => (
  <path
    d={`M${x} ${y - 12 * scale} C${x + 4 * scale} ${y - 2 * scale} ${x + 8 * scale} ${y + 2 * scale} ${x + 18 * scale} ${y} C${x + 8 * scale} ${y + 4 * scale} ${x + 4 * scale} ${y + 8 * scale} ${x} ${y + 18 * scale} C${x - 4 * scale} ${y + 8 * scale} ${x - 8 * scale} ${y + 4 * scale} ${x - 18 * scale} ${y} C${x - 8 * scale} ${y - 2 * scale} ${x - 4 * scale} ${y - 4 * scale} ${x} ${y - 12 * scale}Z`}
    fill={color}
    opacity={opacity}
  />
);

const Flower = ({ cx, cy, scale = 1, palette, dark = false }) => (
  <g transform={`translate(${cx} ${cy}) scale(${scale})`}>
    {[0, 60, 120, 180, 240, 300].map((rotate) => (
      <ellipse
        key={rotate}
        cx="0"
        cy="-72"
        rx="44"
        ry="100"
        transform={`rotate(${rotate})`}
        fill={dark ? palette.flower : palette.flower}
        stroke={palette.flowerLine}
        strokeWidth="5"
        opacity={dark ? 0.34 : 0.72}
      />
    ))}
    {[30, 90, 150, 210, 270, 330].map((rotate) => (
      <path
        key={rotate}
        d="M0 -18 C34 -64 88 -82 126 -52 C82 -44 54 -22 22 20"
        transform={`rotate(${rotate})`}
        fill="none"
        stroke={palette.flowerLine}
        strokeWidth="4"
        opacity="0.48"
      />
    ))}
    <circle r="42" fill={palette.gold2} opacity="0.82" />
    <circle r="22" fill={palette.gold} opacity="0.92" />
    {[0, 45, 90, 135, 180, 225, 270, 315].map((rotate) => (
      <circle key={rotate} cx="0" cy="-34" r="7" fill={palette.gold2} transform={`rotate(${rotate})`} opacity="0.85" />
    ))}
  </g>
);

const Leaves = ({ x, y, palette, scale = 1, flip = false }) => (
  <g transform={`translate(${x} ${y}) scale(${flip ? -scale : scale} ${scale})`} fill="none" stroke={palette.flowerLine} strokeWidth="5" strokeLinecap="round" opacity="0.62">
    <path d="M0 120 C60 40 104 -32 142 -118" />
    <path d="M44 54 C104 28 132 -6 148 -54 C92 -48 60 -16 44 54Z" fill={palette.flower} opacity="0.32" />
    <path d="M86 -10 C152 -34 178 -74 190 -132 C130 -120 96 -78 86 -10Z" fill={palette.flower} opacity="0.26" />
    <path d="M8 96 C-48 66 -72 24 -74 -32 C-24 -18 6 22 8 96Z" fill={palette.flower} opacity="0.24" />
  </g>
);

const SatinWave = ({ palette, ids, dark = false }) => (
  <g opacity={dark ? 0.96 : 0.88}>
    <path
      d="M0 800 C230 688 390 782 572 724 C756 666 882 574 1088 674 C1244 748 1402 712 1600 604 L1600 1000 L0 1000Z"
      fill={`url(#${ids.waveMain})`}
      opacity="0.95"
    />
    <path
      d="M0 798 C256 692 410 806 616 730 C790 666 936 608 1130 706 C1278 780 1442 728 1600 632"
      fill="none"
      stroke={palette.gold2}
      strokeWidth="8"
      opacity="0.8"
    />
    <path
      d="M0 840 C230 765 442 850 638 790 C856 724 1026 762 1214 832 C1372 890 1480 840 1600 786 L1600 1000 L0 1000Z"
      fill={dark ? '#050913' : '#ffffff'}
      opacity={dark ? 0.16 : 0.25}
    />
  </g>
);

const Bow = ({ palette, ids }) => (
  <g transform="translate(1268 603)">
    <path d="M-64 -20 C-228 -176 -410 -168 -476 -44 C-356 -22 -210 42 -76 38Z" fill={`url(#${ids.ribbonFill})`} stroke={palette.gold} strokeWidth="5" opacity="0.92" />
    <path d="M64 -20 C228 -176 410 -168 476 -44 C356 -22 210 42 76 38Z" fill={`url(#${ids.ribbonFill})`} stroke={palette.gold} strokeWidth="5" opacity="0.92" />
    <path d="M-48 34 C-166 116 -220 224 -192 348 C-102 276 -34 182 0 64Z" fill={`url(#${ids.ribbonDeep})`} stroke={palette.gold} strokeWidth="4" opacity="0.9" />
    <path d="M48 34 C166 116 220 224 192 348 C102 276 34 182 0 64Z" fill={`url(#${ids.ribbonDeep})`} stroke={palette.gold} strokeWidth="4" opacity="0.9" />
    <rect x="-64" y="-46" width="128" height="112" rx="28" fill={palette.gold2} stroke={palette.gold} strokeWidth="6" />
    <circle cx="0" cy="148" r="62" fill={`url(#${ids.medalFill})`} stroke={palette.gold} strokeWidth="7" />
    <path d="M-26 160 C-8 128 10 116 30 134 C10 134 -4 152 -16 184 C14 178 38 164 52 146" fill="none" stroke={palette.ink} strokeWidth="7" strokeLinecap="round" />
  </g>
);

const EmbossPattern = ({ palette }) => (
  <g opacity="0.18" fill="none" stroke={palette.gold} strokeWidth="3">
    {Array.from({ length: 5 }).map((_, row) => (
      Array.from({ length: 5 }).map((__, col) => (
        <g key={`${row}-${col}`} transform={`translate(${720 + col * 112} ${118 + row * 112})`}>
          <path d="M0 42 L42 0 L84 42 L42 84Z" />
          <path d="M42 0V84M0 42H84" opacity="0.45" />
          <text x="42" y="56" textAnchor="middle" fontSize="74" fontFamily="Georgia, serif" fill={palette.gold} stroke="none" opacity="0.45">L</text>
        </g>
      ))
    ))}
  </g>
);

const RibbonFrame = ({ palette, ids }) => (
  <g opacity="0.9">
    <path d="M-40 78 C250 -4 392 18 554 92 C730 172 924 140 1118 74 C1292 14 1450 24 1642 92 L1642 238 C1382 142 1216 144 1028 214 C816 294 626 284 424 196 C250 120 96 132 -40 206Z" fill={`url(#${ids.ribbonFill})`} opacity="0.86" />
    <path d="M-50 862 C214 744 394 784 592 840 C792 896 978 872 1160 800 C1336 730 1468 746 1646 832 L1646 1000 L-50 1000Z" fill={`url(#${ids.ribbonDeep})`} opacity="0.88" />
    <path d="M98 1000 C178 796 314 714 476 700 C408 830 330 930 218 1000Z" fill={`url(#${ids.ribbonFill})`} opacity="0.72" />
    <path d="M1182 0 C1120 144 1060 260 940 356 C1098 350 1228 266 1320 118 C1352 66 1374 28 1394 0Z" fill={`url(#${ids.ribbonFill})`} opacity="0.82" />
  </g>
);

const FloralCluster = ({ design, palette, ids }) => {
  if (design.variant === 'bow') {
    return (
      <>
        <EmbossPattern palette={palette} />
        <Leaves x={104} y={755} palette={palette} scale={0.72} />
        <Bow palette={palette} ids={ids} />
      </>
    );
  }

  if (design.variant === 'ribbon') {
    return (
      <>
        <RibbonFrame palette={palette} ids={ids} />
        <Flower cx={220} cy={728} scale={0.82} palette={palette} />
        <Leaves x={118} y={506} palette={palette} scale={0.72} />
        <Bow palette={palette} ids={ids} />
      </>
    );
  }

  if (design.variant === 'midnight') {
    return (
      <>
        <Flower cx={1240} cy={478} scale={1.25} palette={palette} dark />
        <Flower cx={1448} cy={610} scale={0.82} palette={palette} dark />
        <Leaves x={930} y={270} palette={palette} scale={1.05} />
        <SatinWave palette={palette} ids={ids} dark />
      </>
    );
  }

  if (design.variant === 'bloom') {
    return (
      <>
        <Flower cx={1368} cy={292} scale={1.28} palette={palette} dark />
        <Flower cx={128} cy={720} scale={0.84} palette={palette} dark />
        <RibbonFrame palette={palette} ids={ids} />
        <Leaves x={92} y={560} palette={palette} scale={0.86} />
      </>
    );
  }

  return (
    <>
      <SatinWave palette={palette} ids={ids} />
      <Flower cx={1340} cy={610} scale={1.18} palette={palette} />
      <Flower cx={1175} cy={760} scale={0.78} palette={palette} />
      <Leaves x={1120} y={385} palette={palette} scale={0.92} />
      <Leaves x={1488} y={245} palette={palette} scale={0.74} flip />
    </>
  );
};

const GiftCardSvg = ({
  design,
  amount,
  recipientName = '',
  message = '',
  code = '',
  status = '',
  compact = false,
  className = '',
}) => {
  const reactId = useId().replace(/:/g, '');
  const ids = {
    waveMain: `wave-main-${reactId}`,
    ribbonFill: `ribbon-fill-${reactId}`,
    ribbonDeep: `ribbon-deep-${reactId}`,
    medalFill: `medal-fill-${reactId}`,
  };
  const palette = design.palette;
  const amountText = formatPrice(amount);
  const recipientText = recipientName.trim() ? `${clampText(recipientName, compact ? 16 : 26)} uchun` : 'Oluvchi ismi';
  const messageText = clampText(message, compact ? 26 : 52);
  const amountFontSize = amountText.length > 9 ? 132 : amountText.length > 7 ? 150 : 166;
  const displayAmountFont = compact ? Math.round(amountFontSize * 0.66) : amountFontSize;
  const unitFontSize = compact ? 34 : 48;
  const unitX = design.amountPosition.anchor === 'middle'
    ? design.amountPosition.x + (compact ? 248 : 405)
    : design.amountPosition.x + Math.min(compact ? 550 : 900, amountText.length * displayAmountFont * 0.64) + (compact ? 22 : 36);

  return (
    <svg
      className={className}
      viewBox="0 0 1600 1000"
      role="img"
      aria-label={`${design.name} sovg'a kartasi`}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id={`base-${reactId}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={palette.base2} />
          <stop offset="48%" stopColor={palette.base} />
          <stop offset="100%" stopColor={palette.base3} />
        </linearGradient>
        <linearGradient id={ids.waveMain} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor={palette.base3} />
          <stop offset="48%" stopColor={palette.base2} />
          <stop offset="100%" stopColor={palette.base3} />
        </linearGradient>
        <linearGradient id={ids.ribbonFill} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={palette.base2} />
          <stop offset="50%" stopColor={palette.base} />
          <stop offset="100%" stopColor={palette.base3} />
        </linearGradient>
        <linearGradient id={ids.ribbonDeep} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={palette.base3} />
          <stop offset="62%" stopColor={palette.base} />
          <stop offset="100%" stopColor={palette.shadow} />
        </linearGradient>
        <linearGradient id={ids.medalFill} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={palette.gold2} />
          <stop offset="100%" stopColor={palette.gold} />
        </linearGradient>
        <linearGradient id={`gold-${reactId}`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor={palette.gold} />
          <stop offset="38%" stopColor={palette.gold2} />
          <stop offset="100%" stopColor={palette.gold} />
        </linearGradient>
        <filter id={`soft-shadow-${reactId}`} x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="18" stdDeviation="24" floodColor="#000000" floodOpacity="0.34" />
        </filter>
        <filter id={`text-depth-${reactId}`} x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="5" stdDeviation="4" floodColor={palette.shadow} floodOpacity="0.35" />
        </filter>
        <pattern id={`texture-${reactId}`} width="44" height="44" patternUnits="userSpaceOnUse">
          <path d="M0 44 C12 26 26 18 44 0M-8 18 C8 8 24 6 44 16" fill="none" stroke={palette.gold2} strokeWidth="1.2" opacity="0.18" />
        </pattern>
      </defs>

      <rect width="1600" height="1000" rx="82" fill="#05070b" />
      <g filter={`url(#soft-shadow-${reactId})`}>
        <rect x="34" y="38" width="1532" height="884" rx="74" fill={`url(#base-${reactId})`} />
        <rect x="34" y="38" width="1532" height="884" rx="74" fill={`url(#texture-${reactId})`} opacity="0.72" />
        <rect x="64" y="70" width="1472" height="820" rx="52" fill="none" stroke={`url(#gold-${reactId})`} strokeWidth="4" opacity="0.82" />
        <rect x="86" y="92" width="1428" height="776" rx="42" fill="none" stroke="#ffffff" strokeWidth="2" opacity="0.17" />

        <FloralCluster design={design} palette={palette} ids={ids} />

        <g opacity="0.82">
          <Star x={630} y={744} color={palette.gold2} scale={1.15} />
          <Star x={1392} y={184} color={palette.gold2} scale={0.8} opacity={0.72} />
          <Star x={1048} y={322} color={palette.gold2} scale={0.55} opacity={0.55} />
        </g>

        <GiftIcon color={palette.gold} />

        <text x="192" y="208" fill={palette.gold} fontFamily="Arial, sans-serif" fontSize={compact ? 44 : 56} fontWeight="600" letterSpacing="28">
          LUXX.UZ
        </text>
        <text x="192" y="326" fill={palette.ink} fontFamily="Georgia, 'Times New Roman', serif" fontSize={compact ? 58 : 82} fontWeight="500">
          Sovg'a kartalari
        </text>
        <path d="M194 384 H390 M426 384 H620" stroke={palette.gold} strokeWidth="4" opacity="0.7" />
        <Star x={408} y={384} color={palette.gold2} scale={0.8} />

        <g filter={`url(#text-depth-${reactId})`}>
          <text
            x={design.amountPosition.x}
            y={design.amountPosition.y}
            textAnchor={design.amountPosition.anchor}
            fill={palette.ink}
            fontFamily="Georgia, 'Times New Roman', serif"
            fontSize={displayAmountFont}
            fontWeight="700"
            letterSpacing="0"
          >
            {amountText}
          </text>
          <text
            x={unitX}
            y={design.amountPosition.y - (compact ? 16 : 22)}
            textAnchor="start"
            fill={palette.ink}
            fontFamily="Georgia, 'Times New Roman', serif"
            fontSize={unitFontSize}
            fontWeight="700"
          >
            so'm
          </text>
        </g>

        <text
          x={design.recipientPosition.x}
          y={design.recipientPosition.y}
          textAnchor={design.recipientPosition.anchor}
          fill={palette.muted}
          fontFamily="Arial, sans-serif"
          fontSize={compact ? 30 : 38}
          fontWeight="700"
          letterSpacing={compact ? 4 : 7}
        >
          {recipientText.toUpperCase()}
        </text>
        {!compact && messageText && (
          <text
            x={design.recipientPosition.x}
            y={design.recipientPosition.y + 48}
            textAnchor={design.recipientPosition.anchor}
            fill={palette.muted}
            fontFamily="Georgia, 'Times New Roman', serif"
            fontSize="30"
            fontStyle="italic"
            opacity="0.76"
          >
            "{messageText}"
          </text>
        )}

        {status && (
          <g>
            <rect x="1218" y="806" width="180" height="48" rx="20" fill="#000000" opacity="0.26" />
            <text x="1308" y="838" textAnchor="middle" fill="#ffffff" fontFamily="Arial, sans-serif" fontSize="24" fontWeight="800" letterSpacing="3">
              {status.toUpperCase()}
            </text>
          </g>
        )}
        {code && (
          <g>
            <rect x="1108" y="862" width="344" height="58" rx="20" fill="#000000" opacity="0.28" />
            <text x="1280" y="899" textAnchor="middle" fill="#ffffff" fontFamily="Courier New, monospace" fontSize="24" fontWeight="800" letterSpacing="2">
              {clampText(code, 22)}
            </text>
          </g>
        )}
      </g>
    </svg>
  );
};

export default GiftCardSvg;
