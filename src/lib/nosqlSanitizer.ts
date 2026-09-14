/**
 * Recursively sanitizes input objects by stripping keys starting with '$' or containing '.'
 * to prevent NoSQL operator injection attacks.
 */
export function sanitizeNoSQLQuery<T>(input: any): T {
  if (input === null || typeof input !== "object") {
    return input;
  }

  if (Array.isArray(input)) {
    return input.map((item) => sanitizeNoSQLQuery(item)) as unknown as T;
  }

  const sanitized: Record<string, any> = {};

  for (const key of Object.keys(input)) {
    if (key.startsWith("$") || key.includes(".")) {
      console.warn(`[NoSQL Security Warning] Stripped dangerous operator key: '${key}' from client payload.`);
      continue;
    }
    sanitized[key] = sanitizeNoSQLQuery(input[key]);
  }

  return sanitized as T;
}

/**
 * Express / NestJS Middleware to automatically sanitize req.body, req.query, and req.params.
 */
export function nosqlSanitizerMiddleware(req: any, _res: any, next: () => void) {
  if (req.body) req.body = sanitizeNoSQLQuery(req.body);
  if (req.query) req.query = sanitizeNoSQLQuery(req.query);
  if (req.params) req.params = sanitizeNoSQLQuery(req.params);
  next();
}
