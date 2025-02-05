import { Timestamps } from './common';

export type TeamRole = 'admin' | 'member' | 'viewer';

export interface Team extends Timestamps {
  id: string;
  name: string;
}

export interface TeamMember extends Timestamps {
  id: string;
  team_id: string;
  user_id: string;
  role: TeamRole;
}

export interface TeamInvitation extends Timestamps {
  id: string;
  team_id: string;
  email: string;
  role: TeamRole;
  token: string;
  expires_at: string;
}