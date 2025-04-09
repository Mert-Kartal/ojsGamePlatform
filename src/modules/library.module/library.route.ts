import { Router } from "express";
import LibraryController from "./library.controller";
import AuthMiddleware from "src/middleware/auth.middleware";

const router = Router();

// Protected routes - require authentication
router.use(AuthMiddleware.authenticate);

router.get("/", LibraryController.getUserLibrary);
router.post("/add/game/:gameId", LibraryController.addGameToLibrary);
router.patch("/:gameId/last-played", LibraryController.updateLastPlayed);
router.delete("/:gameId", LibraryController.removeGameFromLibrary);
router.get("/:gameId/check", LibraryController.checkGameInLibrary);

router.get(
  "/admin/user/:userId",
  AuthMiddleware.isAdmin,
  LibraryController.getUserLibrary
);

export default router;
