import { Request, Response } from "express";
import UserModel from "../user.module/user.model";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();
import AuthRequest from "src/types/auth.types";
const jwtSecret = process.env.JWT_SECRET!;

export default class AuthController {
  static async register(
    req: Request<
      {},
      {},
      {
        username: string;
        email: string;
        password: string;
        verifyPassword: string;
        name?: string;
      }
    >,
    res: Response
  ) {
    try {
      const { verifyPassword, ...userData } = req.body;

      const createdUser = await UserModel.create(userData);
      const token = jwt.sign({ userId: createdUser.id }, jwtSecret, {
        expiresIn: "1h",
      });

      res.status(201).json({
        message: "User registered successfully",
        user: {
          id: createdUser.id,
          username: createdUser.username,
          email: createdUser.email,
          name: createdUser.name,
          isAdmin: createdUser.isAdmin,
        },
        token,
      });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === "Username or email already exists") {
          res.status(409).json({ error: error.message });
          return;
        }
      }
      console.error("Registration error:", error);
      res
        .status(500)
        .json({ error: "Something went wrong during registration" });
    }
  }

  static async login(
    req: Request<{}, {}, { username: string; password: string }>,
    res: Response
  ) {
    try {
      const { username, password } = req.body;
      const user = await UserModel.verifyPassword(username, password);

      if (!user) {
        res.status(401).json({ error: "Invalid username or password" });
        return;
      }

      const token = jwt.sign({ userId: user.id }, jwtSecret, {
        expiresIn: "1h",
      });

      res.status(200).json({
        message: "Login successful",
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          name: user.name,
          profileImage: user.profileImage,
          isAdmin: user.isAdmin,
        },
        token,
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ error: "Something went wrong during login" });
    }
  }

  static async verifyUser(req: AuthRequest, res: Response) {
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

      res.status(200).json({
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          name: user.name,
          profileImage: user.profileImage,
          isAdmin: user.isAdmin,
        },
      });
    } catch (error) {
      console.error("Token verification error:", error);
      res
        .status(500)
        .json({ error: "Something went wrong while verifying token" });
    }
  }
}

// model->controller->route->validation->middleware
