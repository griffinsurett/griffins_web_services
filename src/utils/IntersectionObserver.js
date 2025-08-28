/**
 * createIntersectionObserver(element, options)
 * --------------------------------------------
 * Creates an Intersection Observer for the given element and returns an object
 * with the current visibility state, whether the element has ever been seen,
 * and a method to disconnect the observer.
 *
 * @param {HTMLElement} element - The DOM element to observe.
 * @param {Object} options - Configuration options.
 * @param {number|number[]} options.threshold - Intersection threshold (0 to 1).
 * @param {HTMLElement|null} options.root - The root element for observing (null for viewport).
 * @param {string} options.rootMargin - Margin around the root (e.g., "0px").
 * @param {boolean} options.once - If true, disconnect after first intersection.
 * @param {Function} options.onEnter - Callback when element enters viewport.
 * @param {Function} options.onExit - Callback when element exits viewport.
 * @returns {Object} - { isVisible, hasBeenSeen, disconnect }
 */
export function useIntersectionObserver(
  element,
  {
    threshold = 0.1,
    root = null,
    rootMargin = "0px",
    once = false,
    onEnter,
    onExit,
  } = {}
) {
  let isVisible = false;
  let hasBeenSeen = false;
  let observer = null;

  if (!element) {
    console.warn("No element provided to createIntersectionObserver");
    return { isVisible, hasBeenSeen, disconnect: () => {} };
  }

  observer = new IntersectionObserver(
    ([entry]) => {
      const isIn = entry.isIntersecting;
      isVisible = isIn;

      if (isIn) {
        if (!hasBeenSeen) hasBeenSeen = true;
        onEnter?.(entry);
        if (once) observer.disconnect();
      } else {
        onExit?.(entry);
      }
    },
    { root, rootMargin, threshold }
  );

  observer.observe(element);

  return {
    get isVisible() {
      return isVisible;
    },
    get hasBeenSeen() {
      return hasBeenSeen;
    },
    disconnect: () => observer?.disconnect(),
  };
}