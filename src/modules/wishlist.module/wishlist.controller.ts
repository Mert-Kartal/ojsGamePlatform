import { Request, Response } from "express";
import WishlistModel from "./wishlist.model";
import AuthRequest from "src/types/auth.types";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";

export default class WishlistController {
  static async addToWishlist(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ error: "User not authenticated" });
        return;
      }

      const gameId = parseInt(req.params.gameId);
      const wishlistItem = await WishlistModel.addToWishlist(userId, gameId);

      res.status(201).json({
        message: "Game added to wishlist",
        game: {
          id: wishlistItem.game.id,
          title: wishlistItem.game.title,
        },
      });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === "Game is already in wishlist") {
          res.status(409).json({ error: error.message });
          return;
        }
        if (error.message === "This Game Deleted or not Exist") {
          res.status(404).json({ error: error.message });
          return;
        }
      }
      console.error("Add to wishlist error:", error);
      res
        .status(500)
        .json({ error: "Something went wrong while adding game to wishlist" });
    }
  }

  static async removeFromWishlist(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ error: "User not authenticated" });
        return;
      }

      const gameId = parseInt(req.params.gameId);
      const wishlistItem = await WishlistModel.removeFromWishlist(
        userId,
        gameId
      );

      res.status(200).json({
        message: "Game removed from wishlist",
        game: {
          id: wishlistItem.game.id,
          title: wishlistItem.game.title,
        },
      });
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === "P2025") {
          res.status(404).json({ error: "Game not found" });
          return;
        }
      }

      console.error("Remove from wishlist error:", error);
      res.status(500).json({
        error: "Something went wrong while removing game from wishlist",
      });
    }
  }

  static async getWishlist(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ error: "User not authenticated" });
        return;
      }

      const wishlist = await WishlistModel.getWishlist(userId);
      res.status(200).json(wishlist);
    } catch (error) {
      console.error("Get wishlist error:", error);
      res
        .status(500)
        .json({ error: "Something went wrong while fetching wishlist" });
    }
  }

  static async getUserWishlist(req: Request, res: Response) {
    try {
      const userId = parseInt(req.params.userId);
      const wishlist = await WishlistModel.getUserWishlist(userId);

      if (!wishlist) {
        res.status(404).json({ error: "Wishlist not found" });
        return;
      }

      res.status(200).json(wishlist);
    } catch (error) {
      console.error("Get user wishlist error:", error);
      res
        .status(500)
        .json({ error: "Something went wrong while fetching user wishlist" });
    }
  }
}
