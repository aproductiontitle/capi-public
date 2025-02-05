import { supabase } from "@/integrations/supabase/client";
import { CampaignError } from "./CampaignErrorHandler";

export type CampaignStatus = 'draft' | 'validating' | 'ready' | 'executing' | 'failed_validation' | 'failed_execution';

interface ValidationResult {
  isValid: boolean;
  details: Record<string, any>;
}

export class CampaignStateManager {
  private readonly campaignId: string;

  constructor(campaignId: string) {
    this.campaignId = campaignId;
  }

  private readonly validTransitions: Record<CampaignStatus, CampaignStatus[]> = {
    draft: ['validating', 'failed_validation'],
    validating: ['ready', 'failed_validation'],
    ready: ['executing', 'failed_execution'],
    executing: ['ready', 'failed_execution'],
    failed_validation: ['draft', 'validating'],
    failed_execution: ['ready', 'executing']
  };

  async transition(newStatus: CampaignStatus, details?: any): Promise<void> {
    const { data: campaign, error: fetchError } = await supabase
      .from('campaigns')
      .select('status')
      .eq('id', this.campaignId)
      .maybeSingle();

    if (fetchError) throw fetchError;
    if (!campaign) throw new CampaignError('FATAL', 'Campaign not found');

    const currentStatus = campaign.status as CampaignStatus;
    
    if (!this.validTransitions[currentStatus]?.includes(newStatus)) {
      throw new CampaignError(
        'CONFIGURATION',
        `Invalid state transition from ${currentStatus} to ${newStatus}`
      );
    }

    const { error: updateError } = await supabase
      .from('campaigns')
      .update({
        status: newStatus,
        updated_at: new Date().toISOString(),
        ...(details || {})
      })
      .eq('id', this.campaignId);

    if (updateError) throw updateError;

    console.log(`Campaign ${this.campaignId} transitioned from ${currentStatus} to ${newStatus}`);
  }

  async validateAndTransition(validation: ValidationResult): Promise<void> {
    const newStatus = validation.isValid ? 'ready' : 'failed_validation';
    
    await this.transition(newStatus, {
      vapi_config_validated: validation.isValid,
      last_validation_error: validation.isValid ? null : validation.details?.error,
      last_validation_time: new Date().toISOString()
    });
  }
}