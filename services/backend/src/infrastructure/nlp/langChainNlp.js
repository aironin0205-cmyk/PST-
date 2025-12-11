export class LangChainNlpService {
  summarizeContext(glossaryEntries) {
    if (!glossaryEntries || !glossaryEntries.length) return '';
    return glossaryEntries
      .map((entry, index) => `${index + 1}. ${entry.source.split(':').pop()} -> ${entry.target}`)
      .join('\n');
  }
}
