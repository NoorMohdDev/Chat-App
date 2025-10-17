import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import api from '../../api/axios.js';
import { useDebounce } from '../../hooks/useDebounce.js';
import UserBadge from '../common/UserBadgeItem.jsx'
import { UserListItem } from '../common/UserListItem.jsx'

const NewGroupChat = ({ onClose, onGroupCreated }) => {
    const [groupName, setGroupName] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [loading, setLoading] = useState(false);

    const debouncedSearchQuery = useDebounce(searchQuery, 400);

    useEffect(() => {
        if (!debouncedSearchQuery) {
            setSearchResults([]);
            return;
        }

        const handleSearch = async () => {
            try {
                const { data } = await api.get(`/users/search?search=${debouncedSearchQuery}`);
                // Filter out users who are already selected
                const filteredResults = data.data.filter(user => !selectedUsers.some(su => su._id === user._id));
                setSearchResults(filteredResults);
            } catch (error) {
                toast.error("Failed to search users.");
            }
        };

        handleSearch();
    }, [debouncedSearchQuery, selectedUsers]);

    const handleSelectUser = (user) => {
        if (selectedUsers.find(u => u._id === user._id)) return;
        setSelectedUsers([...selectedUsers, user]);
        setSearchQuery(""); // Clear search input after selection
    };

    const handleRemoveUser = (userToRemove) => {
        setSelectedUsers(selectedUsers.filter(u => u._id !== userToRemove._id));
    };

    const handleSubmit = async () => {
        if (!groupName || selectedUsers.length < 2) {
            return toast.error("Please provide a group name and select at least 2 users.");
        }
        setLoading(true);
        try {
            const userIds = selectedUsers.map(u => u._id);
            const { data } = await api.post('/chats/group', { name: groupName, users: userIds });
            toast.success(`Group "${groupName}" created!`);
            onGroupCreated(data.data); // Pass the newly created group back to the sidebar
            onClose(); // Close the modal
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to create group.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <input
                    type="text"
                    placeholder="Group Name"
                    value={groupName}
                    onChange={e => setGroupName(e.target.value)}
                    style={{ width: '100%', boxSizing: 'border-box', padding: '12px', borderRadius: '8px', border: '1px solid var(--surface-2)', backgroundColor: 'var(--background)', color: 'var(--text-primary)', fontSize: '16px' }}
                />
                <input
                    type="text"
                    placeholder="Search users to add"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    style={{ width: '100%', boxSizing: 'border-box', padding: '12px', borderRadius: '8px', border: '1px solid var(--surface-2)', backgroundColor: 'var(--background)', color: 'var(--text-primary)', fontSize: '16px' }}
                />
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', margin: '15px 0', minHeight: '30px' }}>
                {selectedUsers.map(user => <UserBadge key={user._id} user={user} onRemove={handleRemoveUser} />)}
            </div>

            <div style={{ height: '150px', overflowY: 'auto' }}>
                {searchResults?.slice(0, 4).map(user => (
                    <UserListItem key={user._id} user={user} onSelect={handleSelectUser} />
                ))}
            </div>

            <button onClick={handleSubmit} className="button-primary" style={{ width: '100%', marginTop: '20px', padding: '12px' }} disabled={loading}>
                {loading ? 'Creating...' : 'Create Group'}
            </button>
        </div>
    );
};

export default NewGroupChat;