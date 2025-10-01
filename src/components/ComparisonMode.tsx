import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  Legend,
  ReferenceLine
} from 'recharts';
import { TrendingUp, TrendingDown, ArrowLeftRight, Calendar, Info, X } from 'lucide-react';
import { formatNumber, formatCurrency, formatPercentage } from '@/lib/formatters';
import { cn } from '@/lib/utils';
import { DateRange } from 'react-day-picker';
import { addDays, subMonths, subYears, format as formatDate } from 'date-fns';

interface Period {
  id: string;
  label: string;
  startDate: Date;
  endDate: Date;
}

interface MetricComparison {
  metric: string;
  period1Value: number;
  period2Value: number;
  change: number;
  changePercent: number;
}

interface ComparisonModeProps {
  metrics: Array<{
    id: string;
    title: string;
    getValue: (startDate: Date, endDate: Date) => number;
    formatter?: (value: number) => string;
  }>;
  onClose?: () => void;
}

export function ComparisonMode({ metrics, onClose }: ComparisonModeProps) {
  const today = new Date();

  const availablePeriods: Period[] = useMemo(() => [
    {
      id: 'last-7-days',
      label: 'Last 7 Days',
      startDate: addDays(today, -7),
      endDate: today
    },
    {
      id: 'last-30-days',
      label: 'Last 30 Days',
      startDate: addDays(today, -30),
      endDate: today
    },
    {
      id: 'last-90-days',
      label: 'Last 90 Days',
      startDate: addDays(today, -90),
      endDate: today
    },
    {
      id: 'this-month',
      label: 'This Month',
      startDate: new Date(today.getFullYear(), today.getMonth(), 1),
      endDate: today
    },
    {
      id: 'last-month',
      label: 'Last Month',
      startDate: new Date(today.getFullYear(), today.getMonth() - 1, 1),
      endDate: new Date(today.getFullYear(), today.getMonth(), 0)
    },
    {
      id: 'this-quarter',
      label: 'This Quarter',
      startDate: new Date(today.getFullYear(), Math.floor(today.getMonth() / 3) * 3, 1),
      endDate: today
    },
    {
      id: 'last-quarter',
      label: 'Last Quarter',
      startDate: new Date(today.getFullYear(), Math.floor(today.getMonth() / 3) * 3 - 3, 1),
      endDate: new Date(today.getFullYear(), Math.floor(today.getMonth() / 3) * 3, 0)
    },
    {
      id: 'this-year',
      label: 'This Year',
      startDate: new Date(today.getFullYear(), 0, 1),
      endDate: today
    },
    {
      id: 'last-year',
      label: 'Last Year',
      startDate: new Date(today.getFullYear() - 1, 0, 1),
      endDate: new Date(today.getFullYear() - 1, 11, 31)
    }
  ], [today]);

  const [period1, setPeriod1] = useState<Period>(availablePeriods[1]);
  const [period2, setPeriod2] = useState<Period>(availablePeriods[4]);
  const [viewMode, setViewMode] = useState<'table' | 'chart'>('table');

  const comparisonData: MetricComparison[] = useMemo(() => {
    return metrics.map(metric => {
      const value1 = metric.getValue(period1.startDate, period1.endDate);
      const value2 = metric.getValue(period2.startDate, period2.endDate);
      const change = value1 - value2;
      const changePercent = value2 !== 0 ? (change / value2) * 100 : 0;

      return {
        metric: metric.title,
        period1Value: value1,
        period2Value: value2,
        change,
        changePercent
      };
    });
  }, [metrics, period1, period2]);

  const chartData = useMemo(() => {
    return comparisonData.map((item, index) => ({
      metric: item.metric,
      [period1.label]: item.period1Value,
      [period2.label]: item.period2Value,
      difference: item.change
    }));
  }, [comparisonData, period1, period2]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card/98 backdrop-blur-md border border-primary/30 rounded-lg p-4 shadow-2xl">
          <p className="font-semibold mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex justify-between gap-4 text-sm mb-1">
              <span className="text-muted-foreground">{entry.name}:</span>
              <span className="font-semibold" style={{ color: entry.color }}>
                {formatNumber(entry.value)}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  const formatPeriodDate = (period: Period) => {
    return `${formatDate(period.startDate, 'MMM d, yyyy')} - ${formatDate(period.endDate, 'MMM d, yyyy')}`;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-2xl flex items-center gap-2">
                <ArrowLeftRight className="w-6 h-6 text-primary" />
                Period Comparison
              </CardTitle>
              <CardDescription>
                Compare metrics across different time periods to identify trends and patterns
              </CardDescription>
            </div>
            {onClose && (
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Badge variant="default" className="bg-primary">Period 1</Badge>
                <Calendar className="w-4 h-4 text-muted-foreground" />
              </div>
              <Select
                value={period1.id}
                onValueChange={(value) => {
                  const selected = availablePeriods.find(p => p.id === value);
                  if (selected) setPeriod1(selected);
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {availablePeriods.map(period => (
                    <SelectItem key={period.id} value={period.id}>
                      {period.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">{formatPeriodDate(period1)}</p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="border-primary text-primary">Period 2</Badge>
                <Calendar className="w-4 h-4 text-muted-foreground" />
              </div>
              <Select
                value={period2.id}
                onValueChange={(value) => {
                  const selected = availablePeriods.find(p => p.id === value);
                  if (selected) setPeriod2(selected);
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {availablePeriods.map(period => (
                    <SelectItem key={period.id} value={period.id}>
                      {period.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">{formatPeriodDate(period2)}</p>
            </div>
          </div>

          <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as any)} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="table">Table View</TabsTrigger>
              <TabsTrigger value="chart">Chart View</TabsTrigger>
            </TabsList>

            <TabsContent value="table" className="space-y-4 mt-6">
              <div className="rounded-lg border overflow-hidden">
                <table className="w-full">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="text-left p-4 font-semibold">Metric</th>
                      <th className="text-right p-4 font-semibold">{period1.label}</th>
                      <th className="text-right p-4 font-semibold">{period2.label}</th>
                      <th className="text-right p-4 font-semibold">Change</th>
                      <th className="text-right p-4 font-semibold">% Change</th>
                    </tr>
                  </thead>
                  <tbody>
                    {comparisonData.map((item, index) => (
                      <tr
                        key={index}
                        className="border-t hover:bg-muted/30 transition-colors"
                      >
                        <td className="p-4 font-medium">{item.metric}</td>
                        <td className="p-4 text-right font-semibold text-primary">
                          {formatNumber(item.period1Value)}
                        </td>
                        <td className="p-4 text-right font-semibold text-primary">
                          {formatNumber(item.period2Value)}
                        </td>
                        <td className={cn(
                          "p-4 text-right font-semibold",
                          item.change >= 0 ? "text-success" : "text-destructive"
                        )}>
                          {item.change >= 0 ? '+' : ''}{formatNumber(item.change)}
                        </td>
                        <td className="p-4 text-right">
                          <div className={cn(
                            "inline-flex items-center gap-1 px-2 py-1 rounded-full text-sm font-semibold",
                            item.changePercent >= 0
                              ? "bg-success/10 text-success"
                              : "bg-destructive/10 text-destructive"
                          )}>
                            {item.changePercent >= 0 ? (
                              <TrendingUp className="w-3 h-3" />
                            ) : (
                              <TrendingDown className="w-3 h-3" />
                            )}
                            {formatPercentage(Math.abs(item.changePercent))}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-gradient-to-br from-success/10 to-transparent border-success/20">
                  <CardContent className="p-4">
                    <p className="text-sm text-muted-foreground mb-1">Improved Metrics</p>
                    <p className="text-3xl font-bold text-success">
                      {comparisonData.filter(d => d.change > 0).length}
                    </p>
                  </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-destructive/10 to-transparent border-destructive/20">
                  <CardContent className="p-4">
                    <p className="text-sm text-muted-foreground mb-1">Declined Metrics</p>
                    <p className="text-3xl font-bold text-destructive">
                      {comparisonData.filter(d => d.change < 0).length}
                    </p>
                  </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-muted/50 to-transparent">
                  <CardContent className="p-4">
                    <p className="text-sm text-muted-foreground mb-1">Unchanged</p>
                    <p className="text-3xl font-bold">
                      {comparisonData.filter(d => d.change === 0).length}
                    </p>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="chart" className="space-y-4 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Side-by-Side Comparison</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={400}>
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                      <XAxis
                        dataKey="metric"
                        tick={{ fontSize: 11 }}
                        angle={-15}
                        textAnchor="end"
                        height={100}
                      />
                      <YAxis tick={{ fontSize: 12 }} />
                      <RechartsTooltip content={<CustomTooltip />} />
                      <Legend />
                      <Bar
                        dataKey={period1.label}
                        fill="hsl(var(--primary))"
                        radius={[8, 8, 0, 0]}
                      />
                      <Bar
                        dataKey={period2.label}
                        fill="hsl(var(--primary) / 0.5)"
                        radius={[8, 8, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Change Magnitude</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={chartData} layout="horizontal">
                      <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                      <XAxis type="number" tick={{ fontSize: 12 }} />
                      <YAxis
                        type="category"
                        dataKey="metric"
                        tick={{ fontSize: 11 }}
                        width={150}
                      />
                      <RechartsTooltip content={<CustomTooltip />} />
                      <ReferenceLine x={0} stroke="hsl(var(--border))" strokeWidth={2} />
                      <Bar
                        dataKey="difference"
                        fill="hsl(var(--primary))"
                        radius={[0, 8, 8, 0]}
                      >
                        {chartData.map((entry, index) => (
                          <Bar
                            key={index}
                            fill={entry.difference >= 0 ? 'hsl(var(--success))' : 'hsl(var(--destructive))'}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <Card className="bg-gradient-to-r from-blue-500/10 to-transparent border-blue-500/20">
            <CardContent className="p-4 flex items-start gap-3">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <Info className="w-4 h-4 text-blue-500" />
              </div>
              <div className="flex-1 text-sm">
                <p className="font-semibold mb-1">Comparison Insights</p>
                <p className="text-muted-foreground">
                  This comparison shows how your metrics have changed between {period2.label} and {period1.label}.
                  Use this to identify trends, validate strategies, and make data-driven decisions.
                </p>
              </div>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
}
