import { supabase } from "@/integrations/supabase/client";
import { ExecutionAttempt, HealthMetrics, StateTransition, ValidationStep, ExecutionDetails } from "../types";

export class ExecutionMonitor {
  private campaignId: string;

  constructor(campaignId: string) {
    this.campaignId = campaignId;
  }

  async getHealthMetrics(): Promise<HealthMetrics> {
    try {
      console.log(`[ExecutionMonitor] Fetching health metrics for campaign ${this.campaignId}`);
      
      const { data: metrics, error } = await supabase
        .from('campaign_health_metrics')
        .select('*')
        .eq('id', this.campaignId)
        .maybeSingle();

      if (error) {
        console.error('[ExecutionMonitor] Error fetching health metrics:', error);
        throw error;
      }

      if (!metrics) {
        console.warn('[ExecutionMonitor] No health metrics found for campaign:', this.campaignId);
        return this.createEmptyHealthMetrics();
      }

      const executionDetails = typeof metrics.last_execution_details === 'string'
        ? JSON.parse(metrics.last_execution_details)
        : (metrics.last_execution_details as ExecutionDetails || {});

      return {
        ...metrics,
        last_execution_details: executionDetails,
        vapi_error_count: executionDetails?.vapi_errors || 0,
        consecutive_failures: metrics.current_retry_count || 0,
        vapi_response_time_ms: executionDetails?.response_time_ms || 0,
        error_classification: executionDetails?.error_type || null,
        state_transition_history: executionDetails?.state_transitions || [],
        validation_steps_completed: executionDetails?.validation_steps || [],
        validation_stack_trace: metrics.validation_stack_trace || null
      };
    } catch (error) {
      console.error('[ExecutionMonitor] Error in getHealthMetrics:', error);
      throw error;
    }
  }

  private createEmptyHealthMetrics(): HealthMetrics {
    return {
      id: this.campaignId,
      name: null,
      status: null,
      completed_contacts: 0,
      current_retry_count: 0,
      execution_attempts: 0,
      failed_contacts: 0,
      last_execution_details: {},
      last_successful_execution: '',
      last_validation_error: null,
      last_validation_time: null,
      last_webhook_received: null,
      latest_contact_error: null,
      pending_contacts: 0,
      total_contacts: 0,
      validation_attempts: 0,
      validation_stack_trace: null,
      vapi_config_validated: false,
      vapi_error_count: 0,
      consecutive_failures: 0,
      vapi_response_time_ms: 0,
      error_classification: null,
      state_transition_history: [],
      validation_steps_completed: []
    };
  }

  async logExecutionAttempt(attempt: ExecutionAttempt) {
    try {
      console.log(`[ExecutionMonitor] Logging execution attempt for campaign ${this.campaignId}:`, attempt);
      
      const { error } = await supabase.rpc('log_campaign_execution_attempt', {
        p_campaign_id: this.campaignId,
        p_status: attempt.status,
        p_details: {
          correlationId: attempt.correlationId,
          error: attempt.error,
          vapiResponse: attempt.vapiResponse,
          timestamp: attempt.timestamp || new Date().toISOString(),
          ...attempt.details
        }
      });

      if (error) throw error;
    } catch (error) {
      console.error('[ExecutionMonitor] Error logging execution attempt:', error);
      throw error;
    }
  }
}