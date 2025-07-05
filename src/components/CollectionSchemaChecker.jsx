import React, { useState, useEffect } from 'react';
import { databases, DATABASE_ID } from '../appwriteConfig';

const CollectionSchemaChecker = () => {
    const [schemas, setSchemas] = useState({});
    const [loading, setLoading] = useState(true);

    const collections = {
        'Users': import.meta.env.VITE_COLLECTION_ID_USERS,
        'Groups': import.meta.env.VITE_COLLECTION_ID_GROUPS,
        'Group Members': import.meta.env.VITE_COLLECTION_ID_GROUP_MEMBERS,
        'Messages': import.meta.env.VITE_COLLECTION_ID_MESSAGES,
        'DM Messages': import.meta.env.VITE_COLLECTION_ID_DM_MESSAGES,
        'Typing Status': import.meta.env.VITE_COLLECTION_ID_TYPING_STATUS,
        'Contacts': import.meta.env.VITE_COLLECTION_ID_CONTACTS
    };

    useEffect(() => {
        checkAllSchemas();
    }, []);

    const checkAllSchemas = async () => {
        const results = {};
        
        for (const [name, id] of Object.entries(collections)) {
            if (!id || id.startsWith('VITE_')) {
                results[name] = { error: 'Collection ID not configured' };
                continue;
            }

            try {
                const collection = await databases.getCollection(DATABASE_ID, id);
                results[name] = {
                    id: collection.$id,
                    name: collection.name,
                    attributes: collection.attributes.map(attr => ({
                        key: attr.key,
                        type: attr.type,
                        required: attr.required,
                        array: attr.array
                    }))
                };
            } catch (error) {
                results[name] = { 
                    error: error.message,
                    id: id
                };
            }
        }
        
        setSchemas(results);
        setLoading(false);
    };

    if (loading) {
        return (
            <div style={{ padding: '20px', textAlign: 'center' }}>
                <h3>Checking Collection Schemas...</h3>
            </div>
        );
    }

    return (
        <div style={{ 
            position: 'fixed', 
            top: '10px', 
            right: '10px', 
            width: '400px', 
            maxHeight: '80vh', 
            overflow: 'auto',
            backgroundColor: 'white', 
            border: '1px solid #ccc', 
            borderRadius: '8px', 
            padding: '15px',
            fontSize: '12px',
            zIndex: 1000,
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
        }}>
            <h3 style={{ margin: '0 0 15px 0', color: '#333' }}>Collection Schema Status</h3>
            
            {Object.entries(schemas).map(([name, data]) => (
                <div key={name} style={{ 
                    marginBottom: '15px', 
                    padding: '10px', 
                    border: '1px solid #eee',
                    borderRadius: '4px',
                    backgroundColor: data.error ? '#ffe6e6' : '#e6ffe6'
                }}>
                    <h4 style={{ margin: '0 0 8px 0', color: '#333' }}>{name}</h4>
                    
                    {data.error ? (
                        <div style={{ color: 'red' }}>
                            <strong>Error:</strong> {data.error}
                            {data.id && <div><strong>ID:</strong> {data.id}</div>}
                        </div>
                    ) : (
                        <div>
                            <div style={{ marginBottom: '5px' }}>
                                <strong>ID:</strong> {data.id}
                            </div>
                            <div><strong>Attributes:</strong></div>
                            <ul style={{ margin: '5px 0', paddingLeft: '20px' }}>
                                {data.attributes.map((attr, idx) => (
                                    <li key={idx} style={{ margin: '2px 0' }}>
                                        <strong>{attr.key}</strong> ({attr.type})
                                        {attr.required && ' *required'}
                                        {attr.array && ' []array'}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            ))}
            
            <button 
                onClick={() => window.location.reload()} 
                style={{ 
                    width: '100%', 
                    padding: '8px', 
                    backgroundColor: '#007bff', 
                    color: 'white', 
                    border: 'none', 
                    borderRadius: '4px',
                    cursor: 'pointer'
                }}
            >
                Refresh
            </button>
        </div>
    );
};

export default CollectionSchemaChecker;
