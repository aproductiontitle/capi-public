import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { error, metadata } = await req.json();
    
    if (!error || !metadata?.contactId) {
      throw new Error('Missing required error information or contact ID');
    }

    console.log('VAPI Error received:', { error, metadata });

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing Supabase configuration');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Update the campaign contact with the error information
    const { error: updateError } = await supabase
      .from('campaign_contacts')
      .update({
        status: 'failed',
        last_error: error.message || 'Unknown VAPI error',
        call_ended_at: new Date().toISOString()
      })
      .eq('id', metadata.contactId);

    if (updateError) {
      console.error('Error updating campaign contact:', updateError);
      throw updateError;
    }

    console.log('Campaign contact updated successfully');

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in vapi-error function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});