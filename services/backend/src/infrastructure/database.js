import { randomUUID } from 'node:crypto';

export class InMemoryDatabase {
  constructor() {
    this.jobs = new Map();
  }

  createJob(payload) {
    const id = randomUUID();
    const record = { id, createdAt: new Date().toISOString(), ...payload };
    this.jobs.set(id, record);
    return record;
  }

  updateJob(id, updates) {
    const current = this.jobs.get(id);
    if (!current) return null;
    const updated = { ...current, ...updates, updatedAt: new Date().toISOString() };
    this.jobs.set(id, updated);
    return updated;
  }

  getJob(id) {
    return this.jobs.get(id) || null;
  }
}
