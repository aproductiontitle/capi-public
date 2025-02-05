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
  validation_details?: ValidationDetail[];
  validation_attempts?: number;
  assistant?: {
    id: string;
    name: string;
    vapi_assistant_id: string;
  };
  contacts?: CampaignContact[];
}

export interface CampaignContact {
  id: string;
  name: string;
  phone_number: string;
  status: string;
  call_duration: number | null;
  sentiment: string | null;
  retry_count: number;
  last_error: string | null;
  transcript: string | null;
}

export interface ExecutionAttempt {
  status: "started" | "completed" | "failed";
  error?: string;
  vapiResponse?: Record<string, any>;
  correlationId: string;
  timestamp?: string;
  details?: Record<string, any>;
}

export interface ExecutionDetails {
  vapi_errors?: number;
  response_time_ms?: number;
  error_type?: string;
  state_transitions?: StateTransition[];
  validation_steps?: ValidationStep[];
}

export interface HealthMetrics {
  // Base metrics from database view
  id: string;
  name: string | null;
  status: string | null;
  completed_contacts: number;
  current_retry_count: number;
  execution_attempts: number;
  failed_contacts: number;
  last_execution_details: ExecutionDetails;
  last_successful_execution: string;
  last_validation_error: string | null;
  last_validation_time: string | null;
  last_webhook_received: string | null;
  latest_contact_error: string | null;
  pending_contacts: number;
  total_contacts: number;
  validation_attempts: number;
  validation_stack_trace: string | null;
  vapi_config_validated: boolean;
  
  // Extended metrics for UI
  vapi_error_count: number;
  consecutive_failures: number;
  vapi_response_time_ms: number;
  error_classification: string | null;
  state_transition_history: StateTransition[];
  validation_steps_completed: ValidationStep[];
  circuit_breaker_status?: CircuitBreakerStatus;
}

export interface CircuitBreakerStatus {
  is_open: boolean;
  cooldown_remaining: string;
  failure_rate: number;
  recovery_progress: number;
}

export interface MetricsData {
  success_rate: number;
  avg_duration: number;
  timestamp: string | null;
  id: string;
  user_id: string;
  total_calls: number;
  metadata: Record<string, any>;
}

export interface VAPIInteractionParams {
  p_campaign_id: string;
  p_contact_id: string;
  p_request: Record<string, any>;
  p_response: Record<string, any>;
  p_success: boolean;
}

export interface StateTransition {
  from: string | null;
  to: string;
  timestamp: string;
  reason: string;
}

export interface ValidationStep {
  timestamp: string;
  step: string;
  success: boolean;
  error: string | null;
}

export interface CircuitBreakerResponse {
  is_open: boolean;
  cooldown_remaining: string;
  failure_count: number;
  last_failure: string;
}

export interface ValidationDetail {
  vapi_config_validated: boolean;
  last_validation_error: string | null;
}
