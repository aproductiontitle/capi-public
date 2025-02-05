export type TeamRole = 'admin' | 'editor' | 'viewer';

export interface TeamMember {
  id: string;
  user_id: string;
  team_id: string;
  role: TeamRole;
  created_at: string;
  updated_at: string;
  profiles?: {
    first_name: string | null;
    last_name: string | null;
    email: string | null;
  };
}

export interface Team {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
}