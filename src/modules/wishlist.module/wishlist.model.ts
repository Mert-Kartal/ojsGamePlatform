import prisma from "src/config/db";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";

export default class WishlistModel {
  static async addToWishlist(userId: number, gameId: number) {
    try {
      const game = await prisma.game.findFirst({
        where: {
          id: gameId,
          deletedAt: null,
        },
      });

      if (!game) {
        throw new Error("This Game Deleted or not Exist");
      }
      return await prisma.wishlist.create({
        data: {
          userId,
          gameId,
        },
        include: {
          game: {
            select: {
              id: true,
              title: true,
              description: true,
              price: true,
              coverImage: true,
            },
          },
        },
      });
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === "P2002") {
          throw new Error("Game is already in wishlist");
        }
      }
      throw error;
    }
  }

  static async removeFromWishlist(userId: number, gameId: number) {
    return await prisma.wishlist.delete({
      where: {
        userId_gameId: {
          userId,
          gameId,
        },
      },
      include: {
        game: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });
  }

  static async getWishlist(userId: number) {
    return await prisma.wishlist.findMany({
      where: {
        userId,
      },
      include: {
        game: {
          select: {
            id: true,
            title: true,
            description: true,
            price: true,
            coverImage: true,
          },
        },
      },
      orderBy: {
        addedAt: "desc",
      },
    });
  }

  static async getUserWishlist(userId: number) {
    return await prisma.wishlist.findMany({
      where: {
        userId,
      },
      include: {
        game: {
          select: {
            id: true,
            title: true,
            description: true,
            price: true,
            coverImage: true,
          },
        },
        user: {
          select: {
            id: true,
            username: true,
            name: true,
          },
        },
      },
      orderBy: {
        addedAt: "desc",
      },
    });
  }
}
