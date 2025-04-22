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
        emailVerified: true,
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

  static async findByEmailVerifyToken(token: string) {
    console.log("Searching for token in database:", token);

    // Try finding all users with their tokens
    const allUsers = await prisma.user.findMany({
      where: {
        emailVerifyToken: {
          not: null,
        },
      },
      select: {
        id: true,
        email: true,
        emailVerifyToken: true,
        emailVerifyExpires: true,
        emailVerified: true,
      },
    });
    console.log("All users with tokens:", allUsers);

    // Try finding with exact token
    const user = await prisma.user.findFirst({
      where: {
        emailVerifyToken: token,
      },
      select: {
        id: true,
        email: true,
        emailVerifyToken: true,
        emailVerifyExpires: true,
        emailVerified: true,
      },
    });

    console.log("Found user with findFirst:", user);
    return user;
  }

  static async findByResetToken(token: string) {
    return await prisma.user.findUnique({
      where: {
        resetToken: token,
      },
    });
  }

  static async getByEmail(email: string) {
    return await prisma.user.findUnique({
      where: {
        email,
      },
    });
  }

  static async verifyEmail(userId: number) {
    return await prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        emailVerified: true,
        emailVerifyToken: null,
        emailVerifyExpires: null,
      },
    });
  }

  static async setEmailVerifyToken(
    userId: number,
    token: string,
    expires: Date
  ) {
    console.log("Setting email verify token:", { userId, token, expires });
    // Clean the token before saving
    const cleanToken = token.trim();
    const result = await prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        emailVerifyToken: cleanToken,
        emailVerifyExpires: expires,
      },
      select: {
        id: true,
        emailVerifyToken: true,
        emailVerifyExpires: true,
      },
    });
    console.log("Token update result:", result);
    return result;
  }

  static async setResetToken(userId: number, token: string, expires: Date) {
    return await prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        resetToken: token,
        resetTokenExpires: expires,
      },
    });
  }

  static async updatePassword(userId: number, newPassword: string) {
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    return await prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpires: null,
      },
    });
  }
}
