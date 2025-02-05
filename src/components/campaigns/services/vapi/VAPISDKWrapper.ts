import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface VAPIConfig {
  phoneNumber: string;
  assistantId: string;
  knowledgeBaseId?: string;
  webhookUrl: string;
  errorWebhookUrl: string;
}

export class VAPISDKWrapper {
  private vapiKey: string | null = null;
  private initialized = false;
  private baseUrl = 'https://api.vapi.ai';

  async initialize(): Promise<void> {
    if (this.initialized) return;

    const { data: vapiKeyData, error: keyError } = await supabase
      .from('secrets')
      .select('secret')
      .eq('name', 'VAPI_API_KEY')
      .single();

    if (keyError || !vapiKeyData?.secret) {
      console.error('Error fetching VAPI key:', keyError);
      toast.error('Please configure your VAPI API key in settings');
      throw new Error('VAPI API key not found');
    }

    this.vapiKey = vapiKeyData.secret;
    this.initialized = true;
  }

  private async makeRequest<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<T> {
    if (!this.initialized) await this.initialize();

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        'Authorization': `Bearer ${this.vapiKey}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('VAPI API error:', {
        status: response.status,
        endpoint,
        error
      });
      throw new Error(error.message || 'VAPI API request failed');
    }

    return response.json();
  }

  async validateAssistant(assistantId: string): Promise<boolean> {
    try {
      const assistant = await this.makeRequest(`/assistant/${assistantId}`);
      return !!assistant;
    } catch (error) {
      console.error('Assistant validation error:', error);
      return false;
    }
  }

  async getPhoneNumbers(): Promise<Array<{
    id: string;
    phoneNumber: string;
    provider: string;
    isAvailable: boolean;
  }>> {
    const response = await this.makeRequest<any[]>('/phone-number');
    
    return response.map(number => ({
      id: number.id,
      phoneNumber: number.number || number.phoneNumber,
      provider: (number.provider || 'vapi').toLowerCase(),
      isAvailable: !number.assistantId
    }));
  }

  async createCall(config: VAPIConfig) {
    return this.makeRequest('/call/phone', {
      method: 'POST',
      body: JSON.stringify({
        phoneNumber: config.phoneNumber,
        assistant: {
          id: config.assistantId,
          model: "gpt-4",
          systemPrompt: "You are making a phone call.",
          functions: [
            {
              name: "end_call",
              description: "End the call",
              parameters: { type: "object", properties: {} }
            }
          ]
        },
        webhook: {
          url: config.webhookUrl,
          headers: {
            'Authorization': `Bearer ${this.vapiKey}`
          }
        },
        errorWebhook: {
          url: config.errorWebhookUrl,
          headers: {
            'Authorization': `Bearer ${this.vapiKey}`
          }
        },
        config: {
          realtime_transcription: true,
          barge_in: true,
          silence_timeout_ms: 3000
        },
        ...(config.knowledgeBaseId && {
          knowledgeBase: {
            id: config.knowledgeBaseId
          }
        })
      })
    });
  }
}

export const vapiSDK = new VAPISDKWrapper();