export interface ISoftDeletable {
  isDeleted?: boolean;
  deletedAt?: Date;
  deletedBy?: string;
}

/**
 * Returns a filter query excluding soft-deleted documents for normal application reads.
 */
export function activeRecordsFilter(additionalQuery: Record<string, any> = {}) {
  return {
    ...additionalQuery,
    isDeleted: { $ne: true },
  };
}

/**
 * Soft deletes a record by updating soft delete metadata without physically removing data.
 */
export function buildSoftDeleteUpdate(deletedBy: string): ISoftDeletable {
  return {
    isDeleted: true,
    deletedAt: new Date(),
    deletedBy,
  };
}
