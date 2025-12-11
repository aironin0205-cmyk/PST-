import { config } from '../../config/index.js';

const MODEL_PREFERENCES = {
  academic_linguist: ['anthropic/claude-3.5-sonnet', 'openai/gpt-5.1', 'google/gemini-2.0-pro-exp-02-05'],
  localization_pro: ['anthropic/claude-3.5-sonnet', 'anthropic/claude-3.5-haiku', 'google/gemini-flash-1.5'],
  cultural_mediator: ['openai/gpt-5.1', 'anthropic/claude-3.5-sonnet', 'google/gemini-2.0-flash-exp'],
  youthful_conversationalist: ['anthropic/claude-3.5-haiku', 'google/gemini-flash-1.5', 'openai/gpt-5.1'],
};

export class PersonaModelRouter {
  constructor(defaultModel = config.openRouter.defaultModel) {
    this.defaultModel = defaultModel;
  }

  pickModel(personaId) {
    const candidates = MODEL_PREFERENCES[personaId];
    if (candidates && candidates.length) return candidates[0];
    return this.defaultModel;
  }

  listSupportedModels(personaId) {
    return MODEL_PREFERENCES[personaId] || [this.defaultModel];
  }
}
