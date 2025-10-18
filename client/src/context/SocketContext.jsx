// src/context/SocketContext.jsx
import React, { createContext, useRef, useEffect, useState, useContext } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext.jsx';

export const SocketContext = createContext();
export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {

  const socketRef = useRef(null);
  const { user } = useAuth();

  const [messages, setMessages] = useState([]);
  const [groupMessages, setGroupMessages] = useState([]);
  const [chats, setChats] = useState([]);
  const [unreadMessages, setUnreadMessages] = useState([]);

  // --- Connect / Disconnect based on user login ---
  useEffect(() => {
    if (!user) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      return;
    }

    // initialize socket
    const socket = io('http://localhost:8000', {
      // auth: { token: user?.token },
      reconnectionAttempts: 5,
      transports: ['websocket', 'polling'],
    });
    socketRef.current = socket;

    // register userId
    socketRef.current.emit("register", user._id);

    // show chats
    socketRef.current.on("show_chats_client", (data) => {
      console.log("client", data.chat);

      setChats((prev) => [...prev, data.chat]);
    });

    // Handle room private/group deleted event
    socketRef.current.on("room_deleted", ({ chatId }) => {
      setChats((prev) => prev.filter((r) => r._id !== chatId));
      setGroupMessages(prev => prev.filter(m => m.chat._id !== chatId))
      setMessages(prev => prev.filter(m => m.chat._id !== chatId))
    });

    // receive private message
    socketRef.current.on("receive_private_message", (data) => {
      setMessages((prev) => [...prev, data.message]);
      setUnreadMessages((prev) => [...prev, data.message]);      
    });

    // receive group message
    socketRef.current.on("receive_room_message", (data) => {
      
      setGroupMessages((prev) => [...prev, data.message]);
      setUnreadMessages((prev) => [...prev, data.message]);
    });

  
    //delete message
    socketRef.current.on("deleteMessage_client", (data) => {
      setMessages((prev) => prev.filter(m => m._id !== data.messageId));
      setGroupMessages((prev) => prev.filter(m => m._id !== data.messageId));
    });

    //update message
    socketRef.current.on("updateMessage_client", (data) => {
      setMessages((prev) => prev.map(m => m._id === data.message._id ? data.message : m));
      setGroupMessages((prev) => prev.map(m => m._id === data.message._id ? data.message : m));
    });

    socket.on('connected', () => {
      console.log('✅ Server acknowledged setup');
    });

    socket.on('connect_error', (err) => {
      console.error('🔴 Socket connection error:', err.message);
    });

    socket.on('disconnect', (reason) => {
      console.log('🔌 Socket disconnected:', reason);
    });

    // cleanup on unmount or user logout
    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, []);

  // emit functions
  const sendPrivateMessage = (toUserId, message) => {
    socketRef.current.emit("private_message", { toUserId, message });
  };

  const sendBroadcast = (message) => {
    socketRef.current.emit("broadcast_message", message);
  };

  const joinRoom = (roomName) => {
    socketRef.current.emit("join_room", roomName);
  };

  const sendRoomMessage = (roomName, message) => {
    console.log("client",roomName);
    
    socketRef.current.emit("room_message", { roomName, message });
  };

  const deleteMessage = (roomName, messageId) => {
    socketRef.current.emit("deleteMessage", { roomName, messageId });
  };

  const updateMessage = (roomName, message) => {
    socketRef.current.emit("updateMessage", { roomName, message });
  };

  // Delete chat room
  const deleteChat = (roomId, chatId) => {
    socketRef.current.emit("delete_chat", { roomId, chatId });
  };

  // Delete group chat room
  const deleteGroupChat = (roomId, chatId) => {
    console.log("roomId", roomId);
    socketRef.current.emit("delete_chat_group", { roomId, chatId });
  };
  // show chat room
  const showChat = (roomId, chat) => {

    socketRef.current.emit("show_chat", { roomId, chat });
  };

  // show group chat room
  const showGroupChat = (roomId, chat) => {
    console.log("Group chat", chat);
    socketRef.current.emit("show_chat_group", { roomId, chat });
  };

  // unread chat
  const unreadChat = (roomId, chat) => {
    console.log("unreadChat",roomId);

    socketRef.current.emit("unread_Chat", { roomId, chat });
  };

  // unread group chat
  const unreadGroupChat = (roomId, chat) => {
    console.log("Group chat", chat);
    socketRef.current.emit("unread_Group_Chat", { roomId, chat });
  };

  return (
    <SocketContext.Provider
      value={{
        unreadMessages,
        setUnreadMessages,
        unreadChat,
        unreadGroupChat,
        showChat,
        showGroupChat,
        deleteChat,
        messages,
        setMessages,
        groupMessages,
        setGroupMessages,
        sendPrivateMessage,
        sendBroadcast,
        joinRoom,
        sendRoomMessage,
        deleteMessage,
        updateMessage,
        chats,
        setChats,
        deleteGroupChat,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

