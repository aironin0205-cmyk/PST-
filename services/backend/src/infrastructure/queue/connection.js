import { EventEmitter } from 'node:events';

export class JobQueue extends EventEmitter {
  constructor() {
    super();
    this.queue = [];
    this.processing = false;
  }

  push(job) {
    this.queue.push(job);
    this._processNext();
  }

  async _processNext() {
    if (this.processing) return;
    const next = this.queue.shift();
    if (!next) return;

    this.processing = true;
    try {
      await this.emitAsync('process', next);
    } finally {
      this.processing = false;
      if (this.queue.length) {
        setImmediate(() => this._processNext());
      }
    }
  }

  emitAsync(event, payload) {
    const listeners = this.listeners(event);
    return Promise.all(listeners.map((listener) => listener(payload)));
  }
}
