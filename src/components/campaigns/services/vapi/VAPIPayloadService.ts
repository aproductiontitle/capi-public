import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export class VAPIPayloadService {
  private static readonly DEFAULT_WEBHOOK_PATH = '/functions/v1/vapi-webhook';
  private static readonly DEFAULT_ERROR_WEBHOOK_PATH = '/functions/v1/vapi-error';

  static async getWebhookConfig(campaignId: string): Promise<{
    webhook: { url: string; headers: Record<string, string> };
    errorWebhook: { url: string; headers: Record<string, string> };
  }> {
    try {
      // Get Supabase project URL
      const { data: { publicUrl } } = await supabase.functions.invoke('get-public-url');
      const baseUrl = publicUrl || 'http://localhost:54321';

      // Get anon key for webhook auth
      const anonKey = process.env.SUPABASE_ANON_KEY || '';

      const webhookConfig = {
        webhook: {
          url: `${baseUrl}${this.DEFAULT_WEBHOOK_PATH}`,
          headers: {
            'Authorization': `Bearer ${anonKey}`,
            'Content-Type': 'application/json'
          }
        },
        errorWebhook: {
          url: `${baseUrl}${this.DEFAULT_ERROR_WEBHOOK_PATH}`,
          headers: {
            'Authorization': `Bearer ${anonKey}`,
            'Content-Type': 'application/json'
          }
        }
      };

      // Log webhook configuration for debugging
      console.log('Generated webhook config:', {
        campaignId,
        webhookUrls: {
          main: webhookConfig.webhook.url,
          error: webhookConfig.errorWebhook.url
        }
      });

      return webhookConfig;
    } catch (error) {
      console.error('Error generating webhook config:', error);
      toast.error('Failed to configure webhooks. Please try again.');
      throw error;
    }
  }

  static async validateWebhookEndpoints(config: {
    webhook: { url: string; headers: Record<string, string> };
    errorWebhook: { url: string; headers: Record<string, string> };
  }): Promise<boolean> {
    try {
      // Test both webhook endpoints
      const mainResponse = await fetch(config.webhook.url, {
        method: 'OPTIONS',
        headers: config.webhook.headers
      });

      const errorResponse = await fetch(config.errorWebhook.url, {
        method: 'OPTIONS',
        headers: config.errorWebhook.headers
      });

      const isValid = mainResponse.ok && errorResponse.ok;

      if (!isValid) {
        console.error('Webhook validation failed:', {
          mainWebhook: {
            status: mainResponse.status,
            statusText: mainResponse.statusText
          },
          errorWebhook: {
            status: errorResponse.status,
            statusText: errorResponse.statusText
          }
        });
      }

      return isValid;
    } catch (error) {
      console.error('Error validating webhook endpoints:', error);
      return false;
    }
  }
}