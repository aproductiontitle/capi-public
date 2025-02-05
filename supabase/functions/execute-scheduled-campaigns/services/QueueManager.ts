import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';
import { QueueJob } from '../types.ts';

export class QueueManager {
  private supabase;
  
  constructor(supabaseUrl: string, supabaseKey: string) {
    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  async getNextBatch(batchSize: number = 5): Promise<QueueJob[]> {
    const { data, error } = await this.supabase
      .from('campaign_queue')
      .select('*')
      .eq('status', 'pending')
      .lt('next_retry', new Date().toISOString())
      .order('priority', { ascending: false })
      .limit(batchSize);

    if (error) throw error;
    return data || [];
  }

  async updateJobStatus(jobId: string, status: string, error?: string): Promise<void> {
    const updates: any = {
      status,
      updated_at: new Date().toISOString()
    };

    if (error) {
      updates.last_error = error;
      updates.retries = this.supabase.rpc('increment_retries', { job_id: jobId });
    }

    const { error: updateError } = await this.supabase
      .from('campaign_queue')
      .update(updates)
      .eq('id', jobId);

    if (updateError) throw updateError;
  }

  async calculateBackoff(retries: number): Promise<Date> {
    const baseDelay = 5 * 60 * 1000; // 5 minutes
    const backoff = Math.min(Math.pow(2, retries) * baseDelay, 24 * 60 * 60 * 1000); // Max 24 hours
    return new Date(Date.now() + backoff);
  }
}