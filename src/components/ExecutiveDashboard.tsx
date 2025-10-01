import React, { useState, useCallback, useRef, useMemo, Suspense, memo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { TrendingUp, Users, Globe, DollarSign, Target, TriangleAlert as AlertTriangle, Activity, ChartBar as BarChart3, Brain, Lightbulb, Info } from 'lucide-react';
import efbLogo from '@/assets/efb-logo.png';
import { MetricCard } from './MetricCard';
import { FinancialHealthGrid } from './FinancialHealthGrid';
import { ImpactAnalytics } from './ImpactAnalytics';
import { ReportNavigation } from './ReportNavigation';
import { DashboardLayout } from './DashboardLayout';
import { MetricDetailModal } from './MetricDetailModal';
import { ProgrammaticAnalysis } from './ProgrammaticAnalysis';
import { ScenarioModelModal } from './ScenarioModelModal';
import { ErrorBoundary } from './ErrorBoundary';
import { PageLoadingSkeleton, AnalyticsSkeleton } from './LoadingStates';
import { useViewportScale } from '@/hooks/useViewportScale';
import { useDebounce } from '@/hooks/useDebounce';
import { useAutoGrid } from '@/hooks/useAutoGrid';
import { useScenarioCalculations } from '@/hooks/useScenarioCalculations';
import { createExecutiveMetrics } from '@/data/executiveMetrics';
import { formatSimpleNumber, formatPercentage, formatCurrency, formatNumber } from '@/lib/formatters';
import { cn } from '@/lib/utils';
import { GrowthTrajectoryChart } from './GrowthTrajectoryChart';
import {
  LazyAdvancedFinancialAnalytics,
  LazyOperationalAnalytics,
  LazyProgramsAnalytics,
  LazyStakeholderAnalytics,
  LazyScenarioAnalysis,
  LazyComponentWrapper
} from './LazyComponents';
import { GlobalSignalsSection } from './GlobalSignalsSection';
import { PageGrid } from '@/layout/PageGrid';
import { ExecutiveSummary } from './ExecutiveSummary';
import { MobileBottomNav } from './MobileBottomNav';
import { ExportMenu } from './ExportMenu';
import { TimeRangeSelector } from './TimeRangeSelector';
import { useUserPreferences } from '@/hooks/useUserPreferences';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { DateRange } from 'react-day-picker';
import { prepareMetricsForExport } from '@/lib/exportUtils';

export interface Metric {
  title: string;
  value: number | string;
  description: string;
  methodology: string;
  dataSource: string;
  interpretation: string;
  benchmarks?: Array<{ label: string; value: string; status: 'good' | 'warning' | 'critical' }>;
  factors?: Array<{ factor: string; impact: string }>;
  formula?: string;
  significance: string;
  recommendations?: string[];
}

interface DashboardMetrics {
  mealsDelivered: number;
  peopleServed: number;
  costPerMeal: number;
  programEfficiency: number;
  revenue: number;
  expenses: number;
  reserves: number;
  cashPosition: number;
}

const baseMetrics: DashboardMetrics = {
  mealsDelivered: 367490721,
  peopleServed: 4960000,
  costPerMeal: 6.36,
  programEfficiency: 83,
  revenue: 2200000000,
  expenses: 2316000000,
  reserves: 731200000,
  cashPosition: 459800000,
};

const ExecutiveDashboard = memo(() => {
  const getInitialSection = () => {
    const hash = window.location.hash.replace('#', '');
    const validSections = ['executive', 'financial', 'operational', 'programs', 'stakeholders', 'scenarios'];
    return validSections.includes(hash) ? hash : 'executive';
  };

  const [currentSection, setCurrentSection] = useState(getInitialSection);
  const [dateRange, setDateRange] = React.useState<DateRange | undefined>();
  const { preferences } = useUserPreferences();
  const [selectedMetric, setSelectedMetric] = useState<Metric | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showModelModal, setShowModelModal] = useState(false);
  const [scenarioFactors, setScenarioFactors] = useState({
    economicGrowth: 0,
    inflationRate: 0,
    donorSentiment: 0,
    operationalEfficiency: 0,
    foodPrices: 0,
    unemploymentRate: 0,
    corporateCSR: 0,
    governmentSupport: 0,
    exchangeRateEGP: 0,
    logisticsCostIndex: 0,
    regionalShock: 0,
  });

  // Debounce scenario factors to prevent excessive calculations
  const debouncedScenarioFactors = useDebounce(scenarioFactors, 50);

  // Update URL when section changes
  const handleSectionChange = (sectionId: string) => {
    setCurrentSection(sectionId);
    window.history.replaceState(null, '', `#${sectionId}`);
  };

  // Simulate initial loading
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);
    
    return () => clearTimeout(timer);
  }, []);

  // Listen for browser back/forward navigation
  React.useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      const validSections = ['executive', 'financial', 'operational', 'programs', 'stakeholders', 'scenarios'];
      if (validSections.includes(hash)) {
        setCurrentSection(hash);
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Scaling system integration
  const headerRef = useRef<HTMLElement>(null);
  const scale = useViewportScale(headerRef);
  useAutoGrid();

  // Use the enhanced scenario calculations hook for dynamic updates
  const calculatedMetrics = useScenarioCalculations(baseMetrics, debouncedScenarioFactors);

  const updateScenario = useCallback((factor: string, value: number[]) => {
    setScenarioFactors(prev => ({ ...prev, [factor]: value[0] }));
  }, []);

  // Executive metrics for detailed modals
  const executiveMetrics = {
    livesImpacted: {
      title: "Lives Impacted Analysis",
      value: `${formatSimpleNumber(calculatedMetrics?.peopleServed || baseMetrics.peopleServed)} people`,
      description: "4.96 million unique individuals reached nationwide across all 27 governorates",
      methodology: "Unique beneficiary identification using national ID verification system, preventing double-counting across multiple programs and time periods.",
      dataSource: "National Beneficiary Database + Ministry of Social Solidarity Integration",
      interpretation: "4.96M represents 4.8% of Egypt's total population, focusing on most vulnerable households identified through poverty mapping",
      significance: "Largest humanitarian reach in Egypt's history, exceeding government social protection programs in coverage and efficiency",
      benchmarks: [
        { label: "UN WFP Egypt Operations", value: "2.1M people", status: "good" as const },
        { label: "Government Takaful Program", value: "3.2M people", status: "good" as const },
        { label: "EFB Achievement", value: "4.96M people", status: "good" as const }
      ],
      recommendations: [
        "Scale to reach 6M people by FY2026 through enhanced partnerships",
        "Implement graduated exit strategies for improved households",
        "Expand prevention programs to reduce future emergency needs"
      ]
    },
    mealsDelivered: {
      title: "Meals Delivered Impact Assessment", 
      value: `${formatSimpleNumber(calculatedMetrics?.mealsDelivered || baseMetrics.mealsDelivered)} meals`,
      description: "Total annual food assistance across protection, prevention, and empowerment programs",
      methodology: "Comprehensive meal equivalent calculation using WHO nutritional standards, verified through biometric distribution tracking and partner reporting.",
      dataSource: "Distribution Management System + Partner Network Reports + Field Verification",
      interpretation: "367.5M meals represents 72 meals per beneficiary annually, equivalent to providing complete nutrition for 1 million people daily",
      significance: "Largest food distribution operation in MENA region, preventing acute malnutrition crisis during economic downturn",
      benchmarks: [
        { label: "Regional Food Banks Average", value: "50M meals/year", status: "good" as const },
        { label: "Global Top 10 Food Banks", value: "200M meals/year", status: "good" as const },
        { label: "EFB World Ranking", value: "#3 globally", status: "good" as const }
      ],
      recommendations: [
        "Optimize meal composition for enhanced nutritional value",
        "Implement seasonal demand forecasting for distribution efficiency",
        "Develop supply chain resilience for 400M+ meal target"
      ]
    },
    costPerMeal: {
      title: "Cost Efficiency Excellence",
      value: `${formatCurrency(calculatedMetrics?.costPerMeal || baseMetrics.costPerMeal)} per meal`,
      description: "All-inclusive program cost including food, logistics, administration, and monitoring",
      methodology: "Activity-based costing system allocating all organizational expenses across meals delivered, including overhead, quality assurance, and impact measurement.",
      dataSource: "ERP Financial System + Time-Driven Activity Based Costing Model",
      interpretation: "EGP 6.36 (~$0.21 USD) per meal represents world-class efficiency, 70% below global humanitarian sector average",
      significance: "Exceptional cost efficiency maximizes donor impact and enables sustainable scale expansion during economic challenges",
      benchmarks: [
        { label: "Global Humanitarian Average", value: "$0.70 per meal", status: "good" as const },
        { label: "USAID Cost Standard", value: "$0.45 per meal", status: "good" as const },
        { label: "EFB Performance", value: "$0.21 per meal", status: "good" as const }
      ],
      recommendations: [
        "Leverage AI for supply chain optimization to reach $0.19 per meal",
        "Expand local sourcing to reduce logistics costs",
        "Implement blockchain for transparency and efficiency gains"
      ]
    },
    coverage: {
      title: "Geographic Coverage Achievement",
      value: "27/27 Governorates",
      description: "Complete national coverage across Egypt's 27 governorates with 5,000+ partners",
      methodology: "Geographic Information Systems mapping of service delivery points combined with population density analysis and accessibility metrics.",
      dataSource: "Partner Network Database + Government Administrative Records + Field Operations",
      interpretation: "100% governorate coverage with 87% average population accessibility represents unmatched humanitarian reach",
      significance: "Universal coverage ensures equitable access regardless of geographic location, critical for national food security",
      benchmarks: [
        { label: "Government Social Programs", value: "22/27 governorates", status: "good" as const },
        { label: "International NGOs Average", value: "12 governorates", status: "good" as const },
        { label: "EFB Unique Achievement", value: "27/27 governorates", status: "good" as const }
      ],
      recommendations: [
        "Establish permanent centers in remote regions",
        "Enhance mobile unit coverage for nomadic populations",
        "Implement satellite monitoring for unreachable areas"
      ]
    }
  };

  const renderCurrentSection = () => {
    switch (currentSection) {
      case 'executive':
        return (
          <div className="space-y-8">
            {/* 1. COMMAND BRIEF - Executive Summary with AI Insights */}
            <section className="mb-8">
              <ExecutiveSummary metrics={calculatedMetrics || baseMetrics} />
            </section>

            {/* Toolbar with filters and export */}
            <section className="mb-6">
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <TimeRangeSelector
                  value={dateRange}
                  onChange={setDateRange}
                  className="w-auto"
                />
                <ExportMenu data={exportData} />
              </div>
            </section>

            {/* 2. EXTERNAL CONTEXT - Global & Egypt Indicators */}
            <section id="global-indicators" className="mb-12">
              <div className="mb-6">
                <h2 className="heading-lg flex items-center gap-3">
                  <Globe className="w-6 h-6 text-primary" />
                  Global & Egypt Indicators
                </h2>
                <p className="text-muted-foreground mt-2">
                  Live macro, prices, and climate signals from official sources affecting operations
                </p>
              </div>
              <GlobalSignalsSection />
            </section>

            {/* 3. STRATEGIC OVERVIEW - Key Performance Indicators */}
            <section>
              <div className="mb-6">
                <h2 className="heading-lg flex items-center gap-3">
                  <Target className="w-6 h-6 text-primary" />
                  Strategic Performance Overview
                </h2>
                <p className="text-muted-foreground mt-2">
                  Critical metrics demonstrating EFB's impact and operational excellence
                </p>
                <div className="mt-3 flex gap-2">
                  <Badge variant="outline" className="text-xs text-primary border-primary cursor-pointer hover:bg-primary/10" onClick={() => handleSectionChange('financial')}>
                    📊 View Financial Deep-Dive
                  </Badge>
                  <Badge variant="outline" className="text-xs text-success border-success cursor-pointer hover:bg-success/10" onClick={() => handleSectionChange('operational')}>
                    🚚 View Operations Details
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <MetricCard
                  title="Lives Impacted"
                  value={calculatedMetrics?.peopleServed || baseMetrics.peopleServed}
                  format="number"
                  suffix="people"
                  change="+43% CAGR"
                  trend="up"
                  icon={<Users className="w-6 h-6" />}
                  color="success"
                  description="Unique individuals reached nationwide"
                  onClick={() => setSelectedMetric(executiveMetrics.livesImpacted)}
                />

                <MetricCard
                  title="Meals Delivered"
                  value={calculatedMetrics?.mealsDelivered || baseMetrics.mealsDelivered}
                  format="number"
                  suffix="meals"
                  change="+40% YoY"
                  trend="up"
                  icon={<Target className="w-6 h-6" />}
                  color="neutral"
                  description="Total annual food assistance"
                  onClick={() => setSelectedMetric(executiveMetrics.mealsDelivered)}
                />

                <MetricCard
                  title="Cost Per Meal"
                  value={calculatedMetrics?.costPerMeal || baseMetrics.costPerMeal}
                  format="currency"
                  prefix="EGP"
                  change="83% ratio"
                  trend="stable"
                  icon={<DollarSign className="w-6 h-6" />}
                  color="warning"
                  description="All-inclusive program cost"
                  onClick={() => setSelectedMetric(executiveMetrics.costPerMeal)}
                />

                <MetricCard
                  title="Coverage"
                  value={27}
                  suffix="/27"
                  format="simple"
                  change="100% coverage"
                  trend="up"
                  icon={<Globe className="w-6 h-6" />}
                  color="danger"
                  description="Governorates reached"
                  onClick={() => setSelectedMetric(executiveMetrics.coverage)}
                />
              </div>
            </section>

            {/* 4. GROWTH ANALYSIS - Five-Year Trajectory */}
            <section>
              <div className="mb-6">
                <h2 className="heading-lg flex items-center gap-3">
                  <TrendingUp className="w-6 h-6 text-primary" />
                  Growth Trajectory & Strategic Expansion
                </h2>
                <p className="text-muted-foreground mt-2">
                  Five-year growth analysis demonstrating EFB's exceptional scale expansion and impact acceleration
                </p>
              </div>

              <GrowthTrajectoryChart />
            </section>

            {/* 5. FINANCIAL HEALTH - Comprehensive Analysis */}
            <section>
              <div className="mb-6">
                <h2 className="heading-lg flex items-center gap-3">
                  <Activity className="w-6 h-6 text-success" />
                  Financial Health Dashboard
                </h2>
                <p className="text-muted-foreground mt-2">
                  Comprehensive financial health indicators and operational efficiency metrics
                </p>
                <div className="mt-3">
                  <Badge variant="outline" className="text-xs text-primary border-primary cursor-pointer hover:bg-primary/10" onClick={() => handleSectionChange('financial')}>
                    💰 View Full Financial Analytics
                  </Badge>
                </div>
              </div>

              <ErrorBoundary>
                <FinancialHealthGrid metrics={calculatedMetrics || baseMetrics} />
              </ErrorBoundary>
            </section>

            {/* 6. OPERATIONAL PERFORMANCE - Impact Analytics */}
            <section>
              <div className="mb-6">
                <h2 className="heading-lg flex items-center gap-3">
                  <BarChart3 className="w-6 h-6 text-warning" />
                  Operational Impact Analysis
                </h2>
                <p className="text-muted-foreground mt-2">
                  Detailed performance metrics and outcome measurement across all programs
                </p>
                <div className="mt-3 flex gap-2">
                  <Badge variant="outline" className="text-xs text-success border-success cursor-pointer hover:bg-success/10" onClick={() => handleSectionChange('operational')}>
                    📦 View Operations Dashboard
                  </Badge>
                  <Badge variant="outline" className="text-xs text-warning border-warning cursor-pointer hover:bg-warning/10" onClick={() => handleSectionChange('programs')}>
                    🎯 View Programs Analytics
                  </Badge>
                </div>
              </div>

              <ImpactAnalytics metrics={calculatedMetrics || baseMetrics} />
            </section>

            {/* Executive Summary Modal */}
            {selectedMetric && (
              <MetricDetailModal
                isOpen={!!selectedMetric}
                onClose={() => setSelectedMetric(null)}
                metric={selectedMetric}
              />
            )}
          </div>
        );
      case 'financial':
        return (
          <LazyComponentWrapper>
            <LazyAdvancedFinancialAnalytics />
          </LazyComponentWrapper>
        );
      case 'operational':
        return (
          <LazyComponentWrapper>
            <LazyOperationalAnalytics />
          </LazyComponentWrapper>
        );
      case 'programs':
        return (
          <LazyComponentWrapper>
            <LazyProgramsAnalytics />
          </LazyComponentWrapper>
        );
      case 'stakeholders':
        return (
          <LazyComponentWrapper>
            <LazyStakeholderAnalytics />
          </LazyComponentWrapper>
        );
      case 'scenarios':
        return (
          <div className="space-y-8">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 bg-background border border-border rounded-lg p-4 sm:p-6">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Brain className="w-6 h-6 text-primary" />
                  </div>
                  <h2 className="text-xl lg:text-2xl font-semibold text-foreground">Advanced Scenario Modeling</h2>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed max-w-2xl">
                  Interactive econometric modeling with 89.3% forecast accuracy. Adjust 11 economic variables below to explore their impact on EFB operations.
                </p>
              </div>
              <div className="flex flex-col sm:items-end gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowModelModal(true)}
                  className="text-primary border-primary hover:bg-primary/5"
                >
                  <Info className="w-4 h-4 mr-2" />
                  Model Methodology
                </Button>
                <span className="text-xs text-muted-foreground">Last calibrated: Dec 2024</span>
              </div>
            </div>

            {/* HERO SECTION - Live Impact Metrics */}
            <section>
              <div className="mb-6">
                <div className="flex items-center justify-center gap-2 mb-4">
                  <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium text-success">Live Scenario Impact</span>
                </div>
                <h3 className="text-center text-2xl font-bold mb-2">Real-Time Projected Outcomes</h3>
                <p className="text-center text-sm text-muted-foreground max-w-3xl mx-auto">
                  These metrics update instantly as you adjust the economic variables below, showing projected impact on EFB operations
                </p>
              </div>

              {/* Primary Impact Metrics - Large Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <Card className="executive-card">
                  <CardContent className="p-6 text-center">
                    <div className="text-xs text-muted-foreground mb-2">People Served</div>
                    <div className="text-3xl font-bold text-success mb-1">
                      {formatNumber(calculatedMetrics?.peopleServed || baseMetrics.peopleServed)}
                    </div>
                    <div className="text-sm text-muted-foreground">unique individuals</div>
                  </CardContent>
                </Card>

                <Card className="executive-card">
                  <CardContent className="p-6 text-center">
                    <div className="text-xs text-muted-foreground mb-2">Meals Delivered</div>
                    <div className="text-3xl font-bold text-primary mb-1">
                      {formatNumber(calculatedMetrics?.mealsDelivered || baseMetrics.mealsDelivered)}
                    </div>
                    <div className="text-sm text-muted-foreground">annually</div>
                  </CardContent>
                </Card>

                <Card className="executive-card">
                  <CardContent className="p-6 text-center">
                    <div className="text-xs text-muted-foreground mb-2">Cost Per Meal</div>
                    <div className="text-3xl font-bold text-warning mb-1">
                      {formatCurrency(calculatedMetrics?.costPerMeal || baseMetrics.costPerMeal)}
                    </div>
                    <div className="text-sm text-muted-foreground">EGP per meal</div>
                  </CardContent>
                </Card>

                <Card className="executive-card">
                  <CardContent className="p-6 text-center">
                    <div className="text-xs text-muted-foreground mb-2">Operating Margin</div>
                    <div className={cn(
                      "text-3xl font-bold mb-1",
                      (((calculatedMetrics?.revenue || baseMetrics.revenue) - (calculatedMetrics?.expenses || baseMetrics.expenses)) / (calculatedMetrics?.revenue || baseMetrics.revenue)) * 100 > 0
                        ? "text-success"
                        : "text-danger"
                    )}>
                      {formatPercentage((((calculatedMetrics?.revenue || baseMetrics.revenue) - (calculatedMetrics?.expenses || baseMetrics.expenses)) / (calculatedMetrics?.revenue || baseMetrics.revenue)) * 100)}
                    </div>
                    <div className="text-sm text-muted-foreground">revenue margin</div>
                  </CardContent>
                </Card>
              </div>

              {/* Change Metrics Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
                <div className="text-center p-3 bg-muted/40 rounded-lg border border-border">
                  <div className={cn("text-2xl font-bold transition-all duration-200",
                    (calculatedMetrics?.revenueChange || 0) > 0 ? "text-success" : "text-danger"
                  )}>
                    {(calculatedMetrics?.revenueChange || 0) > 0 ? '+' : ''}{(calculatedMetrics?.revenueChange || 0).toFixed(1)}%
                  </div>
                  <div className="text-xs text-muted-foreground font-medium mt-1">Revenue Δ</div>
                </div>

                <div className="text-center p-3 bg-muted/40 rounded-lg border border-border">
                  <div className={cn("text-2xl font-bold transition-all duration-200",
                    Math.abs(calculatedMetrics?.demandChange || 0) < 5 ? "text-success" : "text-warning"
                  )}>
                    {(calculatedMetrics?.demandChange || 0) > 0 ? '+' : ''}{(calculatedMetrics?.demandChange || 0).toFixed(1)}%
                  </div>
                  <div className="text-xs text-muted-foreground font-medium mt-1">Demand Δ</div>
                </div>

                <div className="text-center p-3 bg-muted/40 rounded-lg border border-border">
                  <div className={cn("text-2xl font-bold transition-all duration-200",
                    (calculatedMetrics?.costChange || 0) < 0 ? "text-success" : "text-danger"
                  )}>
                    {(calculatedMetrics?.costChange || 0) > 0 ? '+' : ''}{(calculatedMetrics?.costChange || 0).toFixed(1)}%
                  </div>
                  <div className="text-xs text-muted-foreground font-medium mt-1">Cost Δ</div>
                </div>

                <div className="text-center p-3 bg-muted/40 rounded-lg border border-border">
                  <div className={cn("text-2xl font-bold transition-all duration-200",
                    (calculatedMetrics?.efficiencyChange || 0) > 0 ? "text-success" : "text-danger"
                  )}>
                    {(calculatedMetrics?.efficiencyChange || 0) > 0 ? '+' : ''}{(calculatedMetrics?.efficiencyChange || 0).toFixed(1)}%
                  </div>
                  <div className="text-xs text-muted-foreground font-medium mt-1">Efficiency Δ</div>
                </div>

                {calculatedMetrics?.reserveChange !== undefined && (
                  <div className="text-center p-3 bg-muted/40 rounded-lg border border-border">
                    <div className={cn("text-2xl font-bold transition-all duration-200",
                      calculatedMetrics?.reserveChange > 0 ? "text-success" : "text-danger"
                    )}>
                      {calculatedMetrics?.reserveChange > 0 ? '+' : ''}{calculatedMetrics?.reserveChange.toFixed(1)}%
                    </div>
                    <div className="text-xs text-muted-foreground font-medium mt-1">Reserves Δ</div>
                  </div>
                )}

                {calculatedMetrics?.cashChange !== undefined && (
                  <div className="text-center p-3 bg-muted/40 rounded-lg border border-border">
                    <div className={cn("text-2xl font-bold transition-all duration-200",
                      calculatedMetrics?.cashChange > 0 ? "text-success" : "text-danger"
                    )}>
                      {calculatedMetrics?.cashChange > 0 ? '+' : ''}{calculatedMetrics?.cashChange.toFixed(1)}%
                    </div>
                    <div className="text-xs text-muted-foreground font-medium mt-1">Cash Δ</div>
                  </div>
                )}

                {calculatedMetrics?.mealsChange !== undefined && (
                  <div className="text-center p-3 bg-muted/40 rounded-lg border border-border">
                    <div className={cn("text-2xl font-bold transition-all duration-200",
                      calculatedMetrics?.mealsChange > 0 ? "text-success" : "text-danger"
                    )}>
                      {calculatedMetrics?.mealsChange > 0 ? '+' : ''}{calculatedMetrics?.mealsChange.toFixed(1)}%
                    </div>
                    <div className="text-xs text-muted-foreground font-medium mt-1">Meals Δ</div>
                  </div>
                )}
              </div>
            </section>

            {/* Economic Variables Controls */}
            <section>
              <div className="mb-6">
                <h3 className="text-xl font-bold mb-2">Economic Variables</h3>
                <p className="text-sm text-muted-foreground">
                  Adjust the 11 variables below to model different economic scenarios and their impact on operations
                </p>
              </div>

              <LazyComponentWrapper>
                <LazyScenarioAnalysis
                  factors={scenarioFactors}
                  onFactorChange={updateScenario}
                />
              </LazyComponentWrapper>
            </section>
          </div>
        );
      default:
        return <ProgrammaticAnalysis />;
    }
  };

  const dashboardMetrics = {
    peopleServed: calculatedMetrics?.peopleServed || baseMetrics.peopleServed,
    mealsDelivered: calculatedMetrics?.mealsDelivered || baseMetrics.mealsDelivered,
    costPerMeal: calculatedMetrics?.costPerMeal || baseMetrics.costPerMeal,
    coverage: 27
  };

  const keyboardShortcuts = [
    { key: '1', meta: true, description: 'Executive Dashboard', action: () => handleSectionChange('executive') },
    { key: '2', meta: true, description: 'Financial Analytics', action: () => handleSectionChange('financial') },
    { key: '3', meta: true, description: 'Operations', action: () => handleSectionChange('operational') },
    { key: '4', meta: true, description: 'Programs', action: () => handleSectionChange('programs') },
    { key: '5', meta: true, description: 'Stakeholders', action: () => handleSectionChange('stakeholders') },
    { key: '6', meta: true, description: 'Scenarios', action: () => handleSectionChange('scenarios') }
  ];

  useKeyboardShortcuts(keyboardShortcuts);

  const exportData = prepareMetricsForExport(calculatedMetrics || baseMetrics);

  return (
    <>
      <DashboardLayout
        metrics={dashboardMetrics}
        currentSection={currentSection}
        onSectionChange={handleSectionChange}
        sidebar={
          <ReportNavigation
            currentSection={currentSection}
            onSectionChange={handleSectionChange}
          />
        }
      >
      
      {isLoading ? (
        <PageLoadingSkeleton />
      ) : (
        renderCurrentSection()
      )}

      {selectedMetric && (
        <MetricDetailModal 
          isOpen={!!selectedMetric}
          onClose={() => setSelectedMetric(null)}
          metric={selectedMetric}
        />
      )}

      <ScenarioModelModal 
        isOpen={showModelModal}
        onClose={() => setShowModelModal(false)}
      />
      </DashboardLayout>
      <MobileBottomNav
        currentSection={currentSection}
        onSectionChange={handleSectionChange}
      />
    </>
  );
});

ExecutiveDashboard.displayName = 'ExecutiveDashboard';

export { ExecutiveDashboard };