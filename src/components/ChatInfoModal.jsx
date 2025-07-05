import React from 'react';
import { X, Users, Calendar, UserPlus, Settings, LogOut } from 'react-feather';
import './ChatInfoModal.css';

const ChatInfoModal = ({ isOpen, onClose, chatType, chatData }) => {
    if (!isOpen) return null;

    const handleOverlayClick = (e) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    return (
        <div className="modal-overlay" onClick={handleOverlayClick}>
            <div className="modal-content">
                <div className="modal-header">
                    <h2>{chatType === 'group' ? 'Group Info' : 'Contact Info'}</h2>
                    <button className="close-button" onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>
                
                <div className="modal-body">
                    <div className="chat-avatar-large">
                        {chatData?.name?.charAt(0).toUpperCase()}
                    </div>
                    
                    <h3 className="chat-name">{chatData?.name}</h3>
                    
                    {chatType === 'group' && (
                        <div className="group-stats">
                            <div className="stat-item">
                                <Users size={16} />
                                <span>{chatData?.members_count || 0} members</span>
                            </div>
                            <div className="stat-item">
                                <Calendar size={16} />
                                <span>Created {new Date(chatData?.created_at).toLocaleDateString()}</span>
                            </div>
                        </div>
                    )}
                    
                    {chatType === 'dm' && (
                        <div className="contact-info">
                            <p className="contact-email">{chatData?.email}</p>
                            <p className="contact-status">
                                {chatData?.online ? 'Online' : 'Last seen recently'}
                            </p>
                        </div>
                    )}
                    
                    <div className="modal-actions">
                        {chatType === 'group' && (
                            <button className="action-button">
                                <UserPlus size={18} />
                                Add Member
                            </button>
                        )}
                        
                        <button className="action-button">
                            <Settings size={18} />
                            Settings
                        </button>
                        
                        <button className="action-button danger">
                            <LogOut size={18} />
                            {chatType === 'group' ? 'Leave Group' : 'Block Contact'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ChatInfoModal;
