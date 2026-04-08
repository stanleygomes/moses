import type { z } from 'zod';

export interface AskAndParseParams<T> {
  message: string;
  schema: z.ZodSchema<T>;
  initialValue?: string | null;
  default?: string;
}
