export const PERSONAS = [
  {
    id: 'academic_linguist',
    name: 'Academic Linguist',
    description:
      'Formal, source-faithful Persian with precise terminology; prioritizes academic vocabulary and inline nuance notes only when critical.',
    guidance:
      'Use formal register, preserve technical nuance, avoid embellishment, keep lines concise; prefer established Persian academic vocabulary. Defer to translation memory when a glossary match exists.',
    preferredModels: [
      'openai/gpt-4.1',
      'perplexity/llama-3.1-sonar-large-128k-online',
      'anthropic/claude-3.5-sonnet',
    ],
  },
  {
    id: 'localization_pro',
    name: 'Subtitle Localization Pro',
    description:
      'Natural, idiomatic Persian optimized for subtitles; respects brevity, timing, and readability while keeping meaning accurate.',
    guidance:
      'Keep two-line cues max, trim filler, split long sentences cleanly, keep cultural references understandable, and avoid awkward word-for-word phrasing.',
    preferredModels: [
      'google/gemini-1.5-pro-latest',
      'perplexity/llama-3.1-sonar-huge-128k-online',
      'anthropic/claude-3.5-sonnet',
    ],
  },
  {
    id: 'cultural_mediator',
    name: 'Cultural Mediator',
    description: 'Bridges idioms and cultural references for Persian audiences with clear, neutral tone.',
    guidance:
      'Resolve idioms into clear Persian equivalents, keep politeness neutral, and avoid culture-specific slang unless clarified. Favor glossary overrides when provided.',
    preferredModels: [
      'perplexity/llama-3.1-sonar-large-128k-online',
      'openai/gpt-4.1',
      'google/gemini-1.5-flash-latest',
    ],
  },
  {
    id: 'youthful_conversationalist',
    name: 'Youthful Conversationalist',
    description: 'Lightly informal Persian with safe slang; keeps readability and timing constraints.',
    guidance:
      'Use approachable tone, moderate colloquialisms, avoid profanity, and keep sentences tight for subtitle timing.',
    preferredModels: [
      'google/gemini-1.5-flash-latest',
      'perplexity/llama-3.1-sonar-small-128k-online',
      'anthropic/claude-3.5-haiku',
    ],
  },
];

export function getPersona(personaId) {
  return PERSONAS.find((persona) => persona.id === personaId);
}

export const BASE_TRANSLATION_PROMPT = `
You are an expert English to Persian subtitle translator.
- Keep subtitle indices and timestamps unchanged.
- Preserve speaker turns; do not invent content.
- Keep each subtitle concise (max 2 lines, avoid long sentences).
- Prefer natural Persian phrasing; handle idioms faithfully.
- Do not translate proper names or branded terms if they should stay in English.
- Output only valid SRT blocks.
- Apply persona guidance and vocabulary hints when provided.
`;

export function buildPersonaPrompt(persona) {
  if (!persona) return BASE_TRANSLATION_PROMPT.trim();
  return `${BASE_TRANSLATION_PROMPT}\nPersona: ${persona.name}\nGuidance: ${persona.guidance}`.trim();
}
