import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, TrendingDown, Shield, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useInView, useReducedMotion } from '@/hooks/useMatrixEffects';
import { GlitchText, PulsingGlow } from './MatrixEffects';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface RiskThermometerProps {
  concentrationPercent: number;
  className?: string;
  title?: string;
  description?: string;
  recommendations?: string[];
}

type RiskLevel = 'safe' | 'moderate' | 'high' | 'critical';

export const RiskThermometer: React.FC<RiskThermometerProps> = ({
  concentrationPercent,
  className,
  title = 'Donor Concentration Risk',
  description = 'Revenue dependency on top 1% of donors',
  recommendations = [
    'Launch mass donor acquisition campaign',
    'Implement monthly giving program',
    'Diversify into corporate partnerships',
  ],
}) => {
  const [animatedPercent, setAnimatedPercent] = useState(0);
  const [showBubbles, setShowBubbles] = useState(false);
  const { ref, isInView } = useInView({ threshold: 0.5 });
  const prefersReducedMotion = useReducedMotion();

  // Determine risk level
  const getRiskLevel = (percent: number): RiskLevel => {
    if (percent >= 90) return 'critical';
    if (percent >= 75) return 'high';
    if (percent >= 60) return 'moderate';
    return 'safe';
  };

  const riskLevel = getRiskLevel(concentrationPercent);

  // Animate mercury rise
  useEffect(() => {
    if (!isInView) return;

    if (prefersReducedMotion) {
      setAnimatedPercent(concentrationPercent);
      return;
    }

    let start = 0;
    const duration = 2000;
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Ease-out-cubic for natural deceleration
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      const currentPercent = start + (concentrationPercent - start) * easeProgress;

      setAnimatedPercent(currentPercent);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setShowBubbles(true);
      }
    };

    requestAnimationFrame(animate);
  }, [isInView, concentrationPercent, prefersReducedMotion]);

  // Color configurations
  const getRiskColors = (level: RiskLevel) => {
    switch (level) {
      case 'critical':
        return {
          bg: 'from-danger to-danger-glow',
          border: 'border-danger',
          text: 'text-danger',
          shadow: 'shadow-glow-danger',
          badge: 'bg-danger/10 text-danger border-danger/30',
        };
      case 'high':
        return {
          bg: 'from-warning to-warning-glow',
          border: 'border-warning',
          text: 'text-warning',
          shadow: 'shadow-glow-warning',
          badge: 'bg-warning/10 text-warning border-warning/30',
        };
      case 'moderate':
        return {
          bg: 'from-primary to-primary-glow',
          border: 'border-primary',
          text: 'text-primary',
          shadow: 'shadow-glow-primary',
          badge: 'bg-primary/10 text-primary border-primary/30',
        };
      case 'safe':
        return {
          bg: 'from-success to-success-glow',
          border: 'border-success',
          text: 'text-success',
          shadow: 'shadow-glow-success',
          badge: 'bg-success/10 text-success border-success/30',
        };
    }
  };

  const colors = getRiskColors(riskLevel);

  return (
    <Card ref={ref as any} className={cn('matrix-card', className)}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={cn('p-2 rounded-lg', colors.badge)}>
              <AlertTriangle className={cn('w-5 h-5', colors.text)} />
            </div>
            <div>
              <CardTitle className="text-lg">
                <GlitchText triggerOnHover>{title}</GlitchText>
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">{description}</p>
            </div>
          </div>
          <Tooltip>
            <TooltipTrigger asChild>
              <button className="p-1 hover:bg-muted rounded-md transition-colors">
                <Info className="w-4 h-4 text-muted-foreground" />
              </button>
            </TooltipTrigger>
            <TooltipContent className="max-w-xs p-4">
              <div className="space-y-2 text-xs">
                <p className="font-medium">Risk Assessment Scale:</p>
                <ul className="space-y-1">
                  <li>• Safe: {'<'}60% concentration</li>
                  <li>• Moderate: 60-74% concentration</li>
                  <li>• High: 75-89% concentration</li>
                  <li>• Critical: 90%+ concentration</li>
                </ul>
              </div>
            </TooltipContent>
          </Tooltip>
        </div>
      </CardHeader>

      <CardContent>
        <div className="flex flex-col md:flex-row items-center gap-8">
          {/* Thermometer Visualization */}
          <div className="relative w-full md:w-48 flex flex-col items-center">
            {/* Risk status badge */}
            <Badge className={cn('mb-4 uppercase tracking-wider font-bold', colors.badge)}>
              {riskLevel === 'critical' && (
                <span className="flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  Critical Risk
                </span>
              )}
              {riskLevel === 'high' && 'High Risk'}
              {riskLevel === 'moderate' && 'Moderate Risk'}
              {riskLevel === 'safe' && (
                <span className="flex items-center gap-1">
                  <Shield className="w-3 h-3" />
                  Safe Level
                </span>
              )}
            </Badge>

            {/* Thermometer tube */}
            <div className="relative w-20 h-64">
              {/* Background tube */}
              <div className="absolute left-1/2 -translate-x-1/2 w-12 h-52 bg-black border-2 border-muted rounded-t-full overflow-hidden">
                {/* Percentage markers */}
                <div className="absolute inset-y-0 -right-12 flex flex-col justify-between py-2 text-xs text-muted-foreground">
                  {[100, 75, 50, 25, 0].map((mark) => (
                    <div key={mark} className="flex items-center gap-2">
                      <div className="w-2 h-px bg-muted" />
                      <span className="tabular-nums">{mark}%</span>
                    </div>
                  ))}
                </div>

                {/* Animated mercury fill */}
                <div
                  className={cn(
                    'absolute bottom-0 left-0 right-0 transition-all duration-500',
                    'bg-gradient-to-t',
                    colors.bg,
                    riskLevel === 'critical' && !prefersReducedMotion && 'animate-pulse'
                  )}
                  style={{
                    height: `${(animatedPercent / 100) * 100}%`,
                    boxShadow:
                      riskLevel === 'critical'
                        ? `0 -20px 40px hsl(var(--danger) / 0.8)`
                        : `0 -10px 20px ${
                            riskLevel === 'high'
                              ? 'hsl(var(--warning) / 0.6)'
                              : 'hsl(var(--primary) / 0.4)'
                          }`,
                  }}
                >
                  {/* Floating bubbles */}
                  {showBubbles && !prefersReducedMotion && (
                    <div className="absolute inset-0 overflow-hidden">
                      {[...Array(5)].map((_, i) => (
                        <div
                          key={i}
                          className="absolute w-2 h-2 bg-white/30 rounded-full"
                          style={{
                            left: `${20 + i * 15}%`,
                            animation: `bubble-rise ${3 + i}s infinite ease-in ${i * 0.5}s`,
                          }}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Thermometer bulb */}
              <div
                className={cn(
                  'absolute bottom-0 left-1/2 -translate-x-1/2 w-16 h-16 rounded-full border-2',
                  colors.border,
                  'bg-gradient-to-br',
                  colors.bg,
                  riskLevel === 'critical' && !prefersReducedMotion && 'animate-pulse',
                  colors.shadow
                )}
              >
                <div className="absolute inset-2 rounded-full bg-black flex items-center justify-center">
                  <span className={cn('text-xl font-bold tabular-nums', colors.text)}>
                    {Math.round(animatedPercent)}%
                  </span>
                </div>
              </div>
            </div>

            {/* Risk level label */}
            <div className="mt-4 text-center">
              <div className={cn('text-sm font-bold uppercase tracking-wider', colors.text)}>
                {riskLevel} Level
              </div>
            </div>
          </div>

          {/* Analysis and Recommendations */}
          <div className="flex-1 space-y-4">
            {/* Current state */}
            <div className="space-y-2">
              <h4 className="font-semibold flex items-center gap-2">
                <TrendingDown className="w-4 h-4 text-warning" />
                Current Situation
              </h4>
              <p className="text-sm text-muted-foreground">
                Top 1% of donors provide{' '}
                <span className={cn('font-bold', colors.text)}>{concentrationPercent}%</span> of
                total funding. This creates{' '}
                {riskLevel === 'critical' && 'existential risk'}
                {riskLevel === 'high' && 'significant vulnerability'}
                {riskLevel === 'moderate' && 'moderate dependency'}
                {riskLevel === 'safe' && 'acceptable diversification'}{' '}
                in organizational sustainability.
              </p>
            </div>

            {/* Benchmark comparison */}
            <div className="space-y-2">
              <h4 className="font-semibold text-sm">Industry Benchmarks</h4>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Sustainable Model:</span>
                  <span className="text-success">&lt;60%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">High-Risk Threshold:</span>
                  <span className="text-warning">80%+</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">EFB Target (2027):</span>
                  <span className="text-primary">70%</span>
                </div>
              </div>
            </div>

            {/* Recommendations */}
            {recommendations.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-semibold text-sm flex items-center gap-2">
                  <Shield className="w-4 h-4 text-primary" />
                  Strategic Recommendations
                </h4>
                <ul className="space-y-1 text-xs">
                  {recommendations.map((rec, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-primary mt-0.5">•</span>
                      <span className="text-muted-foreground">{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* CTA */}
            {riskLevel === 'critical' && (
              <div className="mt-4 p-3 bg-danger/10 border border-danger/30 rounded-lg">
                <p className="text-xs text-danger font-medium">
                  ⚠️ Urgent Action Required: Immediate diversification strategy needed to ensure
                  organizational resilience
                </p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default RiskThermometer;
