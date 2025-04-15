import { Request, Response } from "express";
import UserModel from "./user.model";
import dotenv from "dotenv";
import path from "path";
import fs from "fs";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";

dotenv.config();

import AuthRequest from "src/types/auth.types";

export default class UserController {
  static async getAll(req: Request, res: Response) {
    try {
      const users = await UserModel.getAll();
      if (users.length === 0) {
        res.status(404).json({ error: "No users found" });
        return;
      }
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
      const id = parseInt(req.params.id);
      const user = await UserModel.getById(id);

      if (!user) {
        res.status(404).json({ error: "User not found" });
        return;
      }

      res.status(200).json(user);
    } catch (error) {
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

      const updatedUser = await UserModel.update(userId, req.body);

      if (!updatedUser) {
        res.status(404).json({ error: "User not found" });
        return;
      }

      res.status(200).json(updatedUser);
    } catch (error) {
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

  static async create(req: Request, res: Response) {
    try {
      const createdUser = await UserModel.create(req.body);
      res.status(201).json(createdUser);
    } catch (error) {
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
      const id = parseInt(req.params.id);
      const updatedUser = await UserModel.update(id, req.body);
      res.status(200).json(updatedUser);
    } catch (error) {
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
      const id = parseInt(req.params.id);
      const deletedUser = await UserModel.delete(id);

      if (!deletedUser) {
        res.status(404).json({ error: "User not found" });
        return;
      }

      res.status(200).json({ message: "User deleted successfully" });
    } catch (error) {
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
      const id = parseInt(req.params.id);
      const user = await UserModel.getById(id);

      if (!user) {
        res.status(404).json({ error: "User not found" });
        return;
      }

      const updatedUser = await UserModel.update(id, {
        isAdmin: !user.isAdmin,
      });

      res.status(200).json(updatedUser);
    } catch (error) {
      console.error("Toggle admin status error:", error);
      res
        .status(500)
        .json({ error: "Something went wrong while toggling admin status" });
    }
  }

  static async uploadProfilePhoto(req: AuthRequest, res: Response) {
    if (!req.file) {
      res.status(400).json({ error: "No file uploaded" });
      return;
    }

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

      // Uploads klasörlerini kontrol et ve oluştur
      const publicDir = path.join(process.cwd(), "public");
      const uploadsDir = path.join(publicDir, "uploads");
      const profilesDir = path.join(uploadsDir, "profile_photos");

      console.log("Creating directories if not exist:");
      console.log("Public dir:", publicDir);
      console.log("Uploads dir:", uploadsDir);
      console.log("Profiles dir:", profilesDir);

      // Klasörleri oluştur
      [publicDir, uploadsDir, profilesDir].forEach((dir) => {
        if (!fs.existsSync(dir)) {
          console.log("Creating directory:", dir);
          fs.mkdirSync(dir, { recursive: true });
        }
      });

      // Eski profil fotoğrafını sil
      if (user.profileImage) {
        const oldImagePath = path.join(publicDir, user.profileImage);
        try {
          if (fs.existsSync(oldImagePath)) {
            console.log("Deleting old profile photo:", oldImagePath);
            fs.unlinkSync(oldImagePath);
          }
        } catch (err) {
          console.error("Error deleting old profile photo:", err);
        }
      }

      console.log("Uploaded file:", req.file);

      // Yeni profil fotoğrafını kaydet
      const profileImage = `/uploads/profile_photos/${req.file.filename}`;
      console.log("New profile image path:", profileImage);

      await UserModel.update(userId, { profileImage });

      res.json({
        success: true,
        profileImage,
        message: "Profile photo uploaded successfully",
      });
    } catch (error) {
      console.error("Error uploading profile photo:", error);
      res.status(500).json({ error: "Error uploading profile photo" });
    }
  }

  static async getProfilePhoto(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ error: "User not authenticated" });
        return;
      }

      const user = await UserModel.getById(userId);
      if (!user || !user.profileImage) {
        res.status(404).json({ error: "Profile photo not found" });
        return;
      }

      console.log("User profile image path:", user.profileImage);

      // Profil fotoğrafı yolunu oluştur
      const imagePath = path.join(process.cwd(), "public", user.profileImage);
      console.log("Full image path:", imagePath);
      console.log("File exists:", fs.existsSync(imagePath));

      // Dosyanın varlığını kontrol et
      if (!fs.existsSync(imagePath)) {
        console.log("File not found at path:", imagePath);
        // Dosya yoksa veritabanından profil fotoğrafı referansını temizle
        await UserModel.update(userId, { profileImage: undefined });
        res.status(404).json({ error: "Profile photo file not found" });
        return;
      }

      // Dosyayı gönder
      res.sendFile(imagePath);
    } catch (error) {
      console.error("Error getting profile photo:", error);
      res.status(500).json({ error: "Error getting profile photo" });
    }
  }

  static async deleteProfilePhoto(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ error: "User not authenticated" });
        return;
      }

      const user = await UserModel.getById(userId);
      if (!user || !user.profileImage) {
        res.status(404).json({ error: "Profile photo not found" });
        return;
      }

      const imagePath = path.join(
        __dirname,
        "../../../public",
        user.profileImage
      );

      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }

      await UserModel.update(userId, { profileImage: undefined });

      res.json({
        success: true,
        message: "Profile photo deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting profile photo:", error);
      res.status(500).json({ error: "Error deleting profile photo" });
    }
  }
}

//TODO profil resmi
