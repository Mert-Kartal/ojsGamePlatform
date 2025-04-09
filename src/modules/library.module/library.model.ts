import prisma from "src/config/db";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";

export default class LibraryModel {
  static async getUserLibrary(userId: number) {
    return await prisma.library.findMany({
      where: {
        userId,
      },
      include: {
        game: {
          include: {
            categories: {
              include: {
                category: true,
              },
            },
          },
        },
      },
      orderBy: {
        lastPlayed: "desc",
      },
    });
  }

  static async addGameToLibrary(userId: number, gameId: number) {
    try {
      return await prisma.library.create({
        data: {
          userId,
          gameId,
        },
        include: {
          game: true,
        },
      });
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === "P2002") {
          throw new Error("Game already exists in library");
        }
        if (error.code === "P2003") {
          throw new Error("Game not found");
        }
      }
      throw error;
    }
  }

  static async updateLastPlayed(userId: number, gameId: number) {
    return await prisma.library.update({
      where: {
        userId_gameId: {
          userId,
          gameId,
        },
      },
      data: {
        lastPlayed: new Date(),
      },
      include: {
        game: true,
      },
    });
  }

  static async removeGameFromLibrary(userId: number, gameId: number) {
    try {
      return await prisma.library.delete({
        where: {
          userId_gameId: {
            userId,
            gameId,
          },
        },
      });
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === "P2025") {
          throw new Error("Game not found in library");
        }
      }
      throw error;
    }
  }

  static async getGameFromLibrary(userId: number, gameId: number) {
    return await prisma.library.findUnique({
      where: {
        userId_gameId: {
          userId,
          gameId,
        },
      },
      include: {
        game: true,
      },
    });
  }
}
