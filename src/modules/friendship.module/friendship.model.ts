import prisma from "src/config/db";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import {
  CreateFriendshipInput,
  UpdateFriendshipStatusInput,
} from "src/validation/friendship.validation";

export default class FriendshipModel {
  static async getFriendships(userId: number) {
    return await prisma.friendship.findMany({
      where: {
        OR: [{ userId }, { friendId: userId }],
        status: "ACCEPTED",
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            profileImage: true,
          },
        },
        friend: {
          select: {
            id: true,
            username: true,
            profileImage: true,
          },
        },
      },
    });
  }

  static async getPendingRequests(userId: number) {
    return await prisma.friendship.findMany({
      where: {
        friendId: userId,
        status: "PENDING",
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            profileImage: true,
          },
        },
        friend: {
          select: {
            id: true,
            username: true,
            profileImage: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  static async getSentRequests(userId: number) {
    return await prisma.friendship.findMany({
      where: {
        userId,
        status: "PENDING",
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            profileImage: true,
          },
        },
        friend: {
          select: {
            id: true,
            username: true,
            profileImage: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  static async getBlockedUsers(userId: number) {
    return await prisma.friendship.findMany({
      where: {
        userId,
        status: "BLOCKED",
      },
      include: {
        friend: {
          select: {
            id: true,
            username: true,
            profileImage: true,
          },
        },
      },
    });
  }

  static async getFriendship(userId: number, friendId: number) {
    return await prisma.friendship.findFirst({
      where: {
        OR: [
          { userId, friendId },
          { userId: friendId, friendId: userId },
        ],
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            profileImage: true,
          },
        },
        friend: {
          select: {
            id: true,
            username: true,
            profileImage: true,
          },
        },
      },
    });
  }

  static async create(userId: number, data: CreateFriendshipInput) {
    try {
      // Check if friendship already exists
      const existingFriendship = await this.getFriendship(
        userId,
        data.friendId
      );
      if (existingFriendship) {
        throw new Error("Friendship already exists");
      }

      return await prisma.friendship.create({
        data: {
          userId,
          friendId: data.friendId,
          status: "PENDING",
        },
        include: {
          user: {
            select: {
              id: true,
              username: true,
              profileImage: true,
            },
          },
          friend: {
            select: {
              id: true,
              username: true,
              profileImage: true,
            },
          },
        },
      });
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === "P2002") {
          throw new Error("Friendship already exists");
        }
        if (error.code === "P2003") {
          throw new Error("User not found");
        }
      }
      throw error;
    }
  }

  static async updateStatus(
    id: number,
    userId: number,
    data: UpdateFriendshipStatusInput
  ) {
    return await prisma.friendship.update({
      where: {
        id,
        OR: [{ userId }, { friendId: userId }],
      },
      data: {
        status: data.status,
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            profileImage: true,
          },
        },
        friend: {
          select: {
            id: true,
            username: true,
            profileImage: true,
          },
        },
      },
    });
  }

  static async delete(id: number, userId: number) {
    return await prisma.friendship.delete({
      where: {
        id,
        OR: [{ userId }, { friendId: userId }],
      },
    });
  }
}
