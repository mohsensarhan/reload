import React, { useState, useMemo } from 'react';
import { ComposedChart, Area, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip as RechartsTooltip, ReferenceLine } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TrendingUp, DollarSign, Users, Calendar, Target, Info, Zap } from 'lucide-react';
import { formatCurrency, formatNumber, formatPercentage } from '@/lib/formatters';
import { cn } from '@/lib/utils';

interface DonationsChartProps {
  data: Array<{
    month: string;
    totalEGP: number;
    totalUSD: number;
    count: number;
    date: Date;
  }>;
  isLoading?: boolean;
}

export function DonationsChart({ data, isLoading }: DonationsChartProps) {
  const [selectedMetric, setSelectedMetric] = useState<'amount' | 'count'>('amount');
  const [hoveredData, setHoveredData] = useState<any>(null);

  const chartData = useMemo(() => {
    if (!data || data.length === 0) return [];
    
    return data.map(item => ({
      month: new Date(item.date).toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
      totalEGP: item.totalEGP,
      count: item.count,
      avgDonation: item.count > 0 ? item.totalEGP / item.count : 0,
      date: item.date,
      // Calculate normalized values for dual axis
      normalizedCount: item.count,
      normalizedAmount: item.totalEGP / 1000000 // Convert to millions for better scaling
    }));
  }, [data]);

  // Calculate summary metrics with proper null checks
  const totalDonations = useMemo(() => {
    return data?.reduce((sum, item) => sum + (item.totalEGP || 0), 0) || 0;
  }, [data]);

  const totalCount = useMemo(() => {
    return data?.reduce((sum, item) => sum + (item.count || 0), 0) || 0;
  }, [data]);

  const avgDonation = totalCount > 0 ? totalDonations / totalCount : 0;
  
  const latestMonth = data?.[data.length - 1];
  const previousMonth = data?.[data.length - 2];
  const monthlyGrowth = latestMonth && previousMonth ? 
    ((latestMonth.totalEGP - previousMonth.totalEGP) / previousMonth.totalEGP) * 100 : 0;

  if (isLoading) {
    return (
      <Card className="executive-card overflow-hidden">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <DollarSign className="h-6 w-6 text-primary animate-pulse" />
            </div>
            <div>
              <CardTitle className="text-xl">Live Donations Analytics</CardTitle>
              <CardDescription>Loading donation data from Metabase...</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-80 bg-gradient-to-br from-primary/5 via-transparent to-primary/3 rounded-lg animate-pulse flex items-center justify-center">
            <div className="text-muted-foreground">Loading analytics...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Card className="executive-card">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <DollarSign className="h-6 w-6 text-primary" />
            </div>
            <div>
              <CardTitle className="text-xl">Live Donations Analytics</CardTitle>
              <CardDescription>No donation data available</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-80 flex items-center justify-center text-muted-foreground bg-gradient-to-br from-muted/20 to-muted/5 rounded-lg">
            No data to display
          </div>
        </CardContent>
      </Card>
    );
  }

  // Custom Tooltip Component
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      
      return (
        <div className="bg-card/98 backdrop-blur-md border border-primary/30 rounded-lg p-4 shadow-2xl animate-in fade-in-0 zoom-in-95 duration-300" style={{
          boxShadow: '0 25px 50px -12px hsl(var(--background) / 0.8), 0 0 30px hsl(var(--primary) / 0.2)'
        }}>
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="w-4 h-4 text-primary" />
            <span className="font-semibold">{label}</span>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">Total Donations:</span>
              <span className="font-semibold text-primary">{formatCurrency(data.totalEGP)}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">Number of Donors:</span>
              <span className="font-semibold text-success">{formatNumber(data.count)}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">Avg per Donor:</span>
              <span className="font-semibold text-warning">{formatCurrency(data.avgDonation)}</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="executive-card bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Donations</p>
                <p className="text-2xl font-bold text-primary">{formatCurrency(totalDonations)}</p>
                <div className="flex items-center gap-1 mt-1">
                  <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                  <span className="text-xs text-primary">Live from Metabase</span>
                </div>
              </div>
              <div className="p-2 bg-primary/20 rounded-lg">
                <DollarSign className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="executive-card bg-gradient-to-br from-success/5 to-success/10 border-success/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Donors</p>
                <p className="text-2xl font-bold text-success">{formatNumber(totalCount)}</p>
                <div className="flex items-center gap-1 mt-1">
                  <TrendingUp className="w-3 h-3 text-success" />
                  <span className="text-xs text-success">Active community</span>
                </div>
              </div>
              <div className="p-2 bg-success/20 rounded-lg">
                <Users className="h-6 w-6 text-success" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="executive-card bg-gradient-to-br from-warning/5 to-warning/10 border-warning/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Donation</p>
                <p className="text-2xl font-bold text-warning">{formatCurrency(avgDonation)}</p>
                <div className="flex items-center gap-1 mt-1">
                  <Target className="w-3 h-3 text-warning" />
                  <span className="text-xs text-warning">Per donor</span>
                </div>
              </div>
              <div className="p-2 bg-warning/20 rounded-lg">
                <TrendingUp className="h-6 w-6 text-warning" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="executive-card bg-gradient-to-br from-muted/10 to-muted/20 border-border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Monthly Growth</p>
                <p className={`text-2xl font-bold ${monthlyGrowth >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                  {monthlyGrowth >= 0 ? '+' : ''}{monthlyGrowth.toFixed(1)}%
                </p>
                <div className="flex items-center gap-1 mt-1">
                  <Calendar className="w-3 h-3 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">Month over month</span>
                </div>
              </div>
              <div className="p-2 bg-muted/20 rounded-lg">
                <Calendar className="h-6 w-6 text-muted-foreground" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Chart */}
      <Card className="executive-card overflow-hidden">
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Zap className="w-6 h-6 text-primary" />
              </div>
              <div className="min-w-0 flex-1">
                <CardTitle className="text-xl">Live Donations Analytics</CardTitle>
                <CardDescription>
                  Real-time donation data from Metabase API - Last 12 months
                </CardDescription>
              </div>
            </div>
            
            <div className="flex items-center gap-3 flex-shrink-0">
              <Badge variant="outline" className="text-primary border-primary animate-pulse">
                <div className="w-2 h-2 bg-primary rounded-full mr-2"></div>
                Live Data
              </Badge>
            </div>
          </div>

          {/* Metric Toggle */}
          <div className="flex items-center gap-2 mt-4">
            <Button
              variant={selectedMetric === 'amount' ? 'default' : 'outline'}
              size="sm" 
              onClick={() => setSelectedMetric('amount')}
              className={cn(
                "gap-2 transition-all duration-200",
                selectedMetric === 'amount' 
                  ? "bg-primary text-primary-foreground hover:bg-primary/90 border-primary shadow-sm" 
                  : "bg-background hover:bg-muted border-border text-muted-foreground hover:text-foreground"
              )}
            >
              <DollarSign className="w-4 h-4" />
              Donation Amounts
            </Button>
            <Button
              variant={selectedMetric === 'count' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedMetric('count')}
              className={cn(
                "gap-2 transition-all duration-200",
                selectedMetric === 'count' 
                  ? "bg-primary text-primary-foreground hover:bg-primary/90 border-primary shadow-sm" 
                  : "bg-background hover:bg-muted border-border text-muted-foreground hover:text-foreground"
              )}
            >
              <Users className="w-4 h-4" />
              Donor Count
            </Button>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="h-80 w-full overflow-hidden relative">
            {/* Animated background glow */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/3 via-transparent to-primary/2 opacity-30 pointer-events-none"></div>
            
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart
                data={chartData}
                margin={{ top: 30, right: 30, left: 20, bottom: 30 }}
                onMouseMove={(e) => {
                  if (e && e.activePayload && e.activePayload.length > 0) {
                    setHoveredData(e.activePayload[0].payload);
                  }
                }}
                onMouseLeave={() => setHoveredData(null)}
              >
                <defs>
                  {/* Sexy gradient for area fill */}
                  <linearGradient id="donationAreaGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.4}/>
                    <stop offset="30%" stopColor="hsl(var(--primary))" stopOpacity={0.25}/>
                    <stop offset="60%" stopColor="hsl(var(--primary))" stopOpacity={0.15}/>
                    <stop offset="85%" stopColor="hsl(var(--primary))" stopOpacity={0.05}/>
                    <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0.01}/>
                  </linearGradient>
                  
                  {/* Bar gradient */}
                  <linearGradient id="donationBarGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--success))" stopOpacity={0.9}/>
                    <stop offset="100%" stopColor="hsl(var(--success))" stopOpacity={0.6}/>
                  </linearGradient>
                  
                  {/* Glow effect filter */}
                  <filter id="donationGlow">
                    <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
                    <feMerge> 
                      <feMergeNode in="coloredBlur"/>
                      <feMergeNode in="SourceGraphic"/>
                    </feMerge>
                  </filter>
                </defs>
                
                <CartesianGrid 
                  strokeDasharray="3 6" 
                  stroke="hsl(var(--primary) / 0.15)" 
                  opacity={0.6}
                  strokeWidth={1.5}
                />
                
                <XAxis 
                  dataKey="month" 
                  stroke="hsl(var(--primary) / 0.6)"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: 'hsl(var(--foreground) / 0.7)', fontSize: 12 }}
                />
                
                <YAxis 
                  yAxisId="left"
                  stroke="hsl(var(--primary) / 0.6)"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => selectedMetric === 'amount' ? `${(value/1000000).toFixed(1)}M` : formatNumber(value)}
                  tick={{ fill: 'hsl(var(--foreground) / 0.7)', fontSize: 11 }}
                />
                
                <YAxis 
                  yAxisId="right" 
                  orientation="right"
                  stroke="hsl(var(--success) / 0.6)"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={formatNumber}
                  tick={{ fill: 'hsl(var(--foreground) / 0.7)', fontSize: 11 }}
                />
                
                <RechartsTooltip 
                  content={<CustomTooltip />}
                  cursor={{
                    stroke: 'hsl(var(--primary))',
                    strokeWidth: 2,
                    strokeDasharray: '8 8',
                    opacity: 0.8,
                    filter: 'drop-shadow(0 0 8px hsl(var(--primary) / 0.6))'
                  }}
                  animationDuration={300}
                  animationEasing="ease-in-out"
                />
                
                <Area
                  yAxisId="left"
                  type="monotone"
                  dataKey="totalEGP"
                  stroke="hsl(var(--primary))"
                  strokeWidth={3}
                  fill="url(#donationAreaGradient)"
                  fillOpacity={1}
                  isAnimationActive={true}
                  animationDuration={1800}
                  animationBegin={200}
                  animationEasing="ease-in-out"
                  style={{ filter: 'url(#donationGlow)' }}
                  activeDot={{ 
                    r: 8, 
                    stroke: 'hsl(var(--background))', 
                    strokeWidth: 3,
                    fill: 'hsl(var(--primary))',
                    style: { 
                      filter: 'drop-shadow(0 0 12px hsl(var(--primary)))',
                      transition: 'all 0.3s ease-in-out'
                    }
                  }}
                />
                
                <Bar
                  yAxisId="right"
                  dataKey="count"
                  fill="url(#donationBarGradient)"
                  fillOpacity={0.8}
                  radius={[4, 4, 0, 0]}
                  isAnimationActive={true}
                  animationDuration={1200}
                  animationBegin={800}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}