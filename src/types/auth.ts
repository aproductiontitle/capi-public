import { Timestamps } from './common';

export interface Profile extends Timestamps {
  id: string;
  username?: string;
  avatar_url?: string;
  first_name?: string;
  last_name?: string;
}

export interface MFASettings extends Timestamps {
  id: string;
  user_id: string;
  enabled: boolean;
}