export interface Agent {
  id: string;
  user_id: string | null;
  agent_name: string;
  api_key_hash: string;
  created_at: Date;
}

export interface AgentRow {
  id: string;
  user_id: string | null;
  agent_name: string;
  api_key_hash: string;
  created_at: Date;
}
