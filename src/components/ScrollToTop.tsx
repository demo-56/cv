import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Scrolls to top and focuses <main> on route change for accessibility.
 */
const ScrollToTop: React.FC = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
    // Accessibility: focus main content
    const main = document.querySelector('main');
    if (main) {
      main.setAttribute('tabindex', '-1');
      main.focus();
    }
  }, [pathname]);
  return null;
};

export default ScrollToTop;
