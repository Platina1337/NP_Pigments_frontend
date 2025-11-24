import { useEffect, useRef, useState } from 'react';

interface ScrollAnimationOptions {
  threshold?: number;
  rootMargin?: string;
  triggerOnce?: boolean;
  exitAnimation?: boolean; // Special mode for exit animations
}

export const useScrollAnimation = <T extends HTMLDivElement = HTMLDivElement>(options: ScrollAnimationOptions = {}) => {
  const [isVisible, setIsVisible] = useState(false); // Always start hidden
  const [isExiting, setIsExiting] = useState(false);
  const [isInitiallyVisible, setIsInitiallyVisible] = useState(false); // Track if element was visible on load
  const elementRef = useRef<T>(null);

  const { threshold = 0.3, rootMargin = '0px 0px 0px 0px', triggerOnce = true, exitAnimation = true } = options;

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    // Force initial hidden state by ensuring the element starts with the hidden class
    // This ensures CSS transitions work properly
    const ensureHiddenStart = () => {
      // For elements that should animate (exitAnimation = true), start hidden
      // For elements that should stay visible (exitAnimation = false), don't apply hidden styles
      if (exitAnimation) {
        element.style.opacity = '0';
        element.style.transform = 'translateY(25px) translateX(5px) scale(0.95) rotate(0.5deg)';
        element.style.filter = 'blur(1px)';
        element.style.transition = 'none'; // Disable transition during initial setup

        // Re-enable transitions after a short delay
        setTimeout(() => {
          element.style.transition = '';
        }, 50);
      }
      // For exitAnimation = false elements, don't apply any initial hidden styles
    };

    // Delay to ensure element is rendered and can be observed
    const startObserverTimeout = setTimeout(() => {
      // Check if element is already in viewport before applying hidden styles
      const rect = element.getBoundingClientRect();
      const isInViewport = rect.top < window.innerHeight && rect.bottom > 0;

      // Track if element was initially visible
      setIsInitiallyVisible(isInViewport);

      if (exitAnimation && !isInViewport) {
        // Only apply hidden styles if element is not in viewport and should animate
        ensureHiddenStart();
      } else if (exitAnimation && isInViewport) {
        // Element is already visible, set visible state immediately
        setIsVisible(true);
        setIsExiting(false);
      }

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              // Add small delay for smoother animation experience
              setTimeout(() => {
                setIsVisible(true);
                setIsExiting(false);
              }, 50);
            } else {
              if (exitAnimation) {
                setIsVisible(false);
                setIsExiting(true);
              } else if (!triggerOnce) {
                setIsVisible(false);
              }
            }
          });
        },
        {
          threshold,
          rootMargin,
        }
      );

      observer.observe(element);

      return () => observer.unobserve(element);
    }, 100);

    return () => {
      clearTimeout(startObserverTimeout);
    };
  }, [threshold, rootMargin, triggerOnce, exitAnimation]);

  return { ref: elementRef, isVisible, isExiting, isInitiallyVisible };
};

// Hook for scroll-based parallax effect
export const useParallax = <T extends HTMLElement = HTMLDivElement>(speed: number = 0.5) => {
  const [offset, setOffset] = useState(0);
  const elementRef = useRef<T>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (elementRef.current) {
        const rect = elementRef.current.getBoundingClientRect();
        const scrollTop = window.pageYOffset;
        const elementTop = rect.top + scrollTop;
        const distance = scrollTop - elementTop;
        setOffset(distance * speed);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [speed]);

  return { ref: elementRef, offset };
};

// Hook for fade in/out based on scroll position
export const useScrollFade = <T extends HTMLElement = HTMLDivElement>(fadeThreshold: number = 200) => {
  const [opacity, setOpacity] = useState(1);
  const elementRef = useRef<T>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (elementRef.current) {
        const rect = elementRef.current.getBoundingClientRect();
        const elementTop = rect.top;
        const windowHeight = window.innerHeight;

        // Calculate opacity based on position
        if (elementTop < -fadeThreshold) {
          // Element is above viewport, fade out
          const progress = Math.min(1, Math.abs(elementTop) / fadeThreshold);
          setOpacity(1 - progress);
        } else if (elementTop > windowHeight + fadeThreshold) {
          // Element is below viewport, fade out
          const progress = Math.min(1, (elementTop - windowHeight) / fadeThreshold);
          setOpacity(1 - progress);
        } else {
          // Element is in viewport, fully visible
          setOpacity(1);
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Initial check

    return () => window.removeEventListener('scroll', handleScroll);
  }, [fadeThreshold]);

  return { ref: elementRef, opacity };
};
