import { Router } from "express";
import NotificationController from "./notification.controller";
import AuthMiddleware from "src/middleware/auth.middleware";
import { validator } from "src/middleware/validator.middleware";
import { notificationIdSchema } from "./notification.validation";

const router = Router();

// Tüm rotalar kimlik doğrulama gerektirir
router.use(AuthMiddleware.authenticate);

// Bildirim listeleme rotaları
router.get("/", NotificationController.getAll);
router.get("/unread", NotificationController.getUnread);
router.get("/unread/count", NotificationController.getUnreadCount);

// Bildirim yönetimi rotaları
router.patch(
  "/:id/read",
  validator({ params: notificationIdSchema }),
  NotificationController.markAsRead
);
router.patch("/read-all", NotificationController.markAllAsRead);
router.delete(
  "/:id",
  validator({ params: notificationIdSchema }),
  NotificationController.delete
);
router.delete("/", NotificationController.deleteAll);

export default router;
