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
import EmailService from "../../services/email.service";

const router = Router();

// Test route for email service (remove in production)
router.get("/test-email", async (req, res) => {
  try {
    await EmailService.testConnection();
    res.json({
      message: "Email test completed. Check server logs for details.",
    });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Email test failed. Check server logs for details." });
  }
});

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
