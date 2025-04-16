import { Request, Response } from "express";
import UserModel from "../user.module/user.model";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import EmailService from "../../services/email.service";
import dotenv from "dotenv";
import AuthRequest from "../../types/auth.types";

dotenv.config();
const jwtSecret = process.env.JWT_SECRET
  ? process.env.JWT_SECRET
  : "secret_key";

export default class AuthController {
  static async register(req: Request, res: Response) {
    try {
      const { username, email, password, name } = req.body;

      const [existingEmail, existingUsername] = await Promise.all([
        UserModel.getByEmail(email),
        UserModel.getByUsername(username),
      ]);

      if (existingEmail) {
        res.status(400).json({ error: "Email already exists" });
        return;
      }

      if (existingUsername) {
        res.status(400).json({ error: "Username already exists" });
        return;
      }

      const emailVerifyToken = uuidv4();
      const emailVerifyExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

      const user = await UserModel.create({
        username,
        email,
        password,
        name,
      });

      await UserModel.setEmailVerifyToken(
        user.id,
        emailVerifyToken,
        emailVerifyExpires
      );

      await EmailService.sendWelcomeEmail(email, username, emailVerifyToken);

      const token = jwt.sign({ userId: user.id }, jwtSecret, {
        expiresIn: "1d",
      });

      res.status(201).json({
        success: true,
        message:
          "Registration successful. Please check your email to verify your account.",
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          name: user.name,
        },
        token,
      });
    } catch (error) {
      console.error("Registration error:", error);
      res
        .status(500)
        .json({ error: "Something went wrong during registration" });
    }
  }

  static async verifyEmail(req: Request, res: Response) {
    try {
      const { token } = req.params;

      const user = await UserModel.findByEmailVerifyToken(token);
      if (!user) {
        res
          .status(400)
          .json({ error: "Invalid or expired verification token" });
        return;
      }

      if (user.emailVerifyExpires && user.emailVerifyExpires < new Date()) {
        res.status(400).json({ error: "Verification token has expired" });
        return;
      }

      await UserModel.verifyEmail(user.id);

      res.json({
        success: true,
        message: "Email verified successfully. You can now log in.",
      });
    } catch (error) {
      console.error("Email verification error:", error);
      res
        .status(500)
        .json({ error: "Something went wrong during email verification" });
    }
  }

  static async login(req: Request, res: Response) {
    try {
      const { username, password } = req.body;

      const user = await UserModel.verifyPassword(username, password);
      if (!user) {
        res.status(401).json({ error: "Invalid credentials" });
        return;
      }

      const token = jwt.sign({ userId: user.id }, jwtSecret, {
        expiresIn: "1d",
      });

      res.json({
        success: true,
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

  static async forgotPassword(req: Request, res: Response) {
    try {
      const { email } = req.body;

      const user = await UserModel.getByEmail(email);
      if (!user) {
        res.status(404).json({
          success: false,
          message: "User not found.",
        });
        return;
      }

      const resetToken = uuidv4();
      const resetTokenExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

      await UserModel.setResetToken(user.id, resetToken, resetTokenExpires);
      await EmailService.sendPasswordResetEmail(
        user.email,
        user.username,
        resetToken
      );

      res.json({
        success: true,
        message:
          "If your email is registered, you will receive password reset instructions.",
      });
    } catch (error) {
      console.error("Forgot password error:", error);
      res.status(500).json({ error: "Something went wrong" });
    }
  }

  static async resetPassword(req: Request, res: Response) {
    try {
      const { token } = req.params;
      const { password } = req.body;

      const user = await UserModel.findByResetToken(token);
      if (!user) {
        res.status(400).json({ error: "Invalid or expired reset token" });
        return;
      }

      if (user.resetTokenExpires && user.resetTokenExpires < new Date()) {
        res.status(400).json({ error: "Reset token has expired" });
        return;
      }

      await UserModel.updatePassword(user.id, password);

      res.json({
        success: true,
        message:
          "Password reset successful. You can now log in with your new password.",
      });
    } catch (error) {
      console.error("Reset password error:", error);
      res
        .status(500)
        .json({ error: "Something went wrong during password reset" });
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

      res.json({
        success: true,
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

  static async sendVerificationEmail(req: AuthRequest, res: Response) {
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

      // Kullanıcı zaten doğrulanmışsa
      if (user.emailVerified) {
        res.status(400).json({
          success: false,
          message: "Email already verified",
        });
        return;
      }

      const emailVerifyToken = uuidv4();
      const emailVerifyExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

      await UserModel.setEmailVerifyToken(
        user.id,
        emailVerifyToken,
        emailVerifyExpires
      );
      await EmailService.sendEmailVerification(
        user.email,
        user.username,
        emailVerifyToken
      );

      res.json({
        success: true,
        message: "Verification email has been sent. Please check your inbox.",
      });
    } catch (error) {
      console.error("Send verification email error:", error);
      res.status(500).json({
        error: "Something went wrong while sending verification email",
      });
    }
  }
}

// model->controller->route->validation->middleware
// kadirgozcu8543@gmail.com
