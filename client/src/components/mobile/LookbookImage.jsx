import React, { useState } from 'react';
import { resolveImageUrl } from '../../utils/image';

const FALLBACK_IMAGE = '/editorial/lookbook-opening-evening-2026.webp';

function ImageFrame({ src, alt, className = '', fallback = FALLBACK_IMAGE }) {
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);

  return (
    <span className={`mlb-image ${loaded ? 'mlb-image--loaded' : ''} ${className}`}>
      {!loaded && <span className="mlb-shimmer" aria-hidden="true" />}
      <img
        src={failed || !src ? fallback : src}
        alt={alt}
        loading="lazy"
        decoding="async"
        onLoad={() => setLoaded(true)}
        onError={() => {
          if (failed || !src) setLoaded(true);
          else setFailed(true);
        }}
      />
    </span>
  );
}

export default function LookbookImage(props) {
  const src = resolveImageUrl(props.src);
  return <ImageFrame key={src} {...props} src={src} />;
}
