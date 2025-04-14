import { Router } from "express";
import WishlistController from "./wishlist.controller";
import AuthMiddleware from "src/middleware/auth.middleware";
import { validator } from "src/middleware/validator.middleware";
import { wishlistGameIdSchema } from "./wishlist.validation";

const router = Router();

// Protected routes (require authentication)
router.use(AuthMiddleware.authenticate);

// User wishlist operations
router.get("/", WishlistController.getWishlist);
router.post(
  "/:gameId",
  validator({ params: wishlistGameIdSchema }),
  WishlistController.addToWishlist
);
router.delete(
  "/:gameId",
  validator({ params: wishlistGameIdSchema }),
  WishlistController.removeFromWishlist
);

// Admin only routes
router.get(
  "/admin/user/:userId",
  AuthMiddleware.isAdmin,
  WishlistController.getUserWishlist
);

export default router;
