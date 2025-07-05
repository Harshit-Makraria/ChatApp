import React, { useState } from 'react';
import { ArrowLeft, MoreVertical, Search, Phone, Video, Info, UserPlus, Settings, LogOut, Menu } from 'react-feather';
import './ChatHeader.css';

const ChatHeader = ({ activeChat, activeChatType, currentGroupOrUser, onBackClick, onMenuToggle }) => {
    const [showDropdown, setShowDropdown] = useState(false);

    const renderTitle = () => {
        if (activeChatType === 'global') {
            return 'Global Chat';
        } else if (activeChatType === 'group' && currentGroupOrUser) {
            return currentGroupOrUser.name;
        } else if (activeChatType === 'dm' && currentGroupOrUser) {
            return currentGroupOrUser.name;
        }
        return 'Chat';
    };

    const renderSubtitle = () => {
        if (activeChatType === 'global') {
            return 'Everyone\'s welcome here!';
        } else if (activeChatType === 'group' && currentGroupOrUser) {
            return `${currentGroupOrUser.members_count || 0} members`;
        } else if (activeChatType === 'dm' && currentGroupOrUser) {
            const isOnline = currentGroupOrUser.online || Math.random() > 0.5; // Mock online status
            return (
                <span style={{ display: 'flex', alignItems: 'center' }}>
                    <span className={`status-indicator ${isOnline ? 'status-online' : 'status-offline'}`}></span>
                    {isOnline ? 'Online' : 'Last seen recently'}
                </span>
            );
        }
        return '';
    };

    const handleDropdownAction = (action) => {
        setShowDropdown(false);
        switch(action) {
            case 'info':
                console.log('Show chat info');
                break;
            case 'add-member':
                console.log('Add member to group');
                break;
            case 'settings':
                console.log('Chat settings');
                break;
            case 'leave':
                console.log('Leave chat/group');
                break;
            default:
                break;
        }
    };

    return (
        <div className="chat-header">
            {/* Mobile menu toggle */}
            <button className="menu-toggle mobile-only" onClick={onMenuToggle}>
                <Menu size={20} />
            </button>

            {/* Back button for mobile */}
            {onBackClick && (
                <button className="back-button mobile-only" onClick={onBackClick}>
                    <ArrowLeft size={20} />
                </button>
            )}

            {/* Chat avatar */}
            <div className="chat-header-avatar">
                {activeChatType === 'global' ? (
                    <div className="avatar global-avatar">
                        <span>🌐</span>
                    </div>
                ) : currentGroupOrUser ? (
                    <div className="avatar">
                        {currentGroupOrUser.name?.charAt(0).toUpperCase() || '?'}
                    </div>
                ) : (
                    <div className="avatar">
                        ?
                    </div>
                )}
            </div>

            {/* Chat info */}
            <div className="chat-header-info">
                <h3>{renderTitle()}</h3>
                <div className="chat-subtitle">
                    {renderSubtitle()}
                </div>
            </div>

            {/* Actions */}
            <div className="chat-header-actions">
                <button className="action-button desktop-only">
                    <Search size={18} />
                </button>
                
                {activeChatType === 'dm' && (
                    <>
                        <button className="action-button desktop-only">
                            <Phone size={18} />
                        </button>
                        <button className="action-button desktop-only">
                            <Video size={18} />
                        </button>
                    </>
                )}

                <div className="dropdown-container">
                    <button 
                        className="action-button"
                        onClick={() => setShowDropdown(!showDropdown)}
                    >
                        <MoreVertical size={18} />
                    </button>

                    {showDropdown && (
                        <div className="dropdown-menu">
                            <button onClick={() => handleDropdownAction('info')}>
                                <Info size={16} />
                                <span>Chat Info</span>
                            </button>

                            {activeChatType === 'group' && (
                                <button onClick={() => handleDropdownAction('add-member')}>
                                    <UserPlus size={16} />
                                    <span>Add Member</span>
                                </button>
                            )}

                            <button onClick={() => handleDropdownAction('settings')}>
                                <Settings size={16} />
                                <span>Settings</span>
                            </button>

                            {activeChatType !== 'global' && (
                                <button 
                                    onClick={() => handleDropdownAction('leave')} 
                                    className="danger"
                                >
                                    <LogOut size={16} />
                                    <span>Leave Chat</span>
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ChatHeader;
