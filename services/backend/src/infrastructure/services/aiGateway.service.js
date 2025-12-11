import { buildPersonaPrompt, getPersona } from '../../features/translation/translation.prompts.js';
import { stringifySrt } from '../../core/srtParser.js';
import { OpenRouterClient } from './openRouterClient.js';
import { PersonaModelRouter } from '../llm/modelRouter.js';

export class AiGatewayService {
  constructor({ openRouterClient = new OpenRouterClient(), modelRouter = new PersonaModelRouter() } = {}) {
    this.openRouterClient = openRouterClient;
    this.modelRouter = modelRouter;
  }

  async analyzeText(text) {
    const words = text.split(/\s+/).filter(Boolean).length;
    const lines = text.split(/\n+/).filter(Boolean).length;
    return { wordCount: words, lineCount: lines };
  }

  async translate(text, targetLanguage, personaId, model, glossaryContext) {
    const persona = getPersona(personaId);
    const prompt = buildPersonaPrompt(persona);
    const chosenModel = model || this.modelRouter.pickModel(personaId);
    const systemContent = `${prompt}${glossaryContext ? `\nGlossary (priority):\n${glossaryContext}` : ''}`;

    const completion = await this.openRouterClient.chatCompletion({
      model: chosenModel,
      messages: [
        { role: 'system', content: systemContent },
        { role: 'user', content: `Translate the following subtitle content into ${targetLanguage} while keeping SRT formatting.\n${text}` },
      ],
    });

    const translatedText = completion.choices?.[0]?.message?.content?.trim() || '';
    return { text: translatedText, modelUsed: chosenModel };
  }

  async translateSrt(segments, targetLanguage, personaId, model, glossaryContext) {
    const translatedSegments = await Promise.all(
      segments.map(async (segment) => {
        const translated = await this.translate(segment.text, targetLanguage, personaId, model, glossaryContext);
        return { ...segment, text: translated.text, modelUsed: translated.modelUsed };
      }),
    );

    return { text: stringifySrt(translatedSegments), modelUsed: translatedSegments[0]?.modelUsed };
  }
}
