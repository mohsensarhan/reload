import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  TrendingUp,
  TrendingDown,
  Activity,
  AlertTriangle,
  Globe,
  DollarSign,
  Droplets,
  Users,
  ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useGlobalSignals } from '@/hooks/useGlobalSignals';
import { FORCE_MOCK, DATA_SOURCE } from '@/config/dataMode';

const last = <T,>(arr: T[]) => (Array.isArray(arr) && arr.length ? arr[arr.length - 1] : undefined);
const prev = <T,>(arr: T[]) => (Array.isArray(arr) && arr.length > 1 ? arr[arr.length - 2] : undefined);

const getDataStatus = (source: keyof typeof DATA_SOURCE, isLoading: boolean, isError: boolean): 'live' | 'mock' | 'disconnected' => {
  if (isError) return 'disconnected';
  return DATA_SOURCE[source] === 'live' ? 'live' : 'mock';
};

interface PressureMetric {
  id: string;
  title: string;
  value: number;
  unit: string;
  change: number;
  changeLabel: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  icon: React.ReactNode;
  description: string;
  dataStatus: 'live' | 'mock' | 'disconnected';
  impact: string;
}

export function TheLandscape() {
  const s = useGlobalSignals();
  const [selectedMetric, setSelectedMetric] = useState<string | null>(null);

  const globalMetrics: PressureMetric[] = [
    {
      id: 'ffpi',
      title: 'FAO Food Price Index',
      value: Number((last(s.ffpi) as any)?.value) || 0,
      unit: 'index',
      change: (() => {
        const curr = last(s.ffpi) as any;
        const prevVal = prev(s.ffpi) as any;
        if (!curr || !prevVal) return 0;
        return ((curr.value - prevVal.value) / prevVal.value) * 100;
      })(),
      changeLabel: 'MoM',
      severity: 'high',
      icon: <Globe className="w-5 h-5" />,
      description: 'Global food commodity prices affecting import costs',
      dataStatus: getDataStatus('ffpi', s.isLoading, s.isError),
      impact: 'Direct impact on procurement costs and meal pricing'
    },
    {
      id: 'fx',
      title: 'USD/EGP Exchange Rate',
      value: Number((last(s.fx) as any)?.value) || 0,
      unit: 'EGP',
      change: (() => {
        const curr = last(s.fx) as any;
        const prevVal = prev(s.fx) as any;
        if (!curr || !prevVal) return 0;
        return ((curr.value - prevVal.value) / prevVal.value) * 100;
      })(),
      changeLabel: 'MoM',
      severity: 'critical',
      icon: <DollarSign className="w-5 h-5" />,
      description: 'Currency weakness increasing import costs by 15-30%',
      dataStatus: getDataStatus('fx', s.isLoading, s.isError),
      impact: 'Higher costs for imported food commodities'
    },
    {
      id: 'inflation',
      title: 'Egypt CPI Inflation',
      value: Number((last(s.cbeInflation) as any)?.value) || 0,
      unit: '%',
      change: (() => {
        const curr = last(s.cbeInflation) as any;
        const prevVal = prev(s.cbeInflation) as any;
        if (!curr || !prevVal) return 0;
        return curr.value - prevVal.value;
      })(),
      changeLabel: 'pp change',
      severity: 'high',
      icon: <TrendingUp className="w-5 h-5" />,
      description: 'Overall price pressure on operations and beneficiaries',
      dataStatus: getDataStatus('cbe', s.isLoading, s.isError),
      impact: 'Increased operational costs and beneficiary needs'
    },
    {
      id: 'refugees',
      title: 'Refugees in Egypt',
      value: Number((last(s.refugees as any[]))?.value) || 0,
      unit: 'people',
      change: (() => {
        const curr = last(s.refugees as any[]);
        const prevVal = prev(s.refugees as any[]);
        if (!curr || !prevVal) return 0;
        return ((curr.value - prevVal.value) / prevVal.value) * 100;
      })(),
      changeLabel: 'YoY',
      severity: 'medium',
      icon: <Users className="w-5 h-5" />,
      description: 'Growing humanitarian need from regional displacement',
      dataStatus: getDataStatus('unhcr', s.isLoading, s.isError),
      impact: 'Expanding target population requiring assistance'
    }
  ];

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'danger';
      case 'high': return 'warning';
      case 'medium': return 'warning';
      case 'low': return 'success';
      default: return 'warning';
    }
  };

  const getSeverityProgress = (severity: string) => {
    switch (severity) {
      case 'critical': return 95;
      case 'high': return 75;
      case 'medium': return 50;
      case 'low': return 25;
      default: return 50;
    }
  };

  const formatValue = (value: number, unit: string) => {
    if (unit === 'people') {
      return (value / 1000).toFixed(0) + 'K';
    }
    return value.toFixed(1);
  };

  return (
    <div className="space-y-6">
      {FORCE_MOCK && (
        <Card className="executive-card p-3 text-xs text-muted-foreground border-warning/30">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-warning" />
            <span>Mock mode active. Real-time data available after API deployment.</span>
          </div>
        </Card>
      )}

      {/* Section Header */}
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-success/15 border border-success/30 shadow-glow-success">
            <Globe className="w-7 h-7 text-success" />
          </div>
          <div>
            <h2 className="text-3xl font-bold">
              <span className="bg-gradient-to-r from-success-glow via-success to-success bg-clip-text text-transparent">
                The Landscape
              </span>
            </h2>
            <p className="text-muted-foreground text-lg mt-1">
              Global & Egypt macro intelligence driving operational context
            </p>
          </div>
        </div>
      </div>

      {/* Pressure Indices Grid */}
      <Card className="executive-card border-success/20">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-semibold text-foreground mb-1">Pressure Indices</h3>
              <p className="text-sm text-muted-foreground">
                Real-time monitoring of key economic and humanitarian indicators
              </p>
            </div>
            <Badge className="badge-live">
              <div className="live-indicator" />
              Live Feed
            </Badge>
          </div>

          <div className="space-y-4">
            {globalMetrics.map((metric, index) => (
              <div
                key={metric.id}
                className={cn(
                  "group relative p-4 rounded-lg border-2 transition-all duration-300 cursor-pointer animate-fade-in-up",
                  selectedMetric === metric.id
                    ? "bg-success/10 border-success/40 shadow-glow-success"
                    : "bg-card/50 border-border hover:border-success/30 hover:bg-success/5",
                  `animate-stagger-${index + 1}`
                )}
                onClick={() => setSelectedMetric(selectedMetric === metric.id ? null : metric.id)}
              >
                {/* Main metric row */}
                <div className="flex items-center gap-4">
                  {/* Icon */}
                  <div className={cn(
                    "p-3 rounded-lg transition-all duration-300",
                    `bg-${getSeverityColor(metric.severity)}/15 border border-${getSeverityColor(metric.severity)}/30`,
                    "group-hover:scale-110"
                  )}>
                    <div className={`text-${getSeverityColor(metric.severity)}`}>
                      {metric.icon}
                    </div>
                  </div>

                  {/* Metric info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="text-base font-semibold text-foreground">
                        {metric.title}
                      </h4>
                      <Badge variant="outline" className={cn(
                        "text-xs",
                        metric.change >= 0
                          ? `text-${getSeverityColor(metric.severity)} border-${getSeverityColor(metric.severity)}/40`
                          : "text-success border-success/40"
                      )}>
                        {metric.change >= 0 ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
                        {metric.change >= 0 && '+'}{metric.change.toFixed(1)}% {metric.changeLabel}
                      </Badge>
                    </div>

                    {/* Progress bar */}
                    <div className="progress-premium mb-2">
                      <div
                        className={cn(
                          "progress-premium-fill",
                          metric.severity === 'critical' && "bg-gradient-to-r from-danger to-danger-glow",
                          metric.severity === 'high' && "bg-gradient-to-r from-warning to-warning-glow",
                          metric.severity === 'medium' && "bg-gradient-to-r from-warning/70 to-warning",
                          metric.severity === 'low' && "bg-gradient-to-r from-success to-success-glow"
                        )}
                        style={{ width: `${getSeverityProgress(metric.severity)}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <p className="text-sm text-muted-foreground">
                        {metric.description}
                      </p>
                      <div className="flex items-center gap-3 flex-shrink-0">
                        <span className="text-2xl font-bold tabular-nums text-foreground">
                          {formatValue(metric.value, metric.unit)}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {metric.unit}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Expand indicator */}
                  <ChevronRight className={cn(
                    "w-5 h-5 text-muted-foreground transition-transform duration-300",
                    selectedMetric === metric.id && "rotate-90"
                  )} />
                </div>

                {/* Expanded impact analysis */}
                {selectedMetric === metric.id && (
                  <div className="mt-4 pt-4 border-t border-success/20 animate-fade-in-up">
                    <div className="flex items-start gap-3">
                      <Activity className="w-4 h-4 text-success mt-0.5" />
                      <div>
                        <h5 className="text-sm font-semibold text-success mb-1">
                          Impact on EFB Operations
                        </h5>
                        <p className="text-sm text-muted-foreground">
                          {metric.impact}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Bottom CTA */}
          <div className="mt-6 p-4 bg-gradient-to-r from-success/5 to-success/10 rounded-lg border border-success/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground mb-1">
                  Click any metric for detailed impact analysis
                </p>
                <p className="text-xs text-muted-foreground">
                  Understand how macro forces translate to operational realities
                </p>
              </div>
              <Button
                variant="outline"
                className="border-success/40 text-success hover:bg-success/10"
              >
                View Causal Chain
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

export default TheLandscape;
