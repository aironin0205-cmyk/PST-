// ===== DOMAIN ENTITY: TranslationJob =====
// This file defines the core business entity for the translation feature.
// A TranslationJob represents a single, stateful translation task as it moves through the workflow.
// This class is pure business logic and has NO dependencies on databases, APIs, or external frameworks.
// It ensures that a job is always in a valid state.

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

export class TranslationJob {
  constructor({
    id = null,
    status = JOB_STATUS.PENDING,
    sourceContent,
    settings,
    briefingDocument = null,
    rawTranslation = null,
    editedTranslation = null,
    finalTranslation = null,
    auditReport = null,
    error = null,
    createdAt = new Date(),
    updatedAt = new Date(),
  }) {
    if (!sourceContent || !settings) {
      throw new Error('Source content and settings are required to create a TranslationJob.');
    }

    this.id = id;
    this.status = status;
    this.sourceContent = sourceContent;
    this.settings = settings;
    this.briefingDocument = briefingDocument;
    this.rawTranslation = rawTranslation;
    this.editedTranslation = editedTranslation;
    this.finalTranslation = finalTranslation;
    this.auditReport = auditReport;
    this.error = error;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  /**
   * Prepares the entity data for database persistence.
   * This is useful for separating the pure domain object from its database representation.
   * @returns {object} A plain object suitable for a database driver (e.g., MongoDB).
   */
  toPersistence() {
    return {
      status: this.status,
      sourceContent: this.sourceContent,
      settings: this.settings,
      briefingDocument: this.briefingDocument,
      rawTranslation: this.rawTranslation,
      editedTranslation: this.editedTranslation,
      finalTranslation: this.finalTranslation,
      auditReport: this.auditReport,
      error: this.error,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  /**
   * Creates a TranslationJob instance from a database record.
   * @param {object} dbRecord - The plain object retrieved from the database.
   * @returns {TranslationJob} An instance of the TranslationJob class.
   */
  static fromPersistence(dbRecord) {
    return new TranslationJob({
      id: dbRecord._id?.toString() || dbRecord.id,
      status: dbRecord.status,
      sourceContent: dbRecord.sourceContent,
      settings: dbRecord.settings,
      briefingDocument: dbRecord.briefingDocument,
      rawTranslation: dbRecord.rawTranslation,
      editedTranslation: dbRecord.editedTranslation,
      finalTranslation: dbRecord.finalTranslation,
      auditReport: dbRecord.auditReport,
      error: dbRecord.error,
      createdAt: dbRecord.createdAt,
      updatedAt: dbRecord.updatedAt,
    });
  }
}
