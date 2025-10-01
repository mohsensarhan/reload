import React, { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import {
  useMatrixRain,
  useCountUp,
  useTypewriter,
  useGlitchEffect,
  useParticles,
  useReducedMotion,
} from '@/hooks/useMatrixEffects';

/**
 * Matrix Rain Background Effect
 * Displays falling code characters in background
 */
interface MatrixRainProps {
  className?: string;
  density?: 'light' | 'medium' | 'heavy';
  opacity?: number;
}

export const MatrixRain: React.FC<MatrixRainProps> = ({
  className,
  density = 'medium',
  opacity = 0.15,
}) => {
  const columnCount = density === 'light' ? 15 : density === 'medium' ? 25 : 40;
  const columns = useMatrixRain(columnCount);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    if (prefersReducedMotion || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const draw = () => {
      ctx.fillStyle = `rgba(0, 0, 0, ${opacity * 0.05})`;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = '#5FB85A';
      ctx.font = '14px monospace';

      columns.forEach(col => {
        const x = (col.x / 100) * canvas.width;
        const startY = (col.y / 100) * canvas.height;

        col.chars.forEach((char, i) => {
          const y = startY + i * 20;
          const alpha = Math.max(0, 1 - (i / col.chars.length));
          ctx.fillStyle = `rgba(95, 184, 90, ${alpha * opacity})`;
          ctx.fillText(char, x, y);
        });
      });
    };

    const intervalId = setInterval(draw, 50);

    return () => {
      clearInterval(intervalId);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [columns, opacity, prefersReducedMotion]);

  if (prefersReducedMotion) return null;

  return (
    <canvas
      ref={canvasRef}
      className={cn('absolute inset-0 pointer-events-none', className)}
      style={{ opacity }}
    />
  );
};

/**
 * Animated Counter with Matrix Style
 * Counts up to target value with glow effect
 */
interface MatrixCounterProps {
  value: number;
  prefix?: string;
  suffix?: string;
  duration?: number;
  className?: string;
  glowColor?: 'primary' | 'success' | 'warning' | 'danger';
}

export const MatrixCounter: React.FC<MatrixCounterProps> = ({
  value,
  prefix = '',
  suffix = '',
  duration = 2000,
  className,
  glowColor = 'primary',
}) => {
  const count = useCountUp(value, 0, duration);

  const glowClass = {
    primary: 'text-primary drop-shadow-[0_0_20px_hsl(var(--primary))]',
    success: 'text-success drop-shadow-[0_0_20px_hsl(var(--success))]',
    warning: 'text-warning drop-shadow-[0_0_20px_hsl(var(--warning))]',
    danger: 'text-danger drop-shadow-[0_0_20px_hsl(var(--danger))]',
  }[glowColor];

  return (
    <span className={cn('font-mono font-bold tabular-nums', glowClass, className)}>
      {prefix}
      {count.toLocaleString()}
      {suffix}
    </span>
  );
};

/**
 * Typewriter Text Effect
 * Types out text character by character
 */
interface TypewriterTextProps {
  text: string;
  speed?: number;
  className?: string;
  showCursor?: boolean;
  onComplete?: () => void;
}

export const TypewriterText: React.FC<TypewriterTextProps> = ({
  text,
  speed = 50,
  className,
  showCursor = true,
  onComplete,
}) => {
  const { displayedText, isComplete } = useTypewriter(text, speed);

  useEffect(() => {
    if (isComplete && onComplete) {
      onComplete();
    }
  }, [isComplete, onComplete]);

  return (
    <span className={cn('font-mono', className)}>
      {displayedText}
      {showCursor && !isComplete && (
        <span className="inline-block w-2 h-5 ml-1 bg-primary animate-pulse" />
      )}
    </span>
  );
};

/**
 * Glitch Text Effect
 * Applies RGB split glitch effect to text
 */
interface GlitchTextProps {
  children: React.ReactNode;
  className?: string;
  triggerOnHover?: boolean;
  autoTrigger?: boolean;
  triggerInterval?: number;
}

export const GlitchText: React.FC<GlitchTextProps> = ({
  children,
  className,
  triggerOnHover = false,
  autoTrigger = false,
  triggerInterval = 5000,
}) => {
  const { isGlitching, triggerGlitch } = useGlitchEffect();

  useEffect(() => {
    if (!autoTrigger) return;

    const interval = setInterval(triggerGlitch, triggerInterval);
    return () => clearInterval(interval);
  }, [autoTrigger, triggerInterval, triggerGlitch]);

  return (
    <span
      className={cn(
        'relative inline-block',
        isGlitching && 'matrix-glitch',
        className
      )}
      onMouseEnter={triggerOnHover ? triggerGlitch : undefined}
    >
      {children}
    </span>
  );
};

/**
 * Particle Explosion Effect
 * Creates particle burst animation
 */
interface ParticleExplosionProps {
  trigger: boolean;
  x?: number;
  y?: number;
  colors?: string[];
  count?: number;
}

export const ParticleExplosion: React.FC<ParticleExplosionProps> = ({
  trigger,
  x = 50,
  y = 50,
  colors = ['#5FB85A', '#39FF14', '#CCFF00'],
  count = 30,
}) => {
  const { particles, createParticles } = useParticles();

  useEffect(() => {
    if (trigger) {
      createParticles(x, y, count, colors);
    }
  }, [trigger, x, y, count, colors, createParticles]);

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {particles.map(particle => (
        <div
          key={particle.id}
          className="absolute rounded-full"
          style={{
            left: `${particle.x}px`,
            top: `${particle.y}px`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            backgroundColor: particle.color,
            opacity: particle.life,
            boxShadow: `0 0 ${particle.size * 2}px ${particle.color}`,
          }}
        />
      ))}
    </div>
  );
};

/**
 * Scanline Overlay Effect
 * Adds CRT monitor scanline effect
 */
interface ScanlineOverlayProps {
  className?: string;
  intensity?: 'light' | 'medium' | 'heavy';
}

export const ScanlineOverlay: React.FC<ScanlineOverlayProps> = ({
  className,
  intensity = 'light',
}) => {
  const prefersReducedMotion = useReducedMotion();

  if (prefersReducedMotion) return null;

  const opacityMap = {
    light: 0.02,
    medium: 0.04,
    heavy: 0.08,
  };

  return (
    <div className={cn('scanline-overlay', className)}>
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `repeating-linear-gradient(
            0deg,
            transparent,
            transparent 2px,
            rgba(95, 184, 90, ${opacityMap[intensity]}) 2px,
            rgba(95, 184, 90, ${opacityMap[intensity]}) 4px
          )`,
        }}
      />
    </div>
  );
};

/**
 * Pulsing Glow Effect
 * Adds pulsing glow animation to elements
 */
interface PulsingGlowProps {
  children: React.ReactNode;
  className?: string;
  color?: 'primary' | 'success' | 'warning' | 'danger';
  intensity?: 'low' | 'medium' | 'high';
}

export const PulsingGlow: React.FC<PulsingGlowProps> = ({
  children,
  className,
  color = 'primary',
  intensity = 'medium',
}) => {
  const prefersReducedMotion = useReducedMotion();

  const colorMap = {
    primary: 'hsl(var(--primary))',
    success: 'hsl(var(--success))',
    warning: 'hsl(var(--warning))',
    danger: 'hsl(var(--danger))',
  };

  const shadowMap = {
    low: '0 0 20px',
    medium: '0 0 40px',
    high: '0 0 60px',
  };

  return (
    <div
      className={cn('relative', className)}
      style={{
        animation: prefersReducedMotion ? 'none' : 'phosphor-glow-pulse 2s ease-in-out infinite',
        boxShadow: `${shadowMap[intensity]} ${colorMap[color]}`,
      }}
    >
      {children}
    </div>
  );
};

/**
 * Terminal Loading State
 * Shows Matrix-style loading animation
 */
interface TerminalLoaderProps {
  message?: string;
  className?: string;
}

export const TerminalLoader: React.FC<TerminalLoaderProps> = ({
  message = 'LOADING...',
  className,
}) => {
  return (
    <div className={cn('flex flex-col items-center justify-center p-8', className)}>
      <div className="font-mono text-success space-y-2">
        <TypewriterText text={message} speed={30} />
        <div className="flex gap-2 mt-4">
          {[0, 1, 2].map(i => (
            <div
              key={i}
              className="w-2 h-2 bg-primary rounded-full animate-pulse"
              style={{ animationDelay: `${i * 200}ms` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

/**
 * Matrix Card with enhanced effects
 * Card component with scanlines and glow
 */
interface MatrixCardProps {
  children: React.ReactNode;
  className?: string;
  glow?: boolean;
  scanlines?: boolean;
  hover?: boolean;
}

export const MatrixCard: React.FC<MatrixCardProps> = ({
  children,
  className,
  glow = false,
  scanlines = false,
  hover = true,
}) => {
  return (
    <div
      className={cn(
        'matrix-card',
        glow && 'matrix-glow',
        hover && 'transition-all duration-300 hover:scale-[1.02]',
        className
      )}
    >
      {scanlines && <ScanlineOverlay intensity="light" />}
      {children}
    </div>
  );
};

/**
 * Data Stream Effect
 * Animated data flowing across screen
 */
interface DataStreamProps {
  direction?: 'horizontal' | 'vertical';
  speed?: 'slow' | 'medium' | 'fast';
  className?: string;
}

export const DataStream: React.FC<DataStreamProps> = ({
  direction = 'horizontal',
  speed = 'medium',
  className,
}) => {
  const prefersReducedMotion = useReducedMotion();

  if (prefersReducedMotion) return null;

  const speedMap = {
    slow: '6s',
    medium: '3s',
    fast: '1.5s',
  };

  return (
    <div
      className={cn(
        'absolute pointer-events-none',
        direction === 'horizontal' ? 'left-0 right-0 h-px' : 'top-0 bottom-0 w-px',
        className
      )}
      style={{
        background: `linear-gradient(${
          direction === 'horizontal' ? '90deg' : '0deg'
        }, transparent, hsl(var(--neon-green)), transparent)`,
        animation: `data-stream ${speedMap[speed]} linear infinite`,
      }}
    />
  );
};
