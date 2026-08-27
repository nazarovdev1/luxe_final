import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { gsap } from 'gsap';
import './Masonry.css';

const useMedia = (queries, values, defaultValue) => {
  const valuesRef = useRef(values);
  valuesRef.current = values;

  const get = () =>
    valuesRef.current[queries.findIndex((q) => matchMedia(q).matches)] ?? defaultValue;

  const [value, setValue] = useState(get);

  useEffect(() => {
    const handler = () => setValue(get);
    queries.forEach((q) => matchMedia(q).addEventListener('change', handler));
    return () =>
      queries.forEach((q) => matchMedia(q).removeEventListener('change', handler));
  }, [queries]);

  const serializedValues = JSON.stringify(values);
  useEffect(() => {
    setValue(get);
  }, [serializedValues, defaultValue]);

  return value;
};

const useMeasure = () => {
  const ref = useRef(null);
  const [size, setSize] = useState({ width: 0, height: 0 });

  useLayoutEffect(() => {
    if (!ref.current) return;
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setSize({ width, height });
    });
    ro.observe(ref.current);
    return () => ro.disconnect();
  }, []);

  return [ref, size];
};

const preloadImages = async (urls) => {
  await Promise.all(
    urls.map(
      (src) =>
        new Promise((resolve) => {
          const img = new Image();
          img.src = src;
          img.onload = img.onerror = () => resolve();
        })
    )
  );
};

const Masonry = ({
  items,
  ease = 'power3.out',
  duration = 0.6,
  stagger = 0.05,
  animateFrom = 'bottom',
  scaleOnHover = true,
  hoverScale = 0.95,
  blurToFocus = true,
  colorShiftOnHover = false,
  borderRadius = '10px',
  gap = 6,
  columns: columnsOverride,
  onItemClick,
  children,
}) => {
  const defaultCols = [3, 2, 1];
  const colValues = Array.isArray(columnsOverride)
    ? columnsOverride
    : defaultCols;

  const responsiveColumns = useMedia(
    ['(min-width:1024px)', '(min-width:768px)', '(min-width:480px)'],
    colValues,
    colValues[colValues.length - 1] ?? 1
  );

  const columns = typeof columnsOverride === 'number'
    ? columnsOverride
    : responsiveColumns;

  const [containerRef, { width }] = useMeasure();
  const [imagesReady, setImagesReady] = useState(false);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
      setIsInView(true);
      return;
    }

    const element = containerRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.unobserve(element);
        }
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px',
      }
    );

    observer.observe(element);
    return () => {
      observer.disconnect();
    };
  }, [containerRef]);

  const getInitialPosition = (item) => {
    const containerRect = containerRef.current?.getBoundingClientRect();
    if (!containerRect) return { x: item.x, y: item.y };

    let direction = animateFrom;

    if (animateFrom === 'random') {
      const directions = ['top', 'bottom', 'left', 'right'];
      direction = directions[Math.floor(Math.random() * directions.length)];
    }

    switch (direction) {
      case 'top':
        return { x: item.x, y: -200 };
      case 'bottom':
        return { x: item.x, y: window.innerHeight + 200 };
      case 'left':
        return { x: -200, y: item.y };
      case 'right':
        return { x: window.innerWidth + 200, y: item.y };
      case 'center':
        return {
          x: containerRect.width / 2 - item.w / 2,
          y: containerRect.height / 2 - item.h / 2,
        };
      default:
        return { x: item.x, y: item.y + 100 };
    }
  };

  useEffect(() => {
    if (!items || items.length === 0) {
      setImagesReady(true);
      return;
    }
    setImagesReady(false);
    preloadImages(items.map((i) => i.img)).then(() => setImagesReady(true));
  }, [items]);

  const grid = useMemo(() => {
    if (!width || !items || items.length === 0) return [];

    const colHeights = new Array(columns).fill(0);
    const columnWidth = (width - gap * (columns - 1)) / columns;

    return items.map((child) => {
      const col = colHeights.indexOf(Math.min(...colHeights));
      const x = columnWidth * col + col * gap;
      const ratio = child.height && child.width ? child.width / child.height : 0.75;
      const targetHeight = columnWidth / (ratio || 0.75);
      const height = Math.max(220, Math.min(720, targetHeight));
      const y = colHeights[col];

      colHeights[col] += height + gap;

      return { ...child, x, y, w: columnWidth, h: height };
    });
  }, [columns, items, width, gap]);

  const totalHeight = useMemo(() => {
    if (!grid.length) return 0;
    let maxY = 0;
    grid.forEach((item) => {
      if (item.y + item.h > maxY) maxY = item.y + item.h;
    });
    return maxY;
  }, [grid]);

  const hasMounted = useRef(false);

  useLayoutEffect(() => {
    if (!imagesReady || !grid.length) return;

    if (!isInView) {
      grid.forEach((item) => {
        const selector = `[data-key="${item.id}"]`;
        const initialPos = getInitialPosition(item);
        gsap.set(selector, {
          opacity: 0,
          x: initialPos.x,
          y: initialPos.y,
          scale: 0.95,
          width: item.w,
          height: item.h,
          willChange: 'transform, opacity',
        });
      });
      return;
    }

    grid.forEach((item, index) => {
      const selector = `[data-key="${item.id}"]`;
      const animationProps = {
        x: item.x,
        y: item.y,
        scale: 1,
        width: item.w,
        height: item.h,
      };

      if (!hasMounted.current) {
        const initialPos = getInitialPosition(item);
        const initialState = {
          opacity: 0,
          scale: 0.95,
          x: initialPos.x,
          y: initialPos.y,
          width: item.w,
          height: item.h,
          willChange: 'transform, opacity',
        };

        gsap.fromTo(
          selector,
          initialState,
          {
            opacity: 1,
            ...animationProps,
            duration: 0.75,
            ease: 'power3.out',
            delay: index * stagger,
            onComplete: () => {
              gsap.set(selector, { clearProps: 'willChange' });
            }
          }
        );
      } else {
        gsap.to(selector, {
          ...animationProps,
          duration,
          ease,
          overwrite: 'auto',
        });
      }
    });

    hasMounted.current = true;
  }, [grid, imagesReady, stagger, animateFrom, blurToFocus, duration, ease, isInView]);

  const handleMouseEnter = (e, item) => {
    const element = e.currentTarget;
    const selector = `[data-key="${item.id}"]`;

    if (scaleOnHover) {
      gsap.to(selector, {
        scale: hoverScale,
        duration: 0.3,
        ease: 'power2.out',
      });
    }

    if (colorShiftOnHover) {
      const overlay = element.querySelector('.color-overlay');
      if (overlay) {
        gsap.to(overlay, {
          opacity: 0.3,
          duration: 0.3,
        });
      }
    }
  };

  const handleMouseLeave = (e, item) => {
    const element = e.currentTarget;
    const selector = `[data-key="${item.id}"]`;

    if (scaleOnHover) {
      gsap.to(selector, {
        scale: 1,
        duration: 0.3,
        ease: 'power2.out',
      });
    }

    if (colorShiftOnHover) {
      const overlay = element.querySelector('.color-overlay');
      if (overlay) {
        gsap.to(overlay, {
          opacity: 0,
          duration: 0.3,
        });
      }
    }
  };

  const handleClick = (e, item) => {
    if (onItemClick) {
      e.preventDefault();
      e.stopPropagation();
      onItemClick(item, e);
      return;
    }
    if (item.url) {
      window.open(item.url, '_blank', 'noopener');
    }
  };

  const renderOverlay = (item) => {
    if (children) {
      return children(item);
    }
    return null;
  };

  return (
    <div
      ref={containerRef}
      className="rb-masonry-list"
      style={{ height: totalHeight ? `${totalHeight}px` : 'auto' }}
    >
      {grid.map((item) => (
        <div
          key={item.id}
          data-key={item.id}
          className="rb-masonry-item-wrapper"
          style={{
            padding: `${gap}px`,
            width: `${item.w + gap * 2}px`,
            borderRadius,
          }}
          onClick={(e) => handleClick(e, item)}
          onMouseEnter={(e) => handleMouseEnter(e, item)}
          onMouseLeave={(e) => handleMouseLeave(e, item)}
        >
          <div
            className="rb-masonry-item-img"
            style={{
              backgroundImage: `url(${item.img})`,
              borderRadius,
            }}
          >
            {colorShiftOnHover && (
              <div
                className="color-overlay"
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  background:
                    'linear-gradient(45deg, rgba(255,0,150,0.5), rgba(0,150,255,0.5))',
                  opacity: 0,
                  pointerEvents: 'none',
                  borderRadius,
                }}
              />
            )}
            <div className="rb-masonry-overlay">{renderOverlay(item)}</div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Masonry;
