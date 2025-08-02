import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// Store scroll positions for each route
const scrollPositions: { [key: string]: number } = {};

/**
 * Manages scroll position restoration and accessibility focus on route changes.
 * Preserves scroll position when navigating back to previous pages.
 */
const ScrollToTop: React.FC = () => {
  const { pathname, key } = useLocation();

  useEffect(() => {
    // Save current scroll position before navigating away
    const saveScrollPosition = () => {
      scrollPositions[pathname] = window.scrollY;
    };

    // Add event listener to save scroll position before page unload
    window.addEventListener('beforeunload', saveScrollPosition);

    // Restore scroll position if returning to a previously visited page
    const savedPosition = scrollPositions[pathname];
    
    if (savedPosition !== undefined) {
      // Use setTimeout to ensure DOM is fully rendered before scrolling
      setTimeout(() => {
        window.scrollTo(0, savedPosition);
      }, 0);
    } else {
      // Scroll to top for new pages
      window.scrollTo(0, 0);
    }

    // Accessibility: focus main content
    const main = document.querySelector('main');
    if (main) {
      main.setAttribute('tabindex', '-1');
      main.focus();
    }

    // Cleanup function
    return () => {
      saveScrollPosition();
      window.removeEventListener('beforeunload', saveScrollPosition);
    };
  }, [pathname, key]);

  // Save scroll position when component unmounts
  useEffect(() => {
    return () => {
      scrollPositions[pathname] = window.scrollY;
    };
  }, [pathname]);

  return null;
};

export default ScrollToTop;