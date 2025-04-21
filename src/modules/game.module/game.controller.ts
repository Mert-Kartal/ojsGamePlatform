import { Request, Response } from "express";
import GameModel from "./game.model";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import path from "path";
import fs from "fs";
import { NotificationService } from "../../services/notification.service";
import WishlistModel from "../wishlist.module/wishlist.model";

export default class GameController {
  static async getAll(req: Request, res: Response) {
    try {
      const games = await GameModel.getAll();
      if (games.length === 0) {
        res.status(404).json({ success: false, message: "No games found" });
        return;
      }
      res.json({ success: true, data: games });
    } catch (error) {
      console.error("Error in getAll games:", error);
      res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    }
  }

  static async getById(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      const game = await GameModel.getById(id);

      if (!game) {
        res.status(404).json({ success: false, message: "Game not found" });
        return;
      }

      res.json({ success: true, data: game });
    } catch (error) {
      console.error("Error in getById game:", error);
      res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    }
  }

  static async getByCategory(req: Request, res: Response) {
    try {
      const categoryId = parseInt(req.params.categoryId);
      const games = await GameModel.getByCategory(categoryId);
      if (games.length === 0) {
        res
          .status(404)
          .json({ success: false, message: "No games found in this category" });
        return;
      }
      res.json({ success: true, data: games });
    } catch (error) {
      console.error("Error in getByCategory games:", error);
      res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    }
  }

  static async search(req: Request, res: Response) {
    try {
      const { query } = req.query;
      if (!query || typeof query !== "string") {
        res
          .status(400)
          .json({ success: false, message: "Search query is required" });
        return;
      }

      const games = await GameModel.search(query);
      res.json({ success: true, data: games });
    } catch (error) {
      console.error("Error in search games:", error);
      res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    }
  }

  static async create(
    req: Request<
      {},
      {},
      {
        title: string;
        description: string;
        price: number;
        releaseDate: Date;
        developer: string;
        publisher: string;
        coverImage?: string;
      }
    >,
    res: Response
  ) {
    try {
      const gameData = {
        ...req.body,
        price: Number(req.body.price),
        releaseDate: new Date(req.body.releaseDate),
      };
      const game = await GameModel.create(gameData);
      res.status(201).json({ success: true, data: game });
    } catch (error) {
      console.error("Error in create game:", error);
      res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    }
  }

  static async update(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        res.status(400).json({ error: "Invalid game ID" });
        return;
      }

      // Get old price if exists
      const oldGame = await GameModel.getById(id);
      const oldPrice = oldGame?.price;

      const game = await GameModel.update(id, req.body);

      // If price is updated and decreased, notify users who have this game in their wishlist
      if (oldPrice && req.body.price && req.body.price < oldPrice) {
        const usersWithGameInWishlist = await WishlistModel.getUsersWithGame(
          id
        );

        // Send notifications to all users who have this game in their wishlist
        for (const user of usersWithGameInWishlist) {
          await NotificationService.sendGameSaleNotification(user.userId, {
            id: game.id,
            title: game.title,
            newPrice: req.body.price,
          });
        }
      }

      res.json(game);
    } catch (error) {
      console.error("Update game error:", error);
      res
        .status(500)
        .json({ error: "Something went wrong while updating the game" });
    }
  }

  static async delete(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      const game = await GameModel.delete(id);

      if (!game) {
        res.status(404).json({ success: false, message: "Game not found" });
        return;
      }

      res.json({ success: true, data: game });
    } catch (error) {
      console.error("Error in delete game:", error);
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === "P2025") {
          res.status(404).json({ error: "no game found" });
          return;
        }
      }

      res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    }
  }

  static async uploadCoverImage(req: Request, res: Response) {
    const gameId = parseInt(req.params.id);

    if (!req.file) {
      res.status(400).json({ error: "No file uploaded" });
      return;
    }

    try {
      const game = await GameModel.getById(gameId);
      if (!game) {
        res.status(404).json({ error: "Game not found" });
        return;
      }

      // Eski cover image'ı sil
      if (game.coverImage) {
        const oldImagePath = path.join(
          process.cwd(),
          "public",
          game.coverImage
        );
        try {
          if (fs.existsSync(oldImagePath)) {
            fs.unlinkSync(oldImagePath);
          }
        } catch (err) {
          console.error("Error deleting old cover image:", err);
        }
      }

      const coverImage = `/uploads/game_covers/${req.file.filename}`;
      await GameModel.update(gameId, { coverImage });

      res.json({
        success: true,
        coverImage,
        message: "Cover image uploaded successfully",
      });
    } catch (error) {
      console.error("Error uploading cover image:", error);
      res.status(500).json({ error: "Error uploading cover image" });
    }
  }

  static async getCoverImage(req: Request, res: Response) {
    const gameId = parseInt(req.params.id);

    try {
      const game = await GameModel.getById(gameId);
      if (!game || !game.coverImage) {
        res.status(404).json({ error: "Cover image not found" });
        return;
      }

      // Doğru yolu oluştur
      const imagePath = path.join(process.cwd(), "public", game.coverImage);

      if (!fs.existsSync(imagePath)) {
        // Dosya yoksa veritabanından referansı temizle
        await GameModel.update(gameId, { coverImage: undefined });
        res.status(404).json({ error: "Cover image file not found" });
        return;
      }

      res.sendFile(imagePath);
    } catch (error) {
      console.error("Error getting cover image:", error);
      res.status(500).json({ error: "Error getting cover image" });
    }
  }

  static async deleteCoverImage(req: Request, res: Response) {
    const gameId = parseInt(req.params.id);

    try {
      const game = await GameModel.getById(gameId);
      if (!game || !game.coverImage) {
        res.status(404).json({ error: "Cover image not found" });
        return;
      }

      // Doğru yolu oluştur
      const imagePath = path.join(process.cwd(), "public", game.coverImage);

      try {
        if (fs.existsSync(imagePath)) {
          fs.unlinkSync(imagePath);
        }
      } catch (err) {
        console.error("Error deleting cover image file:", err);
        res.status(500).json({ error: "Error deleting cover image file" });
        return;
      }

      await GameModel.update(gameId, { coverImage: undefined });

      res.json({
        success: true,
        message: "Cover image deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting cover image:", error);
      res.status(500).json({ error: "Error deleting cover image" });
    }
  }
}
// TODO oyun resmi
