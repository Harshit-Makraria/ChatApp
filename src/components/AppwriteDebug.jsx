import React, { useState, useEffect } from 'react';
import { databases, DATABASE_ID, COLLECTION_ID_USERS, COLLECTION_ID_GROUPS, COLLECTION_ID_GROUP_MEMBERS, COLLECTION_ID_CONTACTS } from '../appwriteConfig';

const AppwriteDebug = () => {
    const [debugInfo, setDebugInfo] = useState({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDebugInfo = async () => {
            try {
                const info = {};

                // Test Users collection
                try {
                    const usersTest = await databases.listDocuments(DATABASE_ID, COLLECTION_ID_USERS, []);
                    info.users = {
                        status: 'success',
                        count: usersTest.total,
                        sampleDoc: usersTest.documents[0] || null,
                        attributes: usersTest.documents[0] ? Object.keys(usersTest.documents[0]) : []
                    };
                } catch (error) {
                    info.users = {
                        status: 'error',
                        error: error.message,
                        code: error.code,
                        type: error.type
                    };
                }

                // Test Groups collection
                try {
                    const groupsTest = await databases.listDocuments(DATABASE_ID, COLLECTION_ID_GROUPS, []);
                    info.groups = {
                        status: 'success',
                        count: groupsTest.total,
                        sampleDoc: groupsTest.documents[0] || null,
                        attributes: groupsTest.documents[0] ? Object.keys(groupsTest.documents[0]) : []
                    };
                } catch (error) {
                    info.groups = {
                        status: 'error',
                        error: error.message,
                        code: error.code,
                        type: error.type
                    };
                }

                // Test Group Members collection
                try {
                    const membersTest = await databases.listDocuments(DATABASE_ID, COLLECTION_ID_GROUP_MEMBERS, []);
                    info.groupMembers = {
                        status: 'success',
                        count: membersTest.total,
                        sampleDoc: membersTest.documents[0] || null,
                        attributes: membersTest.documents[0] ? Object.keys(membersTest.documents[0]) : []
                    };
                } catch (error) {
                    info.groupMembers = {
                        status: 'error',
                        error: error.message,
                        code: error.code,
                        type: error.type
                    };
                }

                // Test Contacts collection
                try {
                    const contactsTest = await databases.listDocuments(DATABASE_ID, COLLECTION_ID_CONTACTS, []);
                    info.contacts = {
                        status: 'success',
                        count: contactsTest.total,
                        sampleDoc: contactsTest.documents[0] || null,
                        attributes: contactsTest.documents[0] ? Object.keys(contactsTest.documents[0]) : []
                    };
                } catch (error) {
                    info.contacts = {
                        status: 'error',
                        error: error.message,
                        code: error.code,
                        type: error.type
                    };
                }

                setDebugInfo(info);
            } catch (error) {
                console.error('Debug fetch error:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchDebugInfo();
    }, []);

    if (loading) {
        return <div style={{ padding: '20px' }}>Loading debug info...</div>;
    }

    return (
        <div style={{ 
            position: 'fixed', 
            top: '10px', 
            right: '10px', 
            backgroundColor: 'white', 
            border: '1px solid #ccc', 
            padding: '15px', 
            borderRadius: '8px',
            maxWidth: '400px',
            maxHeight: '80vh',
            overflow: 'auto',
            zIndex: 9999,
            fontSize: '12px',
            fontFamily: 'monospace'
        }}>
            <h3>Appwrite Collections Debug</h3>
            
            {Object.entries(debugInfo).map(([collection, info]) => (
                <div key={collection} style={{ marginBottom: '15px', padding: '10px', backgroundColor: '#f5f5f5', borderRadius: '4px' }}>
                    <h4>{collection.toUpperCase()}</h4>
                    <div><strong>Status:</strong> <span style={{ color: info.status === 'success' ? 'green' : 'red' }}>{info.status}</span></div>
                    
                    {info.status === 'success' ? (
                        <>
                            <div><strong>Count:</strong> {info.count}</div>
                            <div><strong>Attributes:</strong> {info.attributes.join(', ')}</div>
                            {info.sampleDoc && (
                                <details style={{ marginTop: '5px' }}>
                                    <summary>Sample Document</summary>
                                    <pre style={{ fontSize: '10px', overflow: 'auto', maxHeight: '100px' }}>
                                        {JSON.stringify(info.sampleDoc, null, 2)}
                                    </pre>
                                </details>
                            )}
                        </>
                    ) : (
                        <>
                            <div><strong>Error:</strong> {info.error}</div>
                            <div><strong>Code:</strong> {info.code}</div>
                            <div><strong>Type:</strong> {info.type}</div>
                        </>
                    )}
                </div>
            ))}
            
            <div style={{ marginTop: '10px', padding: '10px', backgroundColor: '#e8f4fd', borderRadius: '4px' }}>
                <h4>Environment</h4>
                <div><strong>Database ID:</strong> {DATABASE_ID}</div>
                <div><strong>Users Collection:</strong> {COLLECTION_ID_USERS}</div>
                <div><strong>Groups Collection:</strong> {COLLECTION_ID_GROUPS}</div>
                <div><strong>Group Members Collection:</strong> {COLLECTION_ID_GROUP_MEMBERS}</div>
                <div><strong>Contacts Collection:</strong> {COLLECTION_ID_CONTACTS}</div>
            </div>
        </div>
    );
};

export default AppwriteDebug;
