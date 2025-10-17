import React, { useState, useContext } from 'react';
import Sidebar from '../components/layout/Sidebar.jsx';
import ChatArea from '../components/chat/ChatArea.jsx';
import Header from '../components/layout/Header.jsx';
import { SocketContext } from '../context/SocketContext.jsx';

const ChatDashboard = () => {
  // State to keep track of the currently active chat
  const [selectedChat, setSelectedChat] = useState(null);
  
  // // Get the notification clearing function from our SocketContext
  // const { clearChatNotifications } = useContext(SocketContext);
  const { joinRoom } = useContext(SocketContext);

  const handleSelectChat = (chat) => {
    setSelectedChat(chat);
    joinRoom(chat._id)
    
    // if (chat) {
    //   clearChatNotifications(chat._id);
    // }
  };

  // --- Style Objects ---
  const dashboardStyle = {
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    width: '100vw',
    backgroundColor: 'var(--background)',
    color: 'var(--text-primary)',
  };

  const mainContentStyle = {
    display: 'flex',
    flexGrow: 1,
    overflow: 'hidden', // Prevents the whole page from scrolling
  };

  return (
    <div style={dashboardStyle}>
      <Header />
      <div style={mainContentStyle}>
        <Sidebar 
          onSelectChat={handleSelectChat} 
          selectedChat={selectedChat} 
        />
        <ChatArea 
          selectedChat={selectedChat} 
        />
      </div>
    </div>
  );
};

export default ChatDashboard;