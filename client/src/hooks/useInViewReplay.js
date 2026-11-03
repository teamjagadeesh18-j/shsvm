import { useEffect, useRef, useState } from 'react';

function checkPrefersReducedMotion() {
  if (typeof window === 'undefined') return false;
  try {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  } catch {
    return false;
  }
}

/**
 * Replay-capable in-view hook using IntersectionObserver.
 * - Plays entrance each time the element enters viewport (reset when leaving).
 * - Threshold: ~0.3, rootMargin: '0px 0px -10% 0px'.
 * - No scroll listeners.
 * - Respects prefers-reduced-motion: returns true permanently if reduced motion matches.
 */
export function useInViewReplay(options = {}) {
  const { threshold = 0.3, rootMargin = '0px 0px -10% 0px' } = options;
  const ref = useRef(null);

  const [isReduced] = useState(() => checkPrefersReducedMotion());
  const [isVisible, setIsVisible] = useState(() => isReduced);

  useEffect(() => {
    if (isReduced) return;

    if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
      return;
    }

    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
          } else {
            setIsVisible(false);
          }
        });
      },
      {
        threshold,
        rootMargin,
      }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [isReduced, threshold, rootMargin]);

  return { ref, isVisible, isReduced };
}

export default useInViewReplay;
