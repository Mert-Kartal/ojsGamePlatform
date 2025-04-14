import { Request, Response } from "express";
import CartModel from "./cart.model";
import AuthRequest from "src/types/auth.types";

export default class CartController {
  // Sepeti getir
  static async getCart(req: AuthRequest, res: Response) {
    try {
      if (!req.user?.id) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }

      const cart = await CartModel.getCart(req.user.id);
      res.status(200).json(cart);
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === "Cart not found") {
          res.status(404).json({ error: error.message });
          return;
        }
      }
      console.error("Get cart error:", error);
      res
        .status(500)
        .json({ error: "Something went wrong while fetching cart" });
    }
  }

  // Admin: Kullanıcının sepetini getir
  static async getUserCart(req: AuthRequest, res: Response) {
    try {
      if (!req.user?.id) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }

      const userId = Number(req.params.userId);
      const cart = await CartModel.getCart(userId);
      res.status(200).json(cart);
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === "Cart not found") {
          res.status(404).json({ error: error.message });
          return;
        }
      }
      console.error("Get user cart error:", error);
      res
        .status(500)
        .json({ error: "Something went wrong while fetching user's cart" });
    }
  }

  // Sepete oyun ekle
  static async addGameToCart(req: AuthRequest, res: Response) {
    try {
      if (!req.user?.id) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }

      const gameId = Number(req.params.gameId);
      const addedGame = await CartModel.addGameToCart(req.user.id, gameId);
      res.status(201).json(addedGame);
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === "Game already exists in cart") {
          res.status(409).json({ error: error.message });
          return;
        }
        if (error.message === "Game not found") {
          res.status(404).json({ error: error.message });
          return;
        }
      }
      console.error("Add game to cart error:", error);
      res
        .status(500)
        .json({ error: "Something went wrong while adding game to cart" });
    }
  }

  // Sepetten oyun çıkar
  static async removeGameFromCart(req: AuthRequest, res: Response) {
    try {
      if (!req.user?.id) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }

      const gameId = Number(req.params.gameId);
      await CartModel.removeGameFromCart(req.user.id, gameId);
      res.status(200).json({ message: "Game removed from cart successfully" });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === "Game not found in cart") {
          res.status(404).json({ error: error.message });
          return;
        }
      }
      console.error("Remove game from cart error:", error);
      res
        .status(500)
        .json({ error: "Something went wrong while removing game from cart" });
    }
  }

  // Sepeti temizle
  static async clearCart(req: AuthRequest, res: Response) {
    try {
      if (!req.user?.id) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }

      const result = await CartModel.clearCart(req.user.id);
      res.status(200).json(result);
    } catch (error) {
      console.error("Clear cart error:", error);
      res
        .status(500)
        .json({ error: "Something went wrong while clearing cart" });
    }
  }
}
