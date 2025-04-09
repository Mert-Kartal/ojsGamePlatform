import { Request, Response } from "express";
import UserModel from "./user.model";
import {
  userCreateSchema,
  userUpdateSchema,
  userIdSchema,
} from "src/validation/user.validation";
import { createUserDTO } from "src/DTO/user.dto";
import { ZodError } from "zod";
import dotenv from "dotenv";
import path from "path";
import fs from "fs";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";

dotenv.config();

interface AuthRequest extends Request {
  user?: {
    id: number;
  };
}

export default class UserController {
  static async getAll(req: Request, res: Response) {
    try {
      const users = await UserModel.getAll();
      res.status(200).json(users);
    } catch (error) {
      console.error("Get all users error:", error);
      res
        .status(500)
        .json({ error: "Something went wrong while fetching users" });
    }
  }

  static async getById(req: Request, res: Response) {
    try {
      const { id } = userIdSchema.parse({ id: parseInt(req.params.id) });
      const user = await UserModel.getById(id);

      if (!user) {
        res.status(404).json({ error: "User not found" });
        return;
      }

      res.status(200).json(user);
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ error: error.errors });
        return;
      }
      console.error("Get user by id error:", error);
      res
        .status(500)
        .json({ error: "Something went wrong while fetching user" });
    }
  }

  static async getProfile(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ error: "User not authenticated" });
        return;
      }

      const user = await UserModel.getById(userId);
      if (!user) {
        res.status(404).json({ error: "User not found" });
        return;
      }

      res.status(200).json(user);
    } catch (error) {
      console.error("Get profile error:", error);
      res
        .status(500)
        .json({ error: "Something went wrong while fetching profile" });
    }
  }

  static async updateProfile(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ error: "User not authenticated" });
        return;
      }

      const validatedData = userUpdateSchema.parse(req.body);
      const updatedUser = await UserModel.update(userId, validatedData);

      if (!updatedUser) {
        res.status(404).json({ error: "User not found" });
        return;
      }

      res.status(200).json(updatedUser);
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ error: error.errors });
        return;
      }
      console.error("Update profile error:", error);
      res
        .status(500)
        .json({ error: "Something went wrong while updating profile" });
    }
  }

  static async deleteProfile(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ error: "User not authenticated" });
        return;
      }

      const deletedUser = await UserModel.delete(userId);
      if (!deletedUser) {
        res.status(404).json({ error: "User not found" });
        return;
      }

      res.status(200).json({ message: "Profile deleted successfully" });
    } catch (error) {
      console.error("Delete profile error:", error);
      res
        .status(500)
        .json({ error: "Something went wrong while deleting profile" });
    }
  }

  static async create(req: Request<{}, {}, createUserDTO>, res: Response) {
    try {
      const validatedData = userCreateSchema.parse(req.body);
      const createdUser = await UserModel.create(validatedData);
      res.status(201).json(createdUser);
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ error: error.errors });
        return;
      }
      if (
        error instanceof Error &&
        error.message === "Username or email already exists"
      ) {
        res.status(409).json({ error: error.message });
        return;
      }
      console.error("Create user error:", error);
      res
        .status(500)
        .json({ error: "Something went wrong while creating user" });
    }
  }

  static async update(req: Request, res: Response) {
    try {
      const { id } = userIdSchema.parse({ id: parseInt(req.params.id) });
      const validatedData = userUpdateSchema.parse(req.body);
      const updatedUser = await UserModel.update(id, validatedData);
      res.status(200).json(updatedUser);
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ error: error.errors });
        return;
      }
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === "P2025") {
          res.status(404).json({ error: "no user found" });
          return;
        }
      }
      console.error("Update user error:", error);
      res
        .status(500)
        .json({ error: "Something went wrong while updating user" });
    }
  }

  static async delete(req: Request, res: Response) {
    try {
      const { id } = userIdSchema.parse({ id: parseInt(req.params.id) });
      const deletedUser = await UserModel.delete(id);

      if (!deletedUser) {
        res.status(404).json({ error: "User not found" });
        return;
      }

      res.status(200).json({ message: "User deleted successfully" });
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ error: error.errors });
        return;
      }
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === "P2025") {
          res.status(404).json({ error: "no user found" });
          return;
        }
      }

      console.error("Delete user error:", error);
      res
        .status(500)
        .json({ error: "Something went wrong while deleting user" });
    }
  }

  static async getByUsername(req: Request, res: Response) {
    try {
      const { username } = req.params;
      if (!username) {
        res.status(400).json({ error: "Username is required" });
        return;
      }

      const user = await UserModel.getByUsername(username);
      if (!user) {
        res.status(404).json({ error: "User not found" });
        return;
      }

      res.status(200).json(user);
    } catch (error) {
      console.error("Get user by username error:", error);
      res
        .status(500)
        .json({ error: "Something went wrong while fetching user" });
    }
  }

  static async toggleAdminStatus(req: Request, res: Response) {
    try {
      const { id } = userIdSchema.parse({ id: parseInt(req.params.id) });
      const updatedUser = await UserModel.toggleAdminStatus(id);

      if (!updatedUser) {
        res.status(404).json({ error: "User not found" });
        return;
      }

      res.status(200).json({
        message: `User admin status changed to ${updatedUser.isAdmin}`,
        user: updatedUser,
      });
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ error: error.errors });
        return;
      }
      console.error("Toggle admin status error:", error);
      res
        .status(500)
        .json({ error: "Something went wrong while toggling admin status" });
    }
  }

  static async uploadProfilePhoto(req: AuthRequest, res: Response) {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ error: "User not authenticated" });
      return;
    }

    if (!req.file) {
      res.status(400).json({ error: "Dosya yüklenemedi" });
      return;
    }

    const filePath = req.file.path as string;

    try {
      const user = await UserModel.getById(+userId);
      if (!user) {
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
        res.status(404).json({ error: "User not found" });
        return;
      }

      if (user.profileImage && fs.existsSync(user.profileImage)) {
        fs.unlinkSync(user.profileImage);
      }

      const updatedUser = await UserModel.update(+userId, {
        profileImage: filePath,
      });

      res.status(200).json({
        message: "Success",
        user: updatedUser,
      });
    } catch (error) {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      console.error("Upload profile photo error:", error);
      res.status(500).json({
        error: "Something went wrong",
      });
    }
  }

  static async getProfilePhoto(req: AuthRequest, res: Response) {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ error: "User not authenticated" });
      return;
    }
    try {
      const user = await UserModel.getById(+userId);

      if (!user) {
        res.status(404).json({ error: "User not found" });
        return;
      }
      if (!user.profileImage) {
        res.status(404).json({ error: "No Profile Picture to Show" });
        return;
      }

      const absolutePath = path.resolve(user.profileImage);

      // Check if file exists physically
      if (!fs.existsSync(absolutePath)) {
        // If file doesn't exist, update the user record to remove the invalid reference
        await UserModel.update(+userId, {
          profileImage: undefined,
        });
        res.status(404).json({ error: "Profile picture file not found" });
        return;
      }

      res.status(200).sendFile(absolutePath);
    } catch (error) {
      console.error("Get profile photo error:", error);
      res.status(500).json({
        error: "Something went wrong",
      });
    }
  }

  static async deleteProfilePhoto(req: AuthRequest, res: Response) {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ error: "User not authenticated" });
      return;
    }

    try {
      const user = await UserModel.getById(+userId);
      if (!user) {
        res.status(404).json({ error: "User not found" });
        return;
      }

      if (!user.profileImage) {
        res.status(404).json({ error: "No profile photo to delete" });
        return;
      }

      // Delete the file from the filesystem
      if (fs.existsSync(user.profileImage)) {
        fs.unlinkSync(user.profileImage);
      }

      // Update user profile to remove the photo reference
      const updatedUser = await UserModel.update(+userId, {
        profileImage: undefined,
      });

      res.status(200).json({
        message: "Profile photo deleted successfully",
        user: updatedUser,
      });
    } catch (error) {
      console.error("Delete profile photo error:", error);
      res.status(500).json({
        error: "Something went wrong while deleting profile photo",
      });
    }
  }
}

//TODO profil resmi
