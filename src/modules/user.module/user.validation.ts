import { z } from "zod";

export const userCreateSchema = z.object({
  username: z
    .string()
    .min(6, "Username must be at least 6 characters")
    .max(16, "Username cannot exceed 16 characters")
    .regex(
      /^[a-zA-Z0-9_]+$/,
      "Username can only contain letters, numbers and underscores"
    ),

  email: z
    .string()
    .email("Please enter a valid email address")
    .max(100, "Email is too long"),

  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(100, "Password is too long")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/,
      "Password must contain at least one uppercase letter, one lowercase letter, one number and one special character"
    ),

  isAdmin: z.boolean().optional(),

  name: z.string().max(100, "Name is too long").optional(),
});

export const userUpdateSchema = z
  .object({
    username: z
      .string()
      .min(6, "Username must be at least 6 characters")
      .max(16, "Username cannot exceed 16 characters")
      .regex(
        /^[a-zA-Z0-9_]+$/,
        "Username can only contain letters, numbers and underscores"
      )
      .optional(),

    email: z
      .string()
      .email("Please enter a valid email address")
      .max(100, "Email is too long")
      .optional(),

    name: z.string().max(100, "Name is too long").optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided",
  });

export const userIdSchema = z.object({
  id: z.number().int().positive("Invalid user ID"),
});
