import React, { useState, useEffect, useRef } from 'react';
import client, { 
    databases, 
    DATABASE_ID, 
    COLLECTION_ID_MESSAGES, 
    COLLECTION_ID_GROUPS,
    COLLECTION_ID_GROUP_MEMBERS,
    COLLECTION_ID_DM_MESSAGES,
    account,
    getAllUsers,
    getUserGroups,
    getGlobalMessages,
    getGroupMessages,
    getDMMessages,
    getGroupMembers,
    createGroup,
    setTypingStatus,
    getTypingUsers
} from '../appwriteConfig';
import { Query, Permission, Role } from 'appwrite';
import { ID } from 'appwrite';
import { useAuth } from '../utils/AuthContext';
import Sidebar from '../components/Sidebar';
import ChatMessage from '../components/ChatMessage';
import ChatInput from '../components/ChatInput';
import ChatHeader from '../components/ChatHeader';
import TypingIndicator from '../components/TypingIndicator';
import AppwriteDebug from '../components/AppwriteDebug';
import CollectionSchemaChecker from '../components/CollectionSchemaChecker';
import './Room.css';

const Room = () => {
    const [messages, setMessages] = useState([]);
    const [activeChat, setActiveChat] = useState('global');
    const [activeChatType, setActiveChatType] = useState('global'); // 'global', 'group', or 'dm'
    const [currentGroupOrUser, setCurrentGroupOrUser] = useState(null);
    const [showSidebar, setShowSidebar] = useState(window.innerWidth > 768);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
    const [typingUsers, setTypingUsers] = useState([]);
    const [isTyping, setIsTyping] = useState(false);
    const typingTimeoutRef = useRef(null);
    const { user } = useAuth();
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        if (activeChat && activeChatType) {
            getMessages();
            scrollToBottom();
            
            if (activeChatType === 'group') {
                getGroupDetails();
            } else if (activeChatType === 'dm') {
                getUserDetails();
            }
        }
    }, [activeChat, activeChatType]);

    useEffect(() => {
        if (user) {
            // Setup realtime updates for messages
            const unsubscribe = setupRealtimeUpdates();
            
            return () => {
                unsubscribe();
            };
        }
    }, [user]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Handle window resize for mobile responsiveness
    useEffect(() => {
        const handleResize = () => {
            const isMobileNow = window.innerWidth <= 768;
            setIsMobile(isMobileNow);
            if (!isMobileNow) {
                setShowSidebar(true);
            } else {
                setShowSidebar(false);
            }
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Close sidebar when clicking outside on mobile
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (isMobile && showSidebar && 
                !event.target.closest('.sidebar-container') && 
                !event.target.closest('.menu-toggle')) {
                setShowSidebar(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isMobile, showSidebar]);

    const setupRealtimeUpdates = () => {
        return client.subscribe([
            `databases.${DATABASE_ID}.collections.${COLLECTION_ID_MESSAGES}.documents`,
            `databases.${DATABASE_ID}.collections.${COLLECTION_ID_DM_MESSAGES}.documents`,
            `databases.${DATABASE_ID}.collections.${COLLECTION_ID_GROUPS}.documents`
        ], response => {
            if (response.events.includes("databases.*.collections.*.documents.*.create")) {
                const newMessage = response.payload;
                
                // Check if the message belongs to the active chat
                if ((activeChatType === 'global' && response.payload.$collectionId === COLLECTION_ID_MESSAGES) ||
                    (activeChatType === 'group' && response.payload.group_id === activeChat) ||
                    (activeChatType === 'dm' && 
                     ((response.payload.sender_id === user.$id && response.payload.receiver_id === activeChat) ||
                      (response.payload.receiver_id === user.$id && response.payload.sender_id === activeChat)))) {
                    setMessages(prevState => [newMessage, ...prevState]);
                }
            }
            
            if (response.events.includes("databases.*.collections.*.documents.*.delete")) {
                setMessages(prevState => prevState.filter(message => message.$id !== response.payload.$id));
            }
        });
    };

    const getMessages = async () => {
        try {
            let messages;
            
            if (activeChatType === 'global') {
                messages = await getGlobalMessages();
            } else if (activeChatType === 'group') {
                messages = await getGroupMessages(activeChat);
            } else if (activeChatType === 'dm') {
                messages = await getDMMessages(user.$id, activeChat);
            }
            
            if (messages) {
                setMessages(messages);
            }
        } catch (error) {
            console.error('Error fetching messages:', error);
        }
    };

    const getGroupDetails = async () => {
        try {
            const response = await databases.getDocument(
                DATABASE_ID,
                COLLECTION_ID_GROUPS,
                activeChat
            );
            
            // Get member count using the API function
            const members = await getGroupMembers(activeChat);
            response.members_count = members.length;
            setCurrentGroupOrUser(response);
        } catch (error) {
            console.error('Error fetching group details:', error);
        }
    };

    const getUserDetails = async () => {
        // Find the user in our contacts
        const userDetails = contacts.find(contact => contact.$id === activeChat);
        if (userDetails) {
            setCurrentGroupOrUser(userDetails);
        }
    };

    const handleSendMessage = async (messageBody) => {
        if (!messageBody.trim()) return;
        
        // Clear typing indicator when sending message
        setIsTyping(false);
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }
        
        try {
            const permissions = [Permission.write(Role.user(user.$id))];
            let payload;
            let collectionId;
            let documentId = ID.unique();
            
            if (activeChatType === 'global') {
                payload = {
                    user_id: user.$id,
                    username: user.name,
                    body: messageBody
                };
                collectionId = COLLECTION_ID_MESSAGES;
            } else if (activeChatType === 'group') {
                payload = {
                    user_id: user.$id,
                    username: user.name,
                    group_id: activeChat,
                    body: messageBody
                };
                collectionId = COLLECTION_ID_MESSAGES;
            } else if (activeChatType === 'dm') {
                payload = {
                    sender_id: user.$id,
                    sender_name: user.name,
                    receiver_id: activeChat,
                    body: messageBody,
                    is_read: false
                };
                collectionId = COLLECTION_ID_DM_MESSAGES;
            }
            
            await databases.createDocument(
                DATABASE_ID,
                collectionId,
                documentId,
                payload,
                permissions
            );
        } catch (error) {
            console.error('Error sending message:', error);
        }
    };

    const handleTyping = async () => {
        if (!isTyping) {
            setIsTyping(true);
            // Broadcast typing status to other users
            await setTypingStatus(user.$id, activeChat, activeChatType, true);
        }
        
        // Reset typing timer
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }
        
        typingTimeoutRef.current = setTimeout(async () => {
            setIsTyping(false);
            // Stop broadcasting typing status
            await setTypingStatus(user.$id, activeChat, activeChatType, false);
        }, 2000);
    };

    const handleDeleteMessage = async (id) => {
        try {
            const collectionId = activeChatType === 'dm' ? COLLECTION_ID_DM_MESSAGES : COLLECTION_ID_MESSAGES;
            await databases.deleteDocument(DATABASE_ID, collectionId, id);
        } catch (error) {
            console.error('Error deleting message:', error);
        }
    };

    const handleCreateGroup = async (groupName) => {
        try {
            const groupData = {
                name: groupName
            };
            
            const group = await createGroup(groupData, user.$id);
            return group.$id;
        } catch (error) {
            console.error('Error creating group:', error);
            return null;
        }
    };

    return (
        <div className="chat-container">
            {/* Debug component - remove this after fixing issues */}
            {/* <AppwriteDebug /> */}
            <CollectionSchemaChecker />
            
            {/* Mobile overlay */}
            {isMobile && showSidebar && <div className="mobile-overlay" onClick={() => setShowSidebar(false)}></div>}
            
            <div className={`sidebar-container ${showSidebar ? 'active' : ''}`}>
                <Sidebar 
                    activeChat={activeChat}
                    setActiveChat={setActiveChat}
                    setActiveChatType={setActiveChatType}
                    onCreateGroup={handleCreateGroup}
                />
            </div>
            
            <div className="chat-main">
                <ChatHeader 
                    activeChat={activeChat}
                    activeChatType={activeChatType}
                    currentGroupOrUser={currentGroupOrUser}
                    onBackClick={() => setShowSidebar(true)}
                    onMenuToggle={() => setShowSidebar(!showSidebar)}
                />
                
                <div className="messages-container">
                    {messages.length > 0 ? (
                        messages.slice(0).reverse().map((message, index, array) => {
                            // Check if this message should be grouped with the previous one
                            const prevMessage = array[index - 1];
                            const isGrouped = prevMessage && 
                                             prevMessage.user_id === message.user_id &&
                                             prevMessage.sender_id === message.sender_id &&
                                             (new Date(message.$createdAt) - new Date(prevMessage.$createdAt)) < 60000; // Within 1 minute
                            
                            const showAvatar = !isGrouped;
                            
                            return (
                                <ChatMessage 
                                    key={message.$id}
                                    message={message}
                                    currentUser={user}
                                    onDelete={handleDeleteMessage}
                                    activeChatType={activeChatType}
                                    isGrouped={isGrouped}
                                    showAvatar={showAvatar}
                                />
                            );
                        })
                    ) : (
                        <div className="no-messages">
                            <div className="no-messages-icon">💬</div>
                            <h3>No messages yet</h3>
                            <p>Start the conversation by sending a message!</p>
                        </div>
                    )}
                    
                    {/* Show typing indicator for demo */}
                    {typingUsers.length > 0 && (
                        <TypingIndicator usernames={typingUsers} />
                    )}
                    
                    <div ref={messagesEndRef} />
                </div>
                
                <ChatInput onSendMessage={handleSendMessage} onTyping={handleTyping} />
            </div>
        </div>
    );
};

export default Room;
