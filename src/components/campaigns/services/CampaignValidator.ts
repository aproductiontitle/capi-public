import { supabase } from "@/integrations/supabase/client";
import { VAPIService } from "./VAPIService";

export class CampaignValidator {
  private campaignId: string;
  private userId: string;
  private vapiService: VAPIService;

  constructor(campaignId: string, userId: string) {
    this.campaignId = campaignId;
    this.userId = userId;
    this.vapiService = new VAPIService(campaignId);
  }

  async validateCampaign(): Promise<{ 
    isValid: boolean; 
    details: Record<string, any>;
  }> {
    console.log(`Validating campaign ${this.campaignId}`);
    const details: Record<string, any> = {};

    try {
      // Initialize VAPI service (this will check for phone numbers)
      await this.vapiService.initialize();
      details.phoneNumberValidation = { success: true };

      // Get available phone numbers
      const phoneNumbers = await this.vapiService.getAvailablePhoneNumbers();
      if (!phoneNumbers.length) {
        return {
          isValid: false,
          details: {
            ...details,
            phoneNumberValidation: {
              success: false,
              error: 'No phone numbers configured in VAPI account'
            }
          }
        };
      }

      // Validate assistant configuration
      const { data: assistant } = await supabase
        .from('assistants')
        .select('vapi_assistant_id')
        .eq('id', this.campaignId)
        .single();

      if (!assistant?.vapi_assistant_id) {
        return {
          isValid: false,
          details: {
            ...details,
            assistantValidation: {
              success: false,
              error: 'Invalid assistant configuration'
            }
          }
        };
      }

      details.assistantValidation = { success: true };

      // Check for pending contacts
      const { count } = await supabase
        .from('campaign_contacts')
        .select('*', { count: 'exact', head: true })
        .eq('campaign_id', this.campaignId)
        .eq('status', 'pending');

      if (!count) {
        return {
          isValid: false,
          details: {
            ...details,
            contactValidation: {
              success: false,
              error: 'No pending contacts found'
            }
          }
        };
      }

      details.contactValidation = { success: true };

      return {
        isValid: true,
        details
      };
    } catch (error) {
      console.error('Campaign validation error:', error);
      return {
        isValid: false,
        details: {
          error: error instanceof Error ? error.message : 'Unknown validation error'
        }
      };
    }
  }
}