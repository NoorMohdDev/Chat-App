import mongoose from "mongoose";
import { Chat } from "../models/chatModel.js";
import { User } from "../models/userModel.js";
import { Message } from "../models/messageModel.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const accessOneToOneChat = asyncHandler(async (req, res) => {
    const { userId } = req.body;

    if (!userId) {
        throw new ApiError(400, "User ID is required");
    }

    if (!mongoose.isValidObjectId(userId)) {
        throw new ApiError(400, "Invalid User ID format");
    }

    // Find if a chat between these two users already exists
    let chat = await Chat.findOne({
        isGroupChat: false,
        users: { $all: [req.user._id, userId] },
    });

    if (chat) {
        return res
            .status(200)
            .json(new ApiResponse(200, chat, "Chat accessed successfully"));
    }

    // If no chat exists, create one
    const newChat = await Chat.create({
        chatName: "sender", // Placeholder for 1-on-1 chats
        isGroupChat: false,
        users: [req.user._id, userId],
    });

    const createdChat = await Chat.findById(newChat._id).populate("users", "-password");

    return res
        .status(201)
        .json(new ApiResponse(201, createdChat, "Chat created successfully"));
});


const createGroupChat = asyncHandler(async (req, res) => {
    const { name, users } = req.body;

    if (!name || !users || users.length === 0) {
        throw new ApiError(400, "Group name and users are required");
    }

    if (users.length < 2) {
        throw new ApiError(400, "A group must have at least 2 other members");
    }

    const members = [...users, req.user._id];

    const groupChat = await Chat.create({
        chatName: name,
        isGroupChat: true,
        users: members,
        groupAdmin: req.user._id,
    });

    const populatedGroupChat = await Chat.findById(groupChat._id)
        .populate("users", "-password -createdAt -updatedAt -refreshToken")
        .populate("groupAdmin", "-password -createdAt -updatedAt -refreshToken");

    return res
        .status(201)
        .json(new ApiResponse(201, populatedGroupChat, "Group chat created"));
});


const fetchUserChats = asyncHandler(async (req, res) => {
    const chats = await Chat.find({ users: req.user._id })
        .populate("users", "-password -createdAt -updatedAt -refreshToken")
        .populate("groupAdmin", "-password -createdAt -updatedAt -refreshToken")
        .populate("latestMessage")
        .sort({ updatedAt: -1 });

    const populatedChats = await User.populate(chats, {
        path: "latestMessage.sender",
        select: "name pic email",
    });

    return res
        .status(200)
        .json(new ApiResponse(200, populatedChats, "Chats fetched successfully"));
});


const fetchChatById = asyncHandler(async (req, res) => {
    const { chatId } = req.params;
    
    const chat = await Chat.findOne({
        _id: chatId,
        users: req.user._id // Ensure the user is a member of the chat
    })
    .populate("users", "-password")
    .populate("groupAdmin", "-password");
    
    if (!chat) {
        throw new ApiError(404, "Chat not found or you're not a member");
    }

    return res.status(200).json(new ApiResponse(200, chat, "Chat details fetched"));
});


const updateGroupChat = asyncHandler(async (req, res) => {
    const { chatId } = req.params;
    const { name } = req.body;

    const chat = await Chat.findById(chatId);

    if (!chat) {
        throw new ApiError(404, "Chat not found");
    }

    // Only the group admin can update the chat name
    if (chat.groupAdmin.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "Only the group admin can rename the group");
    }

    const updatedChat = await Chat.findByIdAndUpdate(
        chatId,
        { chatName: name },
        { new: true }
    )
    .populate("users", "-password")
    .populate("groupAdmin", "-password");

    return res
        .status(200)
        .json(new ApiResponse(200, updatedChat, "Group chat updated"));
});

const deleteChat = asyncHandler(async (req, res) => {
    const { chatId } = req.params;

    const chat = await Chat.findById(chatId);

    if (!chat) {
        throw new ApiError(404, "Chat not found");
    }
    
    // For group chats, only the admin can delete it
    if (chat.isGroupChat && chat.groupAdmin.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "Only the group admin can delete the group");
    }
    
    // For 1-on-1 chats, any member can delete it
    if (!chat.isGroupChat && !chat.users.includes(req.user._id)) {
        throw new ApiError(403, "You are not a member of this chat");
    }

    await Chat.findByIdAndDelete(chatId);

    //delete all associated messages
    await Message.deleteMany({ chat: chatId });

    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Chat deleted successfully"));
});

export {
    accessOneToOneChat,
    createGroupChat,
    fetchUserChats,
    fetchChatById,
    updateGroupChat,
    deleteChat,
};