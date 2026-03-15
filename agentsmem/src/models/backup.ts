export interface BackupSummary {
  id: string;
  file_id: string;
  user_id: string;
  agent_id: string;
  agent_name: string;
  file_name: string;
  file_path: string;
  ciphertext_md5: string;
  file_size_bytes: number;
  content_type: string;
  timestamp: string;
}

export interface BackupDownload extends BackupSummary {
  blob_data: Buffer;
}
