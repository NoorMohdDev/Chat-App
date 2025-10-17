import jwt from "jsonwebtoken";
import { User } from "../models/userModel.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const protect = asyncHandler(async (req, _, next) => {
  try {
    // 1. Extract token from cookies or Authorization header
    const token =
      req.header("Authorization")?.replace("Bearer ", "") ||
      req.cookies?.accessToken;


    if (!token) {
      throw new ApiError(401, "Unauthorized request: No token provided.");
    }

    // 2. Verify the token
    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);


    // 3. Find the user based on the decoded token
    const user = await User.findById(decodedToken?._id).select("-password");

    if (!user) {
      // This case handles a valid token for a user who no longer exists
      throw new ApiError(401, "Invalid Access Token: User not found.");
    }

    // 4. Attach the user object to the request
    req.user = user;
    next();
  } catch (error) {
    // Catches JWT verification errors (e.g., expired, malformed)
    // and re-throws them as a standardized ApiError.
    throw new ApiError(401, error?.message || "Invalid access token.");
  }
});
