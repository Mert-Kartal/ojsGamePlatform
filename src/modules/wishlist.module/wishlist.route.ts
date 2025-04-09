import { Router } from "express";
import WishlistController from "./wishlist.controller";
import AuthMiddleware from "src/middleware/auth.middleware";

const router = Router();

// Protected routes (require authentication)
router.use(AuthMiddleware.authenticate);

// User wishlist operations
router.get("/", WishlistController.getWishlist);
router.post("/:gameId", WishlistController.addToWishlist);
router.delete("/:gameId", WishlistController.removeFromWishlist);

// Admin only routes
router.get(
  "/admin/user/:userId",
  AuthMiddleware.isAdmin,
  WishlistController.getUserWishlist
);

export default router;
