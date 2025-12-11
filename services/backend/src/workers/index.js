import { createTranslationWorker } from './translation.worker.js';

export function registerWorkers(deps) {
  createTranslationWorker(deps);
}
