// lib/sortItems.ts
export type ItemWithTimestamps = {
  id: string;
  title?: string;
  // ISO timestamps (strings) or numbers (ms since epoch)
  createdAt?: string | number | null;
  updatedAt?: string | number | null;
  // optional explicit flags
  isNew?: boolean;
  isEdited?: boolean;
  // any other fields...
  [k: string]: any;
};

/**
 * Normalize timestamp into number (ms since epoch)
 */
function toMs(ts?: string | number | null): number {
  if (!ts) return 0;
  if (typeof ts === 'number') return ts;
  const n = Date.parse(ts);
  return Number.isNaN(n) ? 0 : n;
}

/**
 * Determine derived flags if explicit flags are not present.
 * - isEdited: updatedAt exists and != createdAt
 * - isNew: explicit isNew || createdAt within `newThresholdMs` (default 7 days)
 */
export function deriveFlags(
  item: ItemWithTimestamps,
  newThresholdMs = 7 * 24 * 60 * 60 * 1000
) {
  const created = toMs(item.createdAt);
  const updated = toMs(item.updatedAt);

  const isEdited =
    typeof item.isEdited === 'boolean'
      ? item.isEdited
      : updated && created && updated !== created;

  const now = Date.now();
  const isNew =
    typeof item.isNew === 'boolean'
      ? item.isNew
      : created && now - created <= newThresholdMs;

  const lastChanged = Math.max(created || 0, updated || 0);
  return { isNew, isEdited, lastChanged };
}

/**
 * Sort items:
 * 1. Items that are new or edited appear first (both treated equal priority).
 * 2. Within each group, sort by lastChanged timestamp descending (latest first).
 * 3. Stable fallback: optionally by createdAt desc or id.
 */
export function sortItems<T extends ItemWithTimestamps>(items: T[], opts?: {
  newThresholdMs?: number;
}) {
  const newThresholdMs = opts?.newThresholdMs;
  return [...items].sort((a, b) => {
    const A = deriveFlags(a, newThresholdMs);
    const B = deriveFlags(b, newThresholdMs);

    // If one is new/edited and other isn't, that one comes first.
    const aPriority = A.isNew || A.isEdited ? 1 : 0;
    const bPriority = B.isNew || B.isEdited ? 1 : 0;
    if (aPriority !== bPriority) return bPriority - aPriority; // 1 (true) before 0

    // If same priority, compare lastChanged (more recent first)
    if (A.lastChanged !== B.lastChanged) return B.lastChanged - A.lastChanged;

    // As a deterministic tie-breaker: createdAt desc
    const aCreated = Math.max(toMs(a.createdAt) || 0, 0);
    const bCreated = Math.max(toMs(b.createdAt) || 0, 0);
    if (aCreated !== bCreated) return bCreated - aCreated;

    // final fallback: id string compare
    return String(a.id || '').localeCompare(String(b.id || ''));
  });
}
