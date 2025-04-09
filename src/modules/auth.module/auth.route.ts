import { Router } from "express";
import AuthController from "./auth.controller";
import AuthMiddleware from "src/middleware/auth.middleware";

const router = Router();

// Public routes
router.post(
  "/register",
  AuthMiddleware.validateRegister,
  AuthController.register
);
router.post("/login", AuthMiddleware.validateLogin, AuthController.login);

// Protected routes (require authentication)
router.get("/verify", AuthMiddleware.authenticate, AuthController.verifyUser);

export default router;
