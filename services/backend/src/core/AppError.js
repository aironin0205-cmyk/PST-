export class AppError extends Error {
  constructor(message, { statusCode = 500, details = null } = {}) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.details = details;
    this.isOperational = true;
    Error.captureStackTrace?.(this, this.constructor);
  }
}

export function wrapAsync(fn) {
  return async (...args) => {
    try {
      return await fn(...args);
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError(error.message || 'Unexpected error');
    }
  };
}
