// A tiny spring engine for hand-tuned interface motion.
// Each value chases its target with a stiffness (k) and a damping (c). Lower damping
// overshoots and wobbles; higher damping settles without bounce. The numbers below come
// from the Motion Studies tokens, so the components move the way the references do.

export const SPRING = {
  // Loading to success button
  submit: {
    width: [300, 22], // pill <-> circle <-> success pill
    text: [400, 30], // label dropping away / rising back
    spinner: [300, 28],
    done: [220, 20], // success label rising in
    fill: [200, 30], // success colour washing in
    tick: [120, 20], // the check drawing itself
  },
  // Bottom bar
  bottomBar: {
    label: [300, 26], // a tab opening to show its name
    pop: [520, 14], // icon squash and pop on pick
    highlight: [340, 28], // highlight pill following the picked tab
  },
};

export const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

export const prefersReducedMotion = () =>
  typeof window !== 'undefined'
  && typeof window.matchMedia === 'function'
  && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// [stiffness, damping] -> a spring at rest on `x`. With reduced motion the damping is
// raised to critical, so values still arrive but never overshoot or wobble.
export const makeSpring = (x, [k, c]) => ({
  x,
  v: 0,
  t: x,
  k,
  c: prefersReducedMotion() ? 2 * Math.sqrt(k) : c,
});

export const stepSpring = (s, dt) => {
  const acceleration = -s.k * (s.x - s.t) - s.c * s.v;
  s.v += acceleration * dt;
  s.x += s.v * dt;
};

export const isAtRest = (s, epsilon = 0.01) => Math.abs(s.x - s.t) < epsilon && Math.abs(s.v) < epsilon;

// One requestAnimationFrame loop that sleeps when everything has settled.
// `frame(dt)` advances the springs (called in 4 sub-steps for stability), `render()` writes
// the DOM, `isActive()` says whether anything is still moving. Call `wake()` after changing
// a target.
export const createSpringLoop = ({ frame, render, isActive }) => {
  let raf = 0;
  let last = 0;

  const tick = (now) => {
    const dt = Math.min((now - last) / 1000, 1 / 30);
    last = now;
    const sub = 4;
    for (let i = 0; i < sub; i += 1) frame(dt / sub);
    render();
    raf = isActive() ? requestAnimationFrame(tick) : 0;
  };

  return {
    wake() {
      if (raf || typeof requestAnimationFrame !== 'function') return;
      last = typeof performance !== 'undefined' ? performance.now() : Date.now();
      raf = requestAnimationFrame(tick);
    },
    stop() {
      if (raf && typeof cancelAnimationFrame === 'function') cancelAnimationFrame(raf);
      raf = 0;
    },
  };
};
