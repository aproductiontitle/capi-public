export interface Campaign {
  id: string;
  name: string;
  status: string;
  scheduled_time: string;
  assistant_id: string;
  assistant?: {
    name: string;
  };
  contacts?: Contact[];
}

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