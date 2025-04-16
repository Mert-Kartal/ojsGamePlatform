import { z } from "zod";

const passwordValidation = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(100, "Password is too long")
  .regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/,
    "Password must contain at least one uppercase letter, one lowercase letter, one number and one special character"
  );

const emailValidation = z
  .string()
  .email("Please enter a valid email address")
  .max(100, "Email is too long");

export const registerSchema = z
  .object({
    username: z
      .string()
      .min(6, "Username must be at least 6 characters")
      .max(16, "Username cannot exceed 16 characters")
      .regex(
        /^[a-zA-Z0-9_]+$/,
        "Username can only contain letters, numbers and underscores"
      ),
    email: emailValidation,
    password: passwordValidation,
    verifyPassword: z.string(),
    name: z.string().max(100, "Name is too long").optional(),
  })
  .refine((data) => data.password === data.verifyPassword, {
    message: "Passwords do not match",
    path: ["verifyPassword"],
  });

export const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

export const forgotPasswordSchema = z.object({
  email: emailValidation,
});

export const resetPasswordSchema = z
  .object({
    password: passwordValidation,
    verifyPassword: z.string(),
  })
  .refine((data) => data.password === data.verifyPassword, {
    message: "Passwords do not match",
    path: ["verifyPassword"],
  });

export const tokenSchema = z.object({
  token: z.string().min(1, "Token is required"),
});
