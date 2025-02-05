import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';
import { VAPIMetrics } from '../types.ts';

export class MetricsCollector {
  private supabase;

  constructor(supabaseUrl: string, supabaseKey: string) {
    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  async recordMetrics(userId: string, duration: number, success: boolean): Promise<void> {
    const { error } = await this.supabase
      .from('vapi_performance_metrics')
      .insert({
        user_id: userId,
        avg_duration: duration,
        success_rate: success ? 1 : 0,
        total_calls: 1
      });

    if (error) throw error;
  }

  async getOptimalConcurrency(userId: string): Promise<number> {
    const { data, error } = await this.supabase
      .rpc('calculate_optimal_concurrency', { p_user_id: userId });

    if (error) throw error;
    return data || 3; // Default to 3 if no data available
  }
}