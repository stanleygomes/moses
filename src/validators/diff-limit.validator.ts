import { z } from 'zod';

export const diffLimitSchema = z.string().transform((val, ctx) => {
  const parsed = Number.parseInt(val, 10);
  if (Number.isInteger(parsed) && parsed > 0) return parsed;

  ctx.addIssue({
    code: z.ZodIssueCode.custom,
    message: 'Invalid value. Please inform a positive integer.',
  });
  return z.NEVER;
});
