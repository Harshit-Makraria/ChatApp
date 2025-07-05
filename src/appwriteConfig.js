import { Client, Databases, Account, Query } from 'appwrite';

const client = new Client();

export const PROJECT_ID = import.meta.env.VITE_PROJECT_ID;
export const DATABASE_ID = import.meta.env.VITE_DATABASE_ID;
export const COLLECTION_ID_MESSAGES = import.meta.env.VITE_COLLECTION_ID_MESSAGES;
export const COLLECTION_ID_GROUPS = import.meta.env.VITE_COLLECTION_ID_GROUPS;
export const COLLECTION_ID_DM_MESSAGES = import.meta.env.VITE_COLLECTION_ID_DM_MESSAGES;
export const COLLECTION_ID_GROUP_MEMBERS = import.meta.env.VITE_COLLECTION_ID_GROUP_MEMBERS;
export const COLLECTION_ID_USERS = import.meta.env.VITE_COLLECTION_ID_USERS;
export const COLLECTION_ID_TYPING_STATUS = import.meta.env.VITE_COLLECTION_ID_TYPING_STATUS;
export const COLLECTION_ID_CONTACTS = import.meta.env.VITE_COLLECTION_ID_CONTACTS;
export const ENDPOINT = import.meta.env.VITE_APPWRITE_ENDPOINT;

client
    .setEndpoint(ENDPOINT)
    .setProject(PROJECT_ID);

export const databases = new Databases(client);
export const account = new Account(client);

// API Functions for Users
export const createUserProfile = async (userId, userData) => {
    try {
        console.log('Creating user profile for ID:', userId);
        console.log('Profile data:', userData);
        console.log('Using DATABASE_ID:', DATABASE_ID);
        console.log('Using COLLECTION_ID_USERS:', COLLECTION_ID_USERS);
        
        if (!DATABASE_ID || !COLLECTION_ID_USERS) {
            throw new Error('Missing database or collection configuration');
        }
        
        const profile = await databases.createDocument(
            DATABASE_ID,
            COLLECTION_ID_USERS,
            userId,
            userData
        );
        
        console.log('User profile created successfully:', profile);
        return profile;
    } catch (error) {
        console.error('Error creating user profile:', {
            userId,
            userData,
            DATABASE_ID,
            COLLECTION_ID_USERS,
            error: error.message,
            type: error.type,
            code: error.code
        });
        throw error;
    }
};

export const getUserProfile = async (userId) => {
    try {
        console.log('Fetching user profile for ID:', userId);
        console.log('Using DATABASE_ID:', DATABASE_ID);
        console.log('Using COLLECTION_ID_USERS:', COLLECTION_ID_USERS);
        
        if (!DATABASE_ID || !COLLECTION_ID_USERS) {
            throw new Error('Missing database or collection configuration');
        }
        
        const profile = await databases.getDocument(
            DATABASE_ID,
            COLLECTION_ID_USERS,
            userId
        );
        
        console.log('User profile fetched successfully:', profile);
        return profile;
    } catch (error) {
        console.error('Error getting user profile:', {
            userId,
            DATABASE_ID,
            COLLECTION_ID_USERS,
            error: error.message,
            type: error.type,
            code: error.code
        });
        throw error;
    }
};

export const updateUserOnlineStatus = async (userId, isOnline) => {
    try {
        return await databases.updateDocument(
            DATABASE_ID,
            COLLECTION_ID_USERS,
            userId,
            {
                is_online: isOnline,
                last_seen: new Date().toISOString()
            }
        );
    } catch (error) {
        console.error('Error updating online status:', error);
        throw error;
    }
};

export const getAllUsers = async () => {
    try {
        const response = await databases.listDocuments(
            DATABASE_ID,
            COLLECTION_ID_USERS,
            [Query.limit(100)]
        );
        return response.documents;
    } catch (error) {
        console.error('Error getting all users:', error);
        throw error;
    }
};

// API Functions for Groups
export const createGroup = async (groupData, creatorId) => {
    try {
        console.log('Creating group with data:', { groupData, creatorId });
        console.log('Environment check:', {
            DATABASE_ID,
            COLLECTION_ID_GROUPS,
            COLLECTION_ID_GROUP_MEMBERS,
            hasDatabase: !!DATABASE_ID,
            hasGroupsCollection: !!COLLECTION_ID_GROUPS,
            hasMembersCollection: !!COLLECTION_ID_GROUP_MEMBERS
        });
        
        if (!DATABASE_ID) {
            throw new Error('DATABASE_ID is not configured. Please check your .env file.');
        }
        
        if (!COLLECTION_ID_GROUPS) {
            throw new Error('COLLECTION_ID_GROUPS is not configured. Please check your .env file.');
        }
        
        if (!COLLECTION_ID_GROUP_MEMBERS) {
            throw new Error('COLLECTION_ID_GROUP_MEMBERS is not configured. Please check your .env file.');
        }

        // First create the group
        console.log('Creating group document...');
        let group;
        try {
            // Try with standard snake_case attributes first
            group = await databases.createDocument(
                DATABASE_ID,
                COLLECTION_ID_GROUPS,
                'unique()',
                {
                    name: groupData.name,
                    description: groupData.description || '',
                    created_by: creatorId,
                    created_at: new Date().toISOString(),
                    member_count: 1
                }
            );
        } catch (error) {
            if (error.message.includes('created_by') || error.message.includes('created_at') || error.message.includes('member_count')) {
                console.log('Snake_case attributes failed, trying camelCase...');
                group = await databases.createDocument(
                    DATABASE_ID,
                    COLLECTION_ID_GROUPS,
                    'unique()',
                    {
                        name: groupData.name,
                        description: groupData.description || '',
                        createdBy: creatorId,
                        createdAt: new Date().toISOString(),
                        memberCount: 1
                    }
                );
            } else {
                throw error;
            }
        }
        
        console.log('Group created successfully:', group);
        
        // Then add creator as admin
        console.log('Adding creator as admin...');
        let membership;
        try {
            // Try with standard snake_case attributes first
            membership = await databases.createDocument(
                DATABASE_ID,
                COLLECTION_ID_GROUP_MEMBERS,
                'unique()',
                {
                    user_id: creatorId,
                    group_id: group.$id,
                    role: 'admin',
                    joined_at: new Date().toISOString()
                }
            );
        } catch (error) {
            if (error.message.includes('user_id') || error.message.includes('group_id') || error.message.includes('joined_at')) {
                console.log('Snake_case attributes failed for membership, trying camelCase...');
                membership = await databases.createDocument(
                    DATABASE_ID,
                    COLLECTION_ID_GROUP_MEMBERS,
                    'unique()',
                    {
                        userId: creatorId,
                        groupId: group.$id,
                        role: 'admin',
                        joinedAt: new Date().toISOString()
                    }
                );
            } else {
                // Group was created but membership failed - log but don't fail
                console.error('Failed to add creator as admin:', error);
                console.log('Group created but creator membership failed. Continuing...');
            }
        }
        
        if (membership) {
            console.log('Creator added as admin:', membership);
        }
        
        return group;
    } catch (error) {
        console.error('Error creating group - Full details:', {
            message: error.message,
            type: error.type,
            code: error.code,
            response: error.response,
            groupData,
            creatorId,
            DATABASE_ID,
            COLLECTION_ID_GROUPS,
            COLLECTION_ID_GROUP_MEMBERS
        });
        
        // Provide more user-friendly error messages
        if (error.code === 401) {
            throw new Error('You are not authorized to create groups. Please check your permissions.');
        } else if (error.code === 404) {
            throw new Error('Groups collection not found. Please check your Appwrite configuration.');
        } else if (error.message.includes('Attribute not found')) {
            throw new Error('Group collection schema mismatch. Please check your collection attributes.');
        } else {
            throw new Error(`Failed to create group: ${error.message}`);
        }
    }
};

export const getUserGroups = async (userId) => {
    try {
        console.log('Fetching groups for user:', userId);
        console.log('Using DATABASE_ID:', DATABASE_ID);
        console.log('Using COLLECTION_ID_GROUP_MEMBERS:', COLLECTION_ID_GROUP_MEMBERS);
        
        if (!DATABASE_ID || !COLLECTION_ID_GROUP_MEMBERS) {
            throw new Error('Missing database or collection configuration for group members');
        }

        // Try different possible attribute names for user_id
        let membershipResponse;
        try {
            membershipResponse = await databases.listDocuments(
                DATABASE_ID,
                COLLECTION_ID_GROUP_MEMBERS,
                [Query.equal('user_id', userId)]
            );
        } catch (error) {
            if (error.message.includes('user_id')) {
                console.log('user_id attribute not found, trying userId...');
                try {
                    membershipResponse = await databases.listDocuments(
                        DATABASE_ID,
                        COLLECTION_ID_GROUP_MEMBERS,
                        [Query.equal('userId', userId)]
                    );
                } catch (error2) {
                    console.log('userId attribute not found, trying $user_id...');
                    membershipResponse = await databases.listDocuments(
                        DATABASE_ID,
                        COLLECTION_ID_GROUP_MEMBERS,
                        [Query.equal('$user_id', userId)]
                    );
                }
            } else {
                throw error;
            }
        }
        
        console.log('Group memberships found:', membershipResponse.documents.length);
        
        if (membershipResponse.documents.length === 0) {
            console.log('No group memberships found for user');
            return [];
        }
        
        // Extract group IDs using flexible field names
        const groupIds = membershipResponse.documents.map(doc => 
            doc.group_id || doc.groupId || doc.$group_id
        ).filter(id => id); // Remove any undefined values
        
        if (groupIds.length === 0) {
            console.log('No valid group IDs found');
            return [];
        }
        
        console.log('Fetching groups with IDs:', groupIds);
        
        const groupsResponse = await databases.listDocuments(
            DATABASE_ID,
            COLLECTION_ID_GROUPS,
            [Query.equal('$id', groupIds)]
        );
        
        console.log('Groups fetched:', groupsResponse.documents.length);
        return groupsResponse.documents;
    } catch (error) {
        console.error('Error getting user groups:', {
            userId,
            DATABASE_ID,
            COLLECTION_ID_GROUP_MEMBERS,
            COLLECTION_ID_GROUPS,
            error: error.message,
            type: error.type,
            code: error.code
        });
        return []; // Return empty array instead of throwing
    }
};

export const getGroupMembers = async (groupId) => {
    try {
        const response = await databases.listDocuments(
            DATABASE_ID,
            COLLECTION_ID_GROUP_MEMBERS,
            [Query.equal('group_id', groupId)]
        );
        return response.documents;
    } catch (error) {
        console.error('Error getting group members:', error);
        throw error;
    }
};

// API Functions for Messages
export const getGlobalMessages = async (limit = 50) => {
    try {
        const response = await databases.listDocuments(
            DATABASE_ID,
            COLLECTION_ID_MESSAGES,
            [
                Query.isNull('group_id'),
                Query.orderDesc('$createdAt'),
                Query.limit(limit)
            ]
        );
        return response.documents;
    } catch (error) {
        // If isNull doesn't work, try with empty string
        try {
            const fallbackResponse = await databases.listDocuments(
                DATABASE_ID,
                COLLECTION_ID_MESSAGES,
                [
                    Query.orderDesc('$createdAt'),
                    Query.limit(limit)
                ]
            );
            // Filter out group messages on client side
            const globalMessages = fallbackResponse.documents.filter(msg => !msg.group_id);
            return globalMessages;
        } catch (fallbackError) {
            console.error('Error getting global messages:', fallbackError);
            throw fallbackError;
        }
    }
};

export const getGroupMessages = async (groupId, limit = 50) => {
    try {
        const response = await databases.listDocuments(
            DATABASE_ID,
            COLLECTION_ID_MESSAGES,
            [
                Query.equal('group_id', groupId),
                Query.orderDesc('$createdAt'),
                Query.limit(limit)
            ]
        );
        return response.documents;
    } catch (error) {
        console.error('Error getting group messages:', error);
        throw error;
    }
};

export const getDMMessages = async (userId1, userId2, limit = 50) => {
    try {
        // Get messages where user1 is sender and user2 is receiver
        const response1 = await databases.listDocuments(
            DATABASE_ID,
            COLLECTION_ID_DM_MESSAGES,
            [
                Query.equal('sender_id', userId1),
                Query.equal('receiver_id', userId2),
                Query.orderDesc('$createdAt'),
                Query.limit(limit)
            ]
        );
        
        // Get messages where user2 is sender and user1 is receiver
        const response2 = await databases.listDocuments(
            DATABASE_ID,
            COLLECTION_ID_DM_MESSAGES,
            [
                Query.equal('sender_id', userId2),
                Query.equal('receiver_id', userId1),
                Query.orderDesc('$createdAt'),
                Query.limit(limit)
            ]
        );
        
        // Combine and sort all messages
        const allMessages = [...response1.documents, ...response2.documents];
        allMessages.sort((a, b) => new Date(b.$createdAt) - new Date(a.$createdAt));
        
        return allMessages.slice(0, limit);
    } catch (error) {
        console.error('Error getting DM messages:', error);
        throw error;
    }
};

// API Functions for Typing Status
export const setTypingStatus = async (userId, chatId, chatType, isTyping) => {
    try {
        const typingId = `${userId}_${chatId}_${chatType}`;
        
        if (isTyping) {
            await databases.createDocument(
                DATABASE_ID,
                COLLECTION_ID_TYPING_STATUS,
                typingId,
                {
                    user_id: userId,
                    chat_id: chatId,
                    chat_type: chatType,
                    updated_at: new Date().toISOString()
                }
            );
        } else {
            try {
                await databases.deleteDocument(
                    DATABASE_ID,
                    COLLECTION_ID_TYPING_STATUS,
                    typingId
                );
            } catch (error) {
                // Document might not exist, which is fine
            }
        }
    } catch (error) {
        console.error('Error setting typing status:', error);
    }
};

export const getTypingUsers = async (chatId, chatType, currentUserId) => {
    try {
        const response = await databases.listDocuments(
            DATABASE_ID,
            COLLECTION_ID_TYPING_STATUS,
            [
                Query.equal('chat_id', chatId),
                Query.equal('chat_type', chatType),
                Query.notEqual('user_id', currentUserId)
            ]
        );
        
        // Filter out stale typing indicators (older than 3 seconds)
        const now = new Date();
        const validTyping = response.documents.filter(doc => {
            const updatedAt = new Date(doc.updated_at);
            return (now - updatedAt) < 3000;
        });
        
        return validTyping;
    } catch (error) {
        console.error('Error getting typing users:', error);
        return [];
    }
};

// API Functions for Contacts/Friends
export const addContact = async (userId, contactId) => {
    try {
        console.log('Adding contact:', { userId, contactId });
        
        // Check if contact relationship already exists using flexible field names
        let existingContact;
        try {
            existingContact = await databases.listDocuments(
                DATABASE_ID,
                COLLECTION_ID_CONTACTS,
                [
                    Query.and([
                        Query.equal('user_id', userId),
                        Query.equal('contact_id', contactId)
                    ])
                ]
            );
        } catch (error) {
            if (error.message.includes('user_id')) {
                console.log('Trying alternative field names for contact check...');
                existingContact = await databases.listDocuments(
                    DATABASE_ID,
                    COLLECTION_ID_CONTACTS,
                    [
                        Query.and([
                            Query.equal('userId', userId),
                            Query.equal('contactId', contactId)
                        ])
                    ]
                );
            } else {
                throw error;
            }
        }

        if (existingContact.documents.length > 0) {
            throw new Error('Contact already exists');
        }

        // Create contact relationship using the attribute names that work
        let contactData;
        try {
            // Try standard naming first
            contactData = {
                user_id: userId,
                contact_id: contactId,
                added_at: new Date().toISOString(),
                status: 'active'
            };
            
            const contact = await databases.createDocument(
                DATABASE_ID,
                COLLECTION_ID_CONTACTS,
                'unique()',
                contactData
            );
            
            console.log('Contact created successfully:', contact);
            return contact;
        } catch (error) {
            if (error.message.includes('user_id') || error.message.includes('contact_id')) {
                console.log('Standard naming failed, trying camelCase...');
                contactData = {
                    userId: userId,
                    contactId: contactId,
                    addedAt: new Date().toISOString(),
                    status: 'active'
                };
                
                const contact = await databases.createDocument(
                    DATABASE_ID,
                    COLLECTION_ID_CONTACTS,
                    'unique()',
                    contactData
                );
                
                console.log('Contact created with camelCase:', contact);
                return contact;
            } else {
                throw error;
            }
        }
    } catch (error) {
        console.error('Error adding contact:', {
            userId,
            contactId,
            error: error.message,
            type: error.type,
            code: error.code
        });
        throw error;
    }
};

export const removeContact = async (userId, contactId) => {
    try {
        const contacts = await databases.listDocuments(
            DATABASE_ID,
            COLLECTION_ID_CONTACTS,
            [
                Query.and([
                    Query.equal('user_id', userId),
                    Query.equal('contact_id', contactId)
                ])
            ]
        );

        for (const contact of contacts.documents) {
            await databases.deleteDocument(
                DATABASE_ID,
                COLLECTION_ID_CONTACTS,
                contact.$id
            );
        }

        return true;
    } catch (error) {
        console.error('Error removing contact:', error);
        throw error;
    }
};

export const getUserContacts = async (userId) => {
    try {
        console.log('Fetching contacts for user:', userId);
        console.log('Using DATABASE_ID:', DATABASE_ID);
        console.log('Using COLLECTION_ID_CONTACTS:', COLLECTION_ID_CONTACTS);
        
        if (!DATABASE_ID || !COLLECTION_ID_CONTACTS) {
            throw new Error('Missing database or collection configuration for contacts');
        }

        // Try different possible attribute names for user_id
        let contacts;
        try {
            contacts = await databases.listDocuments(
                DATABASE_ID,
                COLLECTION_ID_CONTACTS,
                [
                    Query.equal('user_id', userId),
                    Query.equal('status', 'active'),
                    Query.limit(100)
                ]
            );
        } catch (error) {
            if (error.message.includes('user_id')) {
                console.log('user_id attribute not found, trying userId...');
                try {
                    contacts = await databases.listDocuments(
                        DATABASE_ID,
                        COLLECTION_ID_CONTACTS,
                        [
                            Query.equal('userId', userId),
                            Query.equal('status', 'active'),
                            Query.limit(100)
                        ]
                    );
                } catch (error2) {
                    if (error2.message.includes('status')) {
                        console.log('status attribute not found, trying without status filter...');
                        contacts = await databases.listDocuments(
                            DATABASE_ID,
                            COLLECTION_ID_CONTACTS,
                            [
                                Query.equal('userId', userId),
                                Query.limit(100)
                            ]
                        );
                    } else {
                        console.log('userId attribute not found, trying $user_id...');
                        contacts = await databases.listDocuments(
                            DATABASE_ID,
                            COLLECTION_ID_CONTACTS,
                            [
                                Query.equal('$user_id', userId),
                                Query.limit(100)
                            ]
                        );
                    }
                }
            } else if (error.message.includes('status')) {
                console.log('status attribute not found, trying without status filter...');
                contacts = await databases.listDocuments(
                    DATABASE_ID,
                    COLLECTION_ID_CONTACTS,
                    [
                        Query.equal('user_id', userId),
                        Query.limit(100)
                    ]
                );
            } else {
                throw error;
            }
        }

        console.log('Found contacts:', contacts.documents.length);

        if (contacts.documents.length === 0) {
            console.log('No contacts found for user');
            return [];
        }

        // Get full user data for each contact using flexible field names
        const contactUsers = await Promise.all(
            contacts.documents.map(async (contact) => {
                try {
                    const contactId = contact.contact_id || contact.contactId || contact.$contact_id;
                    console.log('Fetching user data for contact:', contactId);
                    
                    if (!contactId) {
                        console.error('No contact ID found in contact document:', contact);
                        return null;
                    }
                    
                    const userData = await getUserProfile(contactId);
                    return {
                        ...userData,
                        contact_id: contact.$id,
                        added_at: contact.added_at || contact.addedAt || contact.$created_at
                    };
                } catch (error) {
                    console.error('Error fetching contact user data for:', contact, error);
                    return null;
                }
            })
        );

        const validContacts = contactUsers.filter(contact => contact !== null);
        console.log('Successfully loaded contacts:', validContacts.length);
        return validContacts;
    } catch (error) {
        console.error('Error getting user contacts:', {
            userId,
            DATABASE_ID,
            COLLECTION_ID_CONTACTS,
            error: error.message,
            type: error.type,
            code: error.code
        });
        return []; // Return empty array instead of throwing
    }
};

export const searchUsers = async (searchTerm, currentUserId) => {
    try {
        console.log('Searching for:', searchTerm, 'excluding:', currentUserId);
        
        // First, let's try to get all users and filter manually since search might not work
        const response = await databases.listDocuments(
            DATABASE_ID,
            COLLECTION_ID_USERS,
            [
                Query.notEqual('$id', currentUserId),
                Query.limit(100) // Get more users to filter from
            ]
        );
        
        console.log('Raw users response:', response);
        
        if (!response.documents || response.documents.length === 0) {
            console.log('No users found in database');
            return [];
        }
        
        // Check what fields are actually available
        console.log('Sample user document:', response.documents[0]);
        
        // Filter manually for the search term
        const filtered = response.documents.filter(user => {
            const searchLower = searchTerm.toLowerCase();
            
            // Check various possible field names
            const checkFields = [
                user.name,
                user.username, 
                user.email,
                user.displayName,
                user.display_name
            ].filter(field => field); // Remove undefined/null values
            
            return checkFields.some(field => 
                field.toLowerCase().includes(searchLower)
            );
        });
        
        console.log('Filtered users:', filtered);
        return filtered.slice(0, 20); // Limit to 20 results
        
    } catch (error) {
        console.error('Error searching users:', {
            error: error.message,
            type: error.type,
            code: error.code,
            searchTerm,
            currentUserId
        });
        
        // If we can't even get basic user list, return empty
        return [];
    }
};

export default client;
