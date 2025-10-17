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
      console.log("show_chats_client",data);
      
      setChats((prev) => [...prev, ...data]);
    });
    
    // delete chats
    socketRef.current.on("delete_chats_client", (data) => {
      setChats((prev) => prev.filter(c=> c._id!==data.chat._id));
    });

    // receive private message
    socketRef.current.on("receive_private_message", (data) => {
      setMessages((prev) => [...prev, data.message]);
    });

    // receive room message
    socketRef.current.on("receive_room_message", (data) => {
      setGroupMessages((prev) => [...prev, data.message]);
    });

    //delete message
    socketRef.current.on("deleteMessage_client", (data) => {
      setGroupMessages((prev) => prev.filter(m => m._id !== data.messageId));
    });

    //update message
    socketRef.current.on("updateMessage_client", (data) => {
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
  }, [user?._id]);

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
    socketRef.current.emit("room_message", { roomName, message });
  };

  const deleteMessage = (roomName, messageId) => {
    socketRef.current.emit("deleteMessage", { roomName, messageId });
  };

  const updateMessage = (roomName, message) => {
    socketRef.current.emit("updateMessage", { roomName, message });
  };

  return (
    <SocketContext.Provider
      value={{
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
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

