import prisma from "src/config/db";
import { NotificationType, Prisma } from "@prisma/client";

// Metadata tipi tanımı
type NotificationMetadata = {
  gameId?: number;
  friendshipId?: number;
  userId?: number;
  additionalInfo?: string;
};

export default class NotificationModel {
  static async getAll(userId: number, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [notifications, total] = await Promise.all([
      prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.notification.count({
        where: { userId },
      }),
    ]);

    return {
      notifications,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  static async getById(id: number, userId: number) {
    return await prisma.notification.findFirst({
      where: { id, userId },
    });
  }

  static async getUnread(userId: number, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [notifications, total] = await Promise.all([
      prisma.notification.findMany({
        where: { userId, isRead: false },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.notification.count({
        where: { userId, isRead: false },
      }),
    ]);

    return {
      notifications,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  static async getUnreadCount(userId: number) {
    return await prisma.notification.count({
      where: { userId, isRead: false },
    });
  }

  static async create(data: {
    userId: number;
    title: string;
    message: string;
    type: NotificationType;
    metadata?: NotificationMetadata;
  }) {
    return await prisma.notification.create({
      data: {
        ...data,
        metadata: data.metadata as Prisma.JsonObject,
      },
    });
  }

  static async markAsRead(id: number, userId: number) {
    return await prisma.notification.updateMany({
      where: { id, userId },
      data: { isRead: true },
    });
  }

  static async markAllAsRead(userId: number) {
    return await prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });
  }

  static async delete(id: number, userId: number) {
    return await prisma.notification.deleteMany({
      where: { id, userId },
    });
  }

  static async deleteAll(userId: number) {
    return await prisma.notification.deleteMany({
      where: { userId },
    });
  }

  // Eski bildirimleri temizleme (örn: 30 günden eski)
  static async cleanupOldNotifications(daysToKeep = 30) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    return await prisma.notification.deleteMany({
      where: {
        createdAt: {
          lt: cutoffDate,
        },
      },
    });
  }
}
