import { config } from '../../config/index.js';
import { logger } from '../../config/logger.js';

export class OpenRouterClient {
  constructor({ apiKey = config.openRouter.apiKey, baseUrl = config.openRouter.baseUrl } = {}) {
    this.apiKey = apiKey;
    this.baseUrl = baseUrl;
  }

  async chatCompletion({ model, messages, temperature = 0.2 }) {
    if (!this.apiKey) {
      logger.warn('OpenRouter API key missing; falling back to offline stub.');
      return {
        model,
        choices: [
          {
            message: { role: 'assistant', content: `[stubbed-completion:${model}] ${messages[messages.length - 1]?.content || ''}` },
          },
        ],
      };
    }

    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
        'HTTP-Referer': 'https://openrouter.ai',
      },
      body: JSON.stringify({ model, messages, temperature }),
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`OpenRouter request failed: ${response.status} ${text}`);
    }

    return response.json();
  }
}
