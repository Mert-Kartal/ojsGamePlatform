import { Request, Response } from "express";
import NotificationModel from "./notification.model";
import AuthRequest from "src/types/auth.types";

export default class NotificationController {
  static async getAll(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }

      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;

      if (page < 1 || limit < 1 || limit > 100) {
        res.status(400).json({
          error:
            "Invalid pagination parameters. Page must be >= 1 and limit must be between 1 and 100",
        });
        return;
      }

      const result = await NotificationModel.getAll(userId, page, limit);
      res.json(result);
    } catch (error) {
      console.error("Get all notifications error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }

  static async getUnread(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }

      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;

      if (page < 1 || limit < 1 || limit > 100) {
        res.status(400).json({
          error:
            "Invalid pagination parameters. Page must be >= 1 and limit must be between 1 and 100",
        });
        return;
      }

      const result = await NotificationModel.getUnread(userId, page, limit);
      res.json(result);
    } catch (error) {
      console.error("Get unread notifications error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }

  static async getUnreadCount(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }

      const count = await NotificationModel.getUnreadCount(userId);
      res.json({ count });
    } catch (error) {
      console.error("Get unread count error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }

  static async markAsRead(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }

      const notificationId = parseInt(req.params.id);
      if (isNaN(notificationId)) {
        res.status(400).json({ error: "Invalid notification ID" });
        return;
      }

      const notification = await NotificationModel.getById(
        notificationId,
        userId
      );
      if (!notification) {
        res.status(404).json({ error: "Notification not found" });
        return;
      }

      await NotificationModel.markAsRead(notificationId, userId);
      res.json({ message: "Notification marked as read" });
    } catch (error) {
      console.error("Mark as read error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }

  static async markAllAsRead(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }

      await NotificationModel.markAllAsRead(userId);
      res.json({ message: "All notifications marked as read" });
    } catch (error) {
      console.error("Mark all as read error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }

  static async delete(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }

      const notificationId = parseInt(req.params.id);
      if (isNaN(notificationId)) {
        res.status(400).json({ error: "Invalid notification ID" });
        return;
      }

      const notification = await NotificationModel.getById(
        notificationId,
        userId
      );
      if (!notification) {
        res.status(404).json({ error: "Notification not found" });
        return;
      }

      await NotificationModel.delete(notificationId, userId);
      res.json({ message: "Notification deleted" });
    } catch (error) {
      console.error("Delete notification error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }

  static async deleteAll(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }

      await NotificationModel.deleteAll(userId);
      res.json({ message: "All notifications deleted" });
    } catch (error) {
      console.error("Delete all notifications error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
}
