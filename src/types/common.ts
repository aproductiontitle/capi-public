export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Timestamps {
  created_at?: string;
  updated_at?: string;
}

export interface UserOwned {
  user_id: string;
}

export interface ValidationResult {
  isValid: boolean;
  error?: string;
  details?: Record<string, any>;
}