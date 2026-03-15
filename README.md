# AgentsMem

**Encrypted memory backup for AI agents.** Web app and API: upload, list, and download encrypted backups; manage agents and account from the dashboard.

[English](README.md) · [中文](README.zh-CN.md)

---

## What is AgentsMem?

AgentsMem lets your AI agent back up its memory in encrypted form. Encryption happens on the agent side—only ciphertext is uploaded. Neither AgentsMem nor anyone else can read your memory content; only you (and your agent with the local key) can decrypt it.

- **Agent-side encryption** — Keys stay on your side; we never see plaintext.
- **Backup API** — Upload, list, and download encrypted blobs by API key.
- **Web dashboard** — Claim your agent, manage backups, view history (optional; the agent can use the API directly).

## Project structure

| Path | Description |
|------|-------------|
| `src/` | Next.js frontend (pages, components, i18n) |
| `agentsmem/` | Backend API (Express, TypeScript, MySQL) |
| `docs/development/` | [Development guide](docs/development/README.md) (env, tests, workflow) |
| `tests/unit/` | Frontend Jest unit tests |
| `public/` | Static assets and public docs |

## Quick start

### 1. Environment

```bash
cp agentsmem/.env.example agentsmem/.env
# Set DB_HOST, DB_USER, DB_PASSWORD, DB_NAME in agentsmem/.env
```

### 2. Database

```bash
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS agentsmem;"
cd agentsmem && npm run db:migrate && cd ..
```

### 3. Run

- **Backend:** `cd agentsmem && npm install && npm run dev` → API at http://localhost:3011  
- **Frontend:** `npm install && npm run dev` → App at http://localhost:3010  

Set `AGENTSMEM_API_URL=http://localhost:3011` (e.g. in `.env.local`) so the Next.js app can call the API.

## Scripts

**Root (frontend):**

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Next.js dev server |
| `npm run build` | Build Next.js for production |
| `npm run lint` | Run ESLint |
| `npm run type-check` | Run `tsc --noEmit` |
| `npm run test` | Run all Jest tests |
| `npm run test:unit` | Run only `tests/unit/` tests |
| `npm run test:watch` | Jest watch mode |
| `npm run test:coverage` | Jest with coverage report |

**Backend** (inside `agentsmem/`): `npm run dev`, `npm run build`, `npm run start`, `npm run db:migrate`.

## Documentation

- [Development workflow & testing](docs/development/README.md)
- [Backend API & config](agentsmem/) (see `agentsmem/` source and `.env.example`)

## Tech stack

- **Frontend:** Next.js 14, React 18, TypeScript, Tailwind CSS  
- **Backend:** Node.js, Express, TypeScript, MySQL  
- **Auth:** Agent API key; dashboard uses cookie session (JWT)

## Security

Backups are encrypted before upload. We store only ciphertext and metadata. See the in-app [Security](https://agentsmem.com/security) page (or `/security` when running locally) for a short explanation of why your memory stays private.

## License

See [LICENSE](LICENSE) (or repository license).

## Repository

**[https://github.com/ocmuuu/agentsmem](https://github.com/ocmuuu/agentsmem)**
