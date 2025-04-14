import { Router } from "express";
import ReviewController from "./review.controller";
import AuthMiddleware from "src/middleware/auth.middleware";
import { validator } from "src/middleware/validator.middleware";
import { reviewCreateSchema, reviewUpdateSchema } from "./review.validation";

const router = Router();

// Public routes
router.get("/", ReviewController.getAll);
router.get("/:id", ReviewController.getById);
router.get("/game/:gameId", ReviewController.getByGameId);
router.get("/game/:gameId/rating", ReviewController.getGameAverageRating);

// Protected routes - require authentication
router.use(AuthMiddleware.authenticate);
router.get("/user/me", ReviewController.getUserReviews);
router.post(
  "/",
  validator({ body: reviewCreateSchema }),
  ReviewController.create
);
router.patch(
  "/:id",
  validator({ body: reviewUpdateSchema }),
  ReviewController.update
);
router.delete("/:id", ReviewController.delete);

// Admin routes
router.get(
  "/admin/user/:userId",
  AuthMiddleware.isAdmin,
  ReviewController.getUserReviews
);

export default router;
