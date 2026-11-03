import { useEffect, useRef, useState } from 'react';

function checkShouldSkipAnimation() {
  if (typeof window === 'undefined') return true;
  if (!('IntersectionObserver' in window)) return true;
  try {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  } catch {
    return false;
  }
}

/**
 * Custom hook to detect when an element enters the viewport using Intersection Observer.
 * Features:
 * - Fires only once (disconnects/unobserves after first appearance)
 * - Threshold: 0.15, rootMargin: '0px 0px -50px 0px'
 * - Graceful fallback if IntersectionObserver is unsupported
 * - Respects prefers-reduced-motion: reduce
 * - Supports both object destructuring { ref, isVisible } and array destructuring [ref, isVisible]
 */
export function useInView(options = {}) {
  const { threshold = 0.15, rootMargin = '0px 0px -50px 0px' } = options;
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(() => checkShouldSkipAnimation());

  useEffect(() => {
    if (isVisible) return;

    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.unobserve(entry.target);
            observer.disconnect();
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
  }, [isVisible, threshold, rootMargin]);

  // Support both object and tuple destructuring
  return {
    ref,
    isVisible,
    *[Symbol.iterator]() {
      yield ref;
      yield isVisible;
    },
  };
}

export default useInView;
