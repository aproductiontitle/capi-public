import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';

export class CampaignValidator {
  private supabase;

  constructor(supabaseUrl: string, supabaseKey: string) {
    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  async validateCampaignConfig(campaignId: string): Promise<{
    isValid: boolean;
    vapiKey?: string;
    error?: string;
  }> {
    console.log(`Validating configuration for campaign ${campaignId}`);

    try {
      // Get campaign details with user and assistant info
      const { data: campaign, error: campaignError } = await this.supabase
        .from('campaigns')
        .select(`
          *,
          user_id,
          assistant:assistants (
            id,
            vapi_assistant_id
          )
        `)
        .eq('id', campaignId)
        .single();

      if (campaignError) throw campaignError;

      // Get VAPI API key
      const { data: vapiKey, error: keyError } = await this.supabase
        .from('secrets')
        .select('secret')
        .eq('name', 'VAPI_API_KEY')
        .eq('user_id', campaign.user_id)
        .single();

      if (keyError || !vapiKey?.secret) {
        return { isValid: false, error: 'Missing VAPI API key' };
      }

      // Validate VAPI assistant configuration
      if (!campaign.assistant?.vapi_assistant_id) {
        return { isValid: false, error: 'Invalid assistant configuration' };
      }

      // Check for pending contacts
      const { count, error: contactsError } = await this.supabase
        .from('campaign_contacts')
        .select('*', { count: 'exact', head: true })
        .eq('campaign_id', campaignId)
        .eq('status', 'pending');

      if (contactsError) throw contactsError;
      if (!count) {
        return { isValid: false, error: 'No pending contacts found' };
      }

      return { isValid: true, vapiKey: vapiKey.secret };
    } catch (error) {
      console.error('Validation error:', error);
      return { isValid: false, error: error.message };
    }
  }
}