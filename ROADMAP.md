# English → Persian Subtitle Translator Roadmap
_Maintained by a senior program engineer and code assistant for quality and traceability._

This roadmap assumes Gemini 3 Pro / 2.5 Flash plus OpenRouter models (Claude Sonnet/Haiku, GPT-5.1) behind a LiteLLM-style gateway, a TypeScript/Node.js backend, and an Nx monorepo layout. Python is optional; start with Node.js only.

## 1) Foundations and version control
- Install Docker + Docker Compose, Node.js 20+, pnpm, and Nx CLI.
- Create a GitHub repository to track changes and issues; keep OpenRouter/LiteLLM keys out of git history.
- Put secrets (Gemini/OpenRouter API keys) in `.env` and reference them from `docker-compose`.

## 2) Local stack (start simple)
- Services: API (Node.js/TypeScript), Redis/BullMQ queue, PostgreSQL + pgvector (jobs + translation memory), MinIO (local S3-compatible storage), LiteLLM/OpenRouter proxy, optional Neo4j (persona/model graph), Temporal worker (workflow signals).
- Keep pgvector on from day one for vocabulary/TM; start with in-memory but wire the interface for Postgres.
- NX manages apps (`services/`) and libs (`packages/`). Temporal, Neo4j, and LangChain remain optional yet pre-wired.

## 3) Persona design (quality-first)
- Define 3–4 strong presets with tone, constraints, and do-not-translate terms (e.g., product names).
  - Academic Linguist (formal, source-faithful, explains nuance when needed).
  - Subtitle Localization Pro (natural Persian dialogue, respects subtitle brevity and timing).
  - Cultural Mediator (bridges idioms and cultural references, keeps clarity for Persian audiences).
  - Youthful Conversationalist (informal tone, safe slang, keeps readability).
- Store personas as structured config (id, name, description, guidance, guardrails).

## 4) API surface
- POST `/translations`: upload SRT/VTT text or URL, choose persona, options (formality, honorifics), and target language (default `fa`).
- GET `/translations/:id`: job status and download links for original/translated files.
- GET `/personas`: list available personas and descriptions.
- Healthcheck endpoint for ops.

## 5) Subtitle ingestion and validation
- Parse and validate SRT/VTT; enforce max file size and Unicode normalization.
- Persist originals in MinIO/S3 under job-specific keys; keep DB rows for job metadata.
- Reject unsafe content early (basic profanity/safety checks).

## 6) Job pipeline
- Use BullMQ (Redis) for async jobs with retries/backoff.
- States: pending → analyzing → translating → reviewing/validating → completed/failed.
- Worker steps:
  1. Optional analysis (word count, language detection, heuristic quality checks).
  2. Chunk subtitles into token-safe batches (carry neighboring lines for context).
  3. Call Gemini with persona prompt + system safety and task instructions.
  4. Validate output SRT format, line length, and Persian language detection; retry or flag bad chunks.
  5. Write translated SRT to storage; update DB status and metrics.

## 7) Prompting and safety
- Combine: system safety → task instructions (preserve timing/indexes, avoid hallucinations, stay concise) → persona guidance → user content.
- Include glossary and do-not-translate lists; enforce brevity (max chars per line, 2 lines per cue).
- Add fallback persona defaults if the request omits one.

## 8) Front-end (optional first pass)
- Simple React/Next.js UI to upload file, pick persona, and poll job status.
- Show persona descriptions and recommended use cases; provide download link when done.

## 9) Observability and deployment
- Structured logging (pino/winston) with job IDs; capture queue metrics and durations.
- Healthcheck endpoint and optional Prometheus metrics.
- Deployment: Docker Compose locally; for production, use managed Postgres/Redis + S3, and host the API on a small VPS or container platform.

## 10) Future enhancements
- Enable pgvector to store user corrections and reuse them for similar lines (already scaffolded).
- Add webhooks for completion callbacks.
- Support batch processing for multiple episodes and glossary-per-persona controls.
- Add human-in-the-loop review UI for flagged segments.
- Add automated model routing with quality scores per persona using Neo4j relations.
