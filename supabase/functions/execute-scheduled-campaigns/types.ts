export interface Campaign {
  id: string;
  user_id: string;
  name: string;
  assistant_id: string;
  scheduled_time: string;
  status: string;
  assistant?: {
    id: string;
    name: string;
    vapi_assistant_id: string;
  };
}

export interface Contact {
  id: string;
  name: string;
  phone_number: string;
  status: string;
}

export interface ValidationResult {
  isValid: boolean;
  error?: string;
  vapiKey?: string;
}

export interface VapiCallConfig {
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
  };
}

export interface VAPIMetrics {
  avgDuration: number;
  successRate: number;
  totalCalls: number;
}

export interface QueueJob {
  id: string;
  campaignId: string;
  priority: number;
  retries: number;
  status: string;
  nextRetry: Date | null;
  lastError: string | null;
}