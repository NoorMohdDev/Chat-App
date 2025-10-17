import { Router } from "express";
import {
  accessOneToOneChat,
  createGroupChat,
  deleteChat,
  fetchChatById,
  fetchUserChats,
  updateGroupChat,
} from "../controllers/chatController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = Router();

// Apply the 'protect' middleware to all routes in this file
router.use(protect);

router.route("/").get(fetchUserChats).post(accessOneToOneChat);

router.route("/group").post(createGroupChat);

router.route("/group/:chatId").patch(updateGroupChat);

router.route("/:chatId").get(fetchChatById).delete(deleteChat);

export default router;
