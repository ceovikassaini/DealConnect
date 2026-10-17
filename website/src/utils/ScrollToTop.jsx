import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const ScrollToTop = () => {
  const { pathname, search } = useLocation();

  const performScrollTop = () => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;

    // Reset scroll on any internal layout or scrollable containers
    const scrollContainers = document.querySelectorAll(
      "main, .parkez-layout__scroll, .scroll-container, .dashboard-container"
    );
    scrollContainers.forEach((el) => {
      if (el) el.scrollTop = 0;
    });
  };

  // Run whenever route pathname or query parameters change
  useEffect(() => {
    performScrollTop();
  }, [pathname, search]);

  // Global click handler: when user clicks any link, nav-item, tab, or sidebar button
  useEffect(() => {
    const handleGlobalClick = (e) => {
      const clickableElement = e.target.closest(
        'a, button[role="tab"], .nav-link, .tab-btn, [data-tab], aside a, aside button'
      );
      if (clickableElement) {
        // Small delay to ensure any internal tab state / DOM update completes
        setTimeout(() => {
          performScrollTop();
        }, 20);
      }
    };

    document.addEventListener("click", handleGlobalClick, { passive: true });
    return () => document.removeEventListener("click", handleGlobalClick);
  }, []);

  return null;
};

export default ScrollToTop;