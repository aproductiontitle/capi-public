import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';

export class VAPIMetricsService {
  private supabase;

  constructor(supabaseUrl: string, supabaseKey: string) {
    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  async recordAPIInteraction(
    userId: string,
    success: boolean,
    duration: number,
    metadata: Record<string, any>
  ) {
    try {
      const { error } = await this.supabase
        .from('vapi_performance_metrics')
        .insert({
          user_id: userId,
          success_rate: success ? 1 : 0,
          avg_duration: duration,
          total_calls: 1,
          metadata: metadata
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error recording VAPI metrics:', error);
    }
  }

  async getRecentMetrics(userId: string, minutes: number = 60) {
    const { data, error } = await this.supabase
      .from('vapi_performance_metrics')
      .select('*')
      .eq('user_id', userId)
      .gte('timestamp', new Date(Date.now() - minutes * 60000).toISOString())
      .order('timestamp', { ascending: false });

    if (error) throw error;
    return data;
  }
}