import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';

export class CircuitBreaker {
  private supabase;

  constructor(supabaseUrl: string, supabaseKey: string) {
    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  async checkState(campaignId: string): Promise<boolean> {
    const { data, error } = await this.supabase
      .rpc('check_circuit_breaker_state', { p_campaign_id: campaignId });

    if (error) throw error;
    return data?.[0]?.is_open || false;
  }

  async recordFailure(campaignId: string): Promise<void> {
    const { error } = await this.supabase
      .from('circuit_breaker_state')
      .upsert({
        campaign_id: campaignId,
        failure_count: 1,
        last_failure: new Date().toISOString(),
        cooldown_until: new Date(Date.now() + 15 * 60 * 1000).toISOString() // 15 minutes cooldown
      }, {
        onConflict: 'campaign_id'
      });

    if (error) throw error;
  }
}