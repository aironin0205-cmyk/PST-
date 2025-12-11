import { JOB_STATUS } from '@my-project/shared-types';
import { getPersona } from '../features/translation/translation.prompts.js';

export function createTranslationWorker({ queue, repository, aiGateway, logger, temporal }) {
  queue.on('process', async (job) => {
    const persona = getPersona(job.personaId);
    logger.info('Starting job', { id: job.id, persona: persona?.id });
    try {
      await repository.update(job.id, { status: JOB_STATUS.ANALYZING });
      const analysis = await aiGateway.analyzeText(job.content);

      await repository.update(job.id, { status: JOB_STATUS.TRANSLATING });
      const translationResult =
        job.contentType === 'srt'
          ? await aiGateway.translateSrt(job.srtSegments, job.targetLanguage, job.personaId, job.model, job.glossaryContext)
          : await aiGateway.translate(job.content, job.targetLanguage, job.personaId, job.model, job.glossaryContext);

      await repository.update(job.id, {
        status: JOB_STATUS.COMPLETED,
        analysis,
        translatedText: translationResult.text || translationResult,
        modelUsed: translationResult.modelUsed || job.model,
        personaName: persona?.name,
      });
      await temporal?.signalJobCompleted(job.id);
      logger.info('Finished job', { id: job.id, persona: persona?.id });
    } catch (error) {
      logger.error('Job failed', { id: job.id, error: error.message });
      await repository.update(job.id, { status: JOB_STATUS.FAILED, error: error.message });
    }
  });
}
