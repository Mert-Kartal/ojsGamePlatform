import { z } from "zod";
import { NotificationType } from "@prisma/client";

// Metadata için spesifik tip tanımı
const metadataSchema = z
  .object({
    gameId: z.number().int().positive().optional(),
    friendshipId: z.number().int().positive().optional(),
    userId: z.number().int().positive().optional(),
    additionalInfo: z.string().optional(),
  })
  .strict();

export const notificationIdSchema = z
  .object({
    id: z.number().int().positive(),
  })
  .strict();

export const notificationCreateSchema = z
  .object({
    userId: z.number().int().positive(),
    title: z.string().min(1).max(255),
    message: z.string().min(1).max(1000), // Makul bir maksimum uzunluk
    type: z.nativeEnum(NotificationType),
    metadata: metadataSchema.optional(),
  })
  .strict();

export const notificationUpdateSchema = z
  .object({
    isRead: z.boolean(),
  })
  .strict();
