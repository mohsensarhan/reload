const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

const donationsQuery = {
  database: 2,
  type: "native",
  native: {
    query: `SELECT
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

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const metabaseApiKey = Deno.env.get('METABASE_API_KEY');
    
    if (!metabaseApiKey) {
      console.error('METABASE_API_KEY not found');
      return new Response(JSON.stringify({ error: 'API key not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Fetching donations from Metabase...');
    
    const response = await fetch('https://metabase.efb.eg/api/dataset', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-KEY': metabaseApiKey,
      },
      body: JSON.stringify(donationsQuery),
    });

    if (!response.ok) {
      console.error('Metabase API error:', response.status, response.statusText);
      const errorText = await response.text();
      console.error('Error details:', errorText);
      return new Response(JSON.stringify({ error: 'Failed to fetch from Metabase' }), {
        status: response.status,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const data = await response.json();
    console.log('Successfully fetched donations:', data.data?.rows?.length || 0, 'records');

    // Transform the data to match our DonationRecord interface
    const donations = data.data?.rows?.map((row: any[]) => ({
      id: row[0],
      amount_egp: row[1] || 0,
      amount_usd: row[2] || 0,
      currency: row[3],
      date: row[4],
      status: row[5],
      user_email: row[6],
      user_phonenumber: row[7],
      user_fullname: row[8],
      token_name: row[9],
      program_id: row[10],
      user_id: row[11],
      subscription_id: row[12],
      collection_date: row[13],
      payment_type: row[14],
      address: row[15],
      city: row[16],
      client_country: row[17],
      client_ip: row[18],
      card_country: row[19],
      conversion_rate: row[20],
      type_id: row[21],
      special_donation_id: row[22],
      payment_code: row[23],
      payment_message: row[24],
      payment_option: row[25],
      cash_source_id: row[26],
      dedication_message: row[27],
      honoree_email: row[28],
      honoree_name: row[29],
      isDedicated: row[30],
      circle_id: row[31],
    })) || [];

    return new Response(JSON.stringify(donations), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in donations-proxy function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});