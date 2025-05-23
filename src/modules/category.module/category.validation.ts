import { z } from "zod";

export const categoryCreateSchema = z.object({
  name: z
    .string({ message: "Name required" })
    .min(2, "Category name must be at least 2 characters")
    .max(50, "Category name cannot exceed 50 characters")
    .regex(
      /^[a-zA-Z0-9\s-]+$/,
      "Category name can only contain letters, numbers, spaces and hyphens"
    ),
});

export const categoryUpdateSchema = categoryCreateSchema
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided",
  });

export const categoryIdSchema = z.object({
  id: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
    message: "ID must be a positive number",
  }),
});

export const gameIdSchema = z.object({
  gameId: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
    message: "Game ID must be a positive number",
  }),
});

export type CategoryCreateType = z.infer<typeof categoryCreateSchema>;
