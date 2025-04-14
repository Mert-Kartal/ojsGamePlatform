import { Router } from "express";
import { upload } from "../../middleware/upload.middleware";
import UserController from "./user.controller";
import AuthMiddleware from "src/middleware/auth.middleware";
import { validator } from "src/middleware/validator.middleware";
import { userCreateSchema, userUpdateSchema } from "./user.validation";

const router = Router();

// Public routes
router.get("/", UserController.getAll);
router.get("/:id", UserController.getById);

// Protected routes (require authentication)
router.use("/profile", AuthMiddleware.authenticate);
router.get("/profile/me", UserController.getProfile);
router.get("/profile/:username", UserController.getByUsername);
router.patch(
  "/profile/me",
  validator({ body: userUpdateSchema }),
  UserController.updateProfile
);

// Profile photo routes
router.patch(
  "/profile/me/photo",
  upload.single("profilePhoto"),
  UserController.uploadProfilePhoto
);
router.get("/profile/me/photo", UserController.getProfilePhoto);
router.delete("/profile/me/photo", UserController.deleteProfilePhoto);

router.delete("/profile/me", UserController.deleteProfile);

// Admin only routes
router.use("/admin", AuthMiddleware.authenticate, AuthMiddleware.isAdmin);
router.post(
  "/admin",
  validator({ body: userCreateSchema }),
  UserController.create
);
router.patch(
  "/admin/:id",
  validator({ body: userUpdateSchema }),
  UserController.update
);
router.delete("/admin/:id", UserController.delete);
router.patch("/admin/:id/toggle-admin", UserController.toggleAdminStatus);

export default router;
