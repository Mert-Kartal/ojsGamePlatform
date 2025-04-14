import { Request, Response } from "express";
import FriendshipModel from "./friendship.model";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import AuthRequest from "src/types/auth.types";

export default class FriendshipController {
  static async getFriends(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }

      const friends = await FriendshipModel.getFriendships(req.user.id);
      if (friends.length === 0) {
        res.status(404).json({ error: "No friends found" });
        return;
      }
      res.status(200).json(friends);
    } catch (error) {
      console.error("Get friends error:", error);
      res
        .status(500)
        .json({ error: "Something went wrong while fetching friends" });
    }
  }

  static async getPendingRequests(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }

      const requests = await FriendshipModel.getPendingRequests(req.user.id);
      if (requests.length === 0) {
        res.status(404).json({ error: "No pending friend requests found" });
        return;
      }
      res.status(200).json(requests);
    } catch (error) {
      console.error("Get pending requests error:", error);
      res
        .status(500)
        .json({ error: "Something went wrong while fetching friend requests" });
    }
  }

  static async getSentRequests(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }

      const requests = await FriendshipModel.getSentRequests(req.user.id);
      if (requests.length === 0) {
        res.status(404).json({ error: "No sent friend requests found" });
        return;
      }
      res.status(200).json(requests);
    } catch (error) {
      console.error("Get sent requests error:", error);
      res
        .status(500)
        .json({ error: "Something went wrong while fetching sent requests" });
    }
  }

  static async getBlockedUsers(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }

      const blockedUsers = await FriendshipModel.getBlockedUsers(req.user.id);
      res.status(200).json(blockedUsers);
    } catch (error) {
      console.error("Get blocked users error:", error);
      res
        .status(500)
        .json({ error: "Something went wrong while fetching blocked users" });
    }
  }

  static async sendFriendRequest(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }

      if (req.user.id === req.body.friendId) {
        res
          .status(400)
          .json({ error: "Cannot send friend request to yourself" });
        return;
      }

      const friendship = await FriendshipModel.create(req.user.id, req.body);
      res.status(201).json(friendship);
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === "Friendship already exists") {
          res.status(409).json({ error: error.message });
          return;
        }
        if (error.message === "User not found") {
          res.status(404).json({ error: error.message });
          return;
        }
      }
      console.error("Send friend request error:", error);
      res
        .status(500)
        .json({ error: "Something went wrong while sending friend request" });
    }
  }

  static async updateFriendshipStatus(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }

      const id = parseInt(req.params.id);
      const friendship = await FriendshipModel.updateStatus(
        id,
        req.user.id,
        req.body
      );
      res.status(200).json(friendship);
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === "P2025") {
          res
            .status(404)
            .json({ error: "Friendship not found or unauthorized" });
          return;
        }
      }
      console.error("Update friendship status error:", error);
      res.status(500).json({
        error: "Something went wrong while updating friendship status",
      });
    }
  }

  static async removeFriendship(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }

      const id = parseInt(req.params.id);
      await FriendshipModel.delete(id, req.user.id);
      res.status(200).json({ message: "Friendship removed successfully" });
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === "P2025") {
          res
            .status(404)
            .json({ error: "Friendship not found or unauthorized" });
          return;
        }
      }
      console.error("Remove friendship error:", error);
      res
        .status(500)
        .json({ error: "Something went wrong while removing friendship" });
    }
  }
}
