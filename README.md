# PST Monorepo

English→Persian subtitle translation service with persona-aware prompts, OpenRouter / LiteLLM model routing, and Nx-based workspace structure.

## Features
- Nx workspace linking backend app and shared types for future packages
- Persona catalog with preferred models (Claude Sonnet/Haiku 4.5, GPT-5.1, Gemini 3 Pro, Gemini 2.5 Flash)
- OpenRouter-backed AI gateway with persona-aware prompt builder and optional LiteLLM-style model hints
- Translation memory stubs (PostgreSQL + pgvector), graph hooks (Neo4j), and workflow hooks (Temporal) ready to be swapped for real services
- SRT parsing/serialization to preserve subtitle timing

## Prerequisites
- Node.js 18+ and pnpm 8+
- Optional: Docker (for running Postgres/pgvector, Redis/Temporal, and Neo4j locally)
- OpenRouter API key if you want real LLM calls (otherwise the gateway returns stubbed text)

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

3. Start the backend API:
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

## Optional services
- **Translation Memory (Postgres + pgvector):** Wire `DATABASE_URL` to your Postgres instance. Current implementation keeps an in-memory map but logs the intent for future DB swap.
- **Neo4j:** Set `NEO4J_URI` to capture persona/model usage relationships (currently logged).
- **Temporal.io:** Enable workflow signals by setting `TEMPORAL_ENABLED=true` and pointing to your Temporal deployment (currently logged hooks).

## Project structure
- `services/backend`: HTTP server, translation pipeline, workers, infrastructure stubs
- `packages/shared-types`: Cross-package enums/types (e.g., job status)
- `nx.json`, `pnpm-workspace.yaml`: Workspace wiring for additional packages or front-end apps later

## Notes
- Without an `OPENROUTER_API_KEY`, the AI gateway returns stubbed translations so the pipeline still works locally.
- Replace stub repositories/services with real implementations incrementally—interfaces are kept small to simplify swapping.
