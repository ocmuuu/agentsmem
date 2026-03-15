# AgentsMem Heartbeat — Daily Backup Schedule

AgentsMem does **not** have a server-side heartbeat or push mechanism. Instead, you (the agent) run a **local daily backup** to keep memory safe.

## How It Works

- The server never pushes, polls, or schedules anything. There is no `GET /api/v1/messages` or similar endpoint.
- **You** are responsible for running a daily backup cycle: encrypt memory files locally, then upload the ciphertext to AgentsMem via the API.
- This is a **local schedule** managed by you (the agent), not a server heartbeat.

## Daily Backup Cycle

Run this once every **24 hours** (e.g. at midnight, or at the start of each new session/day). The full backup workflow is documented in SKILL.md; here is the short version:

### 1. Check prerequisites

Before running the daily backup, verify:

- `credentials.json` exists with `agent_name` and `api_key`.
- `.vault` exists with the encryption key.
- The account has been claimed (otherwise API key auth returns `401`).
- Memory files exist. If no memory files are found, skip the backup and log: "No memory files; daily backup skipped."

### 2. Encrypt each memory file

```bash
SKILL_DIR=~/.openclaw/skills/agentsmem   # adjust to your environment
VAULT_KEY=$(cat "$SKILL_DIR/.vault")

# Python:
python3 "$SKILL_DIR/agentsmem_tool.py" \
  --encrypt --key "$VAULT_KEY" \
  --in ./memory/example.md \
  --out ./memory/example.md.enc

# Node:
node "$SKILL_DIR/agentsmem_tool.js" \
  --encrypt --key "$VAULT_KEY" \
  --in ./memory/example.md \
  --out ./memory/example.md.enc
```

The tool prints the ciphertext MD5 — save it for the upload step.

### 3. Upload each encrypted file

```bash
MD5="<ciphertext_md5>"
API_KEY=$(jq -r .api_key "$SKILL_DIR/credentials.json")

curl -s -X POST https://agentsmem.com/api/v1/upload \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/octet-stream" \
  -H "x-ciphertext-md5: $MD5" \
  -H "x-file-path: /memory/example.md" \
  -H "x-file-name: example.md.enc" \
  --data-binary @./memory/example.md.enc
```

### 4. Clean up and log

- Delete the `.enc` temp files after successful upload.
- Log the result locally (e.g. which files were backed up, timestamp, any errors).

## Frequency

| Setting | Value |
|---------|-------|
| Interval | **Once per day** (every 24 hours) |
| Trigger | Start of new day, new session, or on-demand by the owner |
| Retry on failure | Wait 5 minutes, then retry up to 3 times. If still failing, log the error and notify the owner on next interaction. |

## What NOT to Do

- **Do not poll** AgentsMem for messages, commands, or status.
- **Do not** run backups more than once per day unless the owner explicitly asks.
- **Do not** create a recurring HTTP call to any "heartbeat" or "ping" endpoint — none exists.

## Rate Limits

- 100 requests per minute per client. On `429`, wait and retry with backoff.
- A daily backup of a reasonable number of files will stay well within limits.

## Error Handling

| Error | Action |
|-------|--------|
| No memory files found | Skip backup, log "no files to back up" |
| `400` (MD5 mismatch) | Re-encrypt the file and retry upload |
| `401` (unauthorized) | Verify credentials.json and that the account is claimed |
| `429` (rate limit) | Wait and retry with exponential backoff |
| `5xx` (server error) | Retry after 5 minutes; notify owner if persistent |

## Summary

1. The server has no heartbeat — all scheduling is agent-side.
2. Run the backup workflow **once per day**: encrypt memory files → upload → log results.
3. If no memory files exist, skip and log.
4. On failure, retry up to 3 times with 5-minute intervals; escalate to the owner if persistent.
5. See SKILL.md for the full backup/restore workflow and setup instructions.
