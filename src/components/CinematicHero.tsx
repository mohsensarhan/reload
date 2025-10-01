import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Activity, TrendingUp, Users, Target } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatNumber } from '@/lib/formatters';

interface HeroMetric {
  label: string;
  value: number;
  unit?: string;
  change?: number;
  icon: React.ReactNode;
  color: 'primary' | 'success' | 'warning' | 'danger';
}

interface CinematicHeroProps {
  className?: string;
}

export function CinematicHero({ className }: CinematicHeroProps) {
  const [animatedValues, setAnimatedValues] = useState({
    lives: 0,
    meals: 0,
    cost: 0,
    coverage: 0,
  });

  const metrics: HeroMetric[] = [
    {
      label: 'Lives Impacted',
      value: 4960000,
      unit: 'people',
      change: 43,
      icon: <Users className="w-6 h-6" />,
      color: 'primary'
    },
    {
      label: 'Meals Delivered',
      value: 367500000,
      unit: 'meals',
      change: 40,
      icon: <Target className="w-6 h-6" />,
      color: 'success'
    },
    {
      label: 'Cost Per Meal',
      value: 6.36,
      unit: 'EGP',
      change: -8,
      icon: <TrendingUp className="w-6 h-6" />,
      color: 'warning'
    },
    {
      label: 'National Coverage',
      value: 27,
      unit: '/ 27 Governorates',
      change: 0,
      icon: <Activity className="w-6 h-6" />,
      color: 'success'
    },
  ];

  // Animate numbers on mount
  useEffect(() => {
    const duration = 2000;
    const steps = 60;
    const interval = duration / steps;

    let currentStep = 0;
    const timer = setInterval(() => {
      currentStep++;
      const progress = currentStep / steps;
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);

      setAnimatedValues({
        lives: Math.floor(4960000 * easeOutQuart),
        meals: Math.floor(367500000 * easeOutQuart),
        cost: Number((6.36 * easeOutQuart).toFixed(2)),
        coverage: Math.floor(27 * easeOutQuart),
      });

      if (currentStep >= steps) {
        clearInterval(timer);
      }
    }, interval);

    return () => clearInterval(timer);
  }, []);

  const getColorClasses = (color: string) => {
    switch (color) {
      case 'primary':
        return 'bg-primary/10 text-primary border-primary/30';
      case 'success':
        return 'bg-success/10 text-success border-success/30';
      case 'warning':
        return 'bg-warning/10 text-warning border-warning/30';
      case 'danger':
        return 'bg-danger/10 text-danger border-danger/30';
      default:
        return 'bg-primary/10 text-primary border-primary/30';
    }
  };

  const getGlowColor = (color: string) => {
    switch (color) {
      case 'primary':
        return 'shadow-glow-primary';
      case 'success':
        return 'shadow-glow-success';
      case 'warning':
        return 'shadow-glow-warning';
      case 'danger':
        return 'shadow-glow-danger';
      default:
        return 'shadow-glow-primary';
    }
  };

  return (
    <div className={cn("relative overflow-hidden", className)}>
      {/* Ambient background glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-success/5 pointer-events-none" />

      {/* Hero Header */}
      <div className="relative z-10 mb-8 animate-fade-in-up">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-primary/10 border border-primary/20">
              <Activity className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
                Live Operations Status
              </h1>
              <p className="text-muted-foreground mt-1 text-lg">
                Real-time performance metrics across all operations
              </p>
            </div>
          </div>

          <Badge className="badge-live animate-scale-in">
            <div className="live-indicator" />
            Real-time • Updated 2s ago
          </Badge>
        </div>
      </div>

      {/* Hero Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 relative z-10">
        {metrics.map((metric, index) => (
          <Card
            key={metric.label}
            className={cn(
              "metric-card group animate-fade-in-up border-2",
              getColorClasses(metric.color),
              `animate-stagger-${index + 1}`
            )}
          >
            <div className="flex items-start justify-between mb-4">
              <div className={cn(
                "p-3 rounded-lg transition-all duration-300 group-hover:scale-110",
                getColorClasses(metric.color)
              )}>
                {metric.icon}
              </div>

              {metric.change !== 0 && (
                <Badge variant="outline" className={cn(
                  "text-xs",
                  metric.change > 0
                    ? "text-success border-success"
                    : metric.change < 0
                    ? "text-warning border-warning"
                    : "text-muted-foreground border-border"
                )}>
                  {metric.change > 0 && '+'}
                  {metric.change}% YoY
                </Badge>
              )}
            </div>

            <div className="space-y-2">
              <div className={cn(
                "text-3xl md:text-4xl font-bold tabular-nums tracking-tight transition-all duration-300",
                `text-${metric.color}`
              )}>
                {metric.label === 'Lives Impacted' && formatNumber(animatedValues.lives)}
                {metric.label === 'Meals Delivered' && formatNumber(animatedValues.meals)}
                {metric.label === 'Cost Per Meal' && `EGP ${animatedValues.cost}`}
                {metric.label === 'National Coverage' && animatedValues.coverage}
                {metric.unit && metric.label !== 'Cost Per Meal' && (
                  <span className="text-base ml-1 text-muted-foreground font-normal">
                    {metric.unit}
                  </span>
                )}
              </div>

              <div className="text-sm text-muted-foreground font-medium">
                {metric.label}
              </div>

              {/* Mini sparkline visualization */}
              <div className="h-1 w-full bg-muted rounded-full overflow-hidden">
                <div
                  className={cn(
                    "h-full rounded-full transition-all duration-1000 ease-out",
                    metric.color === 'primary' && "bg-primary",
                    metric.color === 'success' && "bg-success",
                    metric.color === 'warning' && "bg-warning",
                    metric.color === 'danger' && "bg-danger"
                  )}
                  style={{
                    width: metric.label === 'National Coverage' ? '100%' : '85%',
                    boxShadow: `0 0 12px hsl(var(--${metric.color}) / 0.5)`
                  }}
                />
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Bottom Context Banner */}
      <Card className="mt-8 bg-gradient-to-r from-card via-card-elevated to-card border border-border-bright/50 overflow-hidden animate-fade-in-up animate-stagger-4">
        <div className="p-6 relative">
          {/* Glow effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-success/5 pointer-events-none" />

          <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-6 text-center md:text-left">
            <div>
              <div className="text-sm text-muted-foreground mb-1">Current fiscal year performance</div>
              <div className="text-2xl font-bold text-primary">FY2024 Q4</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground mb-1">System health status</div>
              <div className="text-2xl font-bold text-success flex items-center justify-center md:justify-start gap-2">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-success"></span>
                </span>
                All Systems Operational
              </div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground mb-1">Data freshness</div>
              <div className="text-2xl font-bold text-warning">Live • 2s latency</div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

export default CinematicHero;
