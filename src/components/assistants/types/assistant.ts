export interface Assistant {
  id: string;
  name: string;
  greeting_message: string;
  vapi_assistant_id?: string;
  created_at?: string;
  updated_at?: string;
  system_prompt?: string;
}

export interface AssistantFormValues {
  name: string;
  systemPrompt: string;
  firstMessage: string;
  voiceProvider: string;
  voiceId: string;
  model: string;
  stability: number;
  similarityBoost: number;
  styleExaggeration: number;
  optimizeStreamingLatency: boolean;
  speakerBoost: boolean;
  provider: string;
  temperature: number;
  maxTokens: number;
  detectEmotion: boolean;
}