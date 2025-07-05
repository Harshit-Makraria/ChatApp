import React from 'react';

const EnvDebug = () => {
    const envVars = {
        'VITE_APPWRITE_ENDPOINT': import.meta.env.VITE_APPWRITE_ENDPOINT,
        'VITE_PROJECT_ID': import.meta.env.VITE_PROJECT_ID,
        'VITE_DATABASE_ID': import.meta.env.VITE_DATABASE_ID,
        'VITE_COLLECTION_ID_USERS': import.meta.env.VITE_COLLECTION_ID_USERS,
        'VITE_COLLECTION_ID_MESSAGES': import.meta.env.VITE_COLLECTION_ID_MESSAGES,
        'VITE_COLLECTION_ID_GROUPS': import.meta.env.VITE_COLLECTION_ID_GROUPS,
        'VITE_COLLECTION_ID_DM_MESSAGES': import.meta.env.VITE_COLLECTION_ID_DM_MESSAGES,
        'VITE_COLLECTION_ID_GROUP_MEMBERS': import.meta.env.VITE_COLLECTION_ID_GROUP_MEMBERS,
        'VITE_COLLECTION_ID_TYPING_STATUS': import.meta.env.VITE_COLLECTION_ID_TYPING_STATUS,
        'VITE_COLLECTION_ID_CONTACTS': import.meta.env.VITE_COLLECTION_ID_CONTACTS,
    };

    // Only show in development
    if (import.meta.env.MODE !== 'development') {
        return null;
    }

    const hasAllVars = Object.values(envVars).every(value => value && value !== 'undefined');

    return (
        <div style={{
            position: 'fixed',
            bottom: '10px',
            right: '10px',
            background: hasAllVars ? '#2ecc71' : '#e74c3c',
            color: 'white',
            padding: '10px',
            borderRadius: '5px',
            fontSize: '12px',
            maxWidth: '300px',
            zIndex: 9999
        }}>
            <strong>Environment Status: {hasAllVars ? '✅ OK' : '❌ Missing'}</strong>
            <details style={{ marginTop: '5px' }}>
                <summary style={{ cursor: 'pointer' }}>View Details</summary>
                <div style={{ marginTop: '5px', fontSize: '10px' }}>
                    {Object.entries(envVars).map(([key, value]) => (
                        <div key={key} style={{ 
                            color: value && value !== 'undefined' ? '#d4edda' : '#f8d7da',
                            marginBottom: '2px'
                        }}>
                            {key}: {value ? (value.length > 20 ? value.substring(0, 20) + '...' : value) : '❌ Missing'}
                        </div>
                    ))}
                </div>
            </details>
        </div>
    );
};

export default EnvDebug;
