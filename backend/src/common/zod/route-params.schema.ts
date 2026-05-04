import { z } from 'zod';

const uuidParamValueSchema = z.string().trim().uuid('Debe ser un UUID valido.');

export const idParamSchema = z.object({
  id: uuidParamValueSchema,
});

export const idAndCommentIdParamSchema = z.object({
  id: uuidParamValueSchema,
  commentId: uuidParamValueSchema,
});

export const idAndExportIdParamSchema = z.object({
  id: uuidParamValueSchema,
  exportId: uuidParamValueSchema,
});

export const idAndAssetIdParamSchema = z.object({
  id: uuidParamValueSchema,
  assetId: uuidParamValueSchema,
});

export type IdParam = z.infer<typeof idParamSchema>;
export type IdAndCommentIdParam = z.infer<typeof idAndCommentIdParamSchema>;
export type IdAndExportIdParam = z.infer<typeof idAndExportIdParamSchema>;
export type IdAndAssetIdParam = z.infer<typeof idAndAssetIdParamSchema>;
