import { supabase } from "@/integrations/supabase/client";

export class VAPIClient {
  private static readonly API_ENDPOINT = 'https://api.vapi.ai/call/phone';
  private vapiKey: string | null = null;
  private initialized: boolean = false;

  async initialize(): Promise<void> {
    if (this.initialized) return;

    const { data: vapiKeyData, error: keyError } = await supabase
      .from('secrets')
      .select('secret')
      .eq('name', 'VAPI_API_KEY')
      .single();

    if (keyError || !vapiKeyData?.secret) {
      console.error('[VAPIClient] Error fetching VAPI key:', keyError);
      throw new Error('VAPI API key not found');
    }

    this.vapiKey = vapiKeyData.secret;
    this.initialized = true;
    console.log('[VAPIClient] Successfully initialized');
  }

  async makeRequest(endpoint: string, options: RequestInit): Promise<Response> {
    if (!this.initialized) await this.initialize();

    const response = await fetch(`https://api.vapi.ai${endpoint}`, {
      ...options,
      headers: {
        'Authorization': `Bearer ${this.vapiKey}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('[VAPIClient] API error:', {
        status: response.status,
        error,
        endpoint
      });
      throw new Error(error.message || 'VAPI API request failed');
    }

    return response;
  }
}