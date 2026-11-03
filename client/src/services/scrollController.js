/**
 * Centralized High-Performance Native Scroll Controller
 * Manages a single passive window scroll listener with batched requestAnimationFrame
 * dispatching, preventing multiple uncoordinated scroll loops.
 */

const subscribers = new Set();
let isListening = false;
let ticking = false;
let currentScrollY = 0;
let currentViewportHeight = 0;

function dispatchTick() {
  currentScrollY = window.scrollY || window.pageYOffset || 0;
  currentViewportHeight = window.innerHeight || document.documentElement.clientHeight || 800;

  subscribers.forEach((callback) => {
    try {
      callback(currentScrollY, currentViewportHeight);
    } catch (err) {
      console.error('ScrollController callback error:', err);
    }
  });

  ticking = false;
}

function onWindowScroll() {
  if (!ticking) {
    requestAnimationFrame(dispatchTick);
    ticking = true;
  }
}

function startListening() {
  if (typeof window === 'undefined' || isListening) return;
  window.addEventListener('scroll', onWindowScroll, { passive: true });
  isListening = true;
}

function stopListening() {
  if (typeof window === 'undefined' || !isListening) return;
  window.removeEventListener('scroll', onWindowScroll);
  isListening = false;
  ticking = false;
}

/**
 * Register a scroll subscriber callback: (scrollY, viewportHeight) => void
 * @returns {Function} cleanup unregister function
 */
export function addScrollListener(callback) {
  if (typeof callback !== 'function') return () => {};
  subscribers.add(callback);

  if (subscribers.size === 1) {
    startListening();
  }

  // Initial trigger with current positions
  if (typeof window !== 'undefined') {
    const y = window.scrollY || window.pageYOffset || 0;
    const h = window.innerHeight || 800;
    callback(y, h);
  }

  return () => {
    subscribers.delete(callback);
    if (subscribers.size === 0) {
      stopListening();
    }
  };
}

export function getCurrentScroll() {
  if (typeof window === 'undefined') return { scrollY: 0, viewportHeight: 800 };
  return {
    scrollY: window.scrollY || window.pageYOffset || 0,
    viewportHeight: window.innerHeight || 800
  };
}

