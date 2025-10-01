import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  Legend,
  LineChart,
  Line
} from 'recharts';
import { ArrowLeftRight, TrendingUp, TrendingDown, Star, Calendar, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatNumber, formatCurrency, formatPercentage } from '@/lib/formatters';
import { useSavedScenarios, SavedScenario } from '@/hooks/useSavedScenarios';
import { format as formatDate } from 'date-fns';

interface ScenarioComparisonProps {
  onClose?: () => void;
}

export function ScenarioComparison({ onClose }: ScenarioComparisonProps) {
  const { scenarios, isLoading, deleteScenario, toggleFavorite } = useSavedScenarios();
  const [selectedScenario1, setSelectedScenario1] = useState<string>('');
  const [selectedScenario2, setSelectedScenario2] = useState<string>('');

  const scenario1 = scenarios.find(s => s.id === selectedScenario1);
  const scenario2 = scenarios.find(s => s.id === selectedScenario2);

  const inputComparisonData = useMemo(() => {
    if (!scenario1 || !scenario2) return [];

    const keys = Object.keys(scenario1.scenario_data) as Array<keyof typeof scenario1.scenario_data>;

    return keys.map(key => ({
      factor: key.replace(/([A-Z])/g, ' $1').trim(),
      scenario1: scenario1.scenario_data[key],
      scenario2: scenario2.scenario_data[key],
      difference: scenario1.scenario_data[key] - scenario2.scenario_data[key]
    }));
  }, [scenario1, scenario2]);

  const resultsComparisonData = useMemo(() => {
    if (!scenario1?.results || !scenario2?.results) return [];

    return [
      {
        metric: 'Meals Delivered',
        scenario1: scenario1.results.mealsDelivered,
        scenario2: scenario2.results.mealsDelivered,
        formatter: formatNumber
      },
      {
        metric: 'People Served',
        scenario1: scenario1.results.peopleServed,
        scenario2: scenario2.results.peopleServed,
        formatter: formatNumber
      },
      {
        metric: 'Cost Per Meal',
        scenario1: scenario1.results.costPerMeal,
        scenario2: scenario2.results.costPerMeal,
        formatter: formatCurrency
      },
      {
        metric: 'Program Efficiency',
        scenario1: scenario1.results.programEfficiency,
        scenario2: scenario2.results.programEfficiency,
        formatter: (v: number) => formatPercentage(v)
      },
      {
        metric: 'Revenue',
        scenario1: scenario1.results.revenue,
        scenario2: scenario2.results.revenue,
        formatter: formatCurrency
      },
      {
        metric: 'Expenses',
        scenario1: scenario1.results.expenses,
        scenario2: scenario2.results.expenses,
        formatter: formatCurrency
      },
      {
        metric: 'Reserves',
        scenario1: scenario1.results.reserves,
        scenario2: scenario2.results.reserves,
        formatter: formatCurrency
      },
      {
        metric: 'Cash Position',
        scenario1: scenario1.results.cashPosition,
        scenario2: scenario2.results.cashPosition,
        formatter: formatCurrency
      }
    ];
  }, [scenario1, scenario2]);

  const radarData = useMemo(() => {
    if (!scenario1 || !scenario2) return [];

    return inputComparisonData.map(item => ({
      factor: item.factor,
      [scenario1.name]: item.scenario1,
      [scenario2.name]: item.scenario2
    }));
  }, [inputComparisonData, scenario1, scenario2]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card/98 backdrop-blur-md border border-primary/30 rounded-lg p-3 shadow-2xl">
          <p className="font-semibold mb-1">{label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex justify-between gap-4 text-sm">
              <span className="text-muted-foreground">{entry.name}:</span>
              <span className="font-semibold" style={{ color: entry.color }}>
                {typeof entry.value === 'number' ? formatNumber(entry.value) : entry.value}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-muted-foreground">Loading scenarios...</div>
      </div>
    );
  }

  if (scenarios.length < 2) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <ArrowLeftRight className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Not Enough Scenarios</h3>
          <p className="text-muted-foreground">
            You need at least 2 saved scenarios to compare. Save some scenarios first!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-2xl flex items-center gap-2">
                <ArrowLeftRight className="w-6 h-6 text-primary" />
                Scenario Comparison
              </CardTitle>
              <CardDescription>
                Compare two saved scenarios to understand different outcomes
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Badge variant="default" className="bg-primary">Scenario 1</Badge>
              </div>
              <Select value={selectedScenario1} onValueChange={setSelectedScenario1}>
                <SelectTrigger>
                  <SelectValue placeholder="Select first scenario" />
                </SelectTrigger>
                <SelectContent>
                  {scenarios.map(scenario => (
                    <SelectItem key={scenario.id} value={scenario.id} disabled={scenario.id === selectedScenario2}>
                      <div className="flex items-center gap-2">
                        {scenario.is_favorite && <Star className="w-3 h-3 fill-warning text-warning" />}
                        <span>{scenario.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {scenario1 && (
                <div className="p-3 bg-muted/50 rounded-lg text-sm space-y-1">
                  <p className="font-medium">{scenario1.name}</p>
                  {scenario1.description && (
                    <p className="text-muted-foreground">{scenario1.description}</p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    <Calendar className="w-3 h-3 inline mr-1" />
                    {formatDate(new Date(scenario1.created_at), 'MMM d, yyyy')}
                  </p>
                </div>
              )}
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="border-primary text-primary">Scenario 2</Badge>
              </div>
              <Select value={selectedScenario2} onValueChange={setSelectedScenario2}>
                <SelectTrigger>
                  <SelectValue placeholder="Select second scenario" />
                </SelectTrigger>
                <SelectContent>
                  {scenarios.map(scenario => (
                    <SelectItem key={scenario.id} value={scenario.id} disabled={scenario.id === selectedScenario1}>
                      <div className="flex items-center gap-2">
                        {scenario.is_favorite && <Star className="w-3 h-3 fill-warning text-warning" />}
                        <span>{scenario.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {scenario2 && (
                <div className="p-3 bg-muted/50 rounded-lg text-sm space-y-1">
                  <p className="font-medium">{scenario2.name}</p>
                  {scenario2.description && (
                    <p className="text-muted-foreground">{scenario2.description}</p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    <Calendar className="w-3 h-3 inline mr-1" />
                    {formatDate(new Date(scenario2.created_at), 'MMM d, yyyy')}
                  </p>
                </div>
              )}
            </div>
          </div>

          {scenario1 && scenario2 && (
            <Tabs defaultValue="results" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="results">Results</TabsTrigger>
                <TabsTrigger value="inputs">Inputs</TabsTrigger>
                <TabsTrigger value="radar">Radar View</TabsTrigger>
              </TabsList>

              <TabsContent value="results" className="space-y-4 mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Outcome Comparison</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={400}>
                      <BarChart data={resultsComparisonData}>
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
                        <Bar dataKey="scenario1" fill="hsl(var(--primary))" name={scenario1.name} radius={[8, 8, 0, 0]} />
                        <Bar dataKey="scenario2" fill="hsl(var(--success))" name={scenario2.name} radius={[8, 8, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <div className="rounded-lg border overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-muted/50">
                      <tr>
                        <th className="text-left p-4 font-semibold">Metric</th>
                        <th className="text-right p-4 font-semibold">{scenario1.name}</th>
                        <th className="text-right p-4 font-semibold">{scenario2.name}</th>
                        <th className="text-right p-4 font-semibold">Difference</th>
                      </tr>
                    </thead>
                    <tbody>
                      {resultsComparisonData.map((item, index) => {
                        const diff = item.scenario1 - item.scenario2;
                        const diffPercent = item.scenario2 !== 0 ? (diff / item.scenario2) * 100 : 0;

                        return (
                          <tr key={index} className="border-t hover:bg-muted/30 transition-colors">
                            <td className="p-4 font-medium">{item.metric}</td>
                            <td className="p-4 text-right font-semibold text-primary">
                              {item.formatter(item.scenario1)}
                            </td>
                            <td className="p-4 text-right font-semibold text-success">
                              {item.formatter(item.scenario2)}
                            </td>
                            <td className="p-4 text-right">
                              <div className={cn(
                                "inline-flex items-center gap-1",
                                diff >= 0 ? "text-success" : "text-destructive"
                              )}>
                                {diff >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                                <span className="font-semibold">{formatPercentage(Math.abs(diffPercent))}</span>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </TabsContent>

              <TabsContent value="inputs" className="space-y-4 mt-6">
                <div className="rounded-lg border overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-muted/50">
                      <tr>
                        <th className="text-left p-4 font-semibold">Factor</th>
                        <th className="text-right p-4 font-semibold">{scenario1.name}</th>
                        <th className="text-right p-4 font-semibold">{scenario2.name}</th>
                        <th className="text-right p-4 font-semibold">Difference</th>
                      </tr>
                    </thead>
                    <tbody>
                      {inputComparisonData.map((item, index) => (
                        <tr key={index} className="border-t hover:bg-muted/30 transition-colors">
                          <td className="p-4 font-medium capitalize">{item.factor}</td>
                          <td className="p-4 text-right font-semibold text-primary">
                            {item.scenario1 >= 0 ? '+' : ''}{item.scenario1}%
                          </td>
                          <td className="p-4 text-right font-semibold text-success">
                            {item.scenario2 >= 0 ? '+' : ''}{item.scenario2}%
                          </td>
                          <td className={cn(
                            "p-4 text-right font-semibold",
                            item.difference >= 0 ? "text-success" : "text-destructive"
                          )}>
                            {item.difference >= 0 ? '+' : ''}{item.difference}%
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </TabsContent>

              <TabsContent value="radar" className="space-y-4 mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Factor Comparison (Radar View)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={500}>
                      <RadarChart data={radarData}>
                        <PolarGrid />
                        <PolarAngleAxis dataKey="factor" tick={{ fontSize: 11 }} />
                        <PolarRadiusAxis angle={90} domain={[-20, 20]} />
                        <Radar
                          name={scenario1.name}
                          dataKey={scenario1.name}
                          stroke="hsl(var(--primary))"
                          fill="hsl(var(--primary))"
                          fillOpacity={0.3}
                        />
                        <Radar
                          name={scenario2.name}
                          dataKey={scenario2.name}
                          stroke="hsl(var(--success))"
                          fill="hsl(var(--success))"
                          fillOpacity={0.3}
                        />
                        <Legend />
                        <RechartsTooltip content={<CustomTooltip />} />
                      </RadarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
