import React, { useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, RotateCcw, X } from 'lucide-react';
import { useFavorites } from '../contexts/FavoritesContext';
import { useLanguage } from '../contexts/LanguageContext';
import { getImageUrl } from '../utils/image';
import { money, productIdOf, productPath } from './ui';
import './styleDeck.css';

const WORDS = {
  uz: { save: 'Saqlash', skip: 'Keyingisi', saved: (n) => (n ? `${n} ta saqlandi` : 'Hali hech narsa saqlanmadi'), doneTitle: "Hammasini ko'rdingiz", again: 'Qaytadan', openSaved: 'Saqlanganlar' },
  ru: { save: 'Сохранить', skip: 'Дальше', saved: (n) => (n ? `Сохранено: ${n}` : 'Пока ничего не сохранено'), doneTitle: 'Вы посмотрели всё', again: 'Сначала', openSaved: 'Сохранённое' },
  en: { save: 'Save', skip: 'Next', saved: (n) => (n ? `${n} saved` : 'Nothing saved yet'), doneTitle: "You've seen them all", again: 'Start over', openSaved: 'Saved pieces' },
};

const THRESHOLD = 90;

// "Style game": swipe right to save a piece to favourites, left to pass, tap to open it.
export default function StyleDeck({ products, loading }) {
  const { language } = useLanguage();
  const w = WORDS[language] || WORDS.uz;
  const navigate = useNavigate();
  const { isFavorite, toggleFavorite } = useFavorites();
  const [index, setIndex] = useState(0);
  const [savedCount, setSavedCount] = useState(0);
  const [drag, setDrag] = useState(0);
  const [leaving, setLeaving] = useState(0);
  const start = useRef(null);

  const deck = useMemo(() => products.slice(index, index + 3), [products, index]);
  const current = deck[0];

  const fling = (direction) => {
    if (!current || leaving) return;
    setLeaving(direction);
    if (direction > 0) {
      const id = productIdOf(current);
      if (!isFavorite(id)) toggleFavorite(id);
      setSavedCount((n) => n + 1);
      if (navigator.vibrate) navigator.vibrate(12);
    }
    window.setTimeout(() => {
      setLeaving(0);
      setDrag(0);
      setIndex((i) => i + 1);
    }, 380);
  };

  const onDown = (event) => {
    if (leaving || event.target.closest('button')) return;
    start.current = { x: event.clientX, y: event.clientY };
    event.currentTarget.setPointerCapture(event.pointerId);
  };
  const onMove = (event) => {
    if (!start.current) return;
    setDrag(event.clientX - start.current.x);
  };
  const onUp = () => {
    if (!start.current) return;
    const moved = drag;
    start.current = null;
    if (Math.abs(moved) > THRESHOLD) fling(Math.sign(moved));
    else if (Math.abs(moved) < 6 && current) navigate(productPath(current));
    else setDrag(0);
  };

  if (loading && !products.length) {
    return <div className="sd"><div className="sd-stack"><div className="sd-card m-skel" /></div></div>;
  }

  return (
    <div className="sd">
      <div className="sd-stack" onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp}>
        {current ? [...deck].reverse().map((product, i, arr) => {
          const depth = arr.length - 1 - i;
          const isTop = depth === 0;
          const x = isTop ? (leaving ? leaving * 480 : drag) : 0;
          const style = isTop
            ? { transform: `translateX(${x}px) rotate(${x / 18}deg)`, transition: start.current ? 'none' : undefined, opacity: leaving ? 0 : 1 }
            : { transform: `translateY(${depth * 16}px) scale(${1 - depth * 0.05})` };
          return (
            <div key={productIdOf(product)} className={`sd-card ${isTop ? 'is-top' : ''}`} style={style} aria-hidden={!isTop}>
              <img src={getImageUrl(product)} alt={isTop ? product.name : ''} draggable="false" loading={depth < 2 ? 'eager' : 'lazy'} />
              {isTop && (
                <>
                  <span className="sd-stamp sd-stamp--yes" style={{ opacity: Math.max(0, drag / THRESHOLD) }}>{w.save}</span>
                  <span className="sd-stamp sd-stamp--no" style={{ opacity: Math.max(0, -drag / THRESHOLD) }}>{w.skip}</span>
                </>
              )}
              <div className="sd-cap">
                {product.brand && <small>{product.brand}</small>}
                <h3>{product.name}</h3>
                <span>{money(product.price, language)}</span>
              </div>
            </div>
          );
        }) : (
          <div className="sd-card sd-done">
            <h3 className="m-h2">{w.doneTitle}</h3>
            <p className="m-body">{w.saved(savedCount)}</p>
            <div className="sd-done__acts">
              <button type="button" className="m-btn m-btn--ghost" onClick={() => { setIndex(0); setSavedCount(0); }}><RotateCcw className="h-4 w-4" />{w.again}</button>
              <button type="button" className="m-btn m-btn--solid" onClick={() => navigate('/mobile/profile#saved')}>{w.openSaved}</button>
            </div>
          </div>
        )}
      </div>
      {current && (
        <>
          <div className="sd-acts">
            <button type="button" className="sd-act" onClick={() => fling(-1)} aria-label={w.skip}><X className="h-6 w-6" strokeWidth={1.5} /></button>
            <button type="button" className="sd-act sd-act--save" onClick={() => fling(1)} aria-label={w.save}><Heart className="h-6 w-6" strokeWidth={1.5} fill="currentColor" /></button>
          </div>
          <p className="sd-count">{w.saved(savedCount)} · {index + 1} / {products.length}</p>
        </>
      )}
    </div>
  );
}
