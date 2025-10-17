import { Router } from "express";
import {
  sendMessage,
  fetchMessagesByChat,
  updateMessage,
  deleteMessage,
} from "../controllers/messageController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = Router();

router.use(protect);

router.route("/").post(sendMessage);
router.route("/:chatId").get(fetchMessagesByChat);
router.route("/:messageId").patch(updateMessage).delete(deleteMessage);

export default router;
