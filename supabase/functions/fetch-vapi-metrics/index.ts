import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { apiKey } = await req.json();

    if (!apiKey) {
      console.error('Missing VAPI API key');
      return new Response(
        JSON.stringify({ error: 'Missing VAPI API key' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    console.log('Fetching VAPI metrics...');
    
    const timeRange = {
      start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      end: new Date().toISOString(),
      timezone: "UTC"
    };

    const response = await fetch('https://api.vapi.ai/analytics', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        queries: [{
          name: "call_metrics",
          table: "call",
          timeRange,
          operations: [
            { operation: "count", column: "id" },
            { operation: "sum", column: "duration" },
            { operation: "avg", column: "duration" },
            { operation: "sum", column: "cost" },
            { operation: "avg", column: "cost" }
          ]
        }]
      })
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('VAPI Analytics API error:', JSON.stringify(error, null, 2));
      throw new Error(Array.isArray(error.message) ? error.message.join(', ') : error.message);
    }

    const data = await response.json();
    console.log('VAPI Metrics Response:', JSON.stringify(data, null, 2));

    return new Response(
      JSON.stringify(data),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error('Error in fetch-vapi-metrics:', error);
    return new Response(
      JSON.stringify({ error: error.message, details: {} }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});