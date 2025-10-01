import React, { ReactNode, useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Video as LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export type NarrativeAct = 'crisis' | 'response' | 'impact' | 'machine' | 'future';

interface NarrativeSectionProps {
  act: NarrativeAct;
  actNumber: number;
  title: string;
  subtitle: string;
  description?: string;
  icon: LucideIcon;
  children: ReactNode;
  className?: string;
}

const actConfig: Record<NarrativeAct, {
  color: string;
  bgGradient: string;
  borderColor: string;
  badgeVariant: string;
}> = {
  crisis: {
    color: 'text-danger',
    bgGradient: 'from-danger/5 to-background',
    borderColor: 'border-danger/30',
    badgeVariant: 'destructive',
  },
  response: {
    color: 'text-warning',
    bgGradient: 'from-warning/5 to-background',
    borderColor: 'border-warning/30',
    badgeVariant: 'secondary',
  },
  impact: {
    color: 'text-success',
    bgGradient: 'from-success/5 to-background',
    borderColor: 'border-success/30',
    badgeVariant: 'default',
  },
  machine: {
    color: 'text-primary',
    bgGradient: 'from-primary/5 to-background',
    borderColor: 'border-primary/30',
    badgeVariant: 'outline',
  },
  future: {
    color: 'text-success',
    bgGradient: 'from-success/10 to-background',
    borderColor: 'border-success/40',
    badgeVariant: 'outline',
  },
};

export function NarrativeSection({
  act,
  actNumber,
  title,
  subtitle,
  description,
  icon: Icon,
  children,
  className,
}: NarrativeSectionProps) {
  const config = actConfig[act];
  const sectionRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: '-100px 0px',
      }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      className={cn(
        'relative space-y-6 py-8 transition-all duration-1000',
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8',
        className
      )}
      data-narrative-act={act}
      role="region"
      aria-labelledby={`act-${actNumber}-title`}
    >
      <Card className={cn(
        'executive-card border-2 bg-gradient-to-br',
        config.bgGradient,
        config.borderColor,
        'scanline-overlay'
      )}>
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-3">
                <Badge
                  variant={config.badgeVariant as any}
                  className="text-xs font-mono uppercase tracking-wider matrix-glow"
                  aria-label={`Act ${actNumber}`}
                >
                  Act {actNumber}
                </Badge>
                <div className={cn('flex items-center gap-2', config.color)}>
                  <Icon className="w-6 h-6" aria-hidden="true" />
                  <CardTitle
                    id={`act-${actNumber}-title`}
                    className="text-2xl font-bold tracking-tight"
                  >
                    {title}
                  </CardTitle>
                </div>
              </div>
              <CardDescription className="text-base font-medium">
                {subtitle}
              </CardDescription>
              {description && (
                <p className="text-sm text-muted-foreground leading-relaxed pt-2">
                  {description}
                </p>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="space-y-6">
        {children}
      </div>
    </section>
  );
}

interface NarrativeMetricProps {
  title: string;
  value: string | number;
  description: string;
  trend?: {
    value: number;
    label: string;
    direction: 'up' | 'down' | 'neutral';
  };
  icon?: LucideIcon;
  className?: string;
}

export function NarrativeMetric({
  title,
  value,
  description,
  trend,
  icon: Icon,
  className,
}: NarrativeMetricProps) {
  const metricRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
          }
        });
      },
      {
        threshold: 0.2,
      }
    );

    if (metricRef.current) {
      observer.observe(metricRef.current);
    }

    return () => {
      if (metricRef.current) {
        observer.unobserve(metricRef.current);
      }
    };
  }, []);

  return (
    <Card
      ref={metricRef}
      className={cn(
        'executive-card-hover transition-all duration-700',
        isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95',
        className
      )}
      role="article"
      aria-label={`${title}: ${value}`}
    >
      <CardContent className="p-6 space-y-4">
        <div className="flex items-start justify-between">
          <div className="flex-1 space-y-1">
            <h4 className="font-medium text-muted-foreground text-sm uppercase tracking-wide">
              {title}
            </h4>
            <div className="text-3xl font-bold metric-hero">
              {value}
            </div>
          </div>
          {Icon && (
            <div
              className="flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10 matrix-glow"
              aria-hidden="true"
            >
              <Icon className="w-6 h-6 text-primary" />
            </div>
          )}
        </div>

        <p className="text-sm text-muted-foreground leading-relaxed">
          {description}
        </p>

        {trend && (
          <div className="flex items-center gap-2 pt-2 border-t border-border">
            <Badge
              variant={trend.direction === 'up' ? 'default' : trend.direction === 'down' ? 'destructive' : 'secondary'}
              className="text-xs"
              aria-label={`Trend: ${trend.direction === 'up' ? 'increasing' : trend.direction === 'down' ? 'decreasing' : 'stable'} by ${Math.abs(trend.value)}%`}
            >
              {trend.direction === 'up' ? '↑' : trend.direction === 'down' ? '↓' : '→'} {Math.abs(trend.value)}%
            </Badge>
            <span className="text-xs text-muted-foreground">{trend.label}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
