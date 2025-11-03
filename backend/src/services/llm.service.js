// src/services/llm.service.js
// This service is the single point of contact for all LLM interactions via OpenRouter.

import { AppError } from '../core/AppError.js';

// A simple retry mechanism for network resilience.
const MAX_RETRIES = 3;
const INITIAL_BACKOFF_MS = 1000;

export class LLMAgentService {
  constructor({ logger }) {
    this.logger = logger;
    this.apiKey = process.env.OPENROUTER_API_KEY;
    if (!this.apiKey) {
      throw new Error("OPENROUTER_API_KEY environment variable is not set.");
    }
    this.baseUrl = "https://openrouter.ai/api/v1/chat/completions";
  }

  /**
   * The core method to execute a call to an LLM with a specific persona.
   * @param {string} model - The model name from OpenRouter (e.g., "anthropic/claude-3-opus").
   * @param {string} systemPrompt - The persona definition (e.g., "You are a senior editor...").
   * @param {string} userPrompt - The specific instruction or text to process.
   * @param {boolean} isJsonMode - Whether to request a JSON response.
   * @returns {Promise<any>} - The parsed response from the LLM.
   */
  async executePersona({ model, systemPrompt, userPrompt, isJsonMode = false }) {
    this.logger.info({ model }, `Executing persona with model ${model}`);

    const body = {
      model,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      ...(isJsonMode && { response_format: { type: "json_object" } }),
    };

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        const response = await fetch(this.baseUrl, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': 'https://your-app-name.onrender.com', // Recommended by OpenRouter
            'X-Title': 'Persian Subtitle Translator', // Recommended by OpenRouter
          },
          body: JSON.stringify(body),
        });

        if (!response.ok) {
          const errorBody = await response.text();
          throw new AppError(`API call failed with status ${response.status}: ${errorBody}`, response.status);
        }

        const data = await response.json();
        const content = data.choices[0].message.content;

        if (isJsonMode) {
          // Clean the content before parsing, as LLMs sometimes add extra text or markdown backticks.
          const cleanedContent = content.replace(/```json\n|```/g, '').trim();
          return JSON.parse(cleanedContent);
        }
        return content;

      } catch (error) {
        this.logger.error({ err: error, attempt }, `Attempt ${attempt} failed for model ${model}.`);
        if (attempt === MAX_RETRIES) {
          throw error; // Rethrow after final attempt
        }
        // Exponential backoff
        await new Promise(res => setTimeout(res, INITIAL_BACKOFF_MS * Math.pow(2, attempt - 1)));
      }
    }
  }
}
