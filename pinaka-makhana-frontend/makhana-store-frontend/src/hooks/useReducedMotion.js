import { useState, useEffect } from 'react';

/**
 * Custom hook to detect user's motion preferences
 * Respects prefers-reduced-motion media query for accessibility
 */
export const useReducedMotion = () => {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    // Check if the browser supports the media query
    if (typeof window !== 'undefined' && window.matchMedia) {
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      
      // Set initial value
      setPrefersReducedMotion(mediaQuery.matches);
      
      // Listen for changes
      const handleChange = (event) => {
        setPrefersReducedMotion(event.matches);
      };
      
      // Add event listener
      if (mediaQuery.addEventListener) {
        mediaQuery.addEventListener('change', handleChange);
      } else {
        // Fallback for older browsers
        mediaQuery.addListener(handleChange);
      }
      
      // Cleanup
      return () => {
        if (mediaQuery.removeEventListener) {
          mediaQuery.removeEventListener('change', handleChange);
        } else {
          // Fallback for older browsers
          mediaQuery.removeListener(handleChange);
        }
      };
    }
  }, []);

  return prefersReducedMotion;
};

/**
 * Get animation variants based on motion preferences
 * Returns reduced animations if user prefers reduced motion
 */
export const getAnimationVariants = (prefersReducedMotion) => {
  if (prefersReducedMotion) {
    return {
      fadeInUp: {
        hidden: { opacity: 1 },
        visible: { opacity: 1, transition: { duration: 0.01 } }
      },
      slideInLeft: {
        hidden: { opacity: 1 },
        visible: { opacity: 1, transition: { duration: 0.01 } }
      },
      slideInRight: {
        hidden: { opacity: 1 },
        visible: { opacity: 1, transition: { duration: 0.01 } }
      },
      scaleIn: {
        hidden: { opacity: 1 },
        visible: { opacity: 1, transition: { duration: 0.01 } }
      },
      staggerContainer: {
        hidden: { opacity: 1 },
        visible: {
          opacity: 1,
          transition: { staggerChildren: 0.01, delayChildren: 0.01 }
        }
      }
    };
  }

  // Full animations for users who don't prefer reduced motion
  return {
    fadeInUp: {
      hidden: {
        opacity: 0,
        y: 40,
        scale: 0.96
      },
      visible: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: {
          duration: 0.8,
          ease: [0.25, 0.46, 0.45, 0.94]
        }
      }
    },
    slideInLeft: {
      hidden: {
        opacity: 0,
        x: -60,
        scale: 0.94
      },
      visible: {
        opacity: 1,
        x: 0,
        scale: 1,
        transition: {
          duration: 1.0,
          ease: [0.25, 0.46, 0.45, 0.94]
        }
      }
    },
    slideInRight: {
      hidden: {
        opacity: 0,
        x: 60,
        scale: 0.94
      },
      visible: {
        opacity: 1,
        x: 0,
        scale: 1,
        transition: {
          duration: 1.0,
          ease: [0.25, 0.46, 0.45, 0.94]
        }
      }
    },
    scaleIn: {
      hidden: {
        opacity: 1,
        scale: 0.9,
        rotate: -2
      },
      visible: {
        opacity: 1,
        scale: 1,
        rotate: 0,
        transition: {
          duration: 0.7,
          ease: [0.25, 0.46, 0.45, 0.94]
        }
      }
    },
    staggerContainer: {
      hidden: { opacity: 1 },
      visible: {
        opacity: 1,
        transition: {
          staggerChildren: 0.15,
          delayChildren: 0.3
        }
      }
    }
  };
};

export default useReducedMotion;
