import { useState, useEffect } from 'react';

/**
 * Advanced Multi-Screen Responsive Profile Algorithm
 * Continuously monitors viewport dimensions, device pixel ratio,
 * orientation, touch capabilities, and device category.
 */
export function useScreenProfile() {
  const [profile, setProfile] = useState(() => getProfile());

  function getProfile() {
    if (typeof window === 'undefined') {
      return {
        width: 1200,
        height: 800,
        category: 'desktop',
        orientation: 'landscape',
        isTouch: false,
        pixelRatio: 1,
        isTinyMobile: false,
        isMobile: false,
        isTablet: false,
        isDesktop: true,
        isWide: false,
      };
    }

    const width = window.innerWidth;
    const height = window.innerHeight;
    const isTouch = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
    const pixelRatio = window.devicePixelRatio || 1;
    const orientation = width >= height ? 'landscape' : 'portrait';

    // Breakpoint Classification Algorithm
    let category = 'desktop';
    let isTinyMobile = false;
    let isMobile = false;
    let isTablet = false;
    let isDesktop = false;
    let isWide = false;

    if (width < 380) {
      category = 'tiny-mobile'; // iPhone SE, Galaxy Z Flip cover, small Androids
      isTinyMobile = true;
      isMobile = true;
    } else if (width < 640) {
      category = 'mobile'; // Standard smartphones (iPhone 13-16, Pixel, Galaxy)
      isMobile = true;
    } else if (width < 1024) {
      category = 'tablet'; // iPads, Tablets, Foldable unfolding screens
      isTablet = true;
    } else if (width < 1536) {
      category = 'desktop'; // Laptops, standard monitors
      isDesktop = true;
    } else {
      category = 'ultrawide'; // 2K/4K/Ultrawide monitors
      isWide = true;
      isDesktop = true;
    }

    return {
      width,
      height,
      category,
      orientation,
      isTouch,
      pixelRatio,
      isTinyMobile,
      isMobile,
      isTablet,
      isDesktop,
      isWide,
      label: isTinyMobile ? 'SM PHONE' : isMobile ? 'PHONE' : isTablet ? 'TABLET' : isWide ? 'ULTRAWIDE' : 'DESKTOP'
    };
  }

  useEffect(() => {
    let timeoutId;
    const handleResize = () => {
      // Debounce slightly for fluid layout stability during rotation or window resizing
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        setProfile(getProfile());
      }, 50);
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
      clearTimeout(timeoutId);
    };
  }, []);

  return profile;
}

