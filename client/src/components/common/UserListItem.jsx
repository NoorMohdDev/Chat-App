import React from 'react';

const UserListItem = ({ user, onSelect }) => {
  return (
    <div 
        onClick={() => onSelect(user)} 
        style={{ 
            display: 'flex', 
            alignItems: 'center', 
            width: '100%', 
            padding: '8px 12px', 
            cursor: 'pointer', 
            borderRadius: '8px',
            transition: 'background-color 0.2s ease'
        }}
        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--surface-2)'}
        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
    >
        <img src={user.pic} alt={user.name} style={{ width: '40px', height: '40px', borderRadius: '50%' }} />
        <div style={{ marginLeft: '12px' }}>
            <p style={{ margin: 0, fontWeight: '700' }}>{user.name}</p>
            <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-secondary)' }}>{user.email}</p>
        </div>
    </div>
  );
};

export {UserListItem};