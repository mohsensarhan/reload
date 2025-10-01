# Integration Guide - New Dashboard Features

This guide shows how to integrate the newly implemented features into your existing EFB Executive Dashboard.

---

## Quick Start Integration

### 1. Add Notification Center to Dashboard Layout

**File:** `src/components/DashboardLayout.tsx`

```typescript
import { NotificationCenter } from '@/components/NotificationCenter';

// Add to your header/toolbar section
<div className="flex items-center gap-4">
  <NotificationCenter />
  {/* Other toolbar items */}
</div>
```

---

### 2. Enable Chart Drill-Down on Existing Charts

**File:** `src/components/GrowthTrajectoryChart.tsx` (or any chart)

```typescript
import { ChartDrillDown } from '@/components/ChartDrillDown';
import { useState } from 'react';

export function GrowthTrajectoryChart() {
  const [drillDownData, setDrillDownData] = useState(null);
  const [drillDownOpen, setDrillDownOpen] = useState(false);

  const handleDataPointClick = (data: any) => {
    setDrillDownData({
      title: `FY${data.year} Performance`,
      category: 'Growth Metrics',
      timeframe: `FY${data.year}`,
      value: data.mealsDelivered,
      change: data.cagr,
      breakdownData: [
        {
          name: 'Direct Distribution',
          value: data.mealsDelivered * 0.6,
          percentage: 60,
          color: 'hsl(var(--primary))'
        },
        {
          name: 'Partner Networks',
          value: data.mealsDelivered * 0.25,
          percentage: 25,
          color: 'hsl(var(--success))'
        },
        {
          name: 'Emergency Response',
          value: data.mealsDelivered * 0.15,
          percentage: 15,
          color: 'hsl(var(--warning))'
        }
      ],
      trendData: growthData.map(d => ({
        period: `FY${d.year}`,
        value: d.mealsDelivered,
        target: d.year <= 2024 ? undefined : d.mealsDelivered * 0.95
      })),
      insights: [
        `Meals delivered grew ${data.cagr?.toFixed(1)}% year-over-year`,
        `Reached ${formatNumber(data.livesImpacted)} people in FY${data.year}`,
        'Strong performance in direct distribution channels'
      ],
      metadata: {
        dataSource: 'EFB Operations Database',
        lastUpdated: new Date().toLocaleDateString(),
        methodology: 'Monthly aggregation of distribution records'
      }
    });
    setDrillDownOpen(true);
  };

  return (
    <>
      {/* Your existing chart with onClick handler */}
      <LineChart onClick={(e) => handleDataPointClick(e)}>
        {/* ... */}
      </LineChart>

      <ChartDrillDown
        open={drillDownOpen}
        onClose={() => setDrillDownOpen(false)}
        data={drillDownData}
      />
    </>
  );
}
```

---

### 3. Add Comparison Mode Button

**File:** `src/components/ExecutiveDashboard.tsx`

```typescript
import { ComparisonMode } from '@/components/ComparisonMode';
import { ArrowLeftRight } from 'lucide-react';

export function ExecutiveDashboard() {
  const [showComparison, setShowComparison] = useState(false);

  const metricsForComparison = [
    {
      id: 'meals-delivered',
      title: 'Meals Delivered',
      getValue: (startDate: Date, endDate: Date) => {
        // Calculate meals delivered in period
        return 367490721; // Example value
      },
      formatter: formatNumber
    },
    {
      id: 'cost-per-meal',
      title: 'Cost Per Meal',
      getValue: (startDate: Date, endDate: Date) => {
        return 6.36;
      },
      formatter: formatCurrency
    },
    // Add more metrics...
  ];

  return (
    <>
      {/* Add button to toolbar */}
      <Button
        variant="outline"
        onClick={() => setShowComparison(true)}
      >
        <ArrowLeftRight className="w-4 h-4 mr-2" />
        Compare Periods
      </Button>

      {/* Show comparison mode */}
      {showComparison && (
        <ComparisonMode
          metrics={metricsForComparison}
          onClose={() => setShowComparison(false)}
        />
      )}
    </>
  );
}
```

---

### 4. Integrate Scenario Saving

**File:** `src/components/ScenarioAnalysis.tsx`

```typescript
import { useSavedScenarios } from '@/hooks/useSavedScenarios';
import { Button } from '@/components/ui/button';
import { Save, FolderOpen } from 'lucide-react';
import { toast } from 'sonner';

export function ScenarioAnalysis() {
  const { saveScenario, scenarios } = useSavedScenarios();
  const [showSavedScenarios, setShowSavedScenarios] = useState(false);

  const handleSaveScenario = async () => {
    const name = prompt('Enter scenario name:');
    if (!name) return;

    const description = prompt('Enter description (optional):');

    const saved = await saveScenario(
      name,
      scenarioFactors, // Your current scenario data
      calculatedResults, // Your calculated results
      description || undefined,
      ['custom'] // Tags
    );

    if (saved) {
      toast.success('Scenario saved successfully!');
    } else {
      toast.error('Failed to save scenario');
    }
  };

  return (
    <>
      <div className="flex gap-2">
        <Button onClick={handleSaveScenario}>
          <Save className="w-4 h-4 mr-2" />
          Save Scenario
        </Button>
        <Button
          variant="outline"
          onClick={() => setShowSavedScenarios(!showSavedScenarios)}
        >
          <FolderOpen className="w-4 h-4 mr-2" />
          Saved Scenarios ({scenarios.length})
        </Button>
      </div>

      {/* List of saved scenarios */}
      {showSavedScenarios && (
        <div className="mt-4 space-y-2">
          {scenarios.map(scenario => (
            <Card key={scenario.id}>
              <CardContent className="p-4">
                <h4 className="font-semibold">{scenario.name}</h4>
                <p className="text-sm text-muted-foreground">
                  {scenario.description}
                </p>
                <div className="flex gap-2 mt-2">
                  <Button
                    size="sm"
                    onClick={() => loadScenario(scenario)}
                  >
                    Load
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => deleteScenario(scenario.id)}
                  >
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </>
  );
}
```

---

### 5. Add Scenario Comparison

**File:** `src/components/ScenarioAnalysis.tsx` (continued)

```typescript
import { ScenarioComparison } from '@/components/ScenarioComparison';

export function ScenarioAnalysis() {
  const [showComparison, setShowComparison] = useState(false);

  return (
    <>
      <Button
        variant="outline"
        onClick={() => setShowComparison(true)}
        disabled={scenarios.length < 2}
      >
        <ArrowLeftRight className="w-4 h-4 mr-2" />
        Compare Scenarios
      </Button>

      {showComparison && (
        <ScenarioComparison onClose={() => setShowComparison(false)} />
      )}
    </>
  );
}
```

---

### 6. Use Advanced Charts

**File:** Anywhere in your dashboard

```typescript
import { DonutChart, HeatMap, SankeyDiagram } from '@/components/AdvancedCharts';

// Donut Chart Example
<DonutChart
  data={[
    { name: 'Individual Donors', value: 1200000000, color: 'hsl(var(--primary))' },
    { name: 'Corporate Partners', value: 650000000, color: 'hsl(var(--success))' },
    { name: 'Government Grants', value: 350000000, color: 'hsl(var(--warning))' }
  ]}
  title="Revenue Sources"
  valueFormatter={formatCurrency}
/>

// Heat Map Example
<HeatMap
  data={[
    { row: 'Cairo', col: 'Q1', value: 45000000 },
    { row: 'Cairo', col: 'Q2', value: 52000000 },
    { row: 'Alexandria', col: 'Q1', value: 28000000 },
    { row: 'Alexandria', col: 'Q2', value: 31000000 },
    // ... more data
  ]}
  title="Regional Distribution by Quarter"
  valueFormatter={formatNumber}
/>

// Sankey Diagram Example
<SankeyDiagram
  nodes={[
    { name: 'Total Donations' },
    { name: 'Food Procurement' },
    { name: 'Operations' },
    { name: 'Families Fed' },
    { name: 'Community Programs' }
  ]}
  links={[
    { source: 0, target: 1, value: 1800000000 },
    { source: 0, target: 2, value: 400000000 },
    { source: 1, target: 3, value: 1600000000 },
    { source: 2, target: 4, value: 200000000 }
  ]}
  title="Resource Flow Analysis"
  valueFormatter={formatCurrency}
/>
```

---

### 7. Add Report Builder

**File:** `src/components/ExecutiveDashboard.tsx`

```typescript
import { ReportBuilder } from '@/components/ReportBuilder';
import { FileText } from 'lucide-react';

export function ExecutiveDashboard() {
  const [showReportBuilder, setShowReportBuilder] = useState(false);

  return (
    <>
      <Button
        onClick={() => setShowReportBuilder(true)}
      >
        <FileText className="w-4 h-4 mr-2" />
        Create Custom Report
      </Button>

      {showReportBuilder && (
        <Dialog open={showReportBuilder} onOpenChange={setShowReportBuilder}>
          <DialogContent className="max-w-7xl max-h-[90vh]">
            <ReportBuilder />
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
```

---

## Automated Notification Examples

### Create Notifications Automatically

```typescript
import { useNotifications } from '@/hooks/useNotifications';

export function useMetricMonitoring() {
  const { createNotification } = useNotifications();

  useEffect(() => {
    // Monitor meals delivered
    if (mealsDelivered > targetMeals) {
      createNotification({
        type: 'success',
        category: 'metric_threshold',
        title: 'Meals Target Exceeded!',
        message: `Delivered ${formatNumber(mealsDelivered)} meals, exceeding target by ${formatPercentage(excess)}`,
        priority: 'high',
        related_section: 'executive',
        related_metric: 'meals-delivered'
      });
    }

    // Monitor cost per meal
    if (costPerMeal > threshold) {
      createNotification({
        type: 'warning',
        category: 'metric_threshold',
        title: 'Cost Per Meal Above Threshold',
        message: `Current cost of ${formatCurrency(costPerMeal)} exceeds target of ${formatCurrency(threshold)}`,
        priority: 'medium',
        related_section: 'financial',
        related_metric: 'cost-per-meal'
      });
    }
  }, [mealsDelivered, costPerMeal]);
}
```

---

## Best Practices

### 1. Performance
- Use lazy loading for heavy components
- Memoize expensive calculations
- Debounce user inputs
- Use virtual scrolling for long lists

### 2. User Experience
- Show loading states
- Provide clear error messages
- Add keyboard shortcuts
- Include helpful tooltips

### 3. Accessibility
- Use semantic HTML
- Add ARIA labels
- Support keyboard navigation
- Ensure color contrast

### 4. Data Management
- Cache frequent queries
- Batch database operations
- Clean up expired data
- Handle edge cases gracefully

---

## Testing Integration

### Component Testing
```typescript
import { render, screen } from '@testing-library/react';
import { NotificationCenter } from '@/components/NotificationCenter';

test('renders notification center', () => {
  render(<NotificationCenter />);
  expect(screen.getByRole('button')).toBeInTheDocument();
});
```

### Hook Testing
```typescript
import { renderHook, waitFor } from '@testing-library/react';
import { useNotifications } from '@/hooks/useNotifications';

test('fetches notifications', async () => {
  const { result } = renderHook(() => useNotifications());

  await waitFor(() => {
    expect(result.current.notifications).toBeDefined();
    expect(result.current.isLoading).toBe(false);
  });
});
```

---

## Troubleshooting

### Common Issues

**Issue:** Notifications not showing
- Check that database tables are created
- Verify user_id is being set in localStorage
- Check browser console for errors

**Issue:** Charts not rendering
- Ensure parent container has defined height
- Check that data is in correct format
- Verify Recharts is installed

**Issue:** Drag-and-drop not working
- Check that @dnd-kit packages are installed
- Ensure unique IDs for all draggable items
- Verify sensors are properly configured

---

## Support

For questions or issues:
1. Check the component documentation
2. Review the implementation examples above
3. Consult the NEW_FEATURES_IMPLEMENTATION.md document
4. Check browser console for errors

---

**Happy Integrating! 🚀**

