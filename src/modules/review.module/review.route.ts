import { Router } from "express";
import ReviewController from "./review.controller";
import AuthMiddleware from "src/middleware/auth.middleware";

const router = Router();

// Public routes
router.get("/", ReviewController.getAll);
router.get("/:id", ReviewController.getById);
router.get("/game/:gameId", ReviewController.getByGameId);
router.get("/game/:gameId/rating", ReviewController.getGameAverageRating);

// Protected routes - require authentication
router.use(AuthMiddleware.authenticate);
router.get("/user/me", ReviewController.getUserReviews);
router.post("/", ReviewController.create);
router.patch("/:id", ReviewController.update);
router.delete("/:id", ReviewController.delete);

// Admin routes
router.get(
  "/admin/user/:userId",
  AuthMiddleware.isAdmin,
  ReviewController.getUserReviews
);

export default router;
