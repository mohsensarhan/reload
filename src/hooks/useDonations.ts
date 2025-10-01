import { useQuery } from '@tanstack/react-query';
import { fetchDonations, aggregateDonationsByMonth, DonationRecord } from '@/lib/feeds/metabase';

export function useDonations() {
  const {
    data: rawDonations,
    isLoading,
    isError,
    error,
    refetch
  } = useQuery<DonationRecord[], Error>({
    queryKey: ['donations'],
    queryFn: fetchDonations,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  // Process and aggregate the data
  const monthlyData = rawDonations ? aggregateDonationsByMonth(rawDonations) : [];
  
  // Calculate summary metrics
  const totalDonationsEGP = rawDonations ? rawDonations.reduce((sum, donation) => sum + (donation.amount_egp || 0), 0) : 0;
  const totalDonationsUSD = rawDonations ? rawDonations.reduce((sum, donation) => sum + (donation.amount_usd || 0), 0) : 0;
  const totalDonors = rawDonations ? rawDonations.length : 0;
  const avgDonationEGP = totalDonors > 0 ? totalDonationsEGP / totalDonors : 0;

  // Recent trends
  const latestMonth = monthlyData[monthlyData.length - 1];
  const previousMonth = monthlyData[monthlyData.length - 2];
  const monthlyGrowthRate = latestMonth && previousMonth 
    ? ((latestMonth.totalEGP - previousMonth.totalEGP) / previousMonth.totalEGP) * 100 
    : 0;

  return {
    // Raw data
    donations: rawDonations || [],
    
    // Processed data
    monthlyData,
    
    // Summary metrics
    totalDonationsEGP,
    totalDonationsUSD,
    totalDonors,
    avgDonationEGP,
    monthlyGrowthRate,
    
    // Query state
    isLoading,
    isError,
    error,
    refetch,
    
    // Helper flags
    hasData: !!(rawDonations && rawDonations.length > 0),
  };
}