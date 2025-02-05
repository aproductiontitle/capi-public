import { Timestamps, UserOwned } from './common';

export interface Assistant extends Timestamps, UserOwned {
  id: string;
  name: string;
  greeting_message: string;
  vapi_assistant_id?: string;
}

export interface VAPIConfig {
  model: string;
  temperature?: number;
  maxTokens?: number;
  voice?: {
    provider: string;
    voiceId: string;
    settings?: Record<string, any>;
  };
}