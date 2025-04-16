import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { tokenSchema } from "../modules/auth.module/auth.validation";
import { ZodError } from "zod";
import UserModel from "../modules/user.module/user.model";

dotenv.config();
const jwtSecret = process.env.JWT_SECRET
  ? process.env.JWT_SECRET
  : "secret_key";

interface JwtPayload {
  userId: number;
  iat: number;
  exp: number;
}

import AuthRequest from "src/types/auth.types";

export default class AuthMiddleware {
  static async authenticate(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader) {
        res.status(401).json({ error: "No token provided" });
        return;
      }

      const token = authHeader.split(" ")[1];
      if (!token) {
        res.status(401).json({ error: "Invalid token format" });
        return;
      }

      const { token: validatedToken } = tokenSchema.parse({ token });
      const decoded = jwt.verify(validatedToken, jwtSecret) as JwtPayload;

      if (!decoded || !decoded.userId) {
        res.status(401).json({ error: "Invalid token" });
        return;
      }

      req.user = { id: decoded.userId };
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ error: error.errors });
        return;
      }
      if (error instanceof jwt.JsonWebTokenError) {
        res.status(401).json({ error: "Invalid token" });
        return;
      }
      if (error instanceof jwt.TokenExpiredError) {
        res.status(401).json({ error: "Token expired" });
        return;
      }
      console.error("Authentication error:", error);
      res
        .status(500)
        .json({ error: "Something went wrong during authentication" });
    }
  }

  static async isAdmin(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ error: "User not authenticated" });
        return;
      }

      const user = await UserModel.getById(userId);
      if (!user || !user.isAdmin) {
        res
          .status(403)
          .json({ error: "Access denied. Admin privileges required." });
        return;
      }

      next();
    } catch (error) {
      console.error("Admin check error:", error);
      res.status(500).json({
        error: "Something went wrong while checking admin privileges",
      });
    }
  }
}
