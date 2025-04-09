import { z } from "zod";

export const reviewCreateSchema = z.object({
  gameId: z.number().int().positive(),
  content: z.string().min(10).max(1000),
  rating: z.number().int().min(1).max(5),
});

export const reviewUpdateSchema = z.object({
  content: z.string().min(10).max(1000).optional(),
  rating: z.number().int().min(1).max(5).optional(),
});

export const reviewIdSchema = z.object({
  id: z.number().int().positive(),
});

export type CreateReviewInput = z.infer<typeof reviewCreateSchema>;
export type UpdateReviewInput = z.infer<typeof reviewUpdateSchema>;
