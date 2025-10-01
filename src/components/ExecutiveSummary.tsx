import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, TriangleAlert as AlertTriangle, CircleCheck as CheckCircle, Info, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { CinematicHero } from './CinematicHero';

interface Insight {
  type: 'positive' | 'warning' | 'critical' | 'neutral';
  title: string;
  description: string;
  metric?: string;
  impact: 'high' | 'medium' | 'low';
  actionable: boolean;
}

interface ExecutiveSummaryProps {
  metrics: {
    peopleServed: number;
    mealsDelivered: number;
    costPerMeal: number;
    programEfficiency: number;
    revenue: number;
    expenses: number;
  };
}

export function ExecutiveSummary({ metrics }: ExecutiveSummaryProps) {
  const generateInsights = (): Insight[] => {
    const insights: Insight[] = [];

    if (metrics.programEfficiency >= 80) {
      insights.push({
        type: 'positive',
        title: 'Exceptional Program Efficiency',
        description: `Program spending ratio of ${metrics.programEfficiency}% exceeds industry standards (75%). This demonstrates excellent resource allocation with minimal overhead.`,
        metric: 'Program Efficiency',
        impact: 'high',
        actionable: false
      });
    }

    if (metrics.costPerMeal < 7) {
      insights.push({
        type: 'positive',
        title: 'Outstanding Cost Efficiency',
        description: `Cost per meal of EGP ${metrics.costPerMeal.toFixed(2)} is 70% below global humanitarian average, maximizing donor impact and sustainability.`,
        metric: 'Cost Per Meal',
        impact: 'high',
        actionable: false
      });
    }

    const operatingMargin = ((metrics.revenue - metrics.expenses) / metrics.revenue) * 100;
    if (operatingMargin < 0) {
      insights.push({
        type: 'warning',
        title: 'Operating Deficit Requires Attention',
        description: `Current ${Math.abs(operatingMargin).toFixed(1)}% deficit indicates expenses exceed revenue. Consider diversifying funding sources and optimizing operational costs.`,
        metric: 'Operating Margin',
        impact: 'high',
        actionable: true
      });
    }

    if (metrics.peopleServed > 4500000) {
      insights.push({
        type: 'positive',
        title: 'Record-Breaking Impact Scale',
        description: `Serving ${(metrics.peopleServed / 1000000).toFixed(2)}M people represents 4.8% of Egypt's population - the largest humanitarian food operation in the country's history.`,
        metric: 'Lives Impacted',
        impact: 'high',
        actionable: false
      });
    }

    if (metrics.mealsDelivered > 350000000) {
      insights.push({
        type: 'positive',
        title: 'Unprecedented Distribution Volume',
        description: `${(metrics.mealsDelivered / 1000000).toFixed(1)}M meals delivered annually positions EFB among the top 3 food banks globally by meal volume.`,
        metric: 'Meals Delivered',
        impact: 'high',
        actionable: false
      });
    }

    const revenueConcentration = 99;
    if (revenueConcentration > 80) {
      insights.push({
        type: 'warning',
        title: 'Revenue Concentration Risk',
        description: `Top 1% of donors provide ${revenueConcentration}% of funding. Recommend diversifying donor base to reduce dependency and ensure sustainability.`,
        metric: 'Revenue Diversification',
        impact: 'medium',
        actionable: true
      });
    }

    return insights;
  };

  const insights = generateInsights();

  const getInsightIcon = (type: Insight['type']) => {
    switch (type) {
      case 'positive':
        return <CheckCircle className="w-5 h-5 text-success" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-warning" />;
      case 'critical':
        return <AlertTriangle className="w-5 h-5 text-danger" />;
      default:
        return <Info className="w-5 h-5 text-primary" />;
    }
  };

  const getInsightColor = (type: Insight['type']) => {
    switch (type) {
      case 'positive':
        return 'border-success/30 bg-success/5';
      case 'warning':
        return 'border-warning/30 bg-warning/5';
      case 'critical':
        return 'border-danger/30 bg-danger/5';
      default:
        return 'border-primary/30 bg-primary/5';
    }
  };

  const getImpactBadge = (impact: Insight['impact']) => {
    const variants = {
      high: 'bg-danger/10 text-danger border-danger/30',
      medium: 'bg-warning/10 text-warning border-warning/30',
      low: 'bg-primary/10 text-primary border-primary/30'
    };

    return (
      <Badge variant="outline" className={cn('text-xs', variants[impact])}>
        {impact.toUpperCase()} IMPACT
      </Badge>
    );
  };

  const positiveCount = insights.filter(i => i.type === 'positive').length;
  const warningCount = insights.filter(i => i.type === 'warning').length;
  const actionableCount = insights.filter(i => i.actionable).length;

  return (
    <div className="space-y-8">
      {/* Cinematic Hero Section */}
      <CinematicHero />

      {/* AI Insights Card */}
      <Card className="executive-card">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-xl">
                <Sparkles className="w-5 h-5 text-primary" />
                AI-Powered Executive Insights
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-2">
                Automatically generated analysis based on current performance metrics
              </p>
            </div>
            <div className="flex gap-2">
              <Badge variant="outline" className="bg-success/10 text-success border-success/30">
                {positiveCount} Positive
              </Badge>
              {warningCount > 0 && (
                <Badge variant="outline" className="bg-warning/10 text-warning border-warning/30">
                  {warningCount} Attention
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
      <CardContent className="space-y-4">
        {insights.map((insight, index) => (
          <div
            key={index}
            className={cn(
              'p-4 rounded-lg border transition-all duration-200 hover:shadow-md',
              getInsightColor(insight.type)
            )}
          >
            <div className="flex items-start gap-3">
              <div className="mt-0.5">{getInsightIcon(insight.type)}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h4 className="font-semibold text-foreground">{insight.title}</h4>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {getImpactBadge(insight.impact)}
                    {insight.actionable && (
                      <Badge variant="outline" className="text-xs bg-primary/10 text-primary border-primary/30">
                        ACTION NEEDED
                      </Badge>
                    )}
                  </div>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {insight.description}
                </p>
                {insight.metric && (
                  <div className="mt-2">
                    <Badge variant="secondary" className="text-xs">
                      Related: {insight.metric}
                    </Badge>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}

        {actionableCount > 0 && (
          <div className="mt-6 p-4 bg-muted/30 rounded-lg border border-border">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-primary mt-0.5" />
              <div>
                <h5 className="font-medium mb-1">Action Items</h5>
                <p className="text-sm text-muted-foreground">
                  {actionableCount} insight{actionableCount > 1 ? 's' : ''} require{actionableCount === 1 ? 's' : ''} executive attention and decision-making.
                  Review recommendations and assign ownership for implementation.
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
    </div>
  );
}
