import type { z } from 'zod';

export interface PasswordParams<T = string> {
  message: string;
  schema?: z.ZodSchema<T>;
  initialValue?: string | null;
  mask?: string | boolean;
}
