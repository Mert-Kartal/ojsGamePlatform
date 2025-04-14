import { Router } from "express";
import LibraryController from "./library.controller";
import AuthMiddleware from "src/middleware/auth.middleware";
import { validator } from "src/middleware/validator.middleware";
import {
  libraryAddGameSchema,
  libraryUpdateSchema,
} from "./library.validation";

const router = Router();

// Protected routes - require authentication
router.use(AuthMiddleware.authenticate);

router.get("/", LibraryController.getUserLibrary);
router.post(
  "/add/game/:gameId",
  validator({ body: libraryAddGameSchema }),
  LibraryController.addGameToLibrary
);
router.patch(
  "/:gameId/last-played",
  validator({ body: libraryUpdateSchema }),
  LibraryController.updateLastPlayed
);
router.delete("/:gameId", LibraryController.removeGameFromLibrary);
router.get("/:gameId/check", LibraryController.checkGameInLibrary);

router.get(
  "/admin/user/:userId",
  AuthMiddleware.isAdmin,
  LibraryController.getUserLibrary
);

export default router;
