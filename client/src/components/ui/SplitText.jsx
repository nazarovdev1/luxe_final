import { useEffect, useLayoutEffect, useMemo, useRef } from 'react';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(useGSAP);

const useIsoLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

const splitIntoUnits = (text, splitType) => {
  if (!text) return [];

  const wantsChars = splitType.includes('chars');
  const wantsWords = splitType.includes('words');

  if (wantsWords && wantsChars) {
    const units = [];
    const wordRegex = /(\s+)|([^\s]+)/g;
    let match;
    while ((match = wordRegex.exec(text)) !== null) {
      if (match[1]) {
        units.push({ type: 'space', value: match[1] });
      } else if (match[2]) {
        const word = match[2];
        for (let i = 0; i < word.length; i++) {
          units.push({ type: 'char', value: word[i], word });
        }
      }
    }
    return units;
  }

  if (wantsWords) {
    const units = [];
    const wordRegex = /(\s+)|([^\s]+)/g;
    let match;
    while ((match = wordRegex.exec(text)) !== null) {
      if (match[1]) {
        units.push({ type: 'space', value: match[1] });
      } else {
        units.push({ type: 'word', value: match[2] });
      }
    }
    return units;
  }

  return text.split('').map((ch) => ({ type: 'char', value: ch }));
};

const SplitText = ({
  text,
  className = '',
  delay = 50,
  duration = 1.25,
  ease = 'power3.out',
  splitType = 'chars',
  from = { opacity: 0, y: 40 },
  to = { opacity: 1, y: 0 },
  threshold = 0.1,
  rootMargin = '-100px',
  textAlign = 'center',
  tag: Tag = 'p',
  as: As = 'span',
  onLetterAnimationComplete,
  triggerOn = 'inView',
  play = true,
  replayKey,
}) => {
  const ref = useRef(null);
  const wrapperRef = useRef(null);
  const animationCompletedRef = useRef(false);
  const onCompleteRef = useRef(onLetterAnimationComplete);

  useEffect(() => {
    onCompleteRef.current = onLetterAnimationComplete;
  }, [onLetterAnimationComplete]);

  const units = useMemo(() => splitIntoUnits(text, splitType), [text, splitType]);

  useIsoLayoutEffect(() => {
    if (!ref.current) return undefined;
    const el = ref.current;
    if (el._rbsplitInstance) {
      try {
        el._rbsplitInstance.kill();
      } catch (_) {
        /* noop */
      }
      el._rbsplitInstance = null;
    }
    gsap.set(el, { opacity: 1 });
    const targets = el.querySelectorAll('[data-split-unit]');
    if (targets.length) {
      gsap.set(targets, { ...from });
    }
    return undefined;
  }, [text, splitType, JSON.stringify(from), replayKey]);

  useGSAP(
    () => {
      if (!ref.current || !text) return;

      const el = ref.current;
      const targets = el.querySelectorAll('[data-split-unit]');
      if (!targets.length) return;

      const shouldRunNow = triggerOn === 'mount' || (triggerOn === 'manual' && play);

      if (triggerOn === 'manual' && !play) {
        gsap.set(targets, { ...from });
        return undefined;
      }

      if (shouldRunNow) {
        animationCompletedRef.current = false;
        const tween = gsap.fromTo(
          targets,
          { ...from },
          {
            ...to,
            duration,
            ease,
            stagger: delay / 1000,
            onComplete: () => {
              animationCompletedRef.current = true;
              onCompleteRef.current?.();
            },
            willChange: 'transform, opacity',
            force3D: true,
          }
        );
        el._rbsplitInstance = tween;
        return () => {
          tween.kill();
          el._rbsplitInstance = null;
        };
      }

      if (triggerOn === 'inView') {
        const startPct = (1 - threshold) * 100;
        const marginMatch = /^(-?\d+(?:\.\d+)?)(px|em|rem|%)?$/.exec(rootMargin);
        const marginValue = marginMatch ? parseFloat(marginMatch[1]) : 0;
        const marginUnit = marginMatch ? marginMatch[2] || 'px' : 'px';
        const sign =
          marginValue === 0
            ? ''
            : marginValue < 0
              ? `-=${Math.abs(marginValue)}${marginUnit}`
              : `+=${marginValue}${marginUnit}`;
        const start = `top ${startPct}%${sign}`;

        const tween = gsap.fromTo(
          targets,
          { ...from },
          {
            ...to,
            duration,
            ease,
            stagger: delay / 1000,
            scrollTrigger: {
              trigger: el,
              start,
              once: true,
              fastScrollEnd: true,
              anticipatePin: 0.4,
            },
            onComplete: () => {
              animationCompletedRef.current = true;
              onCompleteRef.current?.();
            },
            willChange: 'transform, opacity',
            force3D: true,
          }
        );
        el._rbsplitInstance = tween;
        return () => {
          tween.scrollTrigger?.kill();
          tween.kill();
          el._rbsplitInstance = null;
        };
      }

      return undefined;
    },
    {
      dependencies: [
        text,
        delay,
        duration,
        ease,
        splitType,
        JSON.stringify(from),
        JSON.stringify(to),
        threshold,
        rootMargin,
        triggerOn,
        play,
        replayKey,
      ],
      scope: wrapperRef,
    }
  );

  const style = {
    textAlign,
    overflow: 'hidden',
    display: 'inline-block',
    whiteSpace: 'normal',
    wordWrap: 'break-word',
    willChange: 'transform, opacity',
  };

  const innerStyle = {
    display: 'inline-block',
    willChange: 'transform, opacity',
  };

  return (
    <Tag
      ref={wrapperRef}
      style={style}
      className={`split-parent ${className}`}
      key={`wrap-${replayKey ?? 'static'}`}
    >
      <As ref={ref} style={innerStyle} className="split-target" key={`inner-${replayKey ?? 'static'}`}>
        {units.map((unit, idx) => {
          if (unit.type === 'space') {
            return (
              <span key={`s-${idx}`} style={{ whiteSpace: 'pre' }}>
                {unit.value}
              </span>
            );
          }
          return (
            <span
              key={`u-${idx}`}
              data-split-unit
              style={{ display: 'inline-block', willChange: 'transform, opacity' }}
            >
              {unit.value}
            </span>
          );
        })}
      </As>
    </Tag>
  );
};

export default SplitText;
