import { Router } from "express";
import CategoryController from "./category.controller";
import AuthMiddleware from "src/middleware/auth.middleware";
import { validator } from "src/middleware/validator.middleware";
import {
  categoryCreateSchema,
  categoryUpdateSchema,
} from "src/modules/category.module/category.validation";

const router = Router();

// Public routes
router.get("/", CategoryController.listAll);
router.get("/:id", CategoryController.listById);

// Admin only routes
router.use("/admin", AuthMiddleware.authenticate, AuthMiddleware.isAdmin);
router.post(
  "/admin",
  validator({ body: categoryCreateSchema }),
  CategoryController.create
);
router.patch(
  "/admin/:id",
  validator({ body: categoryUpdateSchema }),
  CategoryController.editCategory
);
router.delete("/admin/:id", CategoryController.deleteCategory);
router.post("/admin/:id/game/:gameId", CategoryController.addGameToCategory);
router.delete(
  "/admin/:id/game/:gameId",
  CategoryController.removeGameFromCategory
);

export default router;
