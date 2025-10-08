/**
 * Audit logging utilities
 * Tracks all admin actions for compliance and debugging
 */

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  action: 'approve' | 'reject' | 'update' | 'delete';
  submissionId: string;
  submissionType: 'add' | 'update';
  targetId?: string;
  reviewer: string;
  notes?: string;
  diff?: FieldDiff[];
}

export interface FieldDiff {
  field: string;
  oldValue: any;
  newValue: any;
}

/**
 * Generate diff between old and new objects
 * Returns array of changed fields with old/new values
 */
export const generateDiff = (
  oldObj: Record<string, any>,
  newObj: Record<string, any>
): FieldDiff[] => {
  const diffs: FieldDiff[] = [];
  const allKeys = new Set([...Object.keys(oldObj), ...Object.keys(newObj)]);

  allKeys.forEach((key) => {
    const oldValue = oldObj[key];
    const newValue = newObj[key];

    // Skip if values are the same
    if (JSON.stringify(oldValue) === JSON.stringify(newValue)) {
      return;
    }

    // Skip undefined values
    if (oldValue === undefined && newValue === undefined) {
      return;
    }

    diffs.push({
      field: key,
      oldValue: oldValue ?? null,
      newValue: newValue ?? null,
    });
  });

  return diffs;
};

/**
 * Create audit log entry
 */
export const createAuditEntry = (
  action: AuditLogEntry['action'],
  submissionId: string,
  submissionType: 'add' | 'update',
  reviewer: string,
  options?: {
    targetId?: string;
    notes?: string;
    diff?: FieldDiff[];
  }
): AuditLogEntry => {
  return {
    id: `audit-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
    timestamp: new Date().toISOString(),
    action,
    submissionId,
    submissionType,
    targetId: options?.targetId,
    reviewer,
    notes: options?.notes,
    diff: options?.diff,
  };
};

/**
 * Format diff for human-readable display
 */
export const formatDiff = (diffs: FieldDiff[]): string => {
  if (diffs.length === 0) {
    return 'Aucun changement';
  }

  return diffs
    .map((diff) => {
      const oldVal = diff.oldValue === null ? '(vide)' : String(diff.oldValue);
      const newVal = diff.newValue === null ? '(vide)' : String(diff.newValue);
      return `• ${diff.field}: "${oldVal}" → "${newVal}"`;
    })
    .join('\n');
};

/**
 * Load audit log from localStorage
 */
export const loadAuditLog = (): AuditLogEntry[] => {
  try {
    const stored = localStorage.getItem('audit-log');
    if (!stored) return [];
    return JSON.parse(stored);
  } catch (error) {
    console.error('Failed to load audit log:', error);
    return [];
  }
};

/**
 * Save audit log to localStorage
 */
export const saveAuditLog = (entries: AuditLogEntry[]): void => {
  try {
    localStorage.setItem('audit-log', JSON.stringify(entries, null, 2));
  } catch (error) {
    console.error('Failed to save audit log:', error);
  }
};

/**
 * Append entry to audit log
 */
export const appendToAuditLog = (entry: AuditLogEntry): void => {
  const log = loadAuditLog();
  log.push(entry);
  saveAuditLog(log);
};
