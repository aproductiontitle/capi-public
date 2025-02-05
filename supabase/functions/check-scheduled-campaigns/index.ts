import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('Starting scheduled campaigns check...');

    // Get campaigns that are scheduled and due
    const { data: campaigns, error: campaignError } = await supabase
      .from('campaigns')
      .select(`
        id,
        name,
        status,
        scheduled_time,
        assistant_id,
        user_id,
        current_retry_count,
        max_retries,
        last_validation_error,
        vapi_config_validated,
        assistants (
          name,
          vapi_assistant_id
        )
      `)
      .eq('status', 'scheduled')
      .lte('scheduled_time', new Date().toISOString())
      .is('execution_error', null)
      .lt('current_retry_count', 3)
      .order('scheduled_time', { ascending: true });

    if (campaignError) {
      console.error('Error fetching campaigns:', campaignError);
      throw campaignError;
    }

    console.log(`Found ${campaigns?.length || 0} campaigns to process`);

    if (!campaigns || campaigns.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No campaigns to process' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Process each campaign
    for (const campaign of campaigns) {
      console.log(`Processing campaign: ${campaign.id} (${campaign.name})`);

      try {
        // Acquire execution lock
        const { data: lockResult, error: lockError } = await supabase
          .rpc('acquire_campaign_execution_lock', {
            p_campaign_id: campaign.id,
            p_lock_id: crypto.randomUUID()
          });

        if (lockError || !lockResult?.[0]?.lock_acquired) {
          console.log(`Lock not acquired for campaign ${campaign.id}:`, lockError || 'Already locked');
          continue;
        }

        // Validate VAPI configuration
        const { data: validationResult, error: validationError } = await supabase
          .rpc('validate_vapi_configuration_detailed', {
            campaign_id: campaign.id
          });

        if (validationError || !validationResult?.[0]?.is_valid) {
          console.error(`Validation failed for campaign ${campaign.id}:`, 
            validationError || validationResult?.[0]?.validation_details);
          
          await supabase
            .from('campaigns')
            .update({
              status: 'failed',
              last_validation_error: validationError?.message || 
                JSON.stringify(validationResult?.[0]?.validation_details),
              updated_at: new Date().toISOString()
            })
            .eq('id', campaign.id);
            
          continue;
        }

        // Call execute-scheduled-campaigns function
        const executionResponse = await supabase.functions.invoke('execute-scheduled-campaigns', {
          body: { campaignId: campaign.id }
        });

        if (!executionResponse.data?.success) {
          throw new Error(executionResponse.data?.message || 'Execution failed');
        }

        console.log(`Successfully initiated campaign ${campaign.id}`);

      } catch (error) {
        console.error(`Error processing campaign ${campaign.id}:`, error);
        
        // Update campaign status with error
        await supabase
          .from('campaigns')
          .update({
            status: 'failed',
            execution_error: error.message,
            updated_at: new Date().toISOString()
          })
          .eq('id', campaign.id);

        // Log error to audit logs
        await supabase
          .from('audit_logs')
          .insert({
            user_id: campaign.user_id,
            action: 'campaign_execution_failed',
            details: {
              campaign_id: campaign.id,
              error: error.message,
              timestamp: new Date().toISOString()
            }
          });
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Campaigns processed successfully',
        processed: campaigns.length
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in check-scheduled-campaigns:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});