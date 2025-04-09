import { Request, Response } from "express";
import LibraryModel from "./library.model";
import { libraryAddGameSchema } from "src/validation/library.validation";
import { AddGameToLibraryDTO } from "src/DTO/library.dto";
import { ZodError } from "zod";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";

interface AuthRequest extends Request {
  user?: {
    id: number;
  };
}

export default class LibraryController {
  static async getUserLibrary(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ error: "User not authenticated" });
        return;
      }

      const library = await LibraryModel.getUserLibrary(+userId);
      res.status(200).json(library);
    } catch (error) {
      console.error("Get user library error:", error);
      res
        .status(500)
        .json({ error: "Something went wrong while fetching library" });
    }
  }

  static async addGameToLibrary(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ error: "User not authenticated" });
        return;
      }

      const validatedData = libraryAddGameSchema.parse(+req.params.gameId);
      const addedGame = await LibraryModel.addGameToLibrary(
        +userId,
        validatedData.gameId
      );
      res.status(201).json(addedGame);
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ error: error.errors });
        return;
      }
      if (error instanceof Error) {
        if (error.message === "Game already exists in library") {
          res.status(409).json({ error: error.message });
          return;
        }
        if (error.message === "Game not found") {
          res.status(404).json({ error: error.message });
          return;
        }
      }
      console.error("Add game to library error:", error);
      res
        .status(500)
        .json({ error: "Something went wrong while adding game to library" });
    }
  }

  static async updateLastPlayed(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ error: "User not authenticated" });
        return;
      }

      const gameId = parseInt(req.params.gameId);
      if (!gameId || isNaN(gameId)) {
        res.status(400).json({ error: "Invalid game ID" });
        return;
      }

      const updatedGame = await LibraryModel.updateLastPlayed(+userId, gameId);
      res.status(200).json(updatedGame);
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === "P2025") {
          res.status(404).json({ error: "Game not found in library" });
          return;
        }
      }
      console.error("Update last played error:", error);
      res
        .status(500)
        .json({ error: "Something went wrong while updating last played" });
    }
  }

  static async removeGameFromLibrary(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ error: "User not authenticated" });
        return;
      }

      const gameId = parseInt(req.params.gameId);
      if (!gameId || isNaN(gameId)) {
        res.status(400).json({ error: "Invalid game ID" });
        return;
      }

      await LibraryModel.removeGameFromLibrary(+userId, gameId);
      res
        .status(200)
        .json({ message: "Game removed from library successfully" });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === "Game not found in library") {
          res.status(404).json({ error: error.message });
          return;
        }
      }
      console.error("Remove game from library error:", error);
      res.status(500).json({
        error: "Something went wrong while removing game from library",
      });
    }
  }

  static async checkGameInLibrary(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ error: "User not authenticated" });
        return;
      }

      const gameId = parseInt(req.params.gameId);
      if (!gameId || isNaN(gameId)) {
        res.status(400).json({ error: "Invalid game ID" });
        return;
      }

      const game = await LibraryModel.getGameFromLibrary(+userId, gameId);
      res.status(200).json({ inLibrary: !!game });
    } catch (error) {
      console.error("Check game in library error:", error);
      res
        .status(500)
        .json({ error: "Something went wrong while checking game in library" });
    }
  }
}
