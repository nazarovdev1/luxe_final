import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import { useProducts } from '../../contexts/ProductContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { getImageUrl } from '../../utils/image';

export default function CategoryEditorial() {
  const { products } = useProducts();
  const { language } = useLanguage();
  const navigate = useNavigate();

  // Find real unique categories
  const realCategories = useMemo(() => {
    return [...new Set(products.map((p) => p.category).filter(Boolean))];
  }, [products]);

  // Map of category fallback visuals from project assets
  const categoryMediaMap = {
    'Kastyum shim': '/heroimg.jpg',
    'Dvoyka va troyka': '/second_pose.jpg',
    'Palto plash': '/about_photo.jpg',
    'Kastyum yubka': '/heroimgg.jpg',
  };

  // Build items from real categories + curated new collection entry
  const categoryItems = useMemo(() => {
    const list = realCategories.map((cat, idx) => {
      // Find a real product image if available, else high-res fallback
      const catProduct = products.find((p) => p.category === cat);
      const image = catProduct ? getImageUrl(catProduct) : (categoryMediaMap[cat] || '/heroimgg.jpg');
      const count = products.filter((p) => p.category === cat).length;

      return {
        id: `cat-${idx}`,
        title: cat,
        filterParam: { category: cat },
        image,
        count: `${count} model`,
      };
    });

    // Append curated "Yangi kolleksiya" (real filter: ?filter=new)
    list.push({
      id: 'cat-new',
      title: language === 'ru' ? 'НОВАЯ КОЛЛЕКЦИЯ' : (language === 'en' ? 'NEW COLLECTION' : 'YANGI KOLLEKSIYA'),
      filterParam: { filter: 'new' },
      image: '/heroimgg.jpg',
      count: 'EDITION 2026',
    });

    return list;
  }, [realCategories, products, language]);

  const [activeId, setActiveId] = useState(categoryItems[0]?.id || 'cat-0');
  const activeItem = categoryItems.find((i) => i.id === activeId) || categoryItems[0];

  const handleNavigate = (item) => {
    if (item.filterParam?.filter) {
      navigate(`/products?filter=${item.filterParam.filter}`);
    } else if (item.filterParam?.category) {
      navigate(`/products?category=${encodeURIComponent(item.filterParam.category)}`);
    } else {
      navigate('/products');
    }
  };

  const text = {
    uz: {
      kicker: '03 / TOIFALAR KRONIKASI',
      title: 'KOLLEKSIYA YO‘NALISHLARI',
      viewAction: 'TOIFANI KO‘RISH',
    },
    ru: {
      kicker: '03 / ХРОНИКА КАТЕГОРИЙ',
      title: 'НАПРАВЛЕНИЯ КОЛЛЕКЦИИ',
      viewAction: 'СМОТРЕТЬ КАТЕГОРИЮ',
    },
    en: {
      kicker: '03 / CATEGORY CHRONICLE',
      title: 'COLLECTION DIRECTIONS',
      viewAction: 'EXPLORE CATEGORY',
    },
  }[language] || {
    kicker: '03 / TOIFALAR KRONIKASI',
    title: 'KOLLEKSIYA YO‘NALISHLARI',
    viewAction: 'TOIFANI KO‘RISH',
  };

  return (
    <section className="e-category-section" aria-label="Category Navigation">
      <div className="luxx-editorial-shell">
        <div style={{ marginBottom: '40px' }}>
          <span className="e-label">{text.kicker}</span>
        </div>

        <div className="e-category-grid">
          {/* Left Column: Magazine Headlines List */}
          <div className="e-category-list" role="list">
            {categoryItems.map((item, idx) => {
              const isActive = activeId === item.id;
              return (
                <div
                  key={item.id}
                  role="button"
                  tabIndex={0}
                  className={`e-category-item ${isActive ? 'is-active' : ''}`}
                  onMouseEnter={() => setActiveId(item.id)}
                  onFocus={() => setActiveId(item.id)}
                  onClick={() => handleNavigate(item)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleNavigate(item);
                    }
                  }}
                  aria-label={`${item.title} — ${item.count}`}
                >
                  <div className="e-category-item-left">
                    <span className="e-category-num">{String(idx + 1).padStart(2, '0')}</span>
                    <h3 className="e-category-headline">{item.title}</h3>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <span className="e-category-count">{item.count}</span>
                    <span className="e-category-arrow">
                      <ArrowUpRight size={22} />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right Column: Crossfading Large Fashion Frame */}
          <div className="e-category-preview-box" aria-hidden="true">
            {categoryItems.map((item) => (
              <img
                key={item.id}
                className={`e-category-preview-img ${activeId === item.id ? 'is-active' : ''}`}
                src={item.image}
                alt={item.title}
                loading="lazy"
                onError={(e) => { e.currentTarget.src = '/heroimgg.jpg'; }}
              />
            ))}

            {activeItem && (
              <div className="e-category-preview-badge">
                <span className="e-category-preview-badge-cat">{activeItem.title}</span>
                <span className="e-category-preview-badge-action">{text.viewAction} →</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
