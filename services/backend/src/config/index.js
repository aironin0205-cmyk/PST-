export const config = {
  port: Number(process.env.PORT) || 3000,
  queue: {
    concurrency: Number(process.env.QUEUE_CONCURRENCY) || 1,
  },
  openRouter: {
    apiKey: process.env.OPENROUTER_API_KEY || '',
    baseUrl: process.env.OPENROUTER_BASE_URL || 'https://openrouter.ai/api/v1',
    defaultModel: process.env.DEFAULT_LLM_MODEL || 'anthropic/claude-3.5-sonnet',
  },
  temporal: {
    enabled: process.env.TEMPORAL_ENABLED === 'true',
  },
  graph: {
    neo4jUrl: process.env.NEO4J_URI || 'neo4j://localhost:7687',
  },
  database: {
    connectionString: process.env.DATABASE_URL || 'postgresql://localhost:5432/pst',
    vocabularySchema: process.env.TM_SCHEMA || 'public.translation_memory',
  },
};
