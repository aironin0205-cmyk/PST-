import { logger } from '../../config/logger.js';

export class Neo4jGraphService {
  constructor({ uri }) {
    this.uri = uri;
  }

  async recordPersonaUsage(personaId, model) {
    logger.info('Graph: record persona usage', { personaId, model, uri: this.uri });
  }
}
