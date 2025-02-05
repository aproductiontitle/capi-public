export interface Contact {
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

export interface ContactList {
  id: string;
  name: string;
  description?: string;
  contact_count: number;
  created_at: string;
  updated_at: string;
}