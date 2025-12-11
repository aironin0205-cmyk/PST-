import { JOB_STATUS } from '@my-project/shared-types';
import { getPersona } from './translation.prompts.js';

export function createJobPayload({ content, targetLanguage, personaId, options, contentType, srtSegments, model, glossaryContext }) {
  const persona = getPersona(personaId);
  return {
    content,
    targetLanguage,
    personaId,
    personaName: persona?.name,
    model,
    options,
    contentType,
    srtSegments,
    glossaryContext,
    status: JOB_STATUS.PENDING,
  };
}
