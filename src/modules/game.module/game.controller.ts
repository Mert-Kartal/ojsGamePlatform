import { Request, Response } from "express";
import GameModel from "./game.model";
import {
  gameCreateSchema,
  gameUpdateSchema,
} from "src/validation/game.validation";
import { ZodError } from "zod";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import path from "path";
import fs from "fs";

export default class GameController {
  static async getAll(req: Request, res: Response) {
    try {
      const games = await GameModel.getAll();
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
      const validatedData = gameCreateSchema.parse(req.body);
      const gameData = {
        ...validatedData,
        price: Number(validatedData.price),
        releaseDate: new Date(validatedData.releaseDate),
      };
      const game = await GameModel.create(gameData);
      res.status(201).json({ success: true, data: game });
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({
          success: false,
          message: "Validation error",
          errors: error.errors,
        });
        return;
      }
      console.error("Error in create game:", error);
      res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    }
  }

  static async update(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      const validatedData = gameUpdateSchema.parse(req.body);
      const gameData = {
        ...validatedData,
        price: validatedData.price ? Number(validatedData.price) : undefined,
        releaseDate: validatedData.releaseDate
          ? new Date(validatedData.releaseDate)
          : undefined,
      };
      const game = await GameModel.update(id, gameData);

      if (!game) {
        res.status(404).json({ success: false, message: "Game not found" });
        return;
      }

      res.json({ success: true, data: game });
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({
          success: false,
          message: "Validation error",
          errors: error.errors,
        });
        return;
      }
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === "P2025") {
          res.status(404).json({ error: "no game found" });
          return;
        }
      }

      console.error("Error in update game:", error);
      res
        .status(500)
        .json({ success: false, message: "Internal server error" });
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
      res
        .status(400)
        .json({ success: false, message: "Kapak fotoğrafı yüklenemedi" });
      return;
    }

    const filePath = req.file.path;

    try {
      const game = await GameModel.getById(gameId);
      if (!game) {
        // Yüklenen dosyayı sil
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
        res.status(404).json({ success: false, message: "Oyun bulunamadı" });
        return;
      }

      // Eski kapak fotoğrafını sil
      if (game.coverImage && fs.existsSync(game.coverImage)) {
        fs.unlinkSync(game.coverImage);
      }

      const updatedGame = await GameModel.update(gameId, {
        coverImage: filePath,
      });

      res.status(200).json({
        success: true,
        message: "Kapak fotoğrafı başarıyla yüklendi",
        data: updatedGame,
      });
    } catch (error) {
      // Hata durumunda yüklenen dosyayı sil
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      console.error("Upload cover image error:", error);
      res.status(500).json({
        success: false,
        message: "Kapak fotoğrafı yüklenirken bir hata oluştu",
      });
    }
  }

  static async getCoverImage(req: Request, res: Response) {
    try {
      const gameId = parseInt(req.params.id);
      const game = await GameModel.getById(gameId);

      if (!game) {
        res.status(404).json({ success: false, message: "Oyun bulunamadı" });
        return;
      }

      if (!game.coverImage) {
        res
          .status(404)
          .json({ success: false, message: "Kapak fotoğrafı bulunamadı" });
        return;
      }

      const absolutePath = path.resolve(game.coverImage);

      // Dosyanın fiziksel olarak var olup olmadığını kontrol et
      if (!fs.existsSync(absolutePath)) {
        // Dosya yoksa veritabanından referansı kaldır
        await GameModel.update(gameId, {
          coverImage: undefined,
        });
        res.status(404).json({
          success: false,
          message: "Kapak fotoğrafı dosyası bulunamadı",
        });
        return;
      }

      res.status(200).sendFile(absolutePath);
    } catch (error) {
      console.error("Get cover image error:", error);
      res.status(500).json({
        success: false,
        message: "Kapak fotoğrafı getirilirken bir hata oluştu",
      });
    }
  }

  static async deleteCoverImage(req: Request, res: Response) {
    try {
      const gameId = parseInt(req.params.id);
      const game = await GameModel.getById(gameId);

      if (!game) {
        res.status(404).json({ success: false, message: "Oyun bulunamadı" });
        return;
      }

      if (!game.coverImage) {
        res.status(404).json({
          success: false,
          message: "Silinecek kapak fotoğrafı bulunamadı",
        });
        return;
      }

      // Dosyayı fiziksel olarak sil
      if (fs.existsSync(game.coverImage)) {
        fs.unlinkSync(game.coverImage);
      }

      // Veritabanından referansı kaldır
      const updatedGame = await GameModel.update(gameId, {
        coverImage: undefined,
      });

      res.status(200).json({
        success: true,
        message: "Kapak fotoğrafı başarıyla silindi",
        data: updatedGame,
      });
    } catch (error) {
      console.error("Delete cover image error:", error);
      res.status(500).json({
        success: false,
        message: "Kapak fotoğrafı silinirken bir hata oluştu",
      });
    }
  }
}
// TODO oyun resmi
