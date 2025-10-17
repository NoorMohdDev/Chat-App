import { Message } from "../models/messageModel.js";
import { Chat } from "../models/chatModel.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const sendMessage = asyncHandler(async (req, res) => {
    const { content, chatId } = req.body;

    if (!content || !chatId) {
        throw new ApiError(400, "Content and Chat ID are required.");
    }
    
    // Verify the chat exists and the user is a member
    const chat = await Chat.findOne({ _id: chatId, users: req.user._id });
    if (!chat) {
        throw new ApiError(404, "Chat not found or you're not a member.");
    }

    const newMessage = await Message.create({
        sender: req.user._id,
        content: content,
        chat: chatId,
    });

    // Update the 'latestMessage' field in the chat
    await Chat.findByIdAndUpdate(chatId, { latestMessage: newMessage._id });

    // Populate sender and chat details for a rich response
    const populatedMessage = await Message.findById(newMessage._id)
        .populate("sender", "name pic")
        .populate("chat");

    return res
        .status(201)
        .json(new ApiResponse(201, populatedMessage, "Message sent successfully."));
});


const fetchMessagesByChat = asyncHandler(async (req, res) => {
    const { chatId } = req.params;

    // Verify the chat exists and the user is a member
    const chat = await Chat.findOne({ _id: chatId, users: req.user._id });
    if (!chat) {
        throw new ApiError(404, "Chat not found or you're not a member.");
    }
    
    const messages = await Message.find({ chat: chatId })
        .populate("sender", "name pic email")
        .sort({ createdAt: 1 }); // Sort chronologically

    return res
        .status(200)
        .json(new ApiResponse(200, messages, "Messages fetched successfully."));
});


const updateMessage = asyncHandler(async (req, res) => {
    const { messageId } = req.params;
    const { content } = req.body;

    if (!content) {
        throw new ApiError(400, "Content is required to update the message.");
    }

    const message = await Message.findById(messageId);

    if (!message) {
        throw new ApiError(404, "Message not found.");
    }

    // Check if the person updating the message is the original sender
    if (message.sender.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You can only update your own messages.");
    }

    const updatedMessage = await Message.findByIdAndUpdate(
        messageId,
        { content },
        { new: true }
    ).populate("sender", "name pic");

    return res
        .status(200)
        .json(new ApiResponse(200, updatedMessage, "Message updated successfully."));
});

const deleteMessage = asyncHandler(async (req, res) => {
    const { messageId } = req.params;

    const message = await Message.findById(messageId).populate("chat"); // Populate chat details

    if (!message) {
        throw new ApiError(404, "Message not found.");
    }

    // Define permission checks
    const isSender = message.sender.toString() === req.user._id.toString();
    const isGroupAdmin = 
        message.chat.isGroupChat && 
        message.chat.groupAdmin.toString() === req.user._id.toString();

    // A user can delete a message if they are the sender OR if they are the group admin
    if (!isSender && !isGroupAdmin) {
        throw new ApiError(403, "You are not authorized to delete this message.");
    }

    await Message.findByIdAndDelete(messageId);

    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Message deleted successfully."));
});

export {
    sendMessage,
    fetchMessagesByChat,
    updateMessage,
    deleteMessage,
};