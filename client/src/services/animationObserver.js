/**
 * Viewport Animation Optimization Observer
 * Pauses background looping CSS animations (marquees, sweeps) when off-screen
 * or when page visibility is hidden, conserving CPU frames during active scrolling.
 */

const trackedElements = new Map();
let sharedObserver = null;
let visibilityListenerAttached = false;

function handleVisibilityChange() {
  const isHidden = typeof document !== 'undefined' && document.hidden;
  trackedElements.forEach((entry, element) => {
    if (isHidden) {
      element.style.animationPlayState = 'paused';
    } else if (entry.isIntersecting) {
      element.style.animationPlayState = 'running';
    }
  });
}

function getObserver() {
  if (typeof window === 'undefined' || typeof IntersectionObserver === 'undefined') {
    return null;
  }
  if (!sharedObserver) {
    sharedObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const target = entry.target;
          const data = trackedElements.get(target);
          if (data) {
            data.isIntersecting = entry.isIntersecting;
            if (!document.hidden) {
              target.style.animationPlayState = entry.isIntersecting ? 'running' : 'paused';
            }
          }
        });
      },
      { rootMargin: '120px 0px 120px 0px' }
    );
  }
  if (!visibilityListenerAttached && typeof document !== 'undefined') {
    document.addEventListener('visibilitychange', handleVisibilityChange);
    visibilityListenerAttached = true;
  }
  return sharedObserver;
}

/**
 * Register an animated element to be automatically paused off-screen
 * @param {HTMLElement} element
 * @returns {Function} cleanup unregister function
 */
export function observeAnimation(element) {
  if (!element || typeof window === 'undefined') return () => {};
  const observer = getObserver();
  if (!observer) return () => {};

  trackedElements.set(element, { isIntersecting: true });
  observer.observe(element);

  return () => {
    observer.unobserve(element);
    trackedElements.delete(element);
    if (trackedElements.size === 0 && sharedObserver) {
      sharedObserver.disconnect();
      sharedObserver = null;
    }
  };
}

