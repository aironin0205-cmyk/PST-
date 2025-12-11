import { logger } from '../../config/logger.js';

export class PgVectorTmRepository {
  constructor({ connectionString, vocabularySchema }) {
    this.connectionString = connectionString;
    this.vocabularySchema = vocabularySchema;
    this.memory = new Map();
  }

  async upsertVocabulary({ sourceText, targetText, personaId }) {
    const key = `${personaId}:${sourceText}`;
    this.memory.set(key, targetText);
    logger.info('Stored vocabulary in translation memory', { personaId });
    return { key, targetText };
  }

  async findNearest({ sourceText, personaId, limit = 3 }) {
    const matches = [];
    for (const [key, value] of this.memory.entries()) {
      if (personaId && !key.startsWith(`${personaId}:`)) continue;
      if (sourceText.toLowerCase().includes(key.split(':').slice(1).join(':').toLowerCase())) {
        matches.push({ source: key, target: value });
      }
      if (matches.length >= limit) break;
    }
    return matches;
  }
}
