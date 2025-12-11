import { JOB_STATUS } from '@my-project/shared-types';
import { InMemoryDatabase } from '../../infrastructure/database.js';

export class TranslationRepository {
  constructor(database = new InMemoryDatabase()) {
    this.database = database;
  }

  create(payload) {
    const defaults = {
      status: JOB_STATUS.PENDING,
      analysis: null,
      translatedText: null,
      contentType: payload.contentType || 'plain',
      srtSegments: payload.srtSegments || null,
      model: payload.model,
      modelUsed: null,
      glossaryContext: payload.glossaryContext,
      error: null,
    };
    return this.database.createJob({ ...defaults, ...payload });
  }

  findById(id) {
    return this.database.getJob(id);
  }

  update(id, updates) {
    return this.database.updateJob(id, updates);
  }
}
