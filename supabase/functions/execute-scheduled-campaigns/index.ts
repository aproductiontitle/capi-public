import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';
import { CampaignProcessor } from './campaignProcessor.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  const requestId = crypto.randomUUID();
  console.log(`[${requestId}] Starting campaign execution request`);

  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { campaignId } = await req.json();
    
    if (!campaignId) {
      throw new Error('Campaign ID is required');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log(`[${requestId}] Processing campaign ${campaignId}`);

    // Get campaign details with assistant info
    const { data: campaign, error: campaignError } = await supabase
      .from('campaigns')
      .select(`
        *,
        assistant:assistants (
          id,
          name,
          vapi_assistant_id,
          system_prompt
        )
      `)
      .eq('id', campaignId)
      .single();

    if (campaignError || !campaign) {
      console.error(`[${requestId}] Error fetching campaign:`, campaignError);
      throw campaignError || new Error('Campaign not found');
    }

    // Log campaign details
    console.log(`[${requestId}] Campaign details:`, {
      name: campaign.name,
      status: campaign.status,
      assistantId: campaign.assistant?.vapi_assistant_id
    });

    const processor = new CampaignProcessor(supabaseUrl, supabaseKey);
    
    // Process campaign with enhanced error handling
    const result = await processor.processCampaign(campaign);

    console.log(`[${requestId}] Campaign processing completed:`, {
      campaignId,
      success: true,
      timestamp: new Date().toISOString()
    });

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Campaign execution initiated successfully',
        requestId,
        details: result
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );

  } catch (error) {
    console.error(`[${requestId}] Campaign execution error:`, {
      error: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });

    return new Response(
      JSON.stringify({ 
        error: error.message,
        requestId,
        timestamp: new Date().toISOString()
      }),
      { 
        status: 500,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        }
      }
    );
  }
});