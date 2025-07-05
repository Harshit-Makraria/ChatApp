import React, { useState, useEffect } from 'react';
import { databases, DATABASE_ID } from '../appwriteConfig';

const SchemaDebugger = () => {
    const [collections, setCollections] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const collectionIds = {
        'Users': process.env.REACT_APP_COLLECTION_ID_USERS || 'VITE_COLLECTION_ID_USERS',
        'Groups': process.env.REACT_APP_COLLECTION_ID_GROUPS || 'VITE_COLLECTION_ID_GROUPS',
        'Group Members': process.env.REACT_APP_COLLECTION_ID_GROUP_MEMBERS || 'VITE_COLLECTION_ID_GROUP_MEMBERS',
        'Messages': process.env.REACT_APP_COLLECTION_ID_MESSAGES || 'VITE_COLLECTION_ID_MESSAGES',
        'DM Messages': process.env.REACT_APP_COLLECTION_ID_DM_MESSAGES || 'VITE_COLLECTION_ID_DM_MESSAGES',
        'Typing Status': process.env.REACT_APP_COLLECTION_ID_TYPING_STATUS || 'VITE_COLLECTION_ID_TYPING_STATUS',
        'Contacts': process.env.REACT_APP_COLLECTION_ID_CONTACTS || 'VITE_COLLECTION_ID_CONTACTS'
    };

    useEffect(() => {
        checkCollectionSchemas();
    }, []);

    const checkCollectionSchemas = async () => {
        setLoading(true);
        const collectionData = {};

        for (const [name, id] of Object.entries(collectionIds)) {
            try {
                console.log(`Checking collection: ${name} (${id})`);
                const collection = await databases.getCollection(DATABASE_ID, id);
                collectionData[name] = {
                    id: collection.$id,
                    name: collection.name,
                    attributes: collection.attributes,
                    error: null
                };
            } catch (error) {
                console.error(`Error fetching collection ${name}:`, error);
                collectionData[name] = {
                    id: id,
                    name: name,
                    attributes: [],
                    error: error.message
                };
            }
        }

        setCollections(collectionData);
        setLoading(false);
    };

    const checkDocumentSample = async (collectionId) => {
        try {
            const response = await databases.listDocuments(DATABASE_ID, collectionId, []);
            if (response.documents.length > 0) {
                console.log('Sample document:', response.documents[0]);
                return response.documents[0];
            }
            return null;
        } catch (error) {
            console.error('Error fetching sample document:', error);
            return null;
        }
    };

    if (loading) {
        return <div style={{ padding: '20px' }}>Loading schema information...</div>;
    }

    return (
        <div style={{ 
            padding: '20px', 
            backgroundColor: '#f5f5f5', 
            borderRadius: '8px', 
            margin: '20px',
            maxHeight: '80vh',
            overflowY: 'auto'
        }}>
            <h2>Appwrite Collections Schema Debug</h2>
            <p>This debug tool shows the actual attributes in your Appwrite collections vs what the code expects.</p>
            
            {Object.entries(collections).map(([name, data]) => (
                <div key={name} style={{ 
                    marginBottom: '20px', 
                    padding: '15px', 
                    backgroundColor: 'white', 
                    borderRadius: '5px',
                    border: data.error ? '2px solid red' : '1px solid #ddd'
                }}>
                    <h3>{name}</h3>
                    <p><strong>Collection ID:</strong> {data.id}</p>
                    
                    {data.error ? (
                        <div style={{ color: 'red', padding: '10px', backgroundColor: '#ffe6e6' }}>
                            <strong>Error:</strong> {data.error}
                        </div>
                    ) : (
                        <div>
                            <h4>Attributes:</h4>
                            {data.attributes.length > 0 ? (
                                <ul>
                                    {data.attributes.map((attr, index) => (
                                        <li key={index}>
                                            <strong>{attr.key}</strong> - {attr.type} 
                                            {attr.required && ' (required)'}
                                            {attr.array && ' (array)'}
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p>No attributes found</p>
                            )}
                            
                            <button 
                                onClick={() => checkDocumentSample(data.id)}
                                style={{ 
                                    marginTop: '10px', 
                                    padding: '5px 10px', 
                                    backgroundColor: '#007bff', 
                                    color: 'white', 
                                    border: 'none', 
                                    borderRadius: '3px' 
                                }}
                            >
                                Check Sample Document
                            </button>
                        </div>
                    )}
                </div>
            ))}

            <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#e8f4f8', borderRadius: '5px' }}>
                <h3>Expected Attributes (according to code):</h3>
                <ul>
                    <li><strong>Users:</strong> name, email, is_online, last_seen, avatar_url, bio</li>
                    <li><strong>Groups:</strong> name, created_by, created_at</li>
                    <li><strong>Group Members:</strong> user_id, group_id, role, joined_at</li>
                    <li><strong>Messages:</strong> user_id, username, body, group_id</li>
                    <li><strong>DM Messages:</strong> sender_id, sender_name, receiver_id, body, is_read</li>
                    <li><strong>Typing Status:</strong> user_id, chat_id, chat_type, updated_at</li>
                    <li><strong>Contacts:</strong> user_id, contact_id, added_at, status</li>
                </ul>
            </div>
        </div>
    );
};

export default SchemaDebugger;
