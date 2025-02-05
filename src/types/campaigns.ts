import { CampaignContact } from "@/components/campaigns/types";

export interface HealthMetrics {
  totalContacts: number;
  pendingContacts: number;
  completedContacts: number;
  failedContacts: number;
  vapiErrorCount: number;
  consecutiveFailures: number;
  lastError: string;
  vapiResponseTimeMs: number;
  vapi_config_validated: boolean;
  last_validation_error: string | null;
  error_classification?: string;
  state_transition_history?: Array<{
    from: string | null;
    to: string;
    timestamp: string;
    reason?: string;
  }>;
  validation_steps_completed?: Array<{
    timestamp: string;
    step: string;
    success: boolean;
    error?: string;
  }>;
  last_validation_time?: string;
}

export interface Campaign {
  id: string;
  name: string;
  status: string;
  assistant_id: string;
  user_id: string;
  scheduled_time: string;
  created_at?: string;
  updated_at?: string;
  execution_error?: string;
  validation_details?: Array<{
    vapi_config_validated: boolean;
    last_validation_error: string | null;
  }>;
  assistant?: {
    id: string;
    name: string;
    vapi_assistant_id: string;
  };
  contacts?: CampaignContact[];
}