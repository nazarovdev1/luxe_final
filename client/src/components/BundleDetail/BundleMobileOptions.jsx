import React from 'react';
import { isBundleOptionAvailable } from './bundleEditorialData';
import './bundleMobileOptions.css';

const COLOURS = [
  { values: ['black', 'qora', 'черный', 'чёрный', '#000000', '#1b1b19'], css: '#1b1b19', uz: 'Qora', ru: 'Чёрный', en: 'Black' },
  { values: ['white', 'oq', 'белый', '#ffffff'], css: '#f3f1eb', uz: 'Oq', ru: 'Белый', en: 'White' },
  { values: ['dark blue', 'navy', 'to‘q ko‘k', 'темно-синий', '#000080'], css: '#16233f', uz: 'To‘q ko‘k', ru: 'Тёмно-синий', en: 'Navy' },
  { values: ['blue', 'ko‘k', 'синий', '#0000ff'], css: '#2453ad', uz: 'Ko‘k', ru: 'Синий', en: 'Blue' },
  { values: ['beige', 'bej', 'бежевый', '#f5f5dc'], css: '#d2bda1', uz: 'Bej', ru: 'Бежевый', en: 'Beige' },
  { values: ['brown', 'jigarrang', 'коричневый', '#a52a2a'], css: '#694737', uz: 'Jigarrang', ru: 'Коричневый', en: 'Brown' },
  { values: ['grey', 'gray', 'kulrang', 'серый', '#808080'], css: '#808080', uz: 'Kulrang', ru: 'Серый', en: 'Grey' },
  { values: ['red', 'qizil', 'красный', '#ff0000'], css: '#b62b37', uz: 'Qizil', ru: 'Красный', en: 'Red' },
];

export const getBundleColour = (value, language = 'uz') => {
  const normalized = String(value || '').trim().toLowerCase();
  const expanded = /^#[\da-f]{3}$/i.test(normalized) ? `#${normalized.slice(1).split('').map((character) => character.repeat(2)).join('')}` : normalized;
  const known = COLOURS.find((colour) => colour.values.includes(expanded));
  const isHex = /^#[\da-f]{6}([\da-f]{2})?$/i.test(expanded);
  return { label: known?.[language] || known?.uz || value, css: isHex ? value : known?.css };
};

export default function BundleMobileOptions({ product, selected, onSelect, copy, language, invalid }) {
  const colour = selected.color ? getBundleColour(selected.color, language) : null;
  return <div className="bmo" aria-describedby={invalid ? `bundle-error-${product.id}` : undefined}>
    {product.colors.length > 0 && <fieldset className="bmo-colours">
      <legend>{copy.color}<span>{colour?.label || copy.choose}</span></legend>
      <div className="bmo-colours__choices">
        {product.colors.map((value) => {
          const presentation = getBundleColour(value, language);
          return <button key={value} type="button" className={`bmo-colour ${presentation.css ? '' : 'bmo-colour--named'}`} title={presentation.label} aria-label={`${copy.color}: ${presentation.label}`} aria-pressed={selected.color === value} disabled={!isBundleOptionAvailable(product, value)} onClick={() => onSelect(product, 'color', value)}>
            {presentation.css ? <span className="bmo-colour__dot" style={{ backgroundColor: presentation.css }} aria-hidden="true" /> : <span>{presentation.label}</span>}
          </button>;
        })}
      </div>
    </fieldset>}
    {product.sizes.length > 0 && <fieldset className="bmo-fit">
      <legend>{copy.size}</legend>
      <div className="bmo-sizes">
        {product.sizes.map((size) => <button key={size} type="button" className="bmo-size" aria-label={`${copy.size}: ${size}`} aria-pressed={selected.size === size} disabled={!isBundleOptionAvailable(product, selected.color, size)} onClick={() => onSelect(product, 'size', size)}>{size}</button>)}
      </div>
    </fieldset>}
  </div>;
}
