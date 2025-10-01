import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Hook to check if user prefers reduced motion
 * Respects accessibility preferences
 */
export const useReducedMotion = () => {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handler = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  return prefersReducedMotion;
};

/**
 * Hook for animated counter with Matrix-style roll effect
 * Counts from start to end value with customizable duration
 */
export const useCountUp = (
  end: number,
  start: number = 0,
  duration: number = 2000,
  enabled: boolean = true
) => {
  const [count, setCount] = useState(start);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    if (!enabled) return;

    // Skip animation if reduced motion preferred
    if (prefersReducedMotion) {
      setCount(end);
      return;
    }

    let startTime: number | null = null;
    let animationFrame: number;

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);

      // Ease-out-cubic for natural deceleration
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      const currentValue = start + (end - start) * easeProgress;

      setCount(Math.floor(currentValue));

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      } else {
        setCount(end);
      }
    };

    animationFrame = requestAnimationFrame(animate);

    return () => {
      if (animationFrame) cancelAnimationFrame(animationFrame);
    };
  }, [end, start, duration, enabled, prefersReducedMotion]);

  return count;
};

/**
 * Hook for typewriter effect
 * Types out text character by character
 */
export const useTypewriter = (
  text: string,
  speed: number = 50,
  enabled: boolean = true
) => {
  const [displayedText, setDisplayedText] = useState('');
  const [isComplete, setIsComplete] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    if (!enabled) return;

    // Show all text immediately if reduced motion preferred
    if (prefersReducedMotion) {
      setDisplayedText(text);
      setIsComplete(true);
      return;
    }

    setDisplayedText('');
    setIsComplete(false);

    let currentIndex = 0;
    const interval = setInterval(() => {
      if (currentIndex <= text.length) {
        setDisplayedText(text.substring(0, currentIndex));
        currentIndex++;
      } else {
        setIsComplete(true);
        clearInterval(interval);
      }
    }, speed);

    return () => clearInterval(interval);
  }, [text, speed, enabled, prefersReducedMotion]);

  return { displayedText, isComplete };
};

/**
 * Hook for glitch effect trigger
 * Returns a function to manually trigger glitch animation
 */
export const useGlitchEffect = (cooldown: number = 1000) => {
  const [isGlitching, setIsGlitching] = useState(false);
  const cooldownRef = useRef(false);
  const prefersReducedMotion = useReducedMotion();

  const triggerGlitch = useCallback(() => {
    if (cooldownRef.current || prefersReducedMotion) return;

    setIsGlitching(true);
    cooldownRef.current = true;

    setTimeout(() => {
      setIsGlitching(false);
    }, 300);

    setTimeout(() => {
      cooldownRef.current = false;
    }, cooldown);
  }, [cooldown, prefersReducedMotion]);

  return { isGlitching, triggerGlitch };
};

/**
 * Hook to detect element visibility using Intersection Observer
 * Useful for triggering animations when elements enter viewport
 */
export const useInView = (options?: IntersectionObserverInit) => {
  const [isInView, setIsInView] = useState(false);
  const [hasBeenInView, setHasBeenInView] = useState(false);
  const ref = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!ref.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry.isIntersecting);
        if (entry.isIntersecting) {
          setHasBeenInView(true);
        }
      },
      {
        threshold: 0.1,
        rootMargin: '50px',
        ...options,
      }
    );

    observer.observe(ref.current);

    return () => {
      observer.disconnect();
    };
  }, [options]);

  return { ref, isInView, hasBeenInView };
};

/**
 * Hook for particle animation system
 * Creates and manages particle effects for celebrations/interactions
 */
interface Particle {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  color: string;
  size: number;
}

export const useParticles = (maxParticles: number = 50) => {
  const [particles, setParticles] = useState<Particle[]>([]);
  const animationRef = useRef<number>();
  const prefersReducedMotion = useReducedMotion();

  const createParticles = useCallback((
    x: number,
    y: number,
    count: number = 20,
    colors: string[] = ['#5FB85A', '#39FF14', '#CCFF00']
  ) => {
    if (prefersReducedMotion) return;

    const newParticles: Particle[] = Array.from({ length: count }, () => ({
      id: Math.random().toString(36),
      x,
      y,
      vx: (Math.random() - 0.5) * 10,
      vy: (Math.random() - 0.5) * 10 - 5, // Bias upward
      life: 1,
      color: colors[Math.floor(Math.random() * colors.length)],
      size: Math.random() * 4 + 2,
    }));

    setParticles(prev => [...prev, ...newParticles].slice(-maxParticles));
  }, [maxParticles, prefersReducedMotion]);

  useEffect(() => {
    if (particles.length === 0) return;

    const animate = () => {
      setParticles(prev =>
        prev
          .map(particle => ({
            ...particle,
            x: particle.x + particle.vx,
            y: particle.y + particle.vy,
            vy: particle.vy + 0.5, // Gravity
            life: particle.life - 0.02,
          }))
          .filter(particle => particle.life > 0)
      );

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [particles.length]);

  return { particles, createParticles };
};

/**
 * Hook for scroll progress tracking
 * Returns percentage of page scrolled
 */
export const useScrollProgress = () => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      const currentProgress = (window.scrollY / totalHeight) * 100;
      setProgress(Math.min(Math.max(currentProgress, 0), 100));
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Initial calculation

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return progress;
};

/**
 * Hook for page section tracking
 * Determines which section is currently in view
 */
export const useActiveSection = (sectionIds: string[]) => {
  const [activeSection, setActiveSection] = useState<string | null>(null);

  useEffect(() => {
    const observers = sectionIds.map(id => {
      const element = document.getElementById(id);
      if (!element) return null;

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setActiveSection(id);
          }
        },
        {
          threshold: 0.5,
          rootMargin: '-20% 0px -20% 0px',
        }
      );

      observer.observe(element);
      return observer;
    });

    return () => {
      observers.forEach(observer => observer?.disconnect());
    };
  }, [sectionIds]);

  return activeSection;
};

/**
 * Hook for device/viewport detection
 * Returns current device type and viewport dimensions
 */
export const useViewport = () => {
  const [viewport, setViewport] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0,
    isMobile: typeof window !== 'undefined' ? window.innerWidth < 768 : false,
    isTablet: typeof window !== 'undefined' ? window.innerWidth >= 768 && window.innerWidth < 1024 : false,
    isDesktop: typeof window !== 'undefined' ? window.innerWidth >= 1024 : false,
  });

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;

      setViewport({
        width,
        height,
        isMobile: width < 768,
        isTablet: width >= 768 && width < 1024,
        isDesktop: width >= 1024,
      });
    };

    window.addEventListener('resize', handleResize, { passive: true });
    handleResize(); // Initial calculation

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return viewport;
};

/**
 * Hook for Matrix rain effect data
 * Generates and updates falling code characters
 */
interface MatrixColumn {
  x: number;
  y: number;
  speed: number;
  chars: string[];
}

export const useMatrixRain = (columnCount: number = 20) => {
  const [columns, setColumns] = useState<MatrixColumn[]>([]);
  const prefersReducedMotion = useReducedMotion();
  const animationRef = useRef<number>();

  // Arabic numerals + Arabic letters for culturally relevant Matrix effect
  const chars = '0123456789ابجدهوزحطيكلمنسعفصقرشتثخذضظغ'.split('');

  useEffect(() => {
    if (prefersReducedMotion) return;

    // Initialize columns
    const initialColumns: MatrixColumn[] = Array.from({ length: columnCount }, (_, i) => ({
      x: (i / columnCount) * 100,
      y: Math.random() * -50,
      speed: Math.random() * 2 + 1,
      chars: Array.from({ length: 20 }, () => chars[Math.floor(Math.random() * chars.length)]),
    }));

    setColumns(initialColumns);

    const animate = () => {
      setColumns(prev =>
        prev.map(col => ({
          ...col,
          y: col.y + col.speed,
          // Reset when off screen
          ...(col.y > 100 && {
            y: -20,
            speed: Math.random() * 2 + 1,
            chars: Array.from({ length: 20 }, () => chars[Math.floor(Math.random() * chars.length)]),
          }),
        }))
      );

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [columnCount, prefersReducedMotion]);

  return columns;
};
