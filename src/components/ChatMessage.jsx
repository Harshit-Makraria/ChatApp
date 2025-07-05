import React, { useState } from 'react';
import { Trash2, Check } from 'react-feather';
import './ChatMessage.css';

const ChatMessage = ({ message, currentUser, onDelete, activeChatType, isGrouped = false, showAvatar = true }) => {
    const [showReactions, setShowReactions] = useState(false);
    
    const isOwner = 
        (activeChatType === 'dm' && message.sender_id === currentUser.$id) || 
        (activeChatType !== 'dm' && message.user_id === currentUser.$id);
    
    const messageTime = new Date(message.$createdAt).toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit' 
    });

    // Determine if we should show read status (only for DMs)
    const showReadStatus = activeChatType === 'dm' && isOwner;
    
    // For demo purposes - in a real app, these would be stored and updated in the database
    const reactions = message.reactions || [];

    // Get sender name based on chat type
    const getSenderName = () => {
        if (activeChatType === 'dm') {
            return message.sender_name || 'Unknown';
        }
        return message.username || 'Unknown';
    };

    // Get avatar letter
    const getAvatarLetter = () => {
        const name = getSenderName();
        return name.charAt(0).toUpperCase();
    };

    // Generate a consistent color for each user
    const getAvatarColor = () => {
        const name = getSenderName();
        const colors = [
            'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
            'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
            'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
            'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
            'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
            'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
            'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)'
        ];
        
        let hash = 0;
        for (let i = 0; i < name.length; i++) {
            hash = name.charCodeAt(i) + ((hash << 5) - hash);
        }
        return colors[Math.abs(hash) % colors.length];
    };

    return (
        <div className={`chat-message ${isOwner ? 'owner' : ''} ${isGrouped ? 'grouped' : ''}`}>
            {!isOwner && activeChatType !== 'dm' && showAvatar && (
                <div 
                    className="message-avatar"
                    style={{ background: getAvatarColor() }}
                >
                    {getAvatarLetter()}
                </div>
            )}
            
            <div className="message-content">
                {!isOwner && activeChatType !== 'dm' && !isGrouped && (
                    <div className="message-sender">
                        {getSenderName()}
                    </div>
                )}
                
                <div className="message-bubble">
                    <div className="message-text">{message.body}</div>
                    
                    {reactions.length > 0 && (
                        <div className="message-reactions">
                            {reactions.map((reaction, index) => (
                                <div key={index} className="reaction">
                                    <span className="reaction-emoji">{reaction.emoji}</span>
                                    <span className="reaction-count">{reaction.count}</span>
                                </div>
                            ))}
                        </div>
                    )}
                    
                    <div className="message-meta">
                        <span className="message-time">{messageTime}</span>
                        
                        {showReadStatus && (
                            <span className="message-status">
                                {message.is_read ? 
                                    <span style={{ display: 'flex', alignItems: 'center' }}>
                                        <Check size={10} style={{ marginRight: '-2px' }} />
                                        <Check size={10} />
                                    </span> : 
                                    <Check size={10} />
                                }
                            </span>
                        )}
                        
                        {isOwner && (
                            <Trash2
                                className="delete-message"
                                size={12}
                                onClick={() => onDelete(message.$id)}
                            />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ChatMessage;
