import { Router } from "express";
import FriendshipController from "./friendship.controller";
import AuthMiddleware from "src/middleware/auth.middleware";
import { validator } from "src/middleware/validator.middleware";
import {
  friendshipCreateSchema,
  friendshipIdSchema,
  friendshipStatusSchema,
} from "./friendship.validation";

const router = Router();

// All routes require authentication
router.use(AuthMiddleware.authenticate);

// Friend list and requests
router.get("/", FriendshipController.getFriends);
router.get("/pending", FriendshipController.getPendingRequests);
router.get("/sent", FriendshipController.getSentRequests);
router.get("/blocked", FriendshipController.getBlockedUsers);

// Friend request operations
router.post(
  "/request",
  validator({ body: friendshipCreateSchema }),
  FriendshipController.sendFriendRequest
);
router.put(
  "/:id/status",
  validator({
    params: friendshipIdSchema,
    body: friendshipStatusSchema,
  }),
  FriendshipController.updateFriendshipStatus
);
router.delete(
  "/:id",
  validator({ params: friendshipIdSchema }),
  FriendshipController.removeFriendship
);

export default router;
