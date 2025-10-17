import React from 'react';
import { FiX } from 'react-icons/fi';

const UserBadgeItem = ({ user, onRemove }) => {
  return (
    <div style={{ 
        display: 'inline-flex', 
        alignItems: 'center', 
        background: 'var(--accent)', 
        color: 'var(--background)', 
        padding: '4px 10px', 
        borderRadius: '16px', 
        margin: '2px',
        fontSize: '14px',
        fontWeight: '500'
    }}>
        <span>{user.name}</span>
        <button 
            onClick={() => onRemove(user)} 
            style={{ background: 'none', border: 'none', color: 'var(--background)', marginLeft: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
            aria-label={`Remove ${user.name}`}
        >
            <FiX />
        </button>
    </div>
  );
};

export default UserBadgeItem;