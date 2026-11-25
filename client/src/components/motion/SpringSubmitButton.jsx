import React, { useEffect, useLayoutEffect, useRef } from 'react';
import {
  SPRING,
  clamp,
  createSpringLoop,
  isAtRest,
  makeSpring,
  stepSpring,
} from '../../utils/springs';
import './SpringSubmitButton.css';

const TICK_LENGTH = 22;
const DONE_PADDING = 44;

const createSim = () => ({
  W: makeSpring(0, SPRING.submit.width),
  T: makeSpring(1, SPRING.submit.text),
  P: makeSpring(0, SPRING.submit.spinner),
  D: makeSpring(0, SPRING.submit.done),
  G: makeSpring(0, SPRING.submit.fill),
  K: makeSpring(0, SPRING.submit.tick),
  rot: 0,
  idleWidth: 0,
  status: 'idle',
  timers: [],
});

const allSprings = (s) => [s.W, s.T, s.P, s.D, s.G, s.K];

// "Loading to success" button. The label drops away and the button closes into a circle
// with a spinner; when `status` becomes "success" the circle opens into a coloured pill,
// the check draws itself and the success label rises in. Back to "idle" it grows to full
// width again. The parent owns the status, so the button always reflects real work.
export default function SpringSubmitButton({
  status = 'idle',
  children,
  loadingLabel = '',
  successLabel = '',
  onClick,
  disabled = false,
  type = 'button',
  height = 56,
  radius = 12,
  successColor = '#6ccd93',
  onSuccessColor = '#07130b',
  className = '',
  wrapperClassName = '',
  style,
  ...rest
}) {
  const wrapRef = useRef(null);
  const btnRef = useRef(null);
  const txtRef = useRef(null);
  const spinRef = useRef(null);
  const doneRef = useRef(null);
  const doneInnerRef = useRef(null);
  const tickRef = useRef(null);
  const fillRef = useRef(null);
  const sim = useRef(null);
  const loop = useRef(null);
  const props = useRef({ height, radius });
  props.current = { height, radius };

  if (!sim.current) sim.current = createSim();

  const render = () => {
    const s = sim.current;
    const btn = btnRef.current;
    if (!btn) return;
    const { height: h, radius: base } = props.current;
    const growth = Math.max(s.idleWidth - h, 1);
    // Corners round off as the button closes and stay round for the success pill.
    const round = Math.max(clamp((s.idleWidth - s.W.x) / growth, 0, 1), clamp(s.G.x, 0, 1));
    btn.style.width = `${Math.max(s.W.x, 0).toFixed(2)}px`;
    btn.style.borderRadius = `${(base + (h / 2 - base) * round).toFixed(2)}px`;
    fillRef.current.style.opacity = clamp(s.G.x, 0, 1).toFixed(3);
    txtRef.current.style.opacity = clamp(s.T.x, 0, 1).toFixed(3);
    txtRef.current.style.transform = `translateY(${((1 - s.T.x) * 14).toFixed(2)}px)`;
    spinRef.current.style.opacity = clamp(s.P.x, 0, 1).toFixed(3);
    spinRef.current.style.transform = `rotate(${s.rot % 360}deg) scale(${(0.6 + 0.4 * clamp(s.P.x, 0, 1.2)).toFixed(3)})`;
    doneRef.current.style.opacity = clamp(s.D.x, 0, 1).toFixed(3);
    doneRef.current.style.transform = `translateY(${((1 - s.D.x) * 12).toFixed(2)}px)`;
    tickRef.current.style.strokeDashoffset = (TICK_LENGTH * (1 - clamp(s.K.x, 0, 1))).toFixed(2);
  };

  if (!loop.current) {
    loop.current = createSpringLoop({
      frame: (dt) => {
        const s = sim.current;
        s.rot += dt * 360 * 1.4;
        allSprings(s).forEach((spring) => stepSpring(spring, dt));
      },
      render,
      isActive: () => {
        const s = sim.current;
        return s.status === 'loading' || !allSprings(s).every((spring) => isAtRest(spring));
      },
    });
  }

  // Measure the resting width and keep it in step with the layout.
  useLayoutEffect(() => {
    const s = sim.current;
    const measure = () => {
      const width = wrapRef.current?.clientWidth || 0;
      if (!width || width === s.idleWidth) return;
      s.idleWidth = width;
      if (s.status === 'idle') {
        s.W.x = width;
        s.W.t = width;
        s.W.v = 0;
        render();
      }
    };
    measure();
    if (typeof ResizeObserver === 'undefined') return undefined;
    const observer = new ResizeObserver(measure);
    observer.observe(wrapRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const s = sim.current;
    const run = loop.current;
    if (s.status === status) return undefined;
    s.status = status;
    s.timers.forEach(clearTimeout);
    s.timers = [];
    const later = (ms, fn) => s.timers.push(window.setTimeout(() => { fn(); run.wake(); }, ms));

    if (status === 'loading') {
      s.T.t = 0;
      s.W.t = height;
      s.P.t = 1;
    } else if (status === 'success') {
      const inner = doneInnerRef.current?.offsetWidth || 0;
      s.P.t = 0;
      s.W.t = clamp(inner + DONE_PADDING, height, s.idleWidth || inner + DONE_PADDING);
      s.G.t = 1;
      s.D.t = 1;
      later(150, () => { s.K.t = 1; });
    } else {
      s.P.t = 0;
      s.D.t = 0;
      s.G.t = 0;
      s.K.t = 0;
      s.W.t = s.idleWidth;
      later(120, () => { s.T.t = 1; });
    }
    run.wake();
    return undefined;
  }, [status, height]);

  useEffect(() => () => {
    sim.current.timers.forEach(clearTimeout);
    loop.current.stop();
  }, []);

  const handleClick = (event) => {
    if (status !== 'idle') return;
    onClick?.(event);
  };

  const label = status === 'success' ? successLabel : status === 'loading' ? loadingLabel : undefined;

  return (
    <div ref={wrapRef} className={`sbtn-wrap ${wrapperClassName}`.trim()} style={{ height }}>
      <button
        ref={btnRef}
        type={type}
        disabled={disabled}
        onClick={handleClick}
        aria-live="polite"
        aria-busy={status === 'loading' || undefined}
        aria-label={label || undefined}
        className={`sbtn ${className}`.trim()}
        style={{ ...style, height, borderRadius: radius, '--sbtn-success': successColor, '--sbtn-on-success': onSuccessColor }}
        {...rest}
      >
        <span ref={fillRef} className="sbtn__fill" aria-hidden="true" />
        <span ref={txtRef} className="sbtn__layer sbtn__txt">{children}</span>
        <span ref={spinRef} className="sbtn__spin" aria-hidden="true" />
        <span ref={doneRef} className="sbtn__layer sbtn__done" aria-hidden="true">
          <span ref={doneInnerRef} className="sbtn__done-inner">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path ref={tickRef} d="M5 12.5l4.5 4.5L19 7.5" strokeDasharray={TICK_LENGTH} strokeDashoffset={TICK_LENGTH} />
            </svg>
            <b>{successLabel}</b>
          </span>
        </span>
      </button>
    </div>
  );
}
