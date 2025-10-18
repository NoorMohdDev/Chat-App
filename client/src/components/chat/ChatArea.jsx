import React, { useState, useEffect, useContext, useRef } from 'react';
import api from '../../api/axios.js';
import toast from 'react-hot-toast';
import { IoSend } from 'react-icons/io5';
import { AuthContext } from '../../context/AuthContext.jsx';
import Message from './Message.jsx';
import { useSocket } from '../../context/SocketContext.jsx';

const ChatArea = ({ selectedChat }) => {
    const { socket, groupMessages, setGroupMessages, messages, setMessages, sendPrivateMessage, joinRoom, sendRoomMessage, deleteMessage, updateMessage, showChat } = useSocket();

    const [newMessage, setNewMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const { user } = useContext(AuthContext);

    const messagesEndRef = useRef(null); // Ref for auto-scrolling

    // Function to scroll to the bottom of the message list
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    // Effect for fetching messages when a chat is selected
    useEffect(() => {
        if (!selectedChat) return;

        const fetchMessages = async () => {
            setLoading(true);
            try {
                const { data } = await api.get(`/messages/${selectedChat._id}`);
                selectedChat.isGroupChat? setGroupMessages(data.data) : setMessages(data.data);
                joinRoom(selectedChat._id); // Join socket room for this chat
            } catch (error) {
                toast.error("Could not fetch messages.");
            } finally {
                setLoading(false);
            }
        };
        fetchMessages();
    }, [selectedChat
        , socket
    ]);


    // Effect for auto-scrolling
    useEffect(() => {
        scrollToBottom();
    }, [messages, groupMessages]);

    // --- Action Handlers ---
    const handleSendMessage = async (e) => {

        e.preventDefault();
        if (!newMessage.trim()) return;

        try {
            const { data } = await api.post('/messages', {
                content: newMessage,
                chatId: selectedChat._id,
            });

            if (selectedChat.isGroupChat) {
                setGroupMessages([...groupMessages, data.data]);
                
                sendRoomMessage(data.data.chat.users.filter(u => u !== user._id), data.data)

            } else {
                setMessages([...messages, data.data]);
                sendPrivateMessage(...data.data.chat.users.filter(u => u !== data.data.sender._id), data.data)

                messages.length < 1 ? showChat(...selectedChat.users.filter(u => u._id !== user._id).map(({ _id }) => ({ _id })), selectedChat) : null
            }

            // Optimistically update UI
            setNewMessage("");
        } catch (error) {
            console.log(error);
            
            toast.error("Couldn't send message.");
        }
    };

    const handleUpdateMessage = async (messageId, newContent) => {
        try {
            const { data } = await api.patch(`/messages/${messageId}`, { content: newContent });
            !selectedChat.isGroupChat ?
                setMessages(prev => prev.map(msg => msg._id === messageId ? data.data : msg)) :
                setGroupMessages(prev => prev.map(msg => msg._id === messageId ? data.data : msg));
            updateMessage(selectedChat._id, data.data)
            toast.success("Message updated.");
        } catch (error) {
            toast.error("Failed to update message.");
        }
    };

    const handleDeleteMessage = async (messageId) => {
        try {
            await api.delete(`/messages/${messageId}`);
            !selectedChat.isGroupChat?
                setMessages(prev => prev.filter(m => m._id !== messageId)) :
                setGroupMessages(prev => prev.filter(m => m._id !== messageId));
            deleteMessage(selectedChat._id, messageId)
            toast.success("Message deleted.");
        } catch (error) {
            toast.error("Failed to delete message.");
        }
    };

    // --- Render Logic ---
    if (!selectedChat) {
        return (
            <div style={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
                <p style={{ fontSize: '20px' }}>Select a chat to start messaging</p>
            </div>
        );
    }

    const otherUser = selectedChat.users?.find(u => u._id !== user._id);
    const displayName = selectedChat.isGroupChat ? selectedChat.chatName : otherUser?.name;

    return (
        <main style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', backgroundColor: 'var(--background)' }}>
            <header style={{ padding: '15px 25px', backgroundColor: 'var(--surface-1)', borderBottom: '1px solid var(--surface-2)', display: 'flex', alignItems: 'center' }}>
                <h3 style={{ margin: 0 }}>{displayName}</h3>
                {/* A three-dots menu for chat details/actions could go here */}
            </header>

            <div style={{ flexGrow: 1, padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
                {loading ? (
                    <p>Loading messages...</p>
                ) : (!selectedChat?<div style={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
                    <p style={{ fontSize: '20px' }}>Select a chat to start messaging</p>
                </div>:
                    (selectedChat.isGroupChat?
                        groupMessages.map(msg => (
                            <Message
                                key={msg._id}
                                message={msg}
                                onUpdateMessage={handleUpdateMessage}
                                onDeleteMessage={handleDeleteMessage}
                            />
                        ))
                        : messages.map(msg => (
                            <Message
                                key={msg._id}
                                message={msg}
                                onUpdateMessage={handleUpdateMessage}
                                onDeleteMessage={handleDeleteMessage}
                            />
                        ))
                    ))}
                <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSendMessage} style={{ padding: '20px', backgroundColor: 'var(--surface-1)', borderTop: '1px solid var(--surface-2)' }}>
                <div style={{ display: 'flex', alignItems: 'center', backgroundColor: 'var(--surface-2)', borderRadius: '12px' }}>
                    <input
                        type="text"
                        placeholder="Type a message..."
                        value={newMessage}
                        onChange={(e) => { setNewMessage(e.target.value) }}
                        style={{ flexGrow: 1, background: 'none', border: 'none', padding: '15px', color: 'var(--text-primary)', fontSize: '16px' }}
                    />
                    <button type="submit" className="button-primary" style={{ margin: '5px', padding: '12px', borderRadius: '8px', display: 'flex', alignItems: 'center' }}>
                        <IoSend />
                    </button>
                </div>
            </form>
        </main>
    );
};

export default ChatArea;