import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';

export class CampaignMonitor {
  private supabase;
  
  constructor(supabaseUrl: string, supabaseKey: string) {
    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  async logExecutionAttempt(
    campaignId: string, 
    details: {
      status: string;
      error?: string;
      correlationId: string;
      details?: Record<string, any>;
    }
  ) {
    console.log(`[CampaignMonitor] Logging execution attempt for campaign ${campaignId}:`, {
      timestamp: new Date().toISOString(),
      ...details
    });

    try {
      // Record execution metrics
      await this.supabase
        .from('campaign_execution_metrics')
        .upsert({
          campaign_id: campaignId,
          last_execution_details: {
            ...details,
            timestamp: new Date().toISOString()
          }
        });

      // Update health metrics
      if (details.error) {
        await this.supabase
          .from('campaign_health_metrics')
          .upsert({
            id: campaignId,
            vapi_error_count: this.supabase.rpc('increment'),
            last_vapi_error_timestamp: new Date().toISOString(),
            latest_contact_error: details.error
          });
      }

      // Log to audit trail
      await this.supabase
        .from('audit_logs')
        .insert({
          action: 'campaign_execution_attempt',
          details: {
            campaign_id: campaignId,
            correlation_id: details.correlationId,
            execution_details: details,
            timestamp: new Date().toISOString()
          }
        });

    } catch (error) {
      console.error('[CampaignMonitor] Error logging execution attempt:', error);
      throw error;
    }
  }

  async trackVapiInteraction(
    campaignId: string,
    details: {
      requestId: string;
      request: any;
      response?: any;
      error?: any;
      duration: number;
    }
  ) {
    console.log(`[CampaignMonitor] Tracking VAPI interaction for campaign ${campaignId}:`, {
      timestamp: new Date().toISOString(),
      ...details
    });

    try {
      await this.supabase.rpc('log_vapi_interaction', {
        p_campaign_id: campaignId,
        p_request: details.request,
        p_response: details.response || details.error,
        p_success: !details.error
      });

      if (details.error) {
        await this.updateHealthMetrics(campaignId, details);
      }
    } catch (error) {
      console.error('[CampaignMonitor] Error tracking VAPI interaction:', error);
      throw error;
    }
  }

  private async updateHealthMetrics(campaignId: string, details: Record<string, any>): Promise<void> {
    await this.supabase
      .from('campaign_health_metrics')
      .upsert({
        id: campaignId,
        vapi_error_count: this.supabase.rpc('increment'),
        last_vapi_error_timestamp: new Date().toISOString(),
        vapi_response_time_ms: details.duration,
        latest_contact_error: details.error?.message || 'Unknown error'
      });
  }
}