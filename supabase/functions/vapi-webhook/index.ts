import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  const requestId = crypto.randomUUID();
  console.log(`[${requestId}] Processing webhook request`);

  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { event, call } = await req.json();
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log(`[${requestId}] Processing VAPI webhook event:`, {
      event,
      callId: call.id,
      metadata: call.metadata,
      timestamp: new Date().toISOString()
    });

    const campaignId = call.metadata?.campaignId;
    const contactId = call.metadata?.contactId;

    if (!campaignId || !contactId) {
      throw new Error('Missing required metadata: campaignId or contactId');
    }

    switch (event) {
      case 'call.completed': {
        console.log(`[${requestId}] Call completed successfully:`, {
          callId: call.id,
          duration: call.duration,
          campaignId,
          contactId
        });

        await supabase
          .from('campaign_contacts')
          .update({
            status: 'completed',
            call_ended_at: new Date().toISOString(),
            call_duration: call.duration,
            transcript: call.transcript || null,
            last_error: null
          })
          .eq('id', contactId);

        break;
      }

      case 'call.failed': {
        console.error(`[${requestId}] Call failed:`, {
          error: call.error,
          campaignId,
          contactId,
          callId: call.id
        });

        await supabase
          .from('campaign_contacts')
          .update({
            status: 'failed',
            call_ended_at: new Date().toISOString(),
            last_error: call.error?.message || 'Unknown error',
            retry_count: call.retry_count || 0
          })
          .eq('id', contactId);

        break;
      }

      case 'call.transcript.update': {
        console.log(`[${requestId}] Transcript update received:`, {
          callId: call.id,
          contactId,
          timestamp: new Date().toISOString()
        });

        await supabase
          .from('campaign_contacts')
          .update({ 
            transcript: call.transcript,
            updated_at: new Date().toISOString()
          })
          .eq('id', contactId);
        break;
      }

      default:
        console.log(`[${requestId}] Unhandled event type: ${event}`, { 
          callId: call.id,
          event,
          metadata: call.metadata 
        });
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        requestId,
        event,
        timestamp: new Date().toISOString()
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error(`[${requestId}] Error in vapi-webhook function:`, error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message,
        requestId,
        timestamp: new Date().toISOString()
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});