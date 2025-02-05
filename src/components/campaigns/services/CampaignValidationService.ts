import { Campaign } from "../types";
import { VAPIPayloadService } from "./vapi/VAPIPayloadService";
import { supabase } from "@/integrations/supabase/client";

export class CampaignValidationService {
  private campaign: Campaign;

  constructor(campaign: Campaign) {
    this.campaign = campaign;
  }

  async validateConfiguration() {
    try {
      // Get VAPI API key
      const { data: vapiKeyData, error: keyError } = await supabase
        .from('secrets')
        .select('secret')
        .eq('name', 'VAPI_API_KEY')
        .eq('user_id', this.campaign.user_id)
        .single();

      if (keyError || !vapiKeyData?.secret) {
        return {
          isValid: false,
          error: 'VAPI API key not found'
        };
      }

      // Validate assistant configuration
      if (!this.campaign.assistant?.vapi_assistant_id) {
        return {
          isValid: false,
          error: 'Invalid assistant configuration'
        };
      }

      // Generate and validate webhook configuration
      const webhookConfig = await VAPIPayloadService.getWebhookConfig(this.campaign.id);
      const webhooksValid = await VAPIPayloadService.validateWebhookEndpoints(webhookConfig);

      if (!webhooksValid) {
        return {
          isValid: false,
          error: 'Webhook endpoints validation failed'
        };
      }

      // Log successful validation
      console.log('Campaign validation successful:', {
        campaignId: this.campaign.id,
        assistantId: this.campaign.assistant.vapi_assistant_id,
        webhookConfig
      });

      return {
        isValid: true,
        details: {
          vapiKey: vapiKeyData.secret,
          assistantId: this.campaign.assistant.vapi_assistant_id,
          webhookConfig
        }
      };
    } catch (error) {
      console.error('Campaign validation error:', error);
      return {
        isValid: false,
        error: error instanceof Error ? error.message : 'Unknown validation error'
      };
    }
  }
}