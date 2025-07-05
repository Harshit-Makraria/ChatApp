import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../utils/AuthContext';
import { getUserGroups, getUserContacts } from '../appwriteConfig';
import { Users, MessageCircle, Plus, Search, Settings, UserPlus } from 'react-feather';
import AddContactModal from './AddContactModal';
import './Sidebar.css';

const Sidebar = ({ activeChat, setActiveChat, setActiveChatType, onCreateGroup }) => {
    const { user } = useAuth();
    const [groups, setGroups] = useState([]);
    const [contacts, setContacts] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [showCreateGroup, setShowCreateGroup] = useState(false);
    const [newGroupName, setNewGroupName] = useState('');
    const [createGroupError, setCreateGroupError] = useState('');
    const [createGroupLoading, setCreateGroupLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('chats'); // 'chats', 'groups', 'contacts'
    const [showAddContact, setShowAddContact] = useState(false);
    const [contactsError, setContactsError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        if (user) {
            fetchUserGroups();
            fetchUserContacts();
        }
    }, [user]);

    const fetchUserGroups = async () => {
        try {
            const groups = await getUserGroups(user.$id);
            setGroups(groups);
        } catch (error) {
            console.error('Error fetching groups:', error);
            setGroups([]);
        }
    };

    const fetchUserContacts = async () => {
        try {
            setContactsError('');
            const userContacts = await getUserContacts(user.$id);
            setContacts(userContacts);
        } catch (error) {
            console.error('Error fetching contacts:', error);
            setContactsError(`Failed to load contacts: ${error.message}`);
            setContacts([]);
        }
    };

    const handleCreateGroup = async () => {
        if (newGroupName.trim() === '') return;
        
        setCreateGroupLoading(true);
        setCreateGroupError('');
        
        try {
            const groupId = await onCreateGroup(newGroupName);
            if (groupId) {
                setNewGroupName('');
                setShowCreateGroup(false);
                fetchUserGroups();
                // Optionally switch to the new group
                // setActiveChat(groupId);
                // setActiveChatType('group');
            }
        } catch (error) {
            console.error('Error creating group:', error);
            setCreateGroupError(error.message || 'Failed to create group. Please try again.');
        } finally {
            setCreateGroupLoading(false);
        }
    };

    const handleContactAdded = (newContact) => {
        setContacts(prev => [...prev, newContact]);
        setShowAddContact(false);
    };

    const filteredGroups = groups.filter(group => 
        group.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const filteredContacts = contacts.filter(contact => 
        contact.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleChatSelect = (id, type) => {
        setActiveChat(id);
        setActiveChatType(type);
    };

    return (
        <div className="sidebar">
            <div className="sidebar-header">
                <h2>TeleChat</h2>
                <div className="sidebar-actions">
                    <Settings className="sidebar-icon" />
                </div>
            </div>

            <div className="search-container">
                <Search className="search-icon" />
                <input 
                    type="text" 
                    placeholder="Search..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="search-input"
                />
            </div>

            <div className="sidebar-tabs">
                <button 
                    className={`tab-button ${activeTab === 'chats' ? 'active' : ''}`}
                    onClick={() => setActiveTab('chats')}
                >
                    <MessageCircle size={18} />
                    <span>Chats</span>
                </button>
                <button 
                    className={`tab-button ${activeTab === 'groups' ? 'active' : ''}`}
                    onClick={() => setActiveTab('groups')}
                >
                    <Users size={18} />
                    <span>Groups</span>
                </button>
                <button 
                    className={`tab-button ${activeTab === 'contacts' ? 'active' : ''}`}
                    onClick={() => setActiveTab('contacts')}
                >
                    <Users size={18} />
                    <span>Contacts</span>
                </button>
            </div>

            {activeTab === 'groups' && (
                <div className="create-group">
                    <button 
                        className="create-group-button"
                        onClick={() => setShowCreateGroup(!showCreateGroup)}
                    >
                        <Plus size={18} />
                        <span>Create New Group</span>
                    </button>
                    
                    {showCreateGroup && (
                        <div className="create-group-form">
                            <input 
                                type="text" 
                                placeholder="Enter group name..." 
                                value={newGroupName}
                                onChange={(e) => setNewGroupName(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && !createGroupLoading && handleCreateGroup()}
                                autoFocus
                                maxLength={50}
                                disabled={createGroupLoading}
                            />
                            {createGroupError && (
                                <div className="error-message" style={{
                                    color: '#e74c3c',
                                    fontSize: '0.85rem',
                                    margin: '0.5rem 0',
                                    padding: '0.5rem',
                                    backgroundColor: '#fadbd8',
                                    borderRadius: '4px',
                                    border: '1px solid #e74c3c'
                                }}>
                                    {createGroupError}
                                </div>
                            )}
                            <div className="form-actions">
                                <button 
                                    type="button"
                                    className="cancel-button"
                                    onClick={() => {
                                        setShowCreateGroup(false);
                                        setNewGroupName('');
                                        setCreateGroupError('');
                                    }}
                                    disabled={createGroupLoading}
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="button"
                                    className="create-button"
                                    onClick={handleCreateGroup}
                                    disabled={!newGroupName.trim() || createGroupLoading}
                                >
                                    {createGroupLoading ? 'Creating...' : 'Create'}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}

            <div className="chats-list">
                {activeTab === 'chats' && (
                    <div className="global-chat-item" onClick={() => handleChatSelect('global', 'global')}>
                        <div className="chat-avatar global">
                            <MessageCircle size={24} />
                        </div>
                        <div className="chat-info">
                            <h3>Global Chat</h3>
                            <p>Everyone's welcome here!</p>
                        </div>
                        <div className="chat-meta">
                            <span className="chat-time">now</span>
                            <span className="unread-count">3</span>
                        </div>
                    </div>
                )}

                {activeTab === 'groups' && (
                    <>
                        {filteredGroups.length > 0 ? (
                            filteredGroups.map(group => (
                                <div 
                                    key={group.$id} 
                                    className={`chat-item ${activeChat === group.$id ? 'active' : ''}`}
                                    onClick={() => handleChatSelect(group.$id, 'group')}
                                >
                                    <div className="chat-avatar">
                                        {group.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="chat-info">
                                        <h3>{group.name}</h3>
                                        <p>{group.last_message || 'No messages yet'}</p>
                                    </div>
                                    <div className="chat-meta">
                                        <span className="chat-time">
                                            {group.last_message_time ? 
                                                new Date(group.last_message_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 
                                                'new'}
                                        </span>
                                        {group.unread_count > 0 && (
                                            <span className="unread-count">{group.unread_count}</span>
                                        )}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="no-results">
                                <p>No groups found</p>
                                {createGroupError && (
                                    <p style={{ color: '#e74c3c', fontSize: '0.8rem' }}>
                                        Last error: {createGroupError}
                                    </p>
                                )}
                            </div>
                        )}
                    </>
                )}

                {activeTab === 'contacts' && (
                    <>
                        {filteredContacts.length > 0 ? (
                            filteredContacts.map(contact => (
                                <div 
                                    key={contact.$id} 
                                    className={`chat-item ${activeChat === contact.$id ? 'active' : ''}`}
                                    onClick={() => handleChatSelect(contact.$id, 'dm')}
                                >
                                    <div className="chat-avatar" style={{ backgroundColor: '#2ecc71' }}>
                                        {contact.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="chat-info">
                                        <h3>{contact.name}</h3>
                                        <p>{contact.last_message || contact.email}</p>
                                    </div>
                                    <div className="chat-meta">
                                        <span className="chat-time">
                                            {contact.last_seen || 'offline'}
                                        </span>
                                        {contact.unread_count > 0 && (
                                            <span className="unread-count">{contact.unread_count}</span>
                                        )}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="no-results">
                                <p>No contacts found</p>
                                {contactsError && (
                                    <p style={{ color: '#e74c3c', fontSize: '0.8rem' }}>
                                        Error: {contactsError}
                                    </p>
                                )}
                            </div>
                        )}
                    </>
                )}
            </div>

            {activeTab === 'contacts' && (
                <div className="add-contact">
                    <button 
                        className="add-contact-button"
                        onClick={() => setShowAddContact(true)}
                    >
                        <UserPlus size={18} />
                        <span>Add Contact</span>
                    </button>
                </div>
            )}

            {showAddContact && (
                <AddContactModal 
                    isOpen={showAddContact}
                    onClose={() => setShowAddContact(false)}
                    onContactAdded={handleContactAdded}
                    userId={user.$id}
                />
            )}
        </div>
    );
};

export default Sidebar;
