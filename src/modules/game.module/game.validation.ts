import { z } from "zod";

export const gameIdSchema = z.object({
  id: z.number().int().positive(),
});

export const gameCreateSchema = z.object({
  title: z.string().min(1).max(255),
  description: z.string().min(1),
  price: z.string().regex(/^\d+(\.\d{1,2})?$/),
  releaseDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  developer: z.string().min(1).max(255),
  publisher: z.string().min(1).max(255),
  coverImage: z.string().url().optional(),
});

export const gameUpdateSchema = z
  .object({
    title: z.string().min(1).max(255).optional(),
    description: z.string().min(1).optional(),
    price: z
      .string()
      .regex(/^\d+(\.\d{1,2})?$/)
      .optional(),
    releaseDate: z.string().datetime().optional(),
    developer: z.string().min(1).max(255).optional(),
    publisher: z.string().min(1).max(255).optional(),
    coverImage: z.string().url().optional(),
    categoryId: z.number().int().positive().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided",
  });
