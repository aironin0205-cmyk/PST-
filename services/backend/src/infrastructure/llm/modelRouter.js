import { config } from '../../config/index.js';

const MODEL_PREFERENCES = {
  academic_linguist: [
    'openai/gpt-4.1',
    'perplexity/llama-3.1-sonar-large-128k-online',
    'anthropic/claude-3.5-sonnet',
  ],
  localization_pro: [
    'google/gemini-1.5-pro-latest',
    'perplexity/llama-3.1-sonar-huge-128k-online',
    'anthropic/claude-3.5-sonnet',
  ],
  cultural_mediator: [
    'perplexity/llama-3.1-sonar-large-128k-online',
    'openai/gpt-4.1',
    'google/gemini-1.5-flash-latest',
  ],
  youthful_conversationalist: [
    'google/gemini-1.5-flash-latest',
    'perplexity/llama-3.1-sonar-small-128k-online',
    'anthropic/claude-3.5-haiku',
  ],
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
