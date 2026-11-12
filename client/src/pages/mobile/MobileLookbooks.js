import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ArrowUpRight, BookOpen, RefreshCw, WifiOff } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { apiFetch } from '../../services/api';
import LookbookImage from '../../components/mobile/LookbookImage';
import './mobileLookbook.css';

const categoriesOf = (look) => [...new Set([
  ...(look.tags || []),
  ...(look.items || []).map((item) => item.category),
  ...(look.products || []).map((product) => product?.category),
].filter(Boolean))];

const productCountOf = (look) => look.products?.length ||
  (look.items || []).reduce((sum, item) => sum + (item.count || 1), 0);

function LookCard({ look, featured, t }) {
  const count = productCountOf(look);
  const titleId = `mlb-look-${look._id || look.id}`;

  return (
    <article className={`mlb-look ${featured ? 'mlb-look--featured' : ''}`}>
      <Link to={`/mobile/lookbooks/${look._id || look.id}`} className="mlb-look__link" aria-labelledby={titleId}>
        <LookbookImage src={look.heroImage} alt={look.title} />
        <div className="mlb-look__caption">
          <div className="mlb-look__meta">
            <span>{featured ? t('mobileLookbooks.latest') : t('mobileLookbooks.lookLabel')}</span>
            {count > 0 && <span>{count} {t('mobileLookDetail.success_count')}</span>}
          </div>
          <div className="mlb-look__title">
            <h2 id={titleId}>{look.title}</h2>
            <ArrowUpRight size={featured ? 24 : 19} strokeWidth={1.3} aria-hidden="true" />
          </div>
          {featured && look.description && <p className="mlb-look__description">{look.description}</p>}
          {featured && <span className="mlb-look__action">{t('mobileLookbooks.discoverLook')}<ArrowRight size={16} aria-hidden="true" /></span>}
        </div>
      </Link>
    </article>
  );
}

function LookbookSkeleton({ t }) {
  return (
    <div className="mlb-loading" role="status" aria-label={t('mobileLookbooks.loading')}>
      <span className="sr-only">{t('mobileLookbooks.loading')}</span>
      <div className="mlb-loading__image mlb-shimmer" />
      <div className="mlb-loading__line mlb-shimmer" />
      <div className="mlb-loading__line mlb-loading__line--short mlb-shimmer" />
    </div>
  );
}

export default function MobileLookbooks() {
  const { t } = useLanguage();
  const [looks, setLooks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all');
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    let active = true;
    setIsLoading(true);
    setLoadError(false);
    const timeout = window.setTimeout(() => controller.abort(), 12000);

    apiFetch('/api/looks', { signal: controller.signal }).then((result) => {
      if (!active) return;
      if (result.success && Array.isArray(result.data)) {
        setLooks(result.data.filter((look) => look && look.isActive !== false));
      } else {
        setLoadError(true);
      }
    }).catch(() => {
      if (active) setLoadError(true);
    }).finally(() => {
      window.clearTimeout(timeout);
      if (active) setIsLoading(false);
    });

    return () => {
      active = false;
      window.clearTimeout(timeout);
      controller.abort();
    };
  }, [attempt]);

  const categories = useMemo(() => [...new Set(looks.flatMap(categoriesOf))], [looks]);
  const filteredLooks = useMemo(() => activeFilter === 'all' ? looks :
    looks.filter((look) => categoriesOf(look).includes(activeFilter)), [looks, activeFilter]);
  const [featured, ...remaining] = filteredLooks;

  return (
    <div className="mlb-page">
      <header className="mlb-topbar">
        <Link to="/mobile" className="mlb-wordmark" aria-label="LUXX UZ">LUXX UZ</Link>
        <Link to="/mobile/products" className="mlb-text-link">{t('mobileLookbooks.shop')}<ArrowUpRight size={16} aria-hidden="true" /></Link>
      </header>

      <div className="mlb-content">
        <div className="mlb-intro">
          <p className="mlb-eyebrow">THE LUXX EDIT</p>
          <h1>Lookbook<span>.</span></h1>
          <p className="mlb-intro__lead">{t('mobileLookbooks.intro')}</p>
        </div>

        <div className="mlb-filter-bar">
          <div className="mlb-filters" role="group" aria-label={t('common.filter')}>
            <button type="button" aria-pressed={activeFilter === 'all'} onClick={() => setActiveFilter('all')}>{t('mobileLookbooks.all')}</button>
            {categories.map((category) => (
              <button type="button" key={category} aria-pressed={activeFilter === category} onClick={() => setActiveFilter(category)}>{category}</button>
            ))}
          </div>
          {!isLoading && !loadError && <span className="mlb-result-count" aria-live="polite" aria-label={`${filteredLooks.length} ${t('mobileLookbooks.looksFoundSuffix')}`}>{String(filteredLooks.length).padStart(2, '0')}</span>}
        </div>

        {isLoading ? <LookbookSkeleton t={t} /> : loadError ? (
          <div className="mlb-state" role="alert">
            <WifiOff size={30} strokeWidth={1.2} />
            <h2>{t('mobileLookbooks.errorLoading')}</h2>
            <p>{t('mobileLookbooks.connectionError')}</p>
            <button type="button" className="mlb-button mlb-button--outline" onClick={() => setAttempt((value) => value + 1)}><RefreshCw size={16} />{t('mobileLookbooks.retry')}</button>
          </div>
        ) : featured ? (
          <>
            <LookCard look={featured} featured t={t} />
            {remaining.length > 0 && (
              <section className="mlb-archive" aria-label={t('mobileLookbooks.moreLooks')}>
                <header className="mlb-archive__heading"><h2>{t('mobileLookbooks.moreLooks')}</h2><span>{String(remaining.length).padStart(2, '0')}</span></header>
                <div className="mlb-grid">{remaining.map((look) => <LookCard key={look._id || look.id} look={look} t={t} />)}</div>
              </section>
            )}
          </>
        ) : (
          <div className="mlb-state">
            <BookOpen size={32} strokeWidth={1.2} />
            <h2>{t('mobileLookbooks.emptyTitle')}</h2>
            <p>{t('mobileLookbooks.emptyDescription')}</p>
            <Link to="/mobile/products" className="mlb-button mlb-button--outline">{t('mobileLookbooks.shop')}<ArrowRight size={16} /></Link>
          </div>
        )}

        <footer className="mlb-footer"><span>LUXX</span><p>{t('mobileLookbooks.footer')}</p></footer>
      </div>
    </div>
  );
}
