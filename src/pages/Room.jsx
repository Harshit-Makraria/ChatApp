import React, { useState, useEffect, useRef } from 'react';
import client, { databases, DATABASE_ID, COLLECTION_ID_MESSAGES } from '../appwriteConfig';
import { ID, Query, Permission, Role } from 'appwrite';
import Header from '../components/Header';
import { useAuth } from '../utils/AuthContext';
import { Trash2 } from 'react-feather';
import './Room.css';

const Room = () => {
    const [messageBody, setMessageBody] = useState('');
    const [messages, setMessages] = useState([]);
    const { user } = useAuth();
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        getMessages();

        const unsubscribe = client.subscribe(`databases.${DATABASE_ID}.collections.${COLLECTION_ID_MESSAGES}.documents`, response => {
            if (response.events.includes("databases.*.collections.*.documents.*.create")) {
                setMessages(prevState => [response.payload, ...prevState]);
            }
            if (response.events.includes("databases.*.collections.*.documents.*.delete")) {
                setMessages(prevState => prevState.filter(message => message.$id !== response.payload.$id));
            }
        });

        return () => {
            unsubscribe();
        };
    }, []);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const getMessages = async () => {
        const response = await databases.listDocuments(
            DATABASE_ID,
            COLLECTION_ID_MESSAGES,
            [Query.orderDesc('$createdAt'), Query.limit(100)]
        );
        setMessages(response.documents);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const permissions = [Permission.write(Role.user(user.$id))];
        const payload = {
            user_id: user.$id,
            username: user.name,
            body: messageBody
        };

        await databases.createDocument(
            DATABASE_ID,
            COLLECTION_ID_MESSAGES,
            ID.unique(),
            payload,
            permissions
        );

        setMessageBody('');
    };

    const deleteMessage = async (id) => {
        await databases.deleteDocument(DATABASE_ID, COLLECTION_ID_MESSAGES, id);
    };

    return (
        <main className="container ">
            <Header/>

            <div className="room--container">
                {messages.slice(0).reverse().map((message) => (
                    <div
                        key={message.$id}
                        className={
                            "message--wrapper" +
                            (message.user_id === user.$id ? ' message--owner' : '')
                        }
                    >
                        <div className="message--header">
                            <p className=' font-extrabold text-blue-500'>
                                {message?.username ? (
                                    <span className="username "> {message?.username}</span>
                                ) : (
                                    'Anonymous user'
                                )}
                                                               
                                                               
                            </p>
                            <div className="message-header">
                                    <small className="message-date">
                                        {new Date(message.$createdAt).toLocaleDateString([], {  month: 'numeric', day: 'numeric' })}
                                    </small>
                                    
                                </div>

                            
                        </div>
                        <div className='flex message-wrapper'>
  <div
    className={
      'message--body' + (message.user_id === user.$id ? ' message--body--owner' : '')
    }
  >
    <span>{message.body}</span>
  </div>
  
  <div className="message-footer">
    
    <small className="message-time">
      {new Date(message.$createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
    </small>

    {message.$permissions.includes(`delete("user:${user.$id}")`) && (
      <Trash2
        className="delete--btn"
        onClick={() => deleteMessage(message.$id)}
      />
    )}
  </div>
</div>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>

            <form id="message--form" onSubmit={handleSubmit}>
                <div className="message--input">
                    <textarea
                        required
                        maxLength="250"
                        placeholder="Type a message..."
                        onChange={(e) => setMessageBody(e.target.value)}
                        value={messageBody}
                    ></textarea>
                    <button className="btn--send" type="submit">
                        Send
                    </button>
                </div>
            </form>
        </main>
    );
};

export default Room;
