import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  Legend
} from 'recharts';
import { TrendingUp, TrendingDown, Calendar, Users, DollarSign, Target, Info, ChevronLeft } from 'lucide-react';
import { formatNumber, formatCurrency, formatPercentage } from '@/lib/formatters';
import { cn } from '@/lib/utils';

interface DrillDownData {
  title: string;
  category: string;
  timeframe: string;
  value: number | string;
  change?: number;
  breakdownData?: Array<{
    name: string;
    value: number;
    percentage?: number;
    color?: string;
  }>;
  trendData?: Array<{
    period: string;
    value: number;
    target?: number;
  }>;
  insights?: string[];
  metadata?: {
    dataSource: string;
    lastUpdated: string;
    methodology?: string;
  };
}

interface ChartDrillDownProps {
  open: boolean;
  onClose: () => void;
  data: DrillDownData | null;
  onDrillDeeper?: (item: any) => void;
}

const CHART_COLORS = [
  'hsl(var(--primary))',
  'hsl(var(--success))',
  'hsl(var(--warning))',
  'hsl(var(--destructive))',
  'hsl(var(--info))',
  'hsl(210, 100%, 60%)',
  'hsl(270, 100%, 60%)',
  'hsl(30, 100%, 60%)',
];

export function ChartDrillDown({ open, onClose, data, onDrillDeeper }: ChartDrillDownProps) {
  const [activeTab, setActiveTab] = useState<'breakdown' | 'trends' | 'insights'>('breakdown');

  if (!data) return null;

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card/98 backdrop-blur-md border border-primary/30 rounded-lg p-3 shadow-2xl">
          <p className="font-semibold mb-1">{label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex justify-between gap-4 text-sm">
              <span className="text-muted-foreground">{entry.name}:</span>
              <span className="font-semibold" style={{ color: entry.color }}>
                {typeof entry.value === 'number' && entry.value > 1000000
                  ? formatCurrency(entry.value)
                  : formatNumber(entry.value)}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <DialogTitle className="text-2xl flex items-center gap-2">
                {data.title}
                <Badge variant="outline" className="text-xs">
                  {data.category}
                </Badge>
              </DialogTitle>
              <DialogDescription className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                {data.timeframe}
                {data.change !== undefined && (
                  <span className={cn(
                    "flex items-center gap-1 ml-2",
                    data.change >= 0 ? "text-success" : "text-destructive"
                  )}>
                    {data.change >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                    {formatPercentage(Math.abs(data.change))}
                  </span>
                )}
              </DialogDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <ChevronLeft className="w-4 h-4 mr-1" />
              Back
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          <Card className="bg-gradient-to-br from-primary/5 to-transparent">
            <CardContent className="p-6">
              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-bold text-primary">
                  {typeof data.value === 'number' && data.value > 1000000
                    ? formatCurrency(data.value)
                    : data.value}
                </span>
                <span className="text-muted-foreground">Current Value</span>
              </div>
            </CardContent>
          </Card>

          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="breakdown">Breakdown</TabsTrigger>
              <TabsTrigger value="trends">Trends</TabsTrigger>
              <TabsTrigger value="insights">Insights</TabsTrigger>
            </TabsList>

            <TabsContent value="breakdown" className="space-y-4">
              {data.breakdownData && data.breakdownData.length > 0 ? (
                <>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Category Distribution</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                          <PieChart>
                            <Pie
                              data={data.breakdownData}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              label={(entry) => `${entry.name}: ${formatPercentage(entry.percentage || 0)}`}
                              outerRadius={100}
                              fill="hsl(var(--primary))"
                              dataKey="value"
                            >
                              {data.breakdownData.map((entry, index) => (
                                <Cell
                                  key={`cell-${index}`}
                                  fill={entry.color || CHART_COLORS[index % CHART_COLORS.length]}
                                  className="cursor-pointer hover:opacity-80 transition-opacity"
                                  onClick={() => onDrillDeeper?.(entry)}
                                />
                              ))}
                            </Pie>
                            <RechartsTooltip content={<CustomTooltip />} />
                          </PieChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Breakdown by Value</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                          <BarChart data={data.breakdownData}>
                            <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                            <XAxis
                              dataKey="name"
                              tick={{ fontSize: 12 }}
                              angle={-45}
                              textAnchor="end"
                              height={80}
                            />
                            <YAxis tick={{ fontSize: 12 }} />
                            <RechartsTooltip content={<CustomTooltip />} />
                            <Bar
                              dataKey="value"
                              fill="hsl(var(--primary))"
                              radius={[8, 8, 0, 0]}
                              className="cursor-pointer"
                              onClick={(entry) => onDrillDeeper?.(entry)}
                            >
                              {data.breakdownData.map((entry, index) => (
                                <Cell
                                  key={`cell-${index}`}
                                  fill={entry.color || CHART_COLORS[index % CHART_COLORS.length]}
                                />
                              ))}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {data.breakdownData.map((item, index) => (
                      <Card
                        key={index}
                        className="cursor-pointer hover:shadow-lg transition-all hover:scale-105"
                        onClick={() => onDrillDeeper?.(item)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-2">
                            <h4 className="font-semibold text-sm">{item.name}</h4>
                            <div
                              className="w-4 h-4 rounded-full"
                              style={{ backgroundColor: item.color || CHART_COLORS[index % CHART_COLORS.length] }}
                            />
                          </div>
                          <div className="space-y-1">
                            <p className="text-2xl font-bold text-primary">
                              {typeof item.value === 'number' && item.value > 1000000
                                ? formatCurrency(item.value)
                                : formatNumber(item.value)}
                            </p>
                            {item.percentage !== undefined && (
                              <p className="text-sm text-muted-foreground">
                                {formatPercentage(item.percentage)} of total
                              </p>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  No breakdown data available
                </div>
              )}
            </TabsContent>

            <TabsContent value="trends" className="space-y-4">
              {data.trendData && data.trendData.length > 0 ? (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Historical Trends</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={400}>
                      <LineChart data={data.trendData}>
                        <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                        <XAxis
                          dataKey="period"
                          tick={{ fontSize: 12 }}
                        />
                        <YAxis tick={{ fontSize: 12 }} />
                        <RechartsTooltip content={<CustomTooltip />} />
                        <Legend />
                        <Line
                          type="monotone"
                          dataKey="value"
                          stroke="hsl(var(--primary))"
                          strokeWidth={3}
                          dot={{ r: 6 }}
                          activeDot={{ r: 8 }}
                          name="Actual"
                        />
                        {data.trendData.some(d => d.target !== undefined) && (
                          <Line
                            type="monotone"
                            dataKey="target"
                            stroke="hsl(var(--warning))"
                            strokeWidth={2}
                            strokeDasharray="5 5"
                            dot={{ r: 4 }}
                            name="Target"
                          />
                        )}
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  No trend data available
                </div>
              )}
            </TabsContent>

            <TabsContent value="insights" className="space-y-4">
              {data.insights && data.insights.length > 0 ? (
                <div className="space-y-3">
                  {data.insights.map((insight, index) => (
                    <Card key={index} className="bg-gradient-to-r from-primary/5 to-transparent">
                      <CardContent className="p-4 flex items-start gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          <Info className="w-4 h-4 text-primary" />
                        </div>
                        <p className="text-sm flex-1">{insight}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  No insights available
                </div>
              )}

              {data.metadata && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Metadata</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Data Source:</span>
                      <span className="font-medium">{data.metadata.dataSource}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Last Updated:</span>
                      <span className="font-medium">{data.metadata.lastUpdated}</span>
                    </div>
                    {data.metadata.methodology && (
                      <div className="pt-2 border-t">
                        <p className="text-muted-foreground mb-1">Methodology:</p>
                        <p className="text-xs">{data.metadata.methodology}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}
