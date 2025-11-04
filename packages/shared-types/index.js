// ===== SHARED TYPES & ENUMS =====
// This package contains code shared between the backend and frontend.
// For example, the JOB_STATUS enum is defined here so both services
// understand the state of a translation job.

export const JOB_STATUS = Object.freeze({
  PENDING: 'PENDING',
  ANALYZING: 'ANALYZING',
  TRANSLATING: 'TRANSLATING',
  EDITING: 'EDITING',
  AUDITING: 'AUDITING',
  FINALIZING: 'FINALIZING',
  COMPLETED: 'COMPLETED',
  FAILED: 'FAILED',
});
