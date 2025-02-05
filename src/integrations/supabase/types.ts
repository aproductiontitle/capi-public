export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      admins: {
        Row: {
          created_at: string
          email: string
          id: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      assistants: {
        Row: {
          created_at: string | null
          greeting_message: string
          id: string
          name: string
          system_prompt: string | null
          updated_at: string | null
          user_id: string
          vapi_assistant_id: string | null
        }
        Insert: {
          created_at?: string | null
          greeting_message: string
          id?: string
          name: string
          system_prompt?: string | null
          updated_at?: string | null
          user_id: string
          vapi_assistant_id?: string | null
        }
        Update: {
          created_at?: string | null
          greeting_message?: string
          id?: string
          name?: string
          system_prompt?: string | null
          updated_at?: string | null
          user_id?: string
          vapi_assistant_id?: string | null
        }
        Relationships: []
      }
      audit_logs: {
        Row: {
          action: Database["public"]["Enums"]["audit_action"]
          details: Json | null
          id: string
          ip_address: string | null
          timestamp: string
          user_agent: string | null
          user_id: string
        }
        Insert: {
          action: Database["public"]["Enums"]["audit_action"]
          details?: Json | null
          id?: string
          ip_address?: string | null
          timestamp?: string
          user_agent?: string | null
          user_id: string
        }
        Update: {
          action?: Database["public"]["Enums"]["audit_action"]
          details?: Json | null
          id?: string
          ip_address?: string | null
          timestamp?: string
          user_agent?: string | null
          user_id?: string
        }
        Relationships: []
      }
      campaign_contacts: {
        Row: {
          call_duration: number | null
          call_ended_at: string | null
          call_started_at: string | null
          campaign_id: string
          created_at: string | null
          id: string
          last_error: string | null
          name: string
          phone_number: string
          retry_count: number | null
          sentiment: string | null
          source_list_id: string | null
          status: string
          transcript: string | null
          updated_at: string | null
        }
        Insert: {
          call_duration?: number | null
          call_ended_at?: string | null
          call_started_at?: string | null
          campaign_id: string
          created_at?: string | null
          id?: string
          last_error?: string | null
          name: string
          phone_number: string
          retry_count?: number | null
          sentiment?: string | null
          source_list_id?: string | null
          status?: string
          transcript?: string | null
          updated_at?: string | null
        }
        Update: {
          call_duration?: number | null
          call_ended_at?: string | null
          call_started_at?: string | null
          campaign_id?: string
          created_at?: string | null
          id?: string
          last_error?: string | null
          name?: string
          phone_number?: string
          retry_count?: number | null
          sentiment?: string | null
          source_list_id?: string | null
          status?: string
          transcript?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "campaign_contacts_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaign_health_metrics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campaign_contacts_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campaign_contacts_source_list_id_fkey"
            columns: ["source_list_id"]
            isOneToOne: false
            referencedRelation: "contact_lists"
            referencedColumns: ["id"]
          },
        ]
      }
      campaign_events: {
        Row: {
          campaign_id: string
          created_at: string | null
          event_type: string
          from_state: string | null
          id: string
          metadata: Json | null
          to_state: string | null
        }
        Insert: {
          campaign_id: string
          created_at?: string | null
          event_type: string
          from_state?: string | null
          id?: string
          metadata?: Json | null
          to_state?: string | null
        }
        Update: {
          campaign_id?: string
          created_at?: string | null
          event_type?: string
          from_state?: string | null
          id?: string
          metadata?: Json | null
          to_state?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "campaign_events_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaign_health_metrics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campaign_events_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      campaign_execution_metrics: {
        Row: {
          campaign_id: string | null
          created_at: string | null
          id: string
          last_execution_details: Json | null
          last_successful_execution: string | null
          updated_at: string | null
        }
        Insert: {
          campaign_id?: string | null
          created_at?: string | null
          id?: string
          last_execution_details?: Json | null
          last_successful_execution?: string | null
          updated_at?: string | null
        }
        Update: {
          campaign_id?: string | null
          created_at?: string | null
          id?: string
          last_execution_details?: Json | null
          last_successful_execution?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "campaign_execution_metrics_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaign_health_metrics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campaign_execution_metrics_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      campaign_queue: {
        Row: {
          campaign_id: string
          created_at: string | null
          id: string
          last_error: string | null
          next_retry: string | null
          priority: number | null
          retries: number | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          campaign_id: string
          created_at?: string | null
          id?: string
          last_error?: string | null
          next_retry?: string | null
          priority?: number | null
          retries?: number | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          campaign_id?: string
          created_at?: string | null
          id?: string
          last_error?: string | null
          next_retry?: string | null
          priority?: number | null
          retries?: number | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "campaign_queue_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaign_health_metrics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campaign_queue_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      campaigns: {
        Row: {
          assistant: Json | null
          assistant_id: string
          created_at: string | null
          current_retry_count: number | null
          execution_attempts: number | null
          execution_batch_id: string | null
          execution_error: string | null
          execution_lock_id: string | null
          execution_lock_time: string | null
          id: string
          last_execution_attempt: string | null
          last_validation_error: string | null
          last_validation_time: string | null
          last_webhook_received: string | null
          max_retries: number | null
          name: string
          next_retry_time: string | null
          scheduled_time: string
          status: string
          timezone: string | null
          updated_at: string | null
          user_id: string
          validation_attempts: number | null
          validation_details: Json | null
          vapi_config_validated: boolean | null
        }
        Insert: {
          assistant?: Json | null
          assistant_id: string
          created_at?: string | null
          current_retry_count?: number | null
          execution_attempts?: number | null
          execution_batch_id?: string | null
          execution_error?: string | null
          execution_lock_id?: string | null
          execution_lock_time?: string | null
          id?: string
          last_execution_attempt?: string | null
          last_validation_error?: string | null
          last_validation_time?: string | null
          last_webhook_received?: string | null
          max_retries?: number | null
          name: string
          next_retry_time?: string | null
          scheduled_time: string
          status?: string
          timezone?: string | null
          updated_at?: string | null
          user_id: string
          validation_attempts?: number | null
          validation_details?: Json | null
          vapi_config_validated?: boolean | null
        }
        Update: {
          assistant?: Json | null
          assistant_id?: string
          created_at?: string | null
          current_retry_count?: number | null
          execution_attempts?: number | null
          execution_batch_id?: string | null
          execution_error?: string | null
          execution_lock_id?: string | null
          execution_lock_time?: string | null
          id?: string
          last_execution_attempt?: string | null
          last_validation_error?: string | null
          last_validation_time?: string | null
          last_webhook_received?: string | null
          max_retries?: number | null
          name?: string
          next_retry_time?: string | null
          scheduled_time?: string
          status?: string
          timezone?: string | null
          updated_at?: string | null
          user_id?: string
          validation_attempts?: number | null
          validation_details?: Json | null
          vapi_config_validated?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "campaigns_assistant_id_fkey"
            columns: ["assistant_id"]
            isOneToOne: false
            referencedRelation: "assistants"
            referencedColumns: ["id"]
          },
        ]
      }
      circuit_breaker_state: {
        Row: {
          campaign_id: string
          cooldown_until: string | null
          created_at: string | null
          failure_count: number | null
          failure_window: Json | null
          id: string
          last_failure: string | null
          last_success: string | null
          success_count: number | null
          updated_at: string | null
        }
        Insert: {
          campaign_id: string
          cooldown_until?: string | null
          created_at?: string | null
          failure_count?: number | null
          failure_window?: Json | null
          id?: string
          last_failure?: string | null
          last_success?: string | null
          success_count?: number | null
          updated_at?: string | null
        }
        Update: {
          campaign_id?: string
          cooldown_until?: string | null
          created_at?: string | null
          failure_count?: number | null
          failure_window?: Json | null
          id?: string
          last_failure?: string | null
          last_success?: string | null
          success_count?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "circuit_breaker_state_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaign_health_metrics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "circuit_breaker_state_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      contact_lists: {
        Row: {
          contact_count: number | null
          created_at: string
          description: string | null
          ghl_list_id: string | null
          ghl_location_id: string | null
          id: string
          name: string
          source: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          contact_count?: number | null
          created_at?: string
          description?: string | null
          ghl_list_id?: string | null
          ghl_location_id?: string | null
          id?: string
          name: string
          source?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          contact_count?: number | null
          created_at?: string
          description?: string | null
          ghl_list_id?: string | null
          ghl_location_id?: string | null
          id?: string
          name?: string
          source?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      contacts: {
        Row: {
          created_at: string
          email: string | null
          first_name: string
          ghl_contact_id: string | null
          ghl_location_id: string | null
          id: string
          imported_from: string | null
          last_name: string | null
          list_id: string
          metadata: Json | null
          phone_number: string
          source: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          first_name: string
          ghl_contact_id?: string | null
          ghl_location_id?: string | null
          id?: string
          imported_from?: string | null
          last_name?: string | null
          list_id: string
          metadata?: Json | null
          phone_number: string
          source?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string | null
          first_name?: string
          ghl_contact_id?: string | null
          ghl_location_id?: string | null
          id?: string
          imported_from?: string | null
          last_name?: string | null
          list_id?: string
          metadata?: Json | null
          phone_number?: string
          source?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "contacts_list_id_fkey"
            columns: ["list_id"]
            isOneToOne: false
            referencedRelation: "contact_lists"
            referencedColumns: ["id"]
          },
        ]
      }
      cron_job_logs: {
        Row: {
          error: string | null
          execution_time: string | null
          id: string
          job_name: string | null
          status: string | null
        }
        Insert: {
          error?: string | null
          execution_time?: string | null
          id?: string
          job_name?: string | null
          status?: string | null
        }
        Update: {
          error?: string | null
          execution_time?: string | null
          id?: string
          job_name?: string | null
          status?: string | null
        }
        Relationships: []
      }
      ghl_credentials: {
        Row: {
          access_token: string
          created_at: string
          expires_at: string
          id: string
          location_id: string | null
          refresh_token: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          access_token: string
          created_at?: string
          expires_at: string
          id?: string
          location_id?: string | null
          refresh_token: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          access_token?: string
          created_at?: string
          expires_at?: string
          id?: string
          location_id?: string | null
          refresh_token?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      knowledge_bases: {
        Row: {
          created_at: string
          file_path: string
          file_size: number
          file_type: string
          id: string
          name: string
          status: string | null
          team_id: string | null
          updated_at: string
          user_id: string
          vapi_id: string | null
        }
        Insert: {
          created_at?: string
          file_path: string
          file_size: number
          file_type: string
          id?: string
          name: string
          status?: string | null
          team_id?: string | null
          updated_at?: string
          user_id: string
          vapi_id?: string | null
        }
        Update: {
          created_at?: string
          file_path?: string
          file_size?: number
          file_type?: string
          id?: string
          name?: string
          status?: string | null
          team_id?: string | null
          updated_at?: string
          user_id?: string
          vapi_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "knowledge_bases_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      mfa_settings: {
        Row: {
          created_at: string
          enabled: boolean | null
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          enabled?: boolean | null
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          enabled?: boolean | null
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      phone_number_configurations: {
        Row: {
          created_at: string
          id: string
          is_default: boolean | null
          phone_number: string
          provider: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_default?: boolean | null
          phone_number: string
          provider?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_default?: boolean | null
          phone_number?: string
          provider?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      phone_number_provider_credentials: {
        Row: {
          created_at: string
          credentials: Json
          id: string
          provider: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          credentials: Json
          id?: string
          provider: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          credentials?: Json
          id?: string
          provider?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          first_name: string | null
          id: string
          last_name: string | null
          updated_at: string
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          first_name?: string | null
          id: string
          last_name?: string | null
          updated_at?: string
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          first_name?: string | null
          id?: string
          last_name?: string | null
          updated_at?: string
          username?: string | null
        }
        Relationships: []
      }
      secrets: {
        Row: {
          created_at: string
          id: string
          name: string
          secret: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          secret: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          secret?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      team_invitations: {
        Row: {
          created_at: string
          email: string
          expires_at: string
          id: string
          role: Database["public"]["Enums"]["team_role"]
          team_id: string | null
          token: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          expires_at: string
          id?: string
          role?: Database["public"]["Enums"]["team_role"]
          team_id?: string | null
          token: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          expires_at?: string
          id?: string
          role?: Database["public"]["Enums"]["team_role"]
          team_id?: string | null
          token?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "team_invitations_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      team_members: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["team_role"]
          team_id: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["team_role"]
          team_id?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["team_role"]
          team_id?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "team_members_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      teams: {
        Row: {
          created_at: string
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      vapi_performance_metrics: {
        Row: {
          avg_duration: number
          id: string
          metadata: Json | null
          success_rate: number
          timestamp: string | null
          total_calls: number
          user_id: string
        }
        Insert: {
          avg_duration: number
          id?: string
          metadata?: Json | null
          success_rate: number
          timestamp?: string | null
          total_calls: number
          user_id: string
        }
        Update: {
          avg_duration?: number
          id?: string
          metadata?: Json | null
          success_rate?: number
          timestamp?: string | null
          total_calls?: number
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      campaign_health_metrics: {
        Row: {
          completed_contacts: number | null
          current_retry_count: number | null
          execution_attempts: number | null
          failed_contacts: number | null
          id: string | null
          last_execution_details: Json | null
          last_successful_execution: string | null
          last_validation_error: string | null
          last_validation_time: string | null
          last_webhook_received: string | null
          latest_contact_error: string | null
          name: string | null
          pending_contacts: number | null
          status: string | null
          total_contacts: number | null
          validation_attempts: number | null
          validation_stack_trace: string | null
          vapi_config_validated: boolean | null
        }
        Relationships: []
      }
    }
    Functions: {
      acquire_campaign_execution_lock:
        | {
            Args: {
              p_campaign_id: string
              p_lock_id: string
            }
            Returns: {
              lock_acquired: boolean
              batch_id: string
            }[]
          }
        | {
            Args: {
              p_campaign_id: string
              p_lock_id: string
              p_max_attempts?: number
            }
            Returns: {
              lock_acquired: boolean
              batch_id: string
              attempt_number: number
              next_retry_delay: unknown
            }[]
          }
      calculate_jitter: {
        Args: {
          base_delay: unknown
        }
        Returns: unknown
      }
      check_circuit_breaker_state: {
        Args: {
          p_campaign_id: string
        }
        Returns: {
          is_open: boolean
          cooldown_remaining: unknown
          failure_rate: number
          recovery_progress: number
        }[]
      }
      get_user_accessible_teams: {
        Args: {
          user_uuid: string
        }
        Returns: {
          team_id: string
        }[]
      }
      is_admin: {
        Args: {
          user_id: string
        }
        Returns: boolean
      }
      is_team_admin: {
        Args: {
          team_id: string
          user_id: string
        }
        Returns: boolean
      }
      is_team_member: {
        Args: {
          team_id: string
          user_id: string
        }
        Returns: boolean
      }
      log_campaign_execution_attempt: {
        Args: {
          p_campaign_id: string
          p_status: string
          p_details: Json
        }
        Returns: undefined
      }
      log_campaign_validation_attempt: {
        Args: {
          campaign_id: string
          validation_result: Json
        }
        Returns: undefined
      }
      log_vapi_interaction: {
        Args: {
          p_campaign_id: string
          p_contact_id: string
          p_request: Json
          p_response: Json
          p_success: boolean
        }
        Returns: undefined
      }
      prepare_campaign_batch: {
        Args: {
          p_campaign_id: string
          batch_size?: number
        }
        Returns: {
          contact_id: string
          phone_number: string
          assistant_id: string
          batch_id: string
        }[]
      }
      record_circuit_breaker_failure: {
        Args: {
          p_campaign_id: string
          p_error_details?: Json
        }
        Returns: undefined
      }
      record_circuit_breaker_success: {
        Args: {
          p_campaign_id: string
        }
        Returns: undefined
      }
      validate_campaign_atomic: {
        Args: {
          p_campaign_id: string
        }
        Returns: {
          is_valid: boolean
          error_details: Json
        }[]
      }
      validate_vapi_configuration: {
        Args: {
          campaign_id: string
        }
        Returns: boolean
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
    }
    Enums: {
      audit_action:
        | "login"
        | "logout"
        | "password_change"
        | "profile_update"
        | "api_key_access"
        | "data_export"
        | "settings_change"
        | "vapi_interaction"
        | "circuit_breaker_failure"
        | "circuit_breaker_reset"
      campaign_error_type: "CONFIGURATION" | "TRANSIENT" | "RESOURCE" | "FATAL"
      campaign_state:
        | "draft"
        | "validating"
        | "ready"
        | "scheduled"
        | "executing"
        | "failed_validation"
        | "failed_execution"
        | "completed"
        | "cancelled"
      team_role: "admin" | "editor" | "viewer"
      user_role: "admin" | "user"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
