import type { z } from 'zod';
import { badRequest } from './errors.js';

/**
 * Parse with Zod or throw a typed 400 carrying per-field messages, so forms can
 * render errors inline next to the offending input rather than as one toast.
 */
export function parseOrThrow<T extends z.ZodType>(schema: T, value: unknown): z.infer<T> {
  const result = schema.safeParse(value);
  if (result.success) return result.data;

  const fields: Record<string, string> = {};
  for (const issue of result.error.issues) {
    const path = issue.path.join('.') || '_';
    // Keep the first message per field: later ones are usually cascade noise.
    if (!fields[path]) fields[path] = issue.message;
  }
  throw badRequest('Please check the highlighted fields', fields);
}
