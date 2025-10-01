import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  Legend,
  Sankey,
  Rectangle
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatNumber, formatCurrency, formatPercentage } from '@/lib/formatters';

const COLORS = [
  'hsl(var(--primary))',
  'hsl(var(--success))',
  'hsl(var(--warning))',
  'hsl(var(--destructive))',
  'hsl(210, 100%, 60%)',
  'hsl(270, 100%, 60%)',
  'hsl(30, 100%, 60%)',
  'hsl(180, 100%, 40%)',
];

interface DonutChartData {
  name: string;
  value: number;
  color?: string;
}

interface DonutChartProps {
  data: DonutChartData[];
  title?: string;
  valueFormatter?: (value: number) => string;
  innerRadius?: number;
  outerRadius?: number;
}

export function DonutChart({
  data,
  title,
  valueFormatter = formatNumber,
  innerRadius = 60,
  outerRadius = 100
}: DonutChartProps) {
  const total = data.reduce((sum, item) => sum + item.value, 0);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      const percentage = total > 0 ? (data.value / total) * 100 : 0;

      return (
        <div className="bg-card/98 backdrop-blur-md border border-primary/30 rounded-lg p-3 shadow-2xl">
          <p className="font-semibold mb-1">{data.name}</p>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">Value:</span>
              <span className="font-semibold" style={{ color: data.payload.fill }}>
                {valueFormatter(data.value)}
              </span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">Percentage:</span>
              <span className="font-semibold">{formatPercentage(percentage)}</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  const renderCustomizedLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent
  }: any) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    if (percent < 0.05) return null;

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? 'start' : 'end'}
        dominantBaseline="central"
        className="text-sm font-semibold"
      >
        {formatPercentage(percent * 100)}
      </text>
    );
  };

  return (
    <Card>
      {title && (
        <CardHeader>
          <CardTitle className="text-lg">{title}</CardTitle>
        </CardHeader>
      )}
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={renderCustomizedLabel}
              innerRadius={innerRadius}
              outerRadius={outerRadius}
              fill="hsl(var(--primary))"
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.color || COLORS[index % COLORS.length]}
                  className="hover:opacity-80 transition-opacity cursor-pointer"
                />
              ))}
            </Pie>
            <RechartsTooltip content={<CustomTooltip />} />
            <Legend
              verticalAlign="bottom"
              height={36}
              formatter={(value: string, entry: any) => {
                const percentage = total > 0 ? (entry.payload.value / total) * 100 : 0;
                return `${value} (${formatPercentage(percentage)})`;
              }}
            />
          </PieChart>
        </ResponsiveContainer>

        <div className="mt-4 p-4 bg-muted/50 rounded-lg">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-muted-foreground">Total:</span>
            <span className="text-xl font-bold text-primary">{valueFormatter(total)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface HeatMapCell {
  row: string;
  col: string;
  value: number;
  color?: string;
}

interface HeatMapProps {
  data: HeatMapCell[];
  title?: string;
  valueFormatter?: (value: number) => string;
}

export function HeatMap({ data, title, valueFormatter = formatNumber }: HeatMapProps) {
  const rows = Array.from(new Set(data.map(d => d.row)));
  const cols = Array.from(new Set(data.map(d => d.col)));

  const maxValue = Math.max(...data.map(d => d.value));
  const minValue = Math.min(...data.map(d => d.value));

  const getColorIntensity = (value: number) => {
    const normalized = (value - minValue) / (maxValue - minValue || 1);
    return `hsl(var(--primary) / ${0.2 + normalized * 0.8})`;
  };

  const getCellData = (row: string, col: string) => {
    return data.find(d => d.row === row && d.col === col);
  };

  return (
    <Card>
      {title && (
        <CardHeader>
          <CardTitle className="text-lg">{title}</CardTitle>
        </CardHeader>
      )}
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="p-2 border bg-muted/50"></th>
                {cols.map(col => (
                  <th key={col} className="p-2 border bg-muted/50 text-sm font-medium">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map(row => (
                <tr key={row}>
                  <td className="p-2 border bg-muted/50 text-sm font-medium">{row}</td>
                  {cols.map(col => {
                    const cellData = getCellData(row, col);
                    return (
                      <td
                        key={`${row}-${col}`}
                        className="p-4 border text-center relative group cursor-pointer transition-all hover:scale-105"
                        style={{
                          backgroundColor: cellData
                            ? cellData.color || getColorIntensity(cellData.value)
                            : 'transparent'
                        }}
                      >
                        {cellData && (
                          <>
                            <span className="text-sm font-semibold">
                              {valueFormatter(cellData.value)}
                            </span>
                            <div className="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <div className="text-white text-xs">
                                <div>{valueFormatter(cellData.value)}</div>
                                <div className="text-white/70">{row} × {col}</div>
                              </div>
                            </div>
                          </>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-4 flex items-center gap-4 text-sm">
          <span className="text-muted-foreground">Scale:</span>
          <div className="flex-1 h-4 rounded-full bg-gradient-to-r from-primary/20 to-primary"></div>
          <div className="flex gap-4">
            <span className="text-muted-foreground">
              Min: <span className="font-semibold">{valueFormatter(minValue)}</span>
            </span>
            <span className="text-muted-foreground">
              Max: <span className="font-semibold">{valueFormatter(maxValue)}</span>
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface SankeyNode {
  name: string;
  color?: string;
}

interface SankeyLink {
  source: number;
  target: number;
  value: number;
}

interface SankeyDiagramProps {
  nodes: SankeyNode[];
  links: SankeyLink[];
  title?: string;
  valueFormatter?: (value: number) => string;
}

export function SankeyDiagram({
  nodes,
  links,
  title,
  valueFormatter = formatNumber
}: SankeyDiagramProps) {
  const data = {
    nodes: nodes.map((node, index) => ({
      name: node.name,
      color: node.color || COLORS[index % COLORS.length]
    })),
    links: links.map(link => ({
      source: link.source,
      target: link.target,
      value: link.value
    }))
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;

      return (
        <div className="bg-card/98 backdrop-blur-md border border-primary/30 rounded-lg p-3 shadow-2xl">
          {data.source !== undefined ? (
            <>
              <p className="font-semibold mb-1">Flow</p>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between gap-4">
                  <span className="text-muted-foreground">From:</span>
                  <span className="font-semibold">{nodes[data.source].name}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-muted-foreground">To:</span>
                  <span className="font-semibold">{nodes[data.target].name}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-muted-foreground">Value:</span>
                  <span className="font-semibold text-primary">{valueFormatter(data.value)}</span>
                </div>
              </div>
            </>
          ) : (
            <>
              <p className="font-semibold">{data.name}</p>
            </>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <Card>
      {title && (
        <CardHeader>
          <CardTitle className="text-lg">{title}</CardTitle>
        </CardHeader>
      )}
      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          <Sankey
            data={data}
            nodeWidth={10}
            nodePadding={60}
            margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
            link={{ stroke: 'hsl(var(--primary) / 0.3)' }}
          >
            <RechartsTooltip content={<CustomTooltip />} />
          </Sankey>
        </ResponsiveContainer>

        <div className="mt-4 grid grid-cols-2 gap-4">
          <div className="p-3 bg-muted/50 rounded-lg">
            <p className="text-sm text-muted-foreground mb-2">Source Nodes</p>
            <div className="space-y-1">
              {nodes.slice(0, Math.ceil(nodes.length / 2)).map((node, index) => (
                <div key={index} className="flex items-center gap-2 text-sm">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: node.color || COLORS[index % COLORS.length] }}
                  />
                  <span>{node.name}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="p-3 bg-muted/50 rounded-lg">
            <p className="text-sm text-muted-foreground mb-2">Target Nodes</p>
            <div className="space-y-1">
              {nodes.slice(Math.ceil(nodes.length / 2)).map((node, index) => (
                <div key={index} className="flex items-center gap-2 text-sm">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{
                      backgroundColor:
                        node.color || COLORS[(index + Math.ceil(nodes.length / 2)) % COLORS.length]
                    }}
                  />
                  <span>{node.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
