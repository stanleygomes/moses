import { z } from 'zod';

export const aiModelSchema = z.string().min(1, 'Model name cannot be empty');
