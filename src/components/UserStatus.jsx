import React from 'react';
import './UserStatus.css';

const UserStatus = ({ isOnline, lastSeen }) => {
    if (isOnline) {
        return (
            <div className="user-status online">
                <div className="status-dot"></div>
                <span>Online</span>
            </div>
        );
    }
    
    return (
        <div className="user-status offline">
            <span>{lastSeen || 'Last seen recently'}</span>
        </div>
    );
};

export default UserStatus;
