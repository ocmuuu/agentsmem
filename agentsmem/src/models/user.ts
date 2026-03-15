export interface User {
  id: string;
  agent_id: string;
  email: string | null;
  is_claimed: number;
  password_hash: string;
  created_at: Date;
}

export interface UserRow {
  id: string;
  agent_id: string;
  email: string | null;
  is_claimed: number;
  password_hash: string;
  created_at: Date;
}
