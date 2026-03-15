-- =============================================================================
-- AgentsMem backup storage
-- =============================================================================

CREATE TABLE IF NOT EXISTS agents (
  id CHAR(36) PRIMARY KEY,
  user_id CHAR(36) NULL,
  agent_name_hash CHAR(64) NOT NULL,
  agent_name_ciphertext BLOB NOT NULL,
  api_key_hash CHAR(64) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_agent_name_hash (agent_name_hash),
  UNIQUE KEY uq_agent_name_hash (agent_name_hash),
  UNIQUE KEY uq_api_key_hash (api_key_hash)
);

CREATE TABLE IF NOT EXISTS users (
  id CHAR(36) PRIMARY KEY,
  agent_id CHAR(36) NOT NULL UNIQUE,
  email_hash CHAR(64) NULL,
  email_ciphertext BLOB NULL,
  is_claimed TINYINT(3) NOT NULL DEFAULT 0,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_email_hash (email_hash),
  UNIQUE KEY uq_users_email_hash (email_hash),
  FOREIGN KEY (agent_id) REFERENCES agents(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS backup_blobs (
  id CHAR(36) PRIMARY KEY,
  storage_provider VARCHAR(32) NOT NULL DEFAULT 'db',
  blob_data LONGBLOB NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_storage_provider (storage_provider)
);

CREATE TABLE IF NOT EXISTS backups (
  id CHAR(36) PRIMARY KEY,
  user_id CHAR(36) NOT NULL,
  agent_id CHAR(36) NOT NULL,
  blob_id CHAR(36) NOT NULL,
  file_id CHAR(36) NOT NULL,
  file_name_ciphertext BLOB NOT NULL,
  file_path_ciphertext BLOB NOT NULL,
  ciphertext_md5 CHAR(32) NOT NULL,
  file_size_bytes BIGINT NOT NULL,
  content_type_ciphertext BLOB NOT NULL,
  `timestamp` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_backups_file_id (file_id),
  KEY idx_backups_user_timestamp (user_id, `timestamp`),
  KEY idx_backups_agent_timestamp (agent_id, `timestamp`),
  KEY idx_backups_md5 (ciphertext_md5),
  KEY idx_backups_agent_ciphertext_md5 (agent_id, ciphertext_md5),
  CONSTRAINT backups_ibfk_1 FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
  CONSTRAINT backups_ibfk_2 FOREIGN KEY (agent_id) REFERENCES agents (id) ON DELETE CASCADE,
  CONSTRAINT backups_ibfk_3 FOREIGN KEY (blob_id) REFERENCES backup_blobs (id) ON DELETE CASCADE
);
