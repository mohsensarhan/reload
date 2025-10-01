const METABASE_BASE_URL = 'https://metabase.efb.eg/api/dataset';
const API_KEY = 'mb_sHE6esfIczSKfmXf2ecgb1ZwGr8EsUUrVJ2Y1ArFES8=';

export interface DonationRecord {
  id: number;
  amount_egp: number;
  amount_usd: number;
  currency: string;
  date: string;
  status: string;
  user_email: string;
  user_phonenumber: string;
  user_fullname: string;
  token_name: string;
  program_id: number;
  user_id: number;
  subscription_id: number;
  collection_date: string;
  payment_type: string;
  address: string;
  city: string;
  client_country: string;
  client_ip: string;
  card_country: string;
  conversion_rate: number;
  type_id: number;
  special_donation_id: number;
  payment_code: string;
  payment_message: string;
  payment_option: string;
  cash_source_id: number;
  dedication_message: string;
  honoree_email: string;
  honoree_name: string;
  isDedicated: boolean;
  circle_id: number;
}

export interface DonationsResponse {
  data: {
    rows: any[][];
    cols: Array<{
      name: string;
      display_name: string;
      base_type: string;
    }>;
  };
}

const donationsQuery = {
  "database": 2,
  "type": "native",
  "native": {
    "query": `SELECT
  "public"."payment_donation"."id" AS "id",
  "public"."payment_donation"."amount_egp" AS "amount_egp",
  "public"."payment_donation"."amount_usd" AS "amount_usd",
  "public"."payment_donation"."currency" AS "currency",
  "public"."payment_donation"."date" AS "date",
  "public"."payment_donation"."status" AS "status",
  "public"."payment_donation"."user_email" AS "user_email",
  "public"."payment_donation"."user_phonenumber" AS "user_phonenumber",
  "public"."payment_donation"."user_fullname" AS "user_fullname",
  "public"."payment_donation"."token_name" AS "token_name",
  "public"."payment_donation"."program_id" AS "program_id",
  "public"."payment_donation"."user_id" AS "user_id",
  "public"."payment_donation"."subscription_id" AS "subscription_id",
  "public"."payment_donation"."collection_date" AS "collection_date",
  "public"."payment_donation"."payment_type" AS "payment_type",
  "public"."payment_donation"."address" AS "address",
  "public"."payment_donation"."city" AS "city",
  "public"."payment_donation"."client_country" AS "client_country",
  "public"."payment_donation"."client_ip" AS "client_ip",
  "public"."payment_donation"."card_country" AS "card_country",
  "public"."payment_donation"."conversion_rate" AS "conversion_rate",
  "public"."payment_donation"."type_id" AS "type_id",
  "public"."payment_donation"."special_donation_id" AS "special_donation_id",
  "public"."payment_donation"."payment_code" AS "payment_code",
  "public"."payment_donation"."payment_message" AS "payment_message",
  "public"."payment_donation"."payment_option" AS "payment_option",
  "public"."payment_donation"."cash_source_id" AS "cash_source_id",
  "public"."payment_donation"."dedication_message" AS "dedication_message",
  "public"."payment_donation"."honoree_email" AS "honoree_email",
  "public"."payment_donation"."honoree_name" AS "honoree_name",
  "public"."payment_donation"."isDedicated" AS "isDedicated",
  "public"."payment_donation"."circle_id" AS "circle_id"
FROM
  "public"."payment_donation"
WHERE 
  "public"."payment_donation"."status" = 'paid'
  AND "public"."payment_donation"."date" >= NOW() - INTERVAL '12 months'
ORDER BY
  "public"."payment_donation"."date" DESC
LIMIT
  5000`
  }
};

export async function fetchDonations(): Promise<DonationRecord[]> {
  try {
    console.log('Fetching donations via backend proxy...');
    
    // Use the Supabase edge function proxy instead of direct Metabase call
    const response = await fetch(`https://78847321-0b8b-49c7-aeb1-aaf43b5b5ddf.supabase.co/functions/v1/donations-proxy`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.error('Proxy API error:', response.status, response.statusText);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const donations: DonationRecord[] = await response.json();
    console.log('Fetched donations via proxy:', donations.length);
    return donations;
  } catch (error) {
    console.error('Error fetching donations via proxy:', error);
    
    // Return mock data when backend is unavailable
    console.log('Falling back to mock donation data');
    return generateMockDonationData();
  }
}

// Mock data generator for development/demo purposes
function generateMockDonationData(): DonationRecord[] {
  const mockData: DonationRecord[] = [];
  const startDate = new Date('2024-01-01');
  const endDate = new Date();
  
  // Generate more realistic seasonal donation patterns
  for (let i = 0; i < 2500; i++) {
    const randomDate = new Date(startDate.getTime() + Math.random() * (endDate.getTime() - startDate.getTime()));
    const month = randomDate.getMonth();
    
    // Seasonal patterns - higher donations during Ramadan (around March-April) and end of year
    let seasonalMultiplier = 1;
    if (month === 2 || month === 3) seasonalMultiplier = 2.5; // Ramadan season
    if (month === 11) seasonalMultiplier = 1.8; // End of year giving
    if (month === 6 || month === 7) seasonalMultiplier = 0.7; // Summer slowdown
    
    // More realistic donation amounts with proper distribution
    const donationType = Math.random();
    let baseAmount;
    
    if (donationType < 0.6) {
      // 60% small donations (50-300 EGP)
      baseAmount = 50 + Math.random() * 250;
    } else if (donationType < 0.85) {
      // 25% medium donations (300-1000 EGP)
      baseAmount = 300 + Math.random() * 700;
    } else if (donationType < 0.95) {
      // 10% large donations (1000-5000 EGP)
      baseAmount = 1000 + Math.random() * 4000;
    } else {
      // 5% major donations (5000-25000 EGP)
      baseAmount = 5000 + Math.random() * 20000;
    }
    
    const finalAmount = baseAmount * seasonalMultiplier;
    
    mockData.push({
      id: i + 1,
      amount_egp: Number(finalAmount.toFixed(2)),
      amount_usd: Number((finalAmount / 31.2).toFixed(2)), // Current EGP/USD rate
      currency: 'EGP',
      date: randomDate.toISOString(),
      status: 'paid',
      user_email: `donor${i}@example.com`,
      user_phonenumber: `+201${String(Math.floor(Math.random() * 100000000)).padStart(8, '0')}`,
      user_fullname: `Donor ${i + 1}`,
      token_name: 'donation_token',
      program_id: Math.floor(Math.random() * 5) + 1,
      user_id: i + 1,
      subscription_id: Math.random() > 0.8 ? Math.floor(Math.random() * 100) + 1 : 0, // 20% recurring
      collection_date: randomDate.toISOString(),
      payment_type: Math.random() > 0.7 ? 'card' : 'bank_transfer',
      address: 'Mock Address',
      city: ['Cairo', 'Alexandria', 'Giza', 'Luxor', 'Aswan'][Math.floor(Math.random() * 5)],
      client_country: 'Egypt',
      client_ip: '192.168.1.1',
      card_country: 'Egypt',
      conversion_rate: 31.2,
      type_id: 1,
      special_donation_id: Math.random() > 0.9 ? Math.floor(Math.random() * 10) + 1 : 0,
      payment_code: 'SUCCESS',
      payment_message: 'Payment successful',
      payment_option: Math.random() > 0.6 ? 'card' : 'bank',
      cash_source_id: 0,
      dedication_message: Math.random() > 0.85 ? 'In memory of...' : '',
      honoree_email: '',
      honoree_name: '',
      isDedicated: Math.random() > 0.85,
      circle_id: Math.random() > 0.7 ? Math.floor(Math.random() * 5) + 1 : 0
    });
  }
  
  return mockData;
}

// Helper function to aggregate donations by month
export function aggregateDonationsByMonth(donations: DonationRecord[]) {
  const monthlyData = donations.reduce((acc, donation) => {
    const date = new Date(donation.date);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    
    if (!acc[monthKey]) {
      acc[monthKey] = {
        month: monthKey,
        totalEGP: 0,
        totalUSD: 0,
        count: 0,
        date: new Date(date.getFullYear(), date.getMonth(), 1)
      };
    }
    
    acc[monthKey].totalEGP += donation.amount_egp || 0;
    acc[monthKey].totalUSD += donation.amount_usd || 0;
    acc[monthKey].count += 1;
    
    return acc;
  }, {} as Record<string, any>);

  return Object.values(monthlyData).sort((a: any, b: any) => a.date - b.date);
}