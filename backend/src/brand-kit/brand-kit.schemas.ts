import { z } from 'zod';
import {
  optionalBooleanFieldSchema,
  requiredStringFieldSchema,
  uuidFieldSchema,
} from '../common/zod/field-schemas';

export const createBrandKitBodySchema = z
  .object({
    fontId: uuidFieldSchema.optional(),
    createdByUserId: uuidFieldSchema.optional(),
    name: requiredStringFieldSchema,
    active: optionalBooleanFieldSchema,
  })
  .strict();

export const updateBrandKitBodySchema = createBrandKitBodySchema
  .partial()
  .strict();

export type CreateBrandKitBody = z.infer<typeof createBrandKitBodySchema>;
export type UpdateBrandKitBody = z.infer<typeof updateBrandKitBodySchema>;
