export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      campaigns: {
        Row: {
          id: string
          name: string
          status: string
          assistant_id: string
          user_id: string
          scheduled_time: string
          created_at?: string
          updated_at?: string
          execution_error?: string
          validation_details?: Array<{
            vapi_config_validated: boolean
            last_validation_error: string | null
          }>
        }
        Insert: {
          id?: string
          name: string
          status?: string
          assistant_id: string
          user_id: string
          scheduled_time: string
        }
        Update: {
          id?: string
          name?: string
          status?: string
          assistant_id?: string
          user_id?: string
          scheduled_time?: string
        }
      }
      campaign_health_metrics: {
        Row: {
          id: string
          total_contacts: number
          pending_contacts: number
          completed_contacts: number
          failed_contacts: number
          vapi_error_count: number
          consecutive_failures: number
          latest_contact_error: string | null
          vapi_response_time_ms: number
          vapi_config_validated: boolean
          last_validation_error: string | null
        }
        Insert: {
          id: string
          total_contacts: number
          pending_contacts: number
          completed_contacts: number
          failed_contacts: number
          vapi_error_count: number
          consecutive_failures: number
          latest_contact_error?: string | null
          vapi_response_time_ms: number
          vapi_config_validated: boolean
          last_validation_error?: string | null
        }
        Update: {
          id?: string
          total_contacts?: number
          pending_contacts?: number
          completed_contacts?: number
          failed_contacts?: number
          vapi_error_count?: number
          consecutive_failures?: number
          latest_contact_error?: string | null
          vapi_response_time_ms?: number
          vapi_config_validated?: boolean
          last_validation_error?: string | null
        }
      }
      campaign_execution_metrics: {
        Row: {
          id: string
          campaign_id: string
          last_execution_details: Json
        }
        Insert: {
          id?: string
          campaign_id: string
          last_execution_details: Json
        }
        Update: {
          id?: string
          campaign_id?: string
          last_execution_details?: Json
        }
      }
      audit_logs: {
        Row: {
          id: string
          user_id: string
          action: string
          details: Json
          timestamp: string
        }
        Insert: {
          id?: string
          user_id: string
          action: string
          details: Json
          timestamp?: string
        }
        Update: {
          id?: string
          user_id?: string
          action?: string
          details?: Json
          timestamp?: string
        }
      }
    }
    Functions: {
      log_campaign_execution_attempt: {
        Args: {
          p_campaign_id: string
          p_status: string
          p_details: Json
        }
        Returns: void
      }
      check_circuit_breaker_state: {
        Args: {
          p_campaign_id: string
        }
        Returns: {
          is_open: boolean
          cooldown_remaining: string | null
        }[]
      }
      acquire_campaign_execution_lock: {
        Args: {
          p_campaign_id: string
          p_lock_id: string
        }
        Returns: {
          lock_acquired: boolean
        }[]
      }
      validate_vapi_configuration_detailed: {
        Args: {
          campaign_id: string
        }
        Returns: {
          is_valid: boolean
          validation_details: Json
        }[]
      }
      log_vapi_interaction: {
        Args: {
          p_campaign_id: string
          p_contact_id: string
          p_request: Json
          p_response: Json
          p_success: boolean
        }
        Returns: void
      }
    }
    Enums: {
      campaign_status: {
        scheduled: 'scheduled'
        in_progress: 'in_progress'
        completed: 'completed'
        failed: 'failed'
      }
    }
  }
}
