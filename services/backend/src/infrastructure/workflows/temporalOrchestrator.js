import { logger } from '../../config/logger.js';

export class TemporalOrchestrator {
  constructor({ enabled }) {
    this.enabled = enabled;
  }

  async signalJobQueued(jobId) {
    if (!this.enabled) return;
    logger.info('Temporal signal: job queued', { jobId });
  }

  async signalJobCompleted(jobId) {
    if (!this.enabled) return;
    logger.info('Temporal signal: job completed', { jobId });
  }
}
