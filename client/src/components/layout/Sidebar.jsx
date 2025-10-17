import React, { useState, useEffect, useContext } from 'react';
import api from '../../api/axios.js';
import toast from 'react-hot-toast';
import { FiSearch, FiPlus } from 'react-icons/fi';
import { useDebounce } from '../../hooks/useDebounce.js';
import Modal from '../common/Modal.jsx';
import NewGroupChat from '../chat/NewGroupChat.jsx';
import ChatListItem from '../chat/ChatListItem.jsx';
import { SocketContext } from '../../context/SocketContext.jsx';

const Sidebar = ({ onSelectChat, selectedChat }) => {
    const { socket, joinRoom, chats, setChats } = useContext(SocketContext);

    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const debouncedSearchQuery = useDebounce(searchQuery, 400);

    useEffect(() => {
        const fetchChats = async () => {
            setLoading(true);
            try {
                const { data } = await api.get('/chats');
                setChats(data.data);
            } catch (error) {
                toast.error("Could not fetch chats.");
            } finally {
                setLoading(false);
            }
        };
        fetchChats();
    }, []);

    useEffect(() => {
        if (!debouncedSearchQuery) return setSearchResults([]);

        const handleSearch = async () => {
            try {
                const { data } = await api.get(`/users/search?search=${debouncedSearchQuery}`);
                setSearchResults(data.data);
            } catch (error) {
                toast.error("Failed to search users.");
            }
        };
        handleSearch();
    }, [debouncedSearchQuery]);

    console.log(chats);
    
    const handleSelectUser = async (userId) => {
        try {
            const { data } = await api.post('/chats', { userId });
            if (!chats.find(c => c._id === data.data._id)) {
                setChats([data.data, ...chats]);
            }
            onSelectChat(data.data);
            console.log(data);
            joinRoom(data.data._id)
            setSearchQuery("");
        } catch (error) {
            toast.error("Could not start chat.");
        }
    };

    const handleDeleteChat = async (chatId) => {
        if (!window.confirm("Are you sure? This cannot be undone.")) return;
        try {
            await api.delete(`/chats/${chatId}`);
            setChats(prev => prev.filter(c => c._id !== chatId));
            if (selectedChat?._id === chatId) {
                onSelectChat(null);
            }
            toast.success("Chat deleted.");
        } catch (error) {
            toast.error("Failed to delete chat.");
        }
    };

    const handleGroupCreated = (newGroup) => {
        setChats(prev => [newGroup, ...prev]);
        onSelectChat(newGroup);
    };

    return (
        <>
            <aside style={{ width: '30%', maxWidth: '400px', minWidth: '320px', backgroundColor: 'var(--surface-1)', padding: '20px', display: 'flex', flexDirection: 'column', borderRight: '1px solid var(--surface-2)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h2 style={{ margin: 0, fontSize: '24px' }}>Chats</h2>
                    <button onClick={() => setIsModalOpen(true)} className="button-primary" style={{ padding: '8px 12px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <FiPlus />
                        New Group
                    </button>
                </div>
                <div style={{ position: 'relative', marginBottom: '10px' }}>
                    <FiSearch style={{ position: 'absolute', top: '14px', left: '14px', color: 'var(--text-secondary)' }} />
                    <input
                        type="text"
                        placeholder="Search or start new chat"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        style={{ width: '100%', boxSizing: 'border-box', padding: '12px 12px 12px 45px', borderRadius: '8px', border: 'none', backgroundColor: 'var(--surface-2)', color: 'var(--text-primary)', fontSize: '16px' }}
                    />
                </div>

                <div style={{ flexGrow: 1, overflowY: 'auto' }}>
                    {searchQuery ? (
                        searchResults.map(user => (
                            <div key={user._id} onClick={() => handleSelectUser(user._id)} style={{ display: 'flex', alignItems: 'center', padding: '10px', cursor: 'pointer', borderRadius: '8px' }}>
                                <img src={user.pic} alt={user.name} style={{ width: '40px', height: '40px', borderRadius: '50%' }} />
                                <p style={{ marginLeft: '10px' }}>{user.name}</p>
                            </div>
                        ))
                    ) : (
                        loading ? <p>Loading chats...</p> : chats.map(chat => (
                            <ChatListItem
                                key={chat._id}
                                chat={chat}
                                isSelected={selectedChat?._id === chat._id}
                                onSelectChat={onSelectChat}
                                onDeleteChat={handleDeleteChat}
                            />
                        ))
                    )}
                </div>
            </aside>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create a New Group">
                <NewGroupChat onClose={() => setIsModalOpen(false)} onGroupCreated={handleGroupCreated} />
            </Modal>
        </>
    );
};

export default Sidebar;