# PST Monorepo

English→Persian subtitle translation service with persona-aware prompts, OpenRouter / LiteLLM model routing, and Nx-based workspace structure.

## Workspace at a glance (Nx)
- `services/backend` — HTTP API, translation pipeline, workers, infrastructure stubs. Tracked as the `backend` project in Nx.
- `packages/shared-types` — Cross-package enums/types (e.g., job status). Tracked as `shared-types` in Nx.
- `nx.json`, `pnpm-workspace.yaml`, `tsconfig.base.json` — Workspace plumbing to link the folders above and future apps/libs.

## Features
- Nx workspace linking backend app and shared types for future packages.
- Persona catalog with preferred models, including web-grounded choices (Perplexity Sonar online variants) plus Claude, GPT-4.1, and Gemini 1.5 tiers.
- OpenRouter-backed AI gateway with persona-aware prompt builder and optional LiteLLM-style model hints.
- Translation memory stubs (PostgreSQL + pgvector), graph hooks (Neo4j), and workflow hooks (Temporal) ready to be swapped for real services.
- SRT parsing/serialization to preserve subtitle timing.

## Prerequisites
- Node.js 18+ and pnpm 8+.
- Optional: Docker (for running Postgres/pgvector, Redis/Temporal, and Neo4j locally).
- OpenRouter API key if you want real LLM calls (otherwise the gateway returns stubbed text).

## Local setup
### Bring it to life locally (step-by-step)
1. Install prerequisites: Node.js 18+, pnpm 8+, and Docker if you want the optional infra.
2. Install dependencies:
   ```bash
   pnpm install
   ```
3. Create an `.env` file and set your keys:
   ```bash
   cp .env.example .env
   ```
   - Set `OPENROUTER_API_KEY`.
   - Keep `DEFAULT_LLM_MODEL` as the web-grounded Sonar default or swap to a persona-specific pick (see `/personas`).
4. (Optional but recommended) Start local infra for persistence/queue/graph/workflows:
   ```bash
   docker compose up -d postgres redis neo4j temporal
   ```
   The URLs in `.env` already point at these services.
5. Launch the backend API (from repo root):
   ```bash
   pnpm dev:backend
   ```
   The server listens on `http://localhost:3000`.
6. Explore endpoints:
   - `GET /health` — readiness check
   - `GET /personas` — persona catalog with model suggestions
   - `POST /translations` — submit jobs; include `personaId` and optional `model` override
7. (Optional) Validate code: `pnpm lint` and `pnpm typecheck` (requires Nx binary download).

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
