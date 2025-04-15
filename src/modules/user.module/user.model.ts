import prisma from "src/config/db";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import bcrypt from "bcrypt";

export default class UserModel {
  static async create(data: {
    username: string;
    email: string;
    password: string;
    name?: string;
    isAdmin?: boolean | string;
    profileImage?: string;
  }) {
    try {
      const hashedPassword = await bcrypt.hash(data.password, 10);

      const userData = {
        ...data,
        password: hashedPassword,
        isAdmin: data.isAdmin ? Boolean(data.isAdmin) : false,
      };

      return await prisma.user.create({
        data: userData,
      });
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === "P2002") {
          throw new Error("Username or email already exists");
        }
      }
      throw error;
    }
  }

  static async getAll() {
    return await prisma.user.findMany({
      where: {
        deletedAt: null,
      },
      select: {
        id: true,
        username: true,
        email: true,
        name: true,
        profileImage: true,
        isAdmin: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  static async getById(id: number) {
    return await prisma.user.findUnique({
      where: {
        id,
        deletedAt: null,
      },
      select: {
        id: true,
        username: true,
        email: true,
        name: true,
        profileImage: true,
        isAdmin: true,
        createdAt: true,
        updatedAt: true,
        library: {
          include: {
            game: true,
          },
        },
        reviews: {
          include: {
            game: true,
          },
        },
        wishlist: {
          include: {
            game: true,
          },
        },
      },
    });
  }

  static async getByUsername(username: string) {
    return await prisma.user.findUnique({
      where: {
        username,
        deletedAt: null,
      },
      select: {
        id: true,
        username: true,
        email: true,
        name: true,
        profileImage: true,
        isAdmin: true,
        createdAt: true,
        updatedAt: true,
        library: {
          include: {
            game: true,
          },
        },
        reviews: {
          include: {
            game: true,
          },
        },
        wishlist: {
          include: {
            game: true,
          },
        },
      },
    });
  }

  static async update(
    id: number,
    data: {
      username?: string;
      email?: string;
      name?: string;
      profileImage?: string;
      isAdmin?: boolean;
    }
  ) {
    try {
      return await prisma.user.update({
        where: { id },
        data,
        select: {
          id: true,
          username: true,
          email: true,
          name: true,
          profileImage: true,
          isAdmin: true,
        },
      });
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === "P2002") {
          throw new Error("Username or email already exists");
        }
      }
      throw error;
    }
  }

  static async delete(id: number) {
    return await prisma.user.update({
      where: { id },
      data: {
        deletedAt: new Date(),
      },
    });
  }

  static async verifyPassword(username: string, password: string) {
    const user = await prisma.user.findUnique({
      where: {
        username,
        deletedAt: null,
      },
    });

    if (!user) {
      return null;
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return null;
    }

    return user;
  }

  static async toggleAdminStatus(userId: number) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        return null;
      }

      return await prisma.user.update({
        where: { id: userId },
        data: { isAdmin: !user.isAdmin },
      });
    } catch (error) {
      console.error("Toggle admin status error:", error);
      throw error;
    }
  }
}
