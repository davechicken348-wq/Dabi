type Entry<T> = { value: T; expires: number };

const store = new Map<string, Entry<unknown>>();

/**
 * Cache a producer's result for `ttlMs`. Cheap, process-local read cache for
 * admin pages — keeps repeated dashboard/list loads from re-hitting the DB on
 * every render. Data can be at most `ttlMs` stale; safe for admin dashboards.
 */
export function cached<T>(
  key: string,
  ttlMs: number,
  producer: () => Promise<T>,
): Promise<T> {
  const now = Date.now();
  const hit = store.get(key) as Entry<T> | undefined;
  if (hit && hit.expires > now) return Promise.resolve(hit.value);

  return producer().then((value) => {
    store.set(key, { value, expires: Date.now() + ttlMs });
    return value;
  });
}

export function clearCache(prefix?: string): void {
  if (!prefix) {
    store.clear();
    return;
  }
  for (const key of [...store.keys()]) {
    if (key.startsWith(prefix)) store.delete(key);
  }
}
