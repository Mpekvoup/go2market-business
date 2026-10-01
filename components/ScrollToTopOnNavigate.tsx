import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const HEADER_OFFSET = 40;
const OBSERVER_TIMEOUT = 5000;

/**
 * Scrolls to element with header offset, respecting prefers-reduced-motion.
 */
function scrollToElement(element: HTMLElement): void {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const top = element.getBoundingClientRect().top + window.scrollY - HEADER_OFFSET;
  window.scrollTo({ top, behavior: prefersReducedMotion ? 'instant' : 'smooth' });
}

const ScrollToTopOnNavigate = () => {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (!hash) {
      window.scrollTo(0, 0);
      return;
    }

    const targetId = hash.slice(1);
    let observer: MutationObserver | null = null;
    let timeoutId: ReturnType<typeof setTimeout> | null = null;
    let frameId: ReturnType<typeof requestAnimationFrame> | null = null;
    let didScroll = false;

    const cleanup = () => {
      if (observer) {
        observer.disconnect();
        observer = null;
      }
      if (timeoutId !== null) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }
      if (frameId !== null) {
        cancelAnimationFrame(frameId);
        frameId = null;
      }
    };

    const tryScroll = (): boolean => {
      if (didScroll) return true;
      const element = document.getElementById(targetId);
      if (element) {
        didScroll = true;
        scrollToElement(element);
        cleanup();
        return true;
      }
      return false;
    };

    // Try immediately after a frame (element may already exist)
    frameId = requestAnimationFrame(() => {
      frameId = null;
      if (tryScroll()) return;

      // Element not found — observe DOM for its appearance
      observer = new MutationObserver(() => {
        tryScroll();
      });

      observer.observe(document.body, {
        childList: true,
        subtree: true,
      });

      // Stop waiting after timeout (invalid hash or element never appears)
      timeoutId = setTimeout(() => {
        timeoutId = null;
        cleanup();
      }, OBSERVER_TIMEOUT);
    });

    return cleanup;
  }, [pathname, hash]);

  return null;
};

export default ScrollToTopOnNavigate;
