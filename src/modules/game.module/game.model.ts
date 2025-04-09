import prisma from "src/config/db";

export default class GameModel {
  static async getAll() {
    return await prisma.game.findMany({
      where: { deletedAt: null },
      include: {
        categories: {
          include: {
            category: true,
          },
        },
      },
    });
  }

  static async getById(id: number) {
    return await prisma.game.findUnique({
      where: { id, deletedAt: null },
      include: {
        categories: {
          include: {
            category: true,
          },
        },
      },
    });
  }

  static async getByCategory(categoryId: number) {
    return await prisma.game.findMany({
      where: {
        deletedAt: null,
        categories: {
          some: {
            categoryId,
          },
        },
      },
      include: {
        categories: {
          include: {
            category: true,
          },
        },
      },
    });
  }

  static async search(query: string) {
    return await prisma.game.findMany({
      where: {
        deletedAt: null,
        OR: [
          { title: { contains: query, mode: "insensitive" } },
          { description: { contains: query, mode: "insensitive" } },
          { developer: { contains: query, mode: "insensitive" } },
          { publisher: { contains: query, mode: "insensitive" } },
        ],
      },
      include: {
        categories: {
          include: {
            category: true,
          },
        },
      },
    });
  }

  static async create(data: {
    title: string;
    description: string;
    price: number;
    releaseDate: Date;
    developer: string;
    publisher: string;
    coverImage?: string;
  }) {
    return await prisma.game.create({
      data,
      include: {
        categories: {
          include: {
            category: true,
          },
        },
      },
    });
  }

  static async update(
    id: number,
    data: {
      title?: string;
      description?: string;
      price?: number;
      releaseDate?: Date;
      developer?: string;
      publisher?: string;
      coverImage?: string;
    }
  ) {
    return await prisma.game.update({
      where: { id },
      data,
      include: {
        categories: {
          include: {
            category: true,
          },
        },
      },
    });
  }

  static async delete(id: number) {
    return await prisma.game.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
