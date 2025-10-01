import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, DollarSign, Users, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useInView, useCountUp, useReducedMotion } from '@/hooks/useMatrixEffects';
import { MatrixCounter, GlitchText, DataStream } from './MatrixEffects';
import { formatCurrency } from '@/lib/formatters';

interface MultiplierStage {
  label: string;
  value: number;
  multiplier: number;
  color: string;
  icon: React.ReactNode;
  description: string;
}

interface MultiplierEffectProps {
  initialAmount?: number;
  fundraisingROI?: number;
  programRatio?: number;
  costPerMeal?: number;
  className?: string;
}

export const MultiplierEffect: React.FC<MultiplierEffectProps> = ({
  initialAmount = 1,
  fundraisingROI = 7.6,
  programRatio = 0.83,
  costPerMeal = 6.36,
  className,
}) => {
  const [activeStage, setActiveStage] = useState(0);
  const { ref, isInView, hasBeenInView } = useInView({ threshold: 0.3 });
  const prefersReducedMotion = useReducedMotion();

  // Calculate stages
  const stages: MultiplierStage[] = [
    {
      label: 'Initial Donation',
      value: initialAmount,
      multiplier: 1,
      color: 'text-neutral',
      icon: <DollarSign className="w-5 h-5" />,
      description: 'Your generous contribution',
    },
    {
      label: 'After Fundraising Efficiency',
      value: initialAmount * fundraisingROI,
      multiplier: fundraisingROI,
      color: 'text-primary',
      icon: <TrendingUp className="w-5 h-5" />,
      description: `${fundraisingROI}:1 fundraising ROI multiplies your impact`,
    },
    {
      label: 'Direct to Programs',
      value: initialAmount * fundraisingROI * programRatio,
      multiplier: fundraisingROI * programRatio,
      color: 'text-success',
      icon: <Zap className="w-5 h-5" />,
      description: `${(programRatio * 100).toFixed(0)}% goes directly to beneficiaries`,
    },
    {
      label: 'People Fed',
      value: (initialAmount * fundraisingROI * programRatio) / costPerMeal,
      multiplier: (fundraisingROI * programRatio) / costPerMeal,
      color: 'text-warning',
      icon: <Users className="w-5 h-5" />,
      description: `At EGP ${costPerMeal.toFixed(2)} per meal`,
    },
  ];

  // Auto-advance through stages
  useEffect(() => {
    if (!isInView || prefersReducedMotion) return;

    const interval = setInterval(() => {
      setActiveStage((prev) => (prev + 1) % stages.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [isInView, stages.length, prefersReducedMotion]);

  const finalImpact = stages[stages.length - 1];

  return (
    <Card ref={ref as any} className={cn('matrix-card overflow-hidden', className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-success/10 rounded-lg">
              <Zap className="w-6 h-6 text-success" />
            </div>
            <div>
              <CardTitle className="text-xl">
                <GlitchText>The Multiplier Effect</GlitchText>
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                How EGP {initialAmount} becomes {finalImpact.value.toFixed(1)} meals
              </p>
            </div>
          </div>
          <Badge className="bg-success/10 text-success border-success/30">
            {finalImpact.multiplier.toFixed(1)}x Impact
          </Badge>
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-6">
          {/* Visual Flow Diagram */}
          <div className="relative">
            {/* Connecting lines */}
            <div className="absolute left-8 top-16 bottom-16 w-px bg-gradient-to-b from-primary via-success to-warning" />

            {/* Stages */}
            <div className="space-y-6">
              {stages.map((stage, index) => {
                const isActive = index === activeStage;
                const isPast = index < activeStage;
                const isLast = index === stages.length - 1;

                return (
                  <div
                    key={stage.label}
                    className={cn(
                      'relative pl-20 transition-all duration-500',
                      isActive && 'scale-105',
                      !isActive && 'opacity-60'
                    )}
                  >
                    {/* Node */}
                    <div
                      className={cn(
                        'absolute left-0 w-16 h-16 rounded-full border-4 flex items-center justify-center transition-all duration-500',
                        isActive && 'border-primary bg-primary/20 shadow-glow-primary scale-110',
                        isPast && 'border-success bg-success/20',
                        !isActive && !isPast && 'border-muted bg-muted/10',
                        !prefersReducedMotion && isActive && 'animate-pulse'
                      )}
                    >
                      <div className={cn('transition-colors duration-300', stage.color)}>
                        {stage.icon}
                      </div>
                    </div>

                    {/* Data stream effect */}
                    {!prefersReducedMotion && isActive && (
                      <div className="absolute left-8 top-0 bottom-0">
                        <DataStream direction="vertical" speed="fast" />
                      </div>
                    )}

                    {/* Content */}
                    <div className="bg-card/50 border border-border rounded-lg p-4 hover:bg-card/80 transition-colors">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <h4 className="font-semibold text-sm mb-1">{stage.label}</h4>
                          <p className="text-xs text-muted-foreground">{stage.description}</p>
                        </div>
                        <div className="text-right">
                          {isLast ? (
                            <div>
                              <div className="text-2xl font-bold text-warning">
                                {isInView && hasBeenInView ? (
                                  <MatrixCounter
                                    value={stage.value}
                                    duration={2000}
                                    glowColor="warning"
                                  />
                                ) : (
                                  stage.value.toFixed(1)
                                )}
                              </div>
                              <div className="text-xs text-muted-foreground">meals</div>
                            </div>
                          ) : (
                            <div>
                              <div className={cn('text-2xl font-bold', stage.color)}>
                                {formatCurrency(stage.value)}
                              </div>
                              {index > 0 && (
                                <div className="text-xs text-success flex items-center gap-1 justify-end">
                                  <TrendingUp className="w-3 h-3" />
                                  {stage.multiplier.toFixed(1)}x
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Summary Impact Cards */}
          <div className="grid grid-cols-2 gap-4 pt-6 border-t border-border">
            <div className="text-center p-4 bg-primary/10 rounded-lg border border-primary/20">
              <div className="text-3xl font-bold text-primary">
                {isInView ? (
                  <MatrixCounter value={fundraisingROI} suffix=":1" glowColor="primary" />
                ) : (
                  `${fundraisingROI}:1`
                )}
              </div>
              <div className="text-xs text-muted-foreground mt-1">Fundraising ROI</div>
            </div>

            <div className="text-center p-4 bg-success/10 rounded-lg border border-success/20">
              <div className="text-3xl font-bold text-success">
                {isInView ? (
                  <MatrixCounter
                    value={programRatio * 100}
                    suffix="%"
                    glowColor="success"
                  />
                ) : (
                  `${(programRatio * 100).toFixed(0)}%`
                )}
              </div>
              <div className="text-xs text-muted-foreground mt-1">To Programs</div>
            </div>
          </div>

          {/* Key Insight */}
          <div className="p-4 bg-gradient-to-r from-warning/10 to-warning/5 border border-warning/30 rounded-lg">
            <div className="flex items-start gap-3">
              <Zap className="w-5 h-5 text-warning mt-0.5" />
              <div>
                <h5 className="font-semibold text-sm text-warning mb-1">Exceptional Efficiency</h5>
                <p className="text-xs text-muted-foreground">
                  Through operational excellence and digital transformation, every EGP 1 donated
                  feeds {finalImpact.multiplier.toFixed(1)} people. This is{' '}
                  <span className="text-warning font-semibold">
                    3-5x better than global averages
                  </span>
                  , maximizing your humanitarian impact.
                </p>
              </div>
            </div>
          </div>

          {/* Stage indicators */}
          <div className="flex justify-center gap-2">
            {stages.map((_, index) => (
              <button
                key={index}
                onClick={() => setActiveStage(index)}
                className={cn(
                  'w-2 h-2 rounded-full transition-all duration-300',
                  index === activeStage
                    ? 'bg-primary w-8'
                    : 'bg-muted hover:bg-primary/50'
                )}
                aria-label={`Go to stage ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MultiplierEffect;
