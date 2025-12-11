# PST Monorepo

English→Persian subtitle translation service with persona-aware prompts, OpenRouter / LiteLLM model routing, and Nx-based workspace structure.

## Workspace at a glance (Nx)
- `services/backend` — HTTP API, translation pipeline, workers, infrastructure stubs. Tracked as the `backend` project in Nx.
- `packages/shared-types` — Cross-package enums/types (e.g., job status). Tracked as `shared-types` in Nx.
- `nx.json`, `pnpm-workspace.yaml`, `tsconfig.base.json` — Workspace plumbing to link the folders above and future apps/libs.

## Features
- Nx workspace linking backend app and shared types for future packages.
- Persona catalog with preferred models (Claude Sonnet/Haiku 4.5, GPT-5.1, Gemini 3 Pro, Gemini 2.5 Flash).
- OpenRouter-backed AI gateway with persona-aware prompt builder and optional LiteLLM-style model hints.
- Translation memory stubs (PostgreSQL + pgvector), graph hooks (Neo4j), and workflow hooks (Temporal) ready to be swapped for real services.
- SRT parsing/serialization to preserve subtitle timing.

## Prerequisites
- Node.js 18+ and pnpm 8+.
- Optional: Docker (for running Postgres/pgvector, Redis/Temporal, and Neo4j locally).
- OpenRouter API key if you want real LLM calls (otherwise the gateway returns stubbed text).

## Local setup
1. Install dependencies:
   ```bash
   pnpm install
   ```

2. Create an `.env` file (see [.env.example](.env.example)):
   ```bash
   cp .env.example .env
   ```
   Fill in your `OPENROUTER_API_KEY` and adjust DB/graph endpoints if you have them running.

3. (Optional) Start local infra with pgvector/Redis/Neo4j/Temporal:
   ```bash
   docker compose up -d postgres redis neo4j temporal
   ```
   The defaults align with `DATABASE_URL`, `NEO4J_URI`, and Temporal ports in `.env.example`.

4. Start the backend API (from the repo root):
   ```bash
   pnpm dev:backend
   ```
   The server listens on `http://localhost:3000` by default.

## API quickstart
- Health check:
  ```bash
  curl http://localhost:3000/health
  ```

- List personas:
  ```bash
  curl http://localhost:3000/personas
  ```

- Submit a translation job (plain text or SRT):
  ```bash
  curl -X POST http://localhost:3000/translations \
    -H 'Content-Type: application/json' \
    -d '{
      "content": "1\n00:00:01,000 --> 00:00:03,000\nHello there!",
      "targetLanguage": "fa",
      "personaId": "localization_pro",
      "model": "anthropic/claude-3.5-sonnet",
      "options": {"glossary": [{"source": "Hello", "target": "سلام"}]}
    }'
  ```

- Fetch job status/output:
  ```bash
  curl http://localhost:3000/translations/<jobId>
  ```

## Nx commands
- Lint JS syntax (fast):
  ```bash
  pnpm lint
  ```
- Type-check JS via TypeScript (workspace-wide):
  ```bash
  pnpm typecheck
  ```
- Visualize dependency graph:
  ```bash
  pnpm graph
  ```

## Optional services
- **Translation Memory (Postgres + pgvector):** Wire `DATABASE_URL` to your Postgres instance. Current implementation keeps an in-memory map but logs the intent for future DB swap.
- **Neo4j:** Set `NEO4J_URI` to capture persona/model usage relationships (currently logged).
- **Temporal.io:** Enable workflow signals by setting `TEMPORAL_ENABLED=true` and pointing to your Temporal deployment (currently logged hooks).

## Notes
- Without an `OPENROUTER_API_KEY`, the AI gateway returns stubbed translations so the pipeline still works locally.
- Replace stub repositories/services with real implementations incrementally—interfaces are kept small to simplify swapping.
