import prisma from "src/config/db";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import {
  CreateReviewInput,
  UpdateReviewInput,
} from "src/modules/review.module/review.validation";

export default class ReviewModel {
  static async getAll() {
    return await prisma.review.findMany({
      include: {
        user: {
          select: {
            id: true,
            username: true,
            profileImage: true,
          },
        },
        game: {
          select: {
            id: true,
            title: true,
            coverImage: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  static async getById(id: number) {
    return await prisma.review.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            profileImage: true,
          },
        },
        game: {
          select: {
            id: true,
            title: true,
            coverImage: true,
          },
        },
      },
    });
  }

  static async getByGameId(gameId: number) {
    return await prisma.review.findMany({
      where: { gameId },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            profileImage: true,
          },
        },
        game: {
          select: {
            id: true,
            title: true,
            coverImage: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  static async getByUserId(userId: number) {
    return await prisma.review.findMany({
      where: { userId },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            profileImage: true,
          },
        },
        game: {
          select: {
            id: true,
            title: true,
            coverImage: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  static async create(userId: number, data: CreateReviewInput) {
    try {
      return await prisma.review.create({
        data: {
          ...data,
          userId,
        },
        include: {
          user: {
            select: {
              id: true,
              username: true,
              profileImage: true,
            },
          },
          game: {
            select: {
              id: true,
              title: true,
              coverImage: true,
            },
          },
        },
      });
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === "P2002") {
          throw new Error("User has already reviewed this game");
        }
        if (error.code === "P2003") {
          throw new Error("Game not found");
        }
      }
      throw error;
    }
  }

  static async update(id: number, userId: number, data: UpdateReviewInput) {
    return await prisma.review.update({
      where: {
        id,
        userId, // Ensure the review belongs to the user
      },
      data,
      include: {
        user: {
          select: {
            id: true,
            username: true,
            profileImage: true,
          },
        },
        game: {
          select: {
            id: true,
            title: true,
            coverImage: true,
          },
        },
      },
    });
  }

  static async delete(id: number, userId: number) {
    return await prisma.review.delete({
      where: {
        id,
        userId, // Ensure the review belongs to the user
      },
    });
  }

  static async getGameAverageRating(gameId: number) {
    const result = await prisma.review.aggregate({
      where: { gameId },
      _avg: {
        rating: true,
      },
      _count: {
        rating: true,
      },
    });

    return {
      averageRating: result._avg.rating || 0,
      totalReviews: result._count.rating,
    };
  }
}
