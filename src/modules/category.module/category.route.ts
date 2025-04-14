import { Router } from "express";
import CategoryController from "./category.controller";
import AuthMiddleware from "src/middleware/auth.middleware";
import { validator } from "src/middleware/validator.middleware";
import {
  categoryCreateSchema,
  categoryUpdateSchema,
  categoryIdSchema,
  gameIdSchema,
} from "src/modules/category.module/category.validation";
import { z } from "zod";

const router = Router();

// Create combined schema for routes with both category and game IDs
const categoryAndGameIdSchema = z.object({
  id: categoryIdSchema.shape.id,
  gameId: gameIdSchema.shape.gameId,
});

// Public routes
router.get("/", CategoryController.listAll);
router.get(
  "/:id",
  validator({ params: categoryIdSchema }),
  CategoryController.listById
);

// Admin only routes
router.use("/admin", AuthMiddleware.authenticate, AuthMiddleware.isAdmin);
router.post(
  "/admin",
  validator({ body: categoryCreateSchema }),
  CategoryController.create
);
router.patch(
  "/admin/:id",
  validator({ params: categoryIdSchema, body: categoryUpdateSchema }),
  CategoryController.editCategory
);
router.delete(
  "/admin/:id",
  validator({ params: categoryIdSchema }),
  CategoryController.deleteCategory
);
router.post(
  "/admin/:id/game/:gameId",
  validator({ params: categoryAndGameIdSchema }),
  CategoryController.addGameToCategory
);
router.delete(
  "/admin/:id/game/:gameId",
  validator({ params: categoryAndGameIdSchema }),
  CategoryController.removeGameFromCategory
);

export default router;
