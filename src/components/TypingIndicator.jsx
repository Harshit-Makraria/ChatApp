import React from 'react';
import './TypingIndicator.css';

const TypingIndicator = ({ usernames = [] }) => {
    if (usernames.length === 0) return null;

    const renderTypingText = () => {
        if (usernames.length === 1) {
            return `${usernames[0]} is typing...`;
        } else if (usernames.length === 2) {
            return `${usernames[0]} and ${usernames[1]} are typing...`;
        } else {
            return `${usernames[0]} and ${usernames.length - 1} others are typing...`;
        }
    };

    return (
        <div className="typing-indicator">
            <div className="typing-avatar">
                {usernames[0].charAt(0).toUpperCase()}
            </div>
            <div className="typing-content">
                <div className="typing-text">{renderTypingText()}</div>
                <div className="typing-dots">
                    <div className="typing-dot"></div>
                    <div className="typing-dot"></div>
                    <div className="typing-dot"></div>
                </div>
            </div>
        </div>
    );
};

export default TypingIndicator;
