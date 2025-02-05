import { supabase } from "@/integrations/supabase/client";
import { ExecutionDetails } from "../types";

export interface CampaignMetrics {
  status: string;
  vapiConfigValidated: boolean;
  errorClassification?: string;
  count: number;
  avgVapiErrors: number;
  avgConsecutiveFailures: number;
  validationErrors: string[];
}

export interface VapiMetrics {
  totalCalls: number;
  successfulCalls: number;
  failedCalls: number;
  avgDurationSeconds: number;
}

export class CampaignAnalytics {
  async getCampaignMetrics(days: number = 7): Promise<CampaignMetrics[]> {
    console.log(`[CampaignAnalytics] Fetching campaign metrics for last ${days} days`);
    
    const { data, error } = await supabase
      .from('campaign_health_metrics')
      .select('*')
      .gte('last_validation_time', new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString());

    if (error) {
      console.error('[CampaignAnalytics] Error fetching campaign metrics:', error);
      throw error;
    }

    return data.map(m => {
      const executionDetails = m.last_execution_details as ExecutionDetails || {};

      return {
        status: m.status || '',
        vapiConfigValidated: m.vapi_config_validated || false,
        errorClassification: executionDetails.error_type || null,
        count: 1,
        avgVapiErrors: executionDetails.vapi_errors || 0,
        avgConsecutiveFailures: m.current_retry_count || 0,
        validationErrors: m.last_validation_error ? [m.last_validation_error] : []
      };
    });
  }

  async getVapiMetrics(days: number = 7): Promise<VapiMetrics> {
    console.log(`[CampaignAnalytics] Fetching VAPI metrics for last ${days} days`);
    
    const { data, error } = await supabase
      .from('vapi_performance_metrics')
      .select('*')
      .gte('timestamp', new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString());

    if (error) {
      console.error('[CampaignAnalytics] Error fetching VAPI metrics:', error);
      throw error;
    }

    const metrics = data.reduce((acc: any, metric) => {
      acc.totalCalls++;
      acc.successfulCalls += metric.success_rate * metric.total_calls;
      acc.failedCalls = acc.totalCalls - acc.successfulCalls;
      acc.totalDuration += metric.avg_duration * metric.total_calls;
      return acc;
    }, {
      totalCalls: 0,
      successfulCalls: 0,
      failedCalls: 0,
      totalDuration: 0
    });

    return {
      totalCalls: metrics.totalCalls,
      successfulCalls: Math.round(metrics.successfulCalls),
      failedCalls: Math.round(metrics.failedCalls),
      avgDurationSeconds: metrics.totalCalls > 0 ? metrics.totalDuration / metrics.totalCalls : 0
    };
  }
}