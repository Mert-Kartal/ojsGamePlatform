import { Router } from "express";
import GameController from "./game.controller";
import AuthMiddleware from "src/middleware/auth.middleware";
import { upload } from "../../middleware/upload.middleware";

const router = Router();

// Public routes
router.get("/search", GameController.search);
router.get("/category/:categoryId", GameController.getByCategory);
router.get("/", GameController.getAll);
router.get("/:id/cover", GameController.getCoverImage);
router.get("/:id", GameController.getById);

// Admin only routes
router.use("/admin", AuthMiddleware.authenticate, AuthMiddleware.isAdmin);
router.post("/admin", GameController.create);
router.patch("/admin/:id", GameController.update);
router.delete("/admin/:id", GameController.delete);

// Cover image routes (admin only)
router.patch(
  "/admin/:id/cover",
  upload.single("coverPhoto"),
  GameController.uploadCoverImage
);
router.delete("/admin/:id/cover", GameController.deleteCoverImage);

export default router;
