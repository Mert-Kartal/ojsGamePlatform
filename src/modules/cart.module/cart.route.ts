import { Router } from "express";
import CartController from "./cart.controller";
import AuthMiddleware from "src/middleware/auth.middleware";
import { validator } from "src/middleware/validator.middleware";
import { gameIdSchema, userIdSchema } from "./cart.validation";

const router = Router();

// Tüm rotalar authentication gerektirir
router.use(AuthMiddleware.authenticate);

// Admin route
router.get(
  "/admin/user/:userId",
  AuthMiddleware.isAdmin,
  validator({ params: userIdSchema }),
  CartController.getUserCart
);

// Sepeti getir
router.get("/", CartController.getCart);

// Sepete oyun ekle
router.post(
  "/:gameId",
  validator({ params: gameIdSchema }),
  CartController.addGameToCart
);

// Sepetten oyun çıkar
router.delete(
  "/:gameId",
  validator({ params: gameIdSchema }),
  CartController.removeGameFromCart
);

// Sepeti temizle
router.delete("/", CartController.clearCart);

export default router;
