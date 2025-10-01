import React, { useEffect } from 'react';
import { TriangleAlert as AlertTriangle, TrendingUp, Users, Zap, Rocket, Heart, Package, DollarSign, Globe, Shield, Target } from 'lucide-react';
import { NarrativeSection, NarrativeMetric } from './NarrativeSection';
import { ANNUAL_REPORT_FY2024_25 } from '@/data/annualReportData';
import { formatNumber, formatCurrency, formatPercentage } from '@/lib/formatters';
import { useNarrativeNavigation } from '@/hooks/useNarrativeNavigation';
import { KeyboardShortcutsHelp } from './KeyboardShortcutsHelp';

export function NarrativeDashboard() {
  const data = ANNUAL_REPORT_FY2024_25;
  const { shortcuts } = useNarrativeNavigation(true);

  useEffect(() => {
    document.documentElement.style.scrollBehavior = 'smooth';
    return () => {
      document.documentElement.style.scrollBehavior = 'auto';
    };
  }, []);

  return (
    <div className="space-y-12 px-4 md:px-6 lg:px-8 pt-24 md:pt-32">
      <KeyboardShortcutsHelp shortcuts={shortcuts} />

      <NarrativeSection
        act="crisis"
        actNumber={1}
        title="The Crisis"
        subtitle="Understanding Food Insecurity in Egypt"
        description="In a nation of 104 million, food insecurity remains a critical challenge affecting millions of families. Understanding the scope and severity of this crisis is the first step toward building sustainable solutions."
        icon={AlertTriangle}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <NarrativeMetric
            title="Severe Food Insecurity"
            value="31% → 18%"
            description="Reduction in severe food insecurity through targeted intervention programs and community support systems"
            trend={{ value: 42, label: 'improvement since baseline', direction: 'down' }}
            icon={AlertTriangle}
          />
          <NarrativeMetric
            title="Child Stunting Rate"
            value="21% → 13%"
            description="Dramatic reduction in stunting through nutritional programs addressing critical early childhood development periods"
            trend={{ value: 38, label: 'reduction achieved', direction: 'down' }}
            icon={Heart}
          />
          <NarrativeMetric
            title="Moderate Insecurity"
            value="45% → 35%"
            description="Progress in reducing moderate food insecurity across vulnerable populations through sustained assistance"
            trend={{ value: 22, label: 'improvement rate', direction: 'down' }}
            icon={TrendingUp}
          />
        </div>
      </NarrativeSection>

      <NarrativeSection
        act="response"
        actNumber={2}
        title="The Response"
        subtitle="Building Egypt's Largest Food Security Network"
        description="Through strategic programs and partnerships, EFB has built a comprehensive response infrastructure capable of delivering meals at unprecedented scale while maintaining quality and dignity for every beneficiary."
        icon={Package}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <NarrativeMetric
            title="Total Meals Distributed"
            value={formatNumber(data.keyMetrics.totalMealsDistributed)}
            description="Annual meal distribution across all programs reaching millions of beneficiaries nationwide"
            icon={Package}
          />
          <NarrativeMetric
            title="Hot Meals Program"
            value={formatNumber(data.programBreakdown.hotMeals.meals)}
            description="Daily hot meals providing immediate nutrition to vulnerable communities"
            trend={{ value: data.programBreakdown.hotMeals.percentage * 100, label: 'of total distribution', direction: 'up' }}
            icon={Heart}
          />
          <NarrativeMetric
            title="Food Baskets Delivered"
            value={formatNumber(data.programBreakdown.foodBaskets.baskets)}
            description="Monthly food baskets supporting family self-sufficiency and food security"
            icon={Package}
          />
          <NarrativeMetric
            title="Bakery Network"
            value={`${formatNumber(data.programBreakdown.bakeries.loaves / 1_000_000)}M loaves`}
            description="Fresh bread delivered daily through community bakery partnerships"
            icon={Package}
          />
        </div>
      </NarrativeSection>

      <NarrativeSection
        act="impact"
        actNumber={3}
        title="The Impact"
        subtitle="Transforming Lives at Scale"
        description="Our programs have created measurable, lasting impact across nutrition, health, and community resilience. These outcomes represent millions of individual stories of hope and transformation."
        icon={Users}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <NarrativeMetric
            title="People Served"
            value={formatNumber(data.keyMetrics.totalBeneficiaries)}
            description="Individual beneficiaries reached across all program modalities representing 4.8% of Egypt's population"
            icon={Users}
          />
          <NarrativeMetric
            title="Daily Calorie Intake"
            value={`${formatNumber(data.impactMetrics.nutritionalStatus.dailyCalorieIntake)} kcal`}
            description="Average daily calorie intake achieved through program participation meeting WHO standards"
            icon={Heart}
          />
          <NarrativeMetric
            title="Protein Intake"
            value={`${data.impactMetrics.nutritionalStatus.proteinIntakeGrams}g`}
            description="Daily protein intake meeting nutritional requirements for healthy development and wellbeing"
            icon={Heart}
          />
          <NarrativeMetric
            title="Micronutrient Adequacy"
            value={formatPercentage(data.impactMetrics.nutritionalStatus.micronutrientAdequacy * 100)}
            description="Beneficiaries meeting micronutrient requirements through fortified meal programs"
            icon={Shield}
          />
          <NarrativeMetric
            title="Geographic Reach"
            value={`${data.geographicDistribution.totalGovernorates} Governorates`}
            description="Nationwide presence with distribution centers and kitchens across urban and rural areas"
            icon={Globe}
          />
          <NarrativeMetric
            title="Beneficiary Satisfaction"
            value={formatPercentage(data.stakeholderEngagement.beneficiarySatisfaction * 100)}
            description="Program satisfaction demonstrating quality service delivery and dignity preservation"
            icon={Heart}
          />
        </div>
      </NarrativeSection>

      <NarrativeSection
        act="machine"
        actNumber={4}
        title="The Machine"
        subtitle="Operational Excellence Through Technology"
        description="Behind every meal is a sophisticated operational infrastructure combining traditional humanitarian values with cutting-edge technology to achieve unprecedented efficiency and accountability."
        icon={Zap}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <NarrativeMetric
            title="Cost Per Meal"
            value={`EGP ${data.keyMetrics.costPerMeal}`}
            description="Industry-leading efficiency delivering maximum impact per donor contribution"
            trend={{ value: 70, label: 'below global average', direction: 'down' }}
            icon={DollarSign}
          />
          <NarrativeMetric
            title="Program Efficiency"
            value={formatPercentage(data.keyMetrics.programEfficiencyRatio * 100)}
            description="Direct program spending ratio significantly exceeding sector standards"
            icon={Target}
          />
          <NarrativeMetric
            title="Digital Adoption"
            value={formatPercentage(data.digitalTransformation.onlineDonationPercentage * 100)}
            description="Online donation transactions demonstrating successful digital transformation"
            icon={Zap}
          />
          <NarrativeMetric
            title="System Uptime"
            value={formatPercentage(data.digitalTransformation.systemUptime * 100)}
            description="Technology platform reliability ensuring continuous operations"
            icon={Shield}
          />
          <NarrativeMetric
            title="Mobile App Users"
            value={formatNumber(data.digitalTransformation.mobileAppUsers)}
            description="Active users on beneficiary and donor mobile platforms"
            icon={Zap}
          />
          <NarrativeMetric
            title="Blockchain Transactions"
            value={formatNumber(data.digitalTransformation.blockchainTransactions)}
            description="Transparent transactions tracked on blockchain for accountability"
            icon={Shield}
          />
          <NarrativeMetric
            title="Volunteer Network"
            value={formatNumber(data.operationalMetrics.volunteers)}
            description="Active volunteers powering community engagement and last-mile delivery"
            icon={Users}
          />
          <NarrativeMetric
            title="Donor Retention"
            value={formatPercentage(data.stakeholderEngagement.donorRetentionRate * 100)}
            description="Donor loyalty demonstrating trust and sustained support"
            icon={Heart}
          />
        </div>
      </NarrativeSection>

      <NarrativeSection
        act="future"
        actNumber={5}
        title="The Future"
        subtitle="Scaling Impact for Tomorrow"
        description="Building on proven success, our strategic vision targets ambitious expansion while maintaining operational excellence. These goals represent not just growth, but sustainable transformation of Egypt's food security landscape."
        icon={Rocket}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <NarrativeMetric
            title="2025 Target: Beneficiaries"
            value={formatNumber(data.strategicGoals2025.targetBeneficiaries)}
            description="Projected reach by FY2025 representing 25% increase through strategic scaling"
            trend={{ value: 25, label: 'growth target', direction: 'up' }}
            icon={Users}
          />
          <NarrativeMetric
            title="2025 Target: Meals"
            value={formatNumber(data.strategicGoals2025.targetMeals)}
            description="Annual meal distribution goal requiring operational expansion and partnerships"
            trend={{ value: 27, label: 'capacity increase', direction: 'up' }}
            icon={Package}
          />
          <NarrativeMetric
            title="Digital Adoption Goal"
            value={formatPercentage(data.strategicGoals2025.digitalAdoptionTarget * 100)}
            description="Target digital transaction percentage through enhanced platforms"
            trend={{ value: 25, label: 'digital growth', direction: 'up' }}
            icon={Zap}
          />
          <NarrativeMetric
            title="Volunteer Expansion"
            value={formatNumber(data.strategicGoals2025.targetVolunteers)}
            description="Growing community engagement network for expanded reach"
            trend={{ value: 21, label: 'volunteer growth', direction: 'up' }}
            icon={Users}
          />
          <NarrativeMetric
            title="Sustainability Goals"
            value="4 pillars"
            description="Local sourcing, renewable energy, waste reduction, and carbon footprint programs"
            icon={Globe}
          />
          <NarrativeMetric
            title="Innovation Pipeline"
            value="6 initiatives"
            description="AI-powered logistics, predictive analytics, blockchain expansion, and smart warehousing"
            icon={Rocket}
          />
        </div>
      </NarrativeSection>
    </div>
  );
}
