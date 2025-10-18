import { useContext, useEffect, useState } from 'react'
import { SocketContext } from '../../context/SocketContext.jsx';
import { AuthContext } from '../../context/AuthContext.jsx';
import { FiMoreVertical } from 'react-icons/fi';

const ChatListItem = ({ chat, isSelected, onSelectChat, onDeleteChat }) => {

    const { joinRoom, unreadMessages, setUnreadMessages } = useContext(SocketContext);
    const { user } = useContext(AuthContext);
    const [menuOpen, setMenuOpen] = useState(false);
    const [count, setcount] = useState(0)

    useEffect(() => {
        setcount([...unreadMessages.filter(um => um.chat._id === chat._id)].length)
        console.log(unreadMessages);
    }, [unreadMessages])



    // For 1-on-1 chats, find the other user
    const getOtherUser = (users) => users?.find(u => u._id !== user._id);

    const otherUser = !chat.isGroupChat ? getOtherUser(chat.users) : null;
    const displayName = chat.isGroupChat ? chat.chatName : otherUser?.name;
    const displayPic = chat.isGroupChat ? `https://ui-avatars.com/api/?name=${chat.chatName.charAt(0)}&background=random` : otherUser?.pic;

    const itemStyle = {
        display: 'flex',
        alignItems: 'center',
        padding: '10px 15px',
        cursor: 'pointer',
        borderRadius: '8px',
        marginBottom: '5px',
        position: 'relative',
        transition: 'background-color 0.2s ease',
        backgroundColor: isSelected ? 'var(--accent)' : 'transparent',
    };

    const textStyle = {
        color: isSelected ? 'var(--background)' : 'var(--text-primary)',
    };
    const secondaryTextStyle = {
        color: isSelected ? 'rgba(0,0,0,0.7)' : 'var(--text-secondary)',
    };

    return (
        <div onClick={() => { onSelectChat(chat); joinRoom(chat._id); setUnreadMessages(prev => prev.filter(um => um.chat._id !== chat._id)) }} style={itemStyle}>
            <img src={displayPic} alt={displayName} style={{ width: '45px', height: '45px', borderRadius: '50%' }} />
            <div style={{ flexGrow: 1, marginLeft: '12px', overflow: 'hidden' }}>
                <p style={{ ...textStyle, margin: 0, fontWeight: '700', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{displayName}</p>
                <p style={{ ...secondaryTextStyle, margin: '4px 0 0 0', fontSize: unreadMessages && !isSelected ? "17px" : '14px', fontWeight: !isSelected && unreadMessages ? "700" : "400", whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {unreadMessages ? unreadMessages[count - 1]?.content : chat.latestMessage?.content}
                </p>
            </div>
            {<span style={{
                backgroundColor: count>0?'#bef264':"#42445A00",
                color: '#000',
                fontSize: '11px',
                fontWeight: '600',
                borderRadius: '999px',
                padding: '2px 6px',
                minWidth: '18px',
                textAlign: 'center',
                marginLeft: '8px',
            }}>{!isSelected && count > 0 ? count<=99?count:"99+" : null}</span>}
            <div style={{ position: 'relative' }}>
                <FiMoreVertical onClick={(e) => { e.stopPropagation(); setMenuOpen(!menuOpen); }} style={{ ...secondaryTextStyle, marginLeft: '10px' }} />
                {menuOpen && (
                    <div style={{ position: 'absolute', top: '25px', right: '10px', background: 'var(--surface-2)', borderRadius: '8px', zIndex: 20, overflow: 'hidden' }}>
                        <button onClick={(e) => {
                            e.stopPropagation();
                            onDeleteChat(chat, chat._id);
                            setMenuOpen(false);

                        }} style={{ padding: '8px 15px', background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer', width: '100%' }}>Delete</button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ChatListItem