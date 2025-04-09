import { z } from "zod";

export const friendshipCreateSchema = z.object({
  friendId: z.number().int().positive(),
});

export const friendshipIdSchema = z.object({
  id: z.number().int().positive(),
});

export const friendshipStatusSchema = z.object({
  status: z.enum(["PENDING", "ACCEPTED", "BLOCKED"]),
});

export type CreateFriendshipInput = z.infer<typeof friendshipCreateSchema>;
export type UpdateFriendshipStatusInput = z.infer<
  typeof friendshipStatusSchema
>;
