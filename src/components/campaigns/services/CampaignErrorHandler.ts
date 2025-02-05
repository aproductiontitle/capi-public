import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

export type CampaignErrorType = 'CONFIGURATION' | 'TRANSIENT' | 'RESOURCE' | 'FATAL';

export class CampaignError extends Error {
  constructor(
    public type: CampaignErrorType,
    message: string,
    public retryable: boolean = false
  ) {
    super(message);
    this.name = 'CampaignError';
  }
}

interface ErrorContext {
  campaignId: string;
  contactId?: string;
  details?: Record<string, any>;
}

export class CampaignErrorHandler {
  static classifyError(error: Error): CampaignError {
    if (error instanceof CampaignError) {
      return error;
    }

    if (error.message.includes('configuration') || error.message.includes('setup')) {
      return new CampaignError('CONFIGURATION', error.message, false);
    }

    if (error.message.includes('timeout') || error.message.includes('network')) {
      return new CampaignError('TRANSIENT', error.message, true);
    }

    if (error.message.includes('resource') || error.message.includes('quota')) {
      return new CampaignError('RESOURCE', error.message, false);
    }

    return new CampaignError('FATAL', error.message, false);
  }

  static async handleError(error: Error, context: ErrorContext): Promise<{ error: CampaignError }> {
    const classifiedError = this.classifyError(error);

    console.error('Campaign Error:', {
      type: classifiedError.type,
      message: classifiedError.message,
      retryable: classifiedError.retryable,
      context
    });

    try {
      const { data: campaign } = await supabase
        .from('campaigns')
        .select('user_id')
        .eq('id', context.campaignId)
        .single();

      if (campaign) {
        await supabase.from('audit_logs').insert({
          user_id: campaign.user_id,
          action: 'circuit_breaker_failure' as Database['public']['Enums']['audit_action'],
          details: {
            campaign_id: context.campaignId,
            error_type: classifiedError.type,
            error_message: classifiedError.message,
            retryable: classifiedError.retryable,
            contact_id: context.contactId,
            additional_details: context.details
          }
        });
      }

      if (classifiedError.type === 'FATAL') {
        await supabase
          .from('campaigns')
          .update({ 
            status: 'failed',
            execution_error: classifiedError.message
          })
          .eq('id', context.campaignId);
      }
    } catch (loggingError) {
      console.error('Failed to log campaign error:', loggingError);
    }

    return { error: classifiedError };
  }
}