import { Campaign } from './types.ts';
import { ValidationService } from './services/ValidationService.ts';
import { ExecutionService } from './services/ExecutionService.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';

export class CampaignProcessor {
  private validationService: ValidationService;
  private executionService: ExecutionService;
  private supabase;

  constructor(supabaseUrl: string, supabaseKey: string) {
    this.validationService = new ValidationService(supabaseUrl, supabaseKey);
    this.executionService = new ExecutionService(supabaseUrl, supabaseKey);
    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  async processCampaign(campaign: Campaign): Promise<Record<string, any>> {
    const correlationId = crypto.randomUUID();
    console.log(`[${correlationId}] Starting campaign processing for ${campaign.id}`);
    
    try {
      // Check circuit breaker state
      const { data: circuitBreaker } = await this.supabase
        .rpc('check_circuit_breaker_state', { p_campaign_id: campaign.id });

      if (circuitBreaker?.[0]?.is_open) {
        throw new Error(`Circuit breaker is open. Cooldown remaining: ${circuitBreaker[0].cooldown_remaining}`);
      }

      // Validate campaign configuration
      console.log(`[${correlationId}] Validating campaign configuration`);
      const validation = await this.validationService.validateCampaignConfig(campaign);
      
      if (!validation.isValid) {
        await this.logExecutionFailure(campaign.id, 'validation_failed', validation.error || 'Validation failed');
        throw new Error(validation.error || 'Campaign validation failed');
      }

      // Execute campaign with enhanced monitoring
      console.log(`[${correlationId}] Starting campaign execution`);
      const result = await this.executionService.executeCampaign(campaign);

      // Log successful execution
      await this.logExecutionSuccess(campaign.id, result);

      return {
        success: true,
        correlationId,
        executionDetails: result
      };

    } catch (error) {
      console.error(`[${correlationId}] Campaign processing error:`, error);
      
      // Log failure and update campaign status
      await this.logExecutionFailure(campaign.id, 'execution_failed', error.message);
      
      throw error;
    }
  }

  private async logExecutionSuccess(campaignId: string, details: Record<string, any>): Promise<void> {
    await this.supabase.rpc('log_campaign_execution_attempt', {
      p_campaign_id: campaignId,
      p_status: 'completed',
      p_details: {
        timestamp: new Date().toISOString(),
        ...details
      }
    });
  }

  private async logExecutionFailure(
    campaignId: string, 
    failureType: string, 
    error: string
  ): Promise<void> {
    await this.supabase.rpc('log_campaign_execution_attempt', {
      p_campaign_id: campaignId,
      p_status: 'failed',
      p_details: {
        failureType,
        error,
        timestamp: new Date().toISOString()
      }
    });
  }
}