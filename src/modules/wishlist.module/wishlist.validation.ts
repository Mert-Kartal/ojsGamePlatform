import { z } from "zod";

export const wishlistGameIdSchema = z.object({
  gameId: z.number().int().positive("Game ID must be a positive integer"),
});

export const wishlistUserIdSchema = z.object({
  userId: z.number().int().positive("User ID must be a positive integer"),
});

// For bulk operations if needed
export const wishlistGameIdsSchema = z.object({
  gameIds: z.array(
    z.number().int().positive("Game IDs must be positive integers")
  ),
});
