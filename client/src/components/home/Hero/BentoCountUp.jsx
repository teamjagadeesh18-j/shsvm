import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';

function checkReducedMotion() {
  return typeof window !== 'undefined' &&
    Boolean(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
}

const TARGET_YEARS = new Date().getFullYear() - 1999;

export default function BentoCountUp() {
  const { t } = useTranslation();
  const containerRef = useRef(null);
  const targetYears = TARGET_YEARS;
  const [count, setCount] = useState(() => (checkReducedMotion() ? targetYears : 0));
  const hasAnimatedRef = useRef(false);

  useEffect(() => {
    if (checkReducedMotion()) {
      hasAnimatedRef.current = true;
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && !hasAnimatedRef.current) {
          hasAnimatedRef.current = true;
          observer.disconnect();

          const duration = 1200; // ~1.2s
          const startTime = performance.now();

          const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            // ease-out cubic
            const easeProgress = 1 - Math.pow(1 - progress, 3);
            const currentVal = Math.floor(easeProgress * targetYears);

            setCount(currentVal);

            if (progress < 1) {
              requestAnimationFrame(animate);
            } else {
              setCount(targetYears);
            }
          };

          requestAnimationFrame(animate);
        }
      },
      { threshold: 0.2 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, [targetYears]);

  const yearsLabel = t('bentoYears', 'Years in Pakkam');

  return (
    <div
      ref={containerRef}
      className="bento-tile bento-count-tile"
      aria-label={`${targetYears}+ ${yearsLabel}`}
    >
      <div className="bento-count-content">
        <span className="bento-count-number" aria-hidden="true">
          {count}+
        </span>
        <span className="bento-count-label" aria-hidden="true">
          {yearsLabel}
        </span>
      </div>
    </div>
  );
}
