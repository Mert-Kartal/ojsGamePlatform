import prisma from "src/config/db";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";

export default class CategoryModel {
  static async create(data: { name: string }) {
    try {
      return await prisma.category.create({
        data,
      });
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === "P2002") {
          throw new Error("Category name already exists");
        }
      }
      throw error;
    }
  }

  static async getAll() {
    return await prisma.category.findMany({
      include: {
        games: {
          include: {
            game: true,
          },
        },
      },
    });
  }

  static async getById(id: number) {
    return await prisma.category.findUnique({
      where: { id },
      include: {
        games: {
          include: {
            game: true,
          },
        },
      },
    });
  }

  static async update(id: number, data: { name?: string }) {
    try {
      return await prisma.category.update({
        where: { id },
        data,
      });
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === "P2002") {
          throw new Error("Category name already exists");
        }
      }
      throw error;
    }
  }

  static async delete(id: number) {
    try {
      return await prisma.category.delete({
        where: { id },
      });
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === "P2003") {
          throw new Error("Cannot delete category with associated games");
        }
      }
      throw error;
    }
  }

  static async addGameToCategory(categoryId: number, gameId: number) {
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

      return await prisma.categoryOnGame.create({
        data: {
          categoryId,
          gameId,
        },
      });
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === "P2002") {
          throw new Error("Game is already in this category");
        }
      }
      throw error;
    }
  }

  static async removeGameFromCategory(categoryId: number, gameId: number) {
    return await prisma.categoryOnGame.delete({
      where: {
        gameId_categoryId: {
          gameId,
          categoryId,
        },
      },
    });
  }
}
