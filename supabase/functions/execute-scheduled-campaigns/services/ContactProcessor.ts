import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';
import { Contact } from '../types.ts';

export class ContactProcessor {
  private supabase;
  private vapiService;

  constructor(supabaseUrl: string, supabaseKey: string) {
    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  async processContact(
    contact: Contact,
    campaignId: string,
    vapiKey: string,
    vapiAssistantId: string,
    correlationId: string
  ): Promise<boolean> {
    console.log(`[ContactProcessor] Processing contact ${contact.id} for campaign ${campaignId}`, {
      correlationId
    });

    try {
      // Update contact status to processing
      await this.supabase
        .from('campaign_contacts')
        .update({
          status: 'processing',
          call_started_at: new Date().toISOString()
        })
        .eq('id', contact.id);

      // Initialize VAPI call with detailed request logging
      const vapiRequest = {
        phoneNumber: contact.phone_number,
        assistant: {
          id: vapiAssistantId,
          model: "gpt-4",
        },
        webhook: {
          url: `${Deno.env.get('SUPABASE_URL')}/functions/v1/vapi-webhook`,
          headers: {
            'Authorization': `Bearer ${Deno.env.get('SUPABASE_ANON_KEY')}`,
          }
        },
        metadata: {
          campaignId,
          contactId: contact.id,
          correlationId
        }
      };

      console.log(`[ContactProcessor] Initiating VAPI call for contact ${contact.id}`, {
        correlationId,
        request: vapiRequest
      });

      const response = await fetch('https://api.vapi.ai/call/phone', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${vapiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(vapiRequest),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`VAPI API error: ${errorData.message || response.statusText}`);
      }

      const responseData = await response.json();
      console.log(`[ContactProcessor] VAPI call initiated successfully for contact ${contact.id}`, {
        correlationId,
        response: responseData
      });

      // Log successful VAPI interaction
      await this.supabase.rpc('log_vapi_interaction', {
        p_campaign_id: campaignId,
        p_contact_id: contact.id,
        p_request: vapiRequest,
        p_response: responseData,
        p_success: true
      });

      return true;
    } catch (error) {
      console.error(`[ContactProcessor] Error processing contact ${contact.id}:`, {
        correlationId,
        error
      });

      // Update contact status to failed
      await this.supabase
        .from('campaign_contacts')
        .update({
          status: 'failed',
          last_error: error.message,
          call_ended_at: new Date().toISOString()
        })
        .eq('id', contact.id);

      // Log failed VAPI interaction
      await this.supabase.rpc('log_vapi_interaction', {
        p_campaign_id: campaignId,
        p_contact_id: contact.id,
        p_request: null,
        p_response: { error: error.message },
        p_success: false
      });

      return false;
    }
  }
}