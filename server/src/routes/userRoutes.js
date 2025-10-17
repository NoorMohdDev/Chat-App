import { Router } from "express";
import upload from "../middlewares/multerMiddleware.js";
import {
  loginUser,
  logoutUser,
  registerUser,
  refreshAccessToken,
  changeCurrentPassword,
  getCurrentUser,
  updateUserAvatar,
  updateAccountDetails,
  searchUsers
} from "../controllers/userController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = Router();

router.route("/register").post(
    upload.single("avatar"),
    registerUser
    )

    router.route("/login").post(loginUser)

    //secured routes
    router.route("/logout").post(protect,  logoutUser)
    router.route("/search").get(protect,  searchUsers)
    router.route("/refresh-token").post(refreshAccessToken)
    router.route("/change-password").post(protect, changeCurrentPassword)
    router.route("/current-user").get(protect, getCurrentUser)
    router.route("/update-account").patch(protect, updateAccountDetails)
    
    router.route("/avatar").patch(protect, upload.single("avatar"), updateUserAvatar)

export default router;
