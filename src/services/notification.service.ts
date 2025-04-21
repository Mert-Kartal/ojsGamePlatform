import { NotificationType } from "@prisma/client";
import NotificationModel from "../modules/notification.module/notification.model";

interface NotificationData {
  userId: number;
  title: string;
  message: string;
  type: NotificationType;
  metadata?: {
    gameId?: number;
    friendshipId?: number;
    userId?: number;
    additionalInfo?: string;
  };
}

export class NotificationService {
  // Friend request notifications
  static async sendFriendRequestNotification(
    targetUserId: number,
    senderInfo: { id: number; username: string }
  ) {
    try {
      const notification = await NotificationModel.create({
        userId: targetUserId,
        title: "New Friend Request",
        message: `${senderInfo.username} sent you a friend request`,
        type: NotificationType.FRIEND_REQUEST,
        metadata: {
          userId: senderInfo.id,
        },
      });
      return notification;
    } catch (error: any) {
      throw new Error(
        `Arkadaşlık isteği bildirimi gönderilirken hata oluştu: ${error.message}`
      );
    }
  }

  static async sendFriendRequestAcceptedNotification(
    targetUserId: number,
    accepterInfo: { id: number; username: string },
    friendshipId: number
  ) {
    try {
      const notification = await NotificationModel.create({
        userId: targetUserId,
        title: "Friend Request Accepted",
        message: `${accepterInfo.username} accepted your friend request`,
        type: NotificationType.FRIEND_ACCEPT,
        metadata: {
          userId: accepterInfo.id,
          friendshipId,
        },
      });
      return notification;
    } catch (error: any) {
      throw new Error(
        `Arkadaşlık kabul bildirimi gönderilirken hata oluştu: ${error.message}`
      );
    }
  }

  // Game sale notifications
  static async sendGameSaleNotification(
    targetUserId: number,
    gameInfo: { id: number; title: string; newPrice: number }
  ) {
    try {
      const notification = await NotificationModel.create({
        userId: targetUserId,
        title: "Game on Sale!",
        message: `${gameInfo.title} from your wishlist is now on sale for $${gameInfo.newPrice}!`,
        type: NotificationType.GAME_SALE,
        metadata: {
          gameId: gameInfo.id,
          additionalInfo: `new_price:${gameInfo.newPrice}`,
        },
      });
      return notification;
    } catch (error: any) {
      throw new Error(
        `Oyun indirim bildirimi gönderilirken hata oluştu: ${error.message}`
      );
    }
  }

  // System notifications
  static async sendSystemNotification(
    targetUserId: number,
    title: string,
    message: string
  ) {
    try {
      const notification = await NotificationModel.create({
        userId: targetUserId,
        title,
        message,
        type: NotificationType.SYSTEM_MESSAGE,
      });
      return notification;
    } catch (error: any) {
      throw new Error(
        `Sistem bildirimi gönderilirken hata oluştu: ${error.message}`
      );
    }
  }

  // Bulk system notifications
  static async sendBulkSystemNotification(
    userIds: number[],
    title: string,
    message: string
  ) {
    try {
      const notifications = userIds.map((userId) => ({
        userId,
        title,
        message,
        type: NotificationType.SYSTEM_MESSAGE,
      }));

      const result = await NotificationModel.createMany(notifications);
      return result;
    } catch (error: any) {
      throw new Error(
        `Toplu sistem bildirimi gönderilirken hata oluştu: ${error.message}`
      );
    }
  }

  // Custom notifications
  static async sendCustomNotification(data: NotificationData) {
    try {
      const notification = await NotificationModel.create(data);
      return notification;
    } catch (error: any) {
      throw new Error(
        `Özel bildirim gönderilirken hata oluştu: ${error.message}`
      );
    }
  }

  // WebSocket integration preparation
  private static async emitNotification(userId: number, notification: any) {
    try {
      // TODO: Will be implemented when WebSocket integration is added
      // socket.to(userId).emit('notification', notification);
    } catch (error: any) {
      throw new Error(
        `WebSocket bildirimi gönderilirken hata oluştu: ${error.message}`
      );
    }
  }
}
