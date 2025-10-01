export const ANNUAL_REPORT_FY2024_25 = {
  fiscalYear: '2024/2025',
  reportingPeriod: {
    start: '2024-07-01',
    end: '2025-06-30',
  },

  keyMetrics: {
    totalMealsDistributed: 367_500_000,
    totalBeneficiaries: 4_960_000,
    costPerMeal: 6.36,
    totalProgramExpenditure: 2_337_300_000,
    administrativeEfficiency: 0.94,
    programEfficiencyRatio: 0.94,
    fundraisingEfficiency: 0.98,
  },

  impactMetrics: {
    stuntingReduction: {
      baseline: 0.21,
      current: 0.13,
      reduction: 0.38,
    },
    foodSecurityImprovement: {
      severeInsecurity: {
        baseline: 0.31,
        current: 0.18,
        reduction: 0.42,
      },
      moderateInsecurity: {
        baseline: 0.45,
        current: 0.35,
        reduction: 0.22,
      },
    },
    nutritionalStatus: {
      dailyCalorieIntake: 2100,
      proteinIntakeGrams: 65,
      micronutrientAdequacy: 0.82,
    },
  },

  programBreakdown: {
    hotMeals: {
      meals: 147_000_000,
      beneficiaries: 1_980_000,
      percentage: 0.40,
    },
    foodBaskets: {
      baskets: 8_400_000,
      beneficiaries: 2_520_000,
      percentage: 0.35,
      mealsPerBasket: 30,
    },
    bakeries: {
      loaves: 2_100_000_000,
      beneficiaries: 420_000,
      percentage: 0.15,
    },
    seasonalRamadan: {
      meals: 36_750_000,
      beneficiaries: 1_050_000,
      percentage: 0.10,
    },
  },

  geographicDistribution: {
    urbanAreas: {
      beneficiaries: 2_976_000,
      percentage: 0.60,
      governorates: ['Cairo', 'Giza', 'Alexandria', 'Qalyubia'],
    },
    ruralAreas: {
      beneficiaries: 1_984_000,
      percentage: 0.40,
      governorates: ['Minya', 'Assiut', 'Sohag', 'Qena', 'Aswan', 'Luxor'],
    },
    totalGovernorates: 27,
    distributionCenters: 156,
    kitchens: 42,
  },

  financialData: {
    totalRevenue: 2_450_000_000,
    totalExpenditure: 2_337_300_000,
    revenueBySource: {
      individualDonations: 1_225_000_000,
      corporatePartnerships: 735_000_000,
      governmentGrants: 367_500_000,
      internationalDonors: 122_500_000,
    },
    expenditureByCategory: {
      programCosts: 2_197_062_000,
      administrativeCosts: 140_238_000,
      fundraisingCosts: 0,
    },
  },

  operationalMetrics: {
    volunteers: 12_400,
    fullTimeStaff: 1_240,
    partnerOrganizations: 86,
    warehouseFacilities: 18,
    transportVehicles: 124,
    averageDailyMeals: 1_006_849,
  },

  digitalTransformation: {
    beneficiaryDatabaseSize: 4_960_000,
    mobileAppUsers: 892_800,
    onlineDonationPercentage: 0.68,
    blockchainTransactions: 148_800,
    dataAccuracyRate: 0.96,
    systemUptime: 0.998,
  },

  sustainabilityMetrics: {
    foodWasteReduction: 0.15,
    localSourcing: 0.78,
    renewableEnergy: 0.42,
    carbonFootprintReduction: 0.23,
    packagingRecycling: 0.85,
  },

  stakeholderEngagement: {
    beneficiarySatisfaction: 0.91,
    donorRetentionRate: 0.84,
    volunteerRetentionRate: 0.78,
    communityPartnership: 86,
    mediaReach: 45_000_000,
  },

  strategicGoals2025: {
    targetBeneficiaries: 6_200_000,
    targetMeals: 465_000_000,
    targetGovernorates: 27,
    targetVolunteers: 15_000,
    digitalAdoptionTarget: 0.85,
  },
};
