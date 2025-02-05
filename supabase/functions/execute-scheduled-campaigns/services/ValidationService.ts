import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';
import { Campaign } from '../types.ts';

export class ValidationService {
  private supabase;
  private readonly MAX_RETRIES = 3;
  private readonly RETRY_DELAY = 3000; // 3 seconds

  constructor(supabaseUrl: string, supabaseKey: string) {
    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  async validateCampaignConfig(campaign: Campaign): Promise<{
    isValid: boolean;
    error?: string;
    details?: Record<string, any>;
  }> {
    console.log(`[ValidationService] Starting validation for campaign ${campaign.id}`);
    
    try {
      // Get VAPI key with retry mechanism
      const vapiKey = await this.getVapiKeyWithRetry(campaign.user_id);
      if (!vapiKey) {
        return {
          isValid: false,
          error: 'Missing VAPI API key'
        };
      }

      // Validate assistant configuration
      const { data: assistant, error: assistantError } = await this.supabase
        .from('assistants')
        .select('vapi_assistant_id')
        .eq('id', campaign.assistant_id)
        .single();

      if (assistantError || !assistant?.vapi_assistant_id) {
        console.error('[ValidationService] Assistant validation failed:', assistantError);
        return {
          isValid: false,
          error: 'Invalid assistant configuration'
        };
      }

      // Validate VAPI configuration with retry
      const vapiValidation = await this.validateVapiConfigWithRetry(vapiKey.secret);
      if (!vapiValidation.success) {
        return {
          isValid: false,
          error: `VAPI validation failed: ${vapiValidation.error}`
        };
      }

      // Log successful validation
      await this.logValidationSuccess(campaign.id, {
        assistantId: assistant.vapi_assistant_id,
        vapiKey: vapiKey.secret
      });

      return {
        isValid: true,
        details: {
          vapiKey: vapiKey.secret,
          assistantId: assistant.vapi_assistant_id
        }
      };
    } catch (error) {
      console.error(`[ValidationService] Error validating campaign ${campaign.id}:`, error);
      await this.logValidationFailure(campaign.id, error);
      return {
        isValid: false,
        error: error.message
      };
    }
  }

  private async getVapiKeyWithRetry(userId: string, attempts = 0): Promise<any> {
    try {
      const { data: vapiKey, error } = await this.supabase
        .from('secrets')
        .select('secret')
        .eq('name', 'VAPI_API_KEY')
        .eq('user_id', userId)
        .single();

      if (error) throw error;
      return vapiKey;
    } catch (error) {
      if (attempts < this.MAX_RETRIES) {
        console.log(`VAPI key fetch attempt ${attempts + 1} failed, retrying...`);
        await new Promise(resolve => setTimeout(resolve, this.RETRY_DELAY));
        return this.getVapiKeyWithRetry(userId, attempts + 1);
      }
      throw error;
    }
  }

  private async validateVapiConfigWithRetry(vapiKey: string, attempts = 0): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await fetch('https://api.vapi.ai/assistant', {
        headers: {
          'Authorization': `Bearer ${vapiKey}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'VAPI validation failed');
      }

      return { success: true };
    } catch (error) {
      if (attempts < this.MAX_RETRIES) {
        console.log(`VAPI validation attempt ${attempts + 1} failed, retrying...`);
        await new Promise(resolve => setTimeout(resolve, this.RETRY_DELAY));
        return this.validateVapiConfigWithRetry(vapiKey, attempts + 1);
      }
      return { success: false, error: error.message };
    }
  }

  private async logValidationSuccess(campaignId: string, details: Record<string, any>): Promise<void> {
    await this.supabase.rpc('log_campaign_validation_attempt', {
      campaign_id: campaignId,
      validation_result: {
        success: true,
        timestamp: new Date().toISOString(),
        details
      }
    });
  }

  private async logValidationFailure(campaignId: string, error: Error): Promise<void> {
    await this.supabase.rpc('log_campaign_validation_attempt', {
      campaign_id: campaignId,
      validation_result: {
        success: false,
        timestamp: new Date().toISOString(),
        error: error.message,
        stack: error.stack
      }
    });
  }
}