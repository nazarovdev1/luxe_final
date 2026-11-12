import React, { useState } from 'react';

function EditorialImage({ src, alt = '', unavailable, className = '' }) {
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);

  return (
    <span className={`bde-image ${loaded ? 'bde-image--loaded' : ''} ${className}`}>
      {!loaded && !failed && src && <span className="bde-shimmer" aria-hidden="true" />}
      {failed || !src ? <span className="bde-image__unavailable">{unavailable}</span> : <img
        src={src} alt={alt} loading="lazy" decoding="async"
        onLoad={() => setLoaded(true)} onError={() => setFailed(true)}
      />}
    </span>
  );
}

export default function BundleEditorialImage(props) {
  return <EditorialImage key={props.src} {...props} />;
}
