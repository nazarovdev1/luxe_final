import React, { useEffect, useRef } from 'react';
import { Maximize2 } from 'lucide-react';
import BundleEditorialImage from './BundleEditorialImage';
import { localizeBundleField } from './bundleEditorialData';
import { thumbUrl } from '../../utils/image';
import './mobileBundleStudio.css';

export default function MobileBundleStudio({ gallery, title, copy, language, onSelectPhoto, onOpenPhoto }) {
  const trackRef = useRef(null);
  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined' || !trackRef.current) return undefined;
    const observer = new IntersectionObserver((entries) => {
      const visible = entries.find((entry) => entry.isIntersecting);
      if (visible) onSelectPhoto(Number(visible.target.dataset.photoIndex));
    }, { root: trackRef.current, threshold: .65 });
    Array.from(trackRef.current.children).forEach((child) => observer.observe(child));
    return () => observer.disconnect();
  }, [gallery, onSelectPhoto]);

  return <div className="bmt-studio">
    <div className="bmt-studio__track" ref={trackRef}>
      {(gallery.length ? gallery : [{ url: '', label: title }]).map((photo, index) => <figure key={photo.url || 'empty'} data-photo-index={index}>
        <button type="button" className="bmt-photo" onClick={() => onOpenPhoto(index)} aria-label={copy.zoom} disabled={!photo.url}>
          <BundleEditorialImage src={thumbUrl(photo.url, 1000)} alt={localizeBundleField(photo.label, language) || title} unavailable={copy.noImage} />
          {photo.url && <Maximize2 size={18} strokeWidth={1.3} className="bmt-photo__zoom" aria-hidden="true" />}
        </button>
        <figcaption><span>{copy.photo} {String(index + 1).padStart(2, '0')}</span><span>{localizeBundleField(photo.label, language)}</span></figcaption>
      </figure>)}
    </div>
  </div>;
}
