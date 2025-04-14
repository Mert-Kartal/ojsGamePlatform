import { Router } from "express";
import AuthController from "./auth.controller";
import AuthMiddleware from "src/middleware/auth.middleware";
import { validator } from "src/middleware/validator.middleware";
import { registerSchema, loginSchema } from "./auth.validation";

const router = Router();

// Public routes
router.post(
  "/register",
  validator({ body: registerSchema }),
  AuthController.register
);

router.post("/login", validator({ body: loginSchema }), AuthController.login);

// Protected routes (require authentication)
router.get("/verify", AuthMiddleware.authenticate, AuthController.verifyUser);

export default router;
