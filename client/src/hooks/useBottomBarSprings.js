import { useCallback, useEffect, useLayoutEffect, useRef } from 'react';
import {
  SPRING,
  clamp,
  createSpringLoop,
  isAtRest,
  makeSpring,
  stepSpring,
} from '../utils/springs';

const LABEL_GAP = 6;

// Bottom bar motion. Each tab's name has its own width spring: the picked tab opens to show
// its name while the previous one closes, and the highlight capsule follows the picked tab's
// live position and width, so it stretches as the labels move. The icon squashes and pops
// on pick. All DOM writes happen in one animation-frame loop that sleeps once things settle.
export default function useBottomBarSprings({ activeIndex, labelsKey }) {
  const barRef = useRef(null);
  const highlightRef = useRef(null);
  const items = useRef([]);
  const labels = useRef([]);
  const icons = useRef([]);
  const sim = useRef(null);
  const loop = useRef(null);

  if (!sim.current) {
    sim.current = {
      tabs: [],
      X: makeSpring(0, SPRING.bottomBar.highlight),
      W: makeSpring(0, SPRING.bottomBar.highlight),
      current: -1,
      snapped: false,
    };
  }

  const render = () => {
    const s = sim.current;
    s.tabs.forEach((tab, i) => {
      const label = labels.current[i];
      const icon = icons.current[i];
      if (label) {
        const w = Math.max(0, tab.w.x);
        const open = tab.full > 0 ? clamp(w / tab.full, 0, 1) : 0;
        label.style.width = `${w.toFixed(2)}px`;
        label.style.paddingLeft = `${(open * LABEL_GAP).toFixed(2)}px`;
        label.style.opacity = clamp(open * 1.4 - 0.4, 0, 1).toFixed(3);
      }
      if (icon) icon.style.transform = `scale(${tab.p.x.toFixed(4)})`;
    });
    const highlight = highlightRef.current;
    if (highlight) {
      highlight.style.transform = `translateX(${s.X.x.toFixed(2)}px)`;
      highlight.style.width = `${Math.max(0, s.W.x).toFixed(2)}px`;
    }
  };

  const retarget = () => {
    const s = sim.current;
    const el = items.current[s.current];
    if (!el) return false;
    s.X.t = el.offsetLeft;
    s.W.t = el.offsetWidth;
    return true;
  };

  if (!loop.current) {
    loop.current = createSpringLoop({
      frame: (dt) => {
        const s = sim.current;
        s.tabs.forEach((tab) => { stepSpring(tab.w, dt); stepSpring(tab.p, dt); });
        if (retarget() && !s.snapped) {
          s.X.x = s.X.t;
          s.W.x = s.W.t;
          s.snapped = true;
        }
        stepSpring(s.X, dt);
        stepSpring(s.W, dt);
      },
      render,
      isActive: () => {
        const s = sim.current;
        return s.tabs.some((tab) => !isAtRest(tab.w) || !isAtRest(tab.p)) || !isAtRest(s.X) || !isAtRest(s.W);
      },
    });
  }

  // Natural width of every label, measured while it is briefly allowed to size itself.
  const measure = useCallback(() => {
    const s = sim.current;
    labels.current.forEach((label, i) => {
      if (!label) return;
      const previous = label.style.cssText;
      label.style.width = 'auto';
      label.style.paddingLeft = '0px';
      const full = label.offsetWidth + LABEL_GAP;
      label.style.cssText = previous;
      if (!s.tabs[i]) s.tabs[i] = { w: makeSpring(0, SPRING.bottomBar.label), p: makeSpring(1, SPRING.bottomBar.pop), full };
      s.tabs[i].full = full;
    });
  }, []);

  const applyTargets = useCallback(() => {
    const s = sim.current;
    s.tabs.forEach((tab, i) => { tab.w.t = i === s.current ? tab.full : 0; });
  }, []);

  useLayoutEffect(() => {
    measure();
    applyTargets();
    loop.current.wake();
    // Fonts arriving late change label widths.
    if (typeof document !== 'undefined' && document.fonts?.ready) {
      document.fonts.ready.then(() => { measure(); applyTargets(); loop.current.wake(); });
    }
  }, [labelsKey, measure, applyTargets]);

  useLayoutEffect(() => {
    const s = sim.current;
    const previous = s.current;
    s.current = activeIndex;
    applyTargets();
    if (activeIndex >= 0 && activeIndex !== previous && s.tabs[activeIndex]) {
      s.tabs[activeIndex].p.x = 0.72;
      s.tabs[activeIndex].p.v = 6;
    }
    // The first time, the capsule starts where the picked tab is instead of flying in from 0.
    if (!s.snapped && retarget()) {
      s.X.x = s.X.t;
      s.W.x = s.W.t;
      s.snapped = true;
      render();
    }
    loop.current.wake();
  }, [activeIndex, applyTargets]);

  // Viewport or font-size changes move the tabs without any spring noticing: snap the capsule.
  useEffect(() => {
    const bar = barRef.current;
    if (!bar || typeof ResizeObserver === 'undefined') return undefined;
    let lastWidth = bar.offsetWidth;
    const observer = new ResizeObserver(() => {
      if (bar.offsetWidth === lastWidth) return;
      lastWidth = bar.offsetWidth;
      const s = sim.current;
      measure();
      applyTargets();
      s.tabs.forEach((tab, i) => { if (i === s.current) { tab.w.x = tab.full; tab.w.v = 0; } });
      if (retarget()) {
        s.X.x = s.X.t;
        s.W.x = s.W.t;
        s.X.v = 0;
        s.W.v = 0;
      }
      render();
    });
    observer.observe(bar);
    return () => observer.disconnect();
  }, [measure, applyTargets]);

  useEffect(() => () => loop.current.stop(), []);

  return {
    barRef,
    highlightRef,
    itemRef: (i) => (el) => { items.current[i] = el; },
    labelRef: (i) => (el) => { labels.current[i] = el; },
    iconRef: (i) => (el) => { icons.current[i] = el; },
  };
}
