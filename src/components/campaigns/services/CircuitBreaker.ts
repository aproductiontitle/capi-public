import { supabase } from '@/integrations/supabase/client';
import { CircuitBreakerStatus } from '../types';

interface CircuitBreakerState {
  is_open: boolean;
  cooldown_remaining: string;
  failure_rate: number;
  recovery_progress: number;
}

export class CircuitBreaker {
  private readonly campaignId: string;
  private readonly maxFailures: number = 3;
  private readonly cooldownMinutes: number = 15;

  constructor(campaignId: string) {
    this.campaignId = campaignId;
  }

  async getState(): Promise<CircuitBreakerStatus> {
    const { data, error } = await supabase
      .rpc('check_circuit_breaker_state', {
        p_campaign_id: this.campaignId
      }) as { data: CircuitBreakerState[], error: any };

    if (error) {
      console.error('Error checking circuit breaker state:', error);
      return {
        is_open: true,
        cooldown_remaining: '15 minutes',
        failure_rate: 1,
        recovery_progress: 0
      };
    }

    const state = data[0];
    return {
      is_open: state?.is_open || false,
      cooldown_remaining: state?.cooldown_remaining || '0 minutes',
      failure_rate: state?.failure_rate || 0,
      recovery_progress: state?.recovery_progress || 1
    };
  }

  async recordFailure(error: Error): Promise<void> {
    try {
      const { error: updateError } = await supabase
        .rpc('record_circuit_breaker_failure', {
          p_campaign_id: this.campaignId,
          p_error_details: { message: error.message }
        });

      if (updateError) throw updateError;

    } catch (error) {
      console.error('Error recording circuit breaker failure:', error);
      throw error;
    }
  }

  async reset(): Promise<void> {
    try {
      const { error } = await supabase
        .rpc('record_circuit_breaker_success', {
          p_campaign_id: this.campaignId
        });

      if (error) throw error;

    } catch (error) {
      console.error('Error resetting circuit breaker:', error);
      throw error;
    }
  }
}