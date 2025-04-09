import { Router } from "express";
import FriendshipController from "./friendship.controller";
import AuthMiddleware from "src/middleware/auth.middleware";

const router = Router();

// All routes require authentication
router.use(AuthMiddleware.authenticate);

// Friend list and requests
router.get("/", FriendshipController.getFriends);
router.get("/pending", FriendshipController.getPendingRequests);
router.get("/sent", FriendshipController.getSentRequests);
router.get("/blocked", FriendshipController.getBlockedUsers);

// Friend request operations
router.post("/request", FriendshipController.sendFriendRequest);
router.put("/:id/status", FriendshipController.updateFriendshipStatus);
router.delete("/:id", FriendshipController.removeFriendship);

export default router;
