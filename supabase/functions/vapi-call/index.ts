import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const MAX_RETRIES = 3;

const logError = async (supabase: any, error: Error, context: any) => {
  console.error('Error:', error.message, 'Context:', context);
  
  // You could create a separate table for error logging if needed
  // For now, we'll just log to console and update the campaign contact
  if (context.contactId) {
    await supabase
      .from('campaign_contacts')
      .update({
        status: 'failed',
        last_error: `${error.message} (${context.action || 'unknown action'})`
      })
      .eq('id', context.contactId);
  }
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  let supabase;

  try {
    const { phoneNumber, campaignId, assistantId } = await req.json();

    if (!phoneNumber || !campaignId || !assistantId) {
      throw new Error('Missing required parameters: phoneNumber, campaignId, or assistantId');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing Supabase configuration');
    }

    supabase = createClient(supabaseUrl, supabaseKey);

    // Get campaign details
    const { data: campaign, error: campaignError } = await supabase
      .from('campaigns')
      .select('user_id')
      .eq('id', campaignId)
      .single();

    if (campaignError) {
      throw new Error(`Failed to fetch campaign: ${campaignError.message}`);
    }

    if (!campaign) {
      throw new Error('Campaign not found');
    }

    // Get user's VAPI API key
    const { data: vapiKeyData, error: vapiKeyError } = await supabase
      .from('secrets')
      .select('secret')
      .eq('name', 'VAPI_API_KEY')
      .eq('user_id', campaign.user_id)
      .single();

    if (vapiKeyError || !vapiKeyData) {
      throw new Error('VAPI API key not found');
    }

    // Get current retry count and contact info
    const { data: contactData, error: contactError } = await supabase
      .from('campaign_contacts')
      .select('retry_count, id')
      .eq('campaign_id', campaignId)
      .eq('phone_number', phoneNumber)
      .single();

    if (contactError) {
      throw new Error(`Failed to fetch contact: ${contactError.message}`);
    }

    const retryCount = contactData?.retry_count || 0;
    const contactId = contactData?.id;

    if (retryCount >= MAX_RETRIES) {
      await supabase
        .from('campaign_contacts')
        .update({
          status: 'failed',
          last_error: 'Maximum retry attempts reached'
        })
        .eq('id', contactId);

      throw new Error('Maximum retry attempts reached');
    }

    // Initialize call with VAPI
    const response = await fetch('https://api.vapi.ai/call/phone', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${vapiKeyData.secret}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        phoneNumber,
        assistant: {
          model: "gpt-4",
          systemPrompt: "You are a friendly AI assistant making a phone call.",
          functions: [
            {
              name: "end_call",
              description: "End the call",
              parameters: { type: "object", properties: {} }
            }
          ]
        },
        webhook: {
          url: `${Deno.env.get('SUPABASE_URL')}/functions/v1/vapi-webhook`,
          headers: {
            'Authorization': `Bearer ${Deno.env.get('SUPABASE_ANON_KEY')}`,
          }
        },
        config: {
          realtime_transcription: true,
          barge_in: true,
          silence_timeout_ms: 3000,
        },
        metadata: {
          contactId,
          campaignId
        },
        errorWebhook: {
          url: `${Deno.env.get('SUPABASE_URL')}/functions/v1/vapi-error`,
          headers: {
            'Authorization': `Bearer ${Deno.env.get('SUPABASE_ANON_KEY')}`,
          }
        },
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`VAPI API error: ${errorData.message || 'Unknown error'}`);
    }

    const data = await response.json();

    // Update campaign contact status and retry count
    await supabase
      .from('campaign_contacts')
      .update({
        status: 'in_progress',
        call_started_at: new Date().toISOString(),
        retry_count: retryCount + 1
      })
      .eq('id', contactId);

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('Error in vapi-call function:', errorMessage);

    if (supabase) {
      await logError(supabase, error as Error, {
        action: 'vapi-call',
        phoneNumber: req.phoneNumber,
        campaignId: req.campaignId
      });
    }

    return new Response(
      JSON.stringify({ 
        error: errorMessage,
        details: error instanceof Error ? error.stack : undefined
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});