import React, { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext.jsx';
import { FiLogOut } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const Header = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.success("You've been logged out.");
    navigate('/login'); // Redirect to the login page after logout
  };

  // --- Style Objects ---
  const headerStyle = {
    padding: '12px 25px',
    backgroundColor: 'var(--surface-1)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '1px solid var(--surface-2)',
  };

  const userInfoStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  };

  const avatarStyle = {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    objectFit: 'cover',
  };

  const nameStyle = {
    fontWeight: '700',
    fontSize: '16px',
  };

  const logoutButtonStyle = {
    background: 'none',
    border: 'none',
    color: 'var(--text-secondary)',
    cursor: 'pointer',
    fontSize: '24px',
    display: 'flex',
    alignItems: 'center',
    transition: 'color 0.2s ease',
  };

  return (
    <header style={headerStyle}>
      <div style={userInfoStyle}>
        <img src={user?.pic} alt={user?.name} style={avatarStyle} />
        <span style={nameStyle}>{user?.name}</span>
      </div>
      <button 
        onClick={handleLogout} 
        style={logoutButtonStyle}
        onMouseEnter={(e) => e.currentTarget.style.color = 'var(--accent)'}
        onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
        aria-label="Logout"
      >
        <FiLogOut />
      </button>
    </header>
  );
};

export default Header;