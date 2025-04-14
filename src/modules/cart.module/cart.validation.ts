import { z } from "zod";

// Oyun ID parametresi için şema
export const gameIdSchema = z.object({
  gameId: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
    message: "Game ID must be a positive number",
  }),
});

// Admin için user ID şeması
export const userIdSchema = z.object({
  userId: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
    message: "User ID must be a positive number",
  }),
});
