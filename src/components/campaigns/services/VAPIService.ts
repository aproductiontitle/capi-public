import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { PhoneNumberOption, PhoneNumberProvider } from "../types/phoneNumber";

interface VAPICallConfig {
  phoneNumber: string;
  from: string;
  assistant: {
    id: string;
    model: string;
    systemPrompt: string;
    functions: Array<{
      name: string;
      description: string;
      parameters: Record<string, any>;
    }>;
  };
  webhook: {
    url: string;
    headers: Record<string, string>;
  };
  errorWebhook: {
    url: string;
    headers: Record<string, string>;
  };
  config: {
    realtime_transcription: boolean;
    barge_in: boolean;
    silence_timeout_ms: number;
  };
  metadata: {
    contactId: string;
    campaignId: string;
    timestamp: string;
  };
}

export class VAPIService {
  private static readonly VAPI_API_ENDPOINT = 'https://api.vapi.ai/call/phone';
  private campaignId: string;
  private vapiKey: string | null = null;
  private initialized: boolean = false;
  private selectedPhoneNumber: string | null = null;

  constructor(campaignId: string) {
    this.campaignId = campaignId;
  }

  async initialize(): Promise<void> {
    console.log(`[VAPIService] Initializing for campaign ${this.campaignId}`);
    
    if (this.initialized) return;

    const { data: vapiKeyData, error: keyError } = await supabase
      .from('secrets')
      .select('secret')
      .eq('name', 'VAPI_API_KEY')
      .single();

    if (keyError || !vapiKeyData?.secret) {
      console.error('[VAPIService] Error fetching VAPI key:', keyError);
      toast.error('Please configure your VAPI API key in settings');
      throw new Error('VAPI API key not found');
    }

    this.vapiKey = vapiKeyData.secret;
    this.initialized = true;
    console.log('[VAPIService] Successfully initialized');
  }

  async getAvailablePhoneNumbers(areaCode?: string): Promise<PhoneNumberOption[]> {
    if (!this.initialized) await this.initialize();

    try {
      const params = new URLSearchParams();
      if (areaCode) {
        params.append('numberDesiredAreaCode', areaCode);
      }

      const response = await fetch('https://api.vapi.ai/phone-number', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.vapiKey}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const error = await response.json();
        console.error('[VAPIService] Error fetching phone numbers:', {
          status: response.status,
          statusText: response.statusText,
          error
        });
        throw new Error(error.message || 'Failed to fetch phone numbers');
      }

      const data = await response.json();
      console.log('[VAPIService] Phone numbers response:', data);

      return (Array.isArray(data) ? data : []).map((number: any) => ({
        id: number.id || '',
        phoneNumber: number.number || number.phoneNumber || '',
        provider: (number.provider || 'vonage').toLowerCase() as PhoneNumberProvider,
        capabilities: Array.isArray(number.capabilities) ? number.capabilities : [],
        status: number.status || 'unknown',
        isAvailable: !number.assistantId,
        isDefault: false
      }));
    } catch (error) {
      console.error('[VAPIService] Error in getAvailablePhoneNumbers:', error);
      throw error;
    }
  }

  async initiateCall(contact: {
    id: string;
    phone_number: string;
  }, vapiAssistantId: string): Promise<{
    success: boolean;
    callId?: string;
    error?: string;
  }> {
    if (!this.initialized) await this.initialize();

    if (!this.selectedPhoneNumber) {
      throw new Error('No outbound phone number selected');
    }

    console.log(`[VAPIService] Initiating call for contact ${contact.id}`);

    try {
      const webhookBaseUrl = await this.getWebhookBaseUrl();
      
      const callConfig: VAPICallConfig = {
        phoneNumber: contact.phone_number,
        from: this.selectedPhoneNumber,
        assistant: {
          id: vapiAssistantId,
          model: "gpt-4",
          systemPrompt: "You are making a phone call.",
          functions: [
            {
              name: "end_call",
              description: "End the call",
              parameters: { type: "object", properties: {} }
            },
            {
              name: "hangup",
              description: "Hang up the call",
              parameters: { type: "object", properties: {} }
            }
          ]
        },
        webhook: {
          url: `${webhookBaseUrl}/functions/v1/vapi-webhook`,
          headers: {
            'Authorization': `Bearer ${this.vapiKey}`
          }
        },
        errorWebhook: {
          url: `${webhookBaseUrl}/functions/v1/vapi-error`,
          headers: {
            'Authorization': `Bearer ${this.vapiKey}`
          }
        },
        config: {
          realtime_transcription: true,
          barge_in: true,
          silence_timeout_ms: 3000
        },
        metadata: {
          contactId: contact.id,
          campaignId: this.campaignId,
          timestamp: new Date().toISOString()
        }
      };

      console.log('[VAPIService] Call configuration:', JSON.stringify(callConfig, null, 2));

      const response = await fetch(VAPIService.VAPI_API_ENDPOINT, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.vapiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(callConfig),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`VAPI API error: ${error.message || 'Unknown error'}`);
      }

      const result = await response.json();
      console.log('[VAPIService] Call initiated successfully:', result);

      await this.logCallAttempt({
        contactId: contact.id,
        success: true,
        callId: result.id,
        request: callConfig,
        response: result
      });

      return {
        success: true,
        callId: result.id
      };
    } catch (error) {
      console.error('[VAPIService] Error initiating call:', error);
      
      await this.logCallAttempt({
        contactId: contact.id,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        request: { 
          phoneNumber: contact.phone_number, 
          assistantId: vapiAssistantId,
          from: this.selectedPhoneNumber 
        }
      });

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to initiate call'
      };
    }
  }

  private async logCallAttempt(details: {
    contactId: string;
    success: boolean;
    callId?: string;
    error?: string;
    request?: any;
    response?: any;
  }): Promise<void> {
    try {
      await supabase.rpc('log_vapi_interaction', {
        p_campaign_id: this.campaignId,
        p_contact_id: details.contactId,
        p_request: details.request || null,
        p_response: details.response || { error: details.error },
        p_success: details.success
      });
    } catch (error) {
      console.error('[VAPIService] Error logging call attempt:', error);
    }
  }

  private async getWebhookBaseUrl(): Promise<string> {
    const { data: { publicUrl } } = await supabase.functions.invoke('get-public-url');
    return publicUrl || 'http://localhost:54321';
  }

  async setPhoneNumber(phoneNumber: string) {
    this.selectedPhoneNumber = phoneNumber;
  }
}
