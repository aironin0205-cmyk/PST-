import { AppError } from '../../core/AppError.js';
import { parseSrt } from '../../core/srtParser.js';
import { getPersona, PERSONAS } from './translation.prompts.js';

export function validateCreateTranslation(body) {
  if (!body || typeof body !== 'object') {
    throw new AppError('Request body must be an object', { statusCode: 400 });
  }

  const { content, targetLanguage = 'fa', personaId = 'localization_pro', options = {}, model } = body;
  if (!content || typeof content !== 'string') {
    throw new AppError('content is required', { statusCode: 400 });
  }

  const trimmedContent = content.trim();
  if (!trimmedContent) {
    throw new AppError('content cannot be empty', { statusCode: 400 });
  }

  const contentLength = trimmedContent.length;
  const maxLength = 50_000;
  if (contentLength > maxLength) {
    throw new AppError(`content exceeds ${maxLength} characters`, { statusCode: 400 });
  }

  if (!targetLanguage || typeof targetLanguage !== 'string') {
    throw new AppError('targetLanguage is required', { statusCode: 400 });
  }

  const persona = getPersona(personaId);
  if (!persona) {
    const ids = PERSONAS.map((p) => p.id).join(', ');
    throw new AppError(`personaId must be one of: ${ids}`, { statusCode: 400 });
  }

  const cleanedGlossary = Array.isArray(options.glossary)
    ? options.glossary
        .map((entry) => ({
          source: typeof entry?.source === 'string' ? entry.source.trim() : undefined,
          target: typeof entry?.target === 'string' ? entry.target.trim() : undefined,
        }))
        .filter((entry) => entry.source && entry.target)
    : undefined;

  const cleanedOptions = {
    formality: typeof options.formality === 'string' ? options.formality.trim() : undefined,
    honorifics: typeof options.honorifics === 'string' ? options.honorifics.trim() : undefined,
    glossary: cleanedGlossary,
  };

  const srtSegments = parseSrt(trimmedContent);
  const isSrt = Array.isArray(srtSegments) && srtSegments.length > 0;

  return {
    content: trimmedContent,
    targetLanguage: targetLanguage.trim(),
    personaId,
    model: typeof model === 'string' && model.trim() ? model.trim() : undefined,
    options: cleanedOptions,
    contentType: isSrt ? 'srt' : 'plain',
    srtSegments: isSrt ? srtSegments : null,
  };
}
