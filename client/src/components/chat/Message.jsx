import React, { useContext, useState } from 'react';
import { AuthContext } from '../../context/AuthContext.jsx';
import { BsThreeDotsVertical } from 'react-icons/bs';

const Message = ({ message, onUpdateMessage, onDeleteMessage }) => {
    const { user } = useContext(AuthContext);
    const [menuOpen, setMenuOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editedContent, setEditedContent] = useState(message.content);

    const isOwnMessage = message.sender._id === user._id;

    // --- Style Objects for Readability ---
    const messageContainerStyles = {
        display: 'flex',
        alignItems: 'flex-start',
        gap: '10px',
        marginBottom: '15px',
        maxWidth: '70%',
        alignSelf: isOwnMessage ? 'flex-end' : 'flex-start',
        flexDirection: isOwnMessage ? 'row-reverse' : 'row',
    };

    const bubbleStyles = {
        padding: '10px 15px',
        borderRadius: '18px',
        position: 'relative',
        backgroundColor: isOwnMessage ? 'var(--accent)' : 'var(--surface-2)',
        color: isOwnMessage ? 'var(--background)' : 'var(--text-primary)',
        borderTopLeftRadius: isOwnMessage ? '18px' : '4px',
        borderTopRightRadius: isOwnMessage ? '4px' : '18px',
    };
    
    // --- Action Handlers ---
    const handleDelete = () => {
        onDeleteMessage(message._id);
        setMenuOpen(false);
    };

    const handleEnableEdit = () => {
        setIsEditing(true);
        setMenuOpen(false);
    };
    
    const handleSaveEdit = () => {
        if (editedContent.trim() && editedContent.trim() !== message.content) {
            onUpdateMessage(message._id, editedContent.trim());
        }
        setIsEditing(false);
    };
    
    return (
        <div style={messageContainerStyles}>
            <img 
                src={message.sender.pic} 
                alt={message.sender.name} 
                style={{ width: '35px', height: '35px', borderRadius: '50%', marginTop: '5px' }} 
            />
            <div style={bubbleStyles}>
                {!isOwnMessage && (
                    <p style={{ margin: '0 0 5px 0', fontWeight: '700', fontSize: '14px', color: 'var(--accent)' }}>
                        {message.sender.name}
                    </p>
                )}

                {isEditing ? (
                    <div>
                        <textarea
                            value={editedContent}
                            onChange={(e) => setEditedContent(e.target.value)}
                            style={{ width: '100%', background: 'rgba(0,0,0,0.2)', color: 'white', border: '1px solid var(--accent)', borderRadius: '4px', minHeight: '50px' }}
                        />
                        <div style={{ display: 'flex', gap: '5px', marginTop: '5px' }}>
                            <button onClick={handleSaveEdit} className="button-primary" style={{ fontSize: '12px', padding: '4px 8px' }}>Save</button>
                            <button onClick={() => setIsEditing(false)} style={{ fontSize: '12px', padding: '4px 8px' }}>Cancel</button>
                        </div>
                    </div>
                ) : (
                    <p style={{ margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                        {message.content}
                    </p>
                )}
            </div>
            
            {isOwnMessage && !isEditing && (
                <div style={{ position: 'relative' }}>
                    <BsThreeDotsVertical 
                        onClick={() => setMenuOpen(!menuOpen)} 
                        style={{ cursor: 'pointer', color: 'var(--text-secondary)' }} 
                    />
                    {menuOpen && (
                        <div style={{ position: 'absolute', top: '25px', right: '10px', background: 'var(--surface-2)', borderRadius: '8px', zIndex: 20, overflow: 'hidden', boxShadow: '0 4px 12px rgba(0,0,0,0.3)' }}>
                            <button onClick={handleEnableEdit} style={{ padding: '8px 15px', background: 'none', border: 'none', color: 'var(--text-primary)', cursor: 'pointer', width: '100%', display: 'block' }}>Edit</button>
                            <button onClick={handleDelete} style={{ padding: '8px 15px', background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer', width: '100%', display: 'block' }}>Delete</button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default Message;