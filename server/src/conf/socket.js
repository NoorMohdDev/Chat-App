import { Server } from "socket.io";

export const initializeSocketIO = (server) => {
  const io = new Server(server, {
    pingTimeout: 60000,
    cors: {
      origin: "http://localhost:5173",
      credentials: true,
    },
  });

  const users = {}; // store socket.id for each userId

  io.on("connection", (socket) => {
    console.log(`✅ User connected: ${socket.id}`);

    // Register userId when user logs in
    socket.on("register", (userId) => {
      users[userId] = socket.id;
      console.log(`User ${userId} registered with socket ${socket.id}`);
    });

    // 🔹 Private message
    socket.on("private_message", ({ toUserId, message }) => {
      const targetSocketId = users[toUserId];

      if (targetSocketId) {
        io.to(targetSocketId).emit("receive_private_message", {
          from: socket.id,
          message,
        });
      }
    });

    // 🔹 Group chat
    socket.on("join_room", (roomName) => {
      socket.join(roomName);
      console.log(`${socket.id} joined room ${roomName}`);
    });

    socket.on("room_message", ({ roomName, message }) => {
      roomName.map(r=>{
        io.to(users[r._id]).emit("receive_room_message", {
          from: socket.id,
          message,
        });
      })
    });

    // Delete chat (room)
    socket.on("delete_chat", ({ roomId, chatId }) => {
      // Notify everyone in the room
      io.to(users[roomId]).emit("room_deleted", { chatId });
    });

    // delete groupChat
    socket.on("delete_chat_group", ({ roomId, chatId }) => {
      // Notify everyone in the room
      roomId.map((r) => {
        io.to(users[r._id]).emit("room_deleted", { chatId });
      });
    });

    // show chat (room)
    socket.on("show_chat", ({ roomId, chat }) => {
      // Notify everyone in the room
      io.to(users[roomId._id]).emit("show_chats_client", { chat });
    });

    // show groupChat
    socket.on("show_chat_group", ({ roomId, chat }) => {
      // Notify everyone in the room
      roomId.map((r) => {
        io.to(users[r._id]).emit("show_chats_client", { chat });
      });
    });

    socket.on("deleteMessage", ({ roomName, messageId }) => {
      io.to(roomName).emit("deleteMessage_client", {
        from: socket.id,
        messageId,
      });
    });

    //updateMessage
    socket.on("updateMessage", ({ roomName, message }) => {
      io.to(roomName).emit("updateMessage_client", {
        from: socket.id,
        message,
      });
    });

    // --- Disconnect ---
    socket.on("disconnect", (reason) => {
      console.log(`❌ ${socket.id} disconnected: ${reason}`);
    });
  });

  return io;
};
