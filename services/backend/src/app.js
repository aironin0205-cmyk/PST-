import http from 'node:http';
import { logger } from './config/logger.js';
import { translationQueue } from './infrastructure/queue/index.js';
import { AiGatewayService } from './infrastructure/services/aiGateway.service.js';
import { TemporalOrchestrator } from './infrastructure/workflows/temporalOrchestrator.js';
import { registerWorkers } from './workers/index.js';
import { TranslationRepository, TranslationService, createTranslationController } from './features/translation/index.js';
import { config } from './config/index.js';

function parseBody(req) {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', (chunk) => {
      data += chunk;
    });
    req.on('end', () => {
      if (!data) return resolve(null);
      try {
        resolve(JSON.parse(data));
      } catch (error) {
        reject(error);
      }
    });
  });
}

export function createServer(dependencies = {}) {
  const repository = dependencies.repository || new TranslationRepository();
  const aiGateway = dependencies.aiGateway || new AiGatewayService();
  const temporal = dependencies.temporal || new TemporalOrchestrator({ enabled: config.temporal.enabled });
  const queue = dependencies.queue || translationQueue;
  const service = new TranslationService({ repository, aiGateway, queue, temporal });
  const controller = createTranslationController(service);

  registerWorkers({ queue, repository, aiGateway, logger, temporal });

  return http.createServer(async (req, res) => {
    try {
      if (req.method === 'GET' && req.url === '/health') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ status: 'ok' }));
        return;
      }

      if (req.method === 'GET' && req.url === '/personas') {
        return controller.listPersonas(req, res);
      }

      if (req.method === 'POST' && req.url === '/translations') {
        const body = await parseBody(req);
        return controller.create(req, res, body);
      }

      if (req.method === 'GET' && req.url.startsWith('/translations/')) {
        const id = req.url.split('/').pop();
        return controller.getById(req, res, null, id);
      }

      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ message: 'Not found' }));
    } catch (error) {
      logger.error('Request failed', { error: error.message });
      const statusCode = error.statusCode || 500;
      res.writeHead(statusCode, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ message: error.message }));
    }
  });
}

export function start() {
  const server = createServer();
  server.listen(config.port, () => {
    logger.info(`Server listening on port ${config.port}`);
  });
  return server;
}
