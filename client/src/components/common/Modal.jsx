import React from 'react';
import { FiX } from 'react-icons/fi';

const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  // --- Style Objects ---
  const overlayStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    animation: 'fadeIn 0.3s ease-in-out',
  };

  const modalStyle = {
    background: 'var(--surface-1)',
    padding: '25px',
    borderRadius: '12px',
    width: '90%',
    maxWidth: '500px',
    position: 'relative',
    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)',
    border: '1px solid var(--surface-2)',
  };

  const headerStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
  };

  const closeButtonStyle = {
    background: 'none',
    border: 'none',
    color: 'var(--text-secondary)',
    fontSize: '24px',
    cursor: 'pointer',
    padding: 0,
    lineHeight: 0,
  };

  return (
    <div style={overlayStyle} onClick={onClose}>
      <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
        <div style={headerStyle}>
          <h3 style={{ margin: 0, fontSize: '22px' }}>{title}</h3>
          <button onClick={onClose} style={closeButtonStyle}>
            <FiX />
          </button>
        </div>
        {children}
      </div>
    
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default Modal;