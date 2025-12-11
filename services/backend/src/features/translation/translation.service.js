import { translationQueue } from '../../infrastructure/queue/index.js';
import { AiGatewayService } from '../../infrastructure/services/aiGateway.service.js';
import { PgVectorTmRepository } from '../../infrastructure/persistence/pgVectorTmRepository.js';
import { LangChainNlpService } from '../../infrastructure/nlp/langChainNlp.js';
import { PersonaModelRouter } from '../../infrastructure/llm/modelRouter.js';
import { Neo4jGraphService } from '../../infrastructure/graph/neo4jGraph.js';
import { TemporalOrchestrator } from '../../infrastructure/workflows/temporalOrchestrator.js';
import { AppError } from '../../core/AppError.js';
import { TranslationRepository } from './translation.repository.js';
import { createJobPayload } from './translation.job.js';
import { getPersona } from './translation.prompts.js';
import { config } from '../../config/index.js';

export class TranslationService {
  constructor({
    queue = translationQueue,
    repository = new TranslationRepository(),
    aiGateway = new AiGatewayService(),
    tmRepository = new PgVectorTmRepository({
      connectionString: config.database.connectionString,
      vocabularySchema: config.database.vocabularySchema,
    }),
    nlpService = new LangChainNlpService(),
    modelRouter = new PersonaModelRouter(),
    graphService = new Neo4jGraphService({ uri: config.graph.neo4jUrl }),
    temporal = new TemporalOrchestrator({ enabled: config.temporal.enabled }),
  } = {}) {
    this.queue = queue;
    this.repository = repository;
    this.aiGateway = aiGateway;
    this.tmRepository = tmRepository;
    this.nlpService = nlpService;
    this.modelRouter = modelRouter;
    this.graphService = graphService;
    this.temporal = temporal;
  }

  async createJob(payload) {
    const persona = getPersona(payload.personaId);
    if (!persona) {
      throw new AppError('Invalid persona supplied to translation service', { statusCode: 400 });
    }
    const model = payload.model || this.modelRouter.pickModel(persona.id);
    const glossaryEntries = payload.options?.glossary
      ? payload.options.glossary.map((entry) => ({ sourceText: entry.source, targetText: entry.target, personaId: persona.id }))
      : [];
    const storedGlossary = await Promise.all(
      glossaryEntries.map((entry) => this.tmRepository.upsertVocabulary(entry)),
    );
    const glossaryContext = this.nlpService.summarizeContext(
      storedGlossary.map((entry, idx) => ({
        source: glossaryEntries[idx]?.sourceText || entry.key,
        target: entry.targetText,
      })),
    );

    const jobPayload = createJobPayload({ ...payload, personaId: persona.id, model, glossaryContext });
    const job = this.repository.create(jobPayload);
    await this.graphService.recordPersonaUsage(persona.id, model);
    await this.temporal.signalJobQueued(job.id);
    this.queue.push(job);
    return job;
  }

  getJob(id) {
    return this.repository.findById(id);
  }
}
