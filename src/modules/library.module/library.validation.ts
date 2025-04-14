import { z } from "zod";

export const libraryAddGameSchema = z.object({
  gameId: z.number().int().positive(),
});

export const libraryIdSchema = z.object({
  id: z.number().int().positive(),
});

export const libraryUpdateSchema = z.object({
  lastPlayed: z.date().optional(),
});

export const createLibrarySchema = z.object({
  userId: z.number().int().positive(),
  gameId: z.number().int().positive(),
});

export const updateLibrarySchema = z.object({
  lastPlayed: z.string().datetime().optional(),
});
