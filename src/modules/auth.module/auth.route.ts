import { Router } from "express";
import AuthController from "./auth.controller";
import AuthMiddleware from "../../middleware/auth.middleware";
import { validator } from "../../middleware/validator.middleware";
import {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  tokenSchema,
} from "./auth.validation";

const router = Router();

// Public routes
router.post(
  "/register",
  validator({ body: registerSchema }),
  AuthController.register
);

router.post("/login", validator({ body: loginSchema }), AuthController.login);

router.get("/verify", AuthMiddleware.authenticate, AuthController.verifyUser);

// Email verification routes
router.get(
  "/verify-email/:token",
  validator({ params: tokenSchema }),
  AuthController.verifyEmail
);

router.post(
  "/send-verification-email",
  AuthMiddleware.authenticate,
  AuthController.sendVerificationEmail
);

// Password reset routes
router.post(
  "/forgot-password",
  validator({ body: forgotPasswordSchema }),
  AuthController.forgotPassword
);

router.post(
  "/reset-password/:token",
  validator({
    params: tokenSchema,
    body: resetPasswordSchema,
  }),
  AuthController.resetPassword
);

export default router;
