import { wrapAsync } from '../../core/AppError.js';
import { PERSONAS } from './translation.prompts.js';
import { validateCreateTranslation } from './translation.schemas.js';

export function createTranslationController(service) {
  return {
    listPersonas: wrapAsync(async (_req, res) => {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ personas: PERSONAS }));
    }),
    create: wrapAsync(async (_req, res, body) => {
      const payload = validateCreateTranslation(body);
      const job = await service.createJob(payload);
      res.writeHead(201, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ job }));
    }),
    getById: wrapAsync(async (_req, res, _body, id) => {
      const job = service.getJob(id);
      if (!job) {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'Job not found' }));
        return;
      }
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ job }));
    }),
  };
}
