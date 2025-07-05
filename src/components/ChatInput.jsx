import React, { useState, useRef } from 'react';
import { Send, Paperclip, Smile, Image, Mic, File, MapPin, X } from 'react-feather';
import './ChatInput.css';

const ChatInput = ({ onSendMessage, onTyping }) => {
    const [message, setMessage] = useState('');
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [isRecording, setIsRecording] = useState(false);
    const fileInputRef = useRef(null);
    const imageInputRef = useRef(null);

    const handleInputChange = (e) => {
        setMessage(e.target.value);
        if (onTyping && e.target.value.length > 0) {
            onTyping();
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (message.trim() === '' && selectedFiles.length === 0) return;
        
        onSendMessage(message, selectedFiles);
        setMessage('');
        setSelectedFiles([]);
    };

    const handleEmojiClick = (emoji) => {
        setMessage(prev => prev + emoji);
        setShowEmojiPicker(false);
    };

    const handleFileSelect = (e) => {
        const files = Array.from(e.target.files);
        setSelectedFiles(prev => [...prev, ...files]);
        setShowAttachmentMenu(false);
    };

    const removeFile = (index) => {
        setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    };

    const handleAttachmentClick = (type) => {
        switch(type) {
            case 'photo':
                imageInputRef.current.click();
                break;
            case 'file':
                fileInputRef.current.click();
                break;
            case 'location':
                console.log('Location sharing not implemented');
                break;
            case 'voice':
                handleVoiceRecording();
                break;
            default:
                break;
        }
        setShowAttachmentMenu(false);
    };

    const handleVoiceRecording = () => {
        if (!isRecording) {
            setIsRecording(true);
            console.log('Voice recording started');
        } else {
            setIsRecording(false);
            console.log('Voice recording stopped');
        }
    };

    const emojis = ['😊', '👍', '❤️', '🎉', '😂', '🔥', '👏', '🙏', '😍', '🤔', '😢', '😮', '🎶', '🌟', '💯', '👋'];

    return (
        <div className="chat-input-container">
            {/* File preview */}
            {selectedFiles.length > 0 && (
                <div className="file-preview-container">
                    {selectedFiles.map((file, index) => (
                        <div key={index} className="file-preview-item">
                            {file.type.startsWith('image/') ? (
                                <img 
                                    src={URL.createObjectURL(file)} 
                                    alt="Preview"
                                    className="file-preview-image"
                                />
                            ) : (
                                <div className="file-preview-file">
                                    <File size={24} />
                                    <span>{file.name}</span>
                                </div>
                            )}
                            <button 
                                className="file-remove-button"
                                onClick={() => removeFile(index)}
                            >
                                <X size={16} />
                            </button>
                        </div>
                    ))}
                </div>
            )}

            <form className="chat-input-form" onSubmit={handleSubmit}>
                <button 
                    type="button" 
                    className="input-button"
                    onClick={() => {
                        setShowAttachmentMenu(!showAttachmentMenu);
                        setShowEmojiPicker(false);
                    }}
                >
                    <Paperclip size={20} />
                </button>
                
                <div className="input-wrapper">
                    <input
                        type="text"
                        placeholder="Type a message..."
                        value={message}
                        onChange={handleInputChange}
                        maxLength={1000}
                    />
                </div>
                
                <button 
                    type="button" 
                    className="input-button"
                    onClick={() => {
                        setShowEmojiPicker(!showEmojiPicker);
                        setShowAttachmentMenu(false);
                    }}
                >
                    <Smile size={20} />
                </button>
                
                {message.trim() || selectedFiles.length > 0 ? (
                    <button 
                        type="submit" 
                        className="send-button active"
                    >
                        <Send size={20} />
                    </button>
                ) : (
                    <button 
                        type="button" 
                        className={`input-button voice-button ${isRecording ? 'recording' : ''}`}
                        onClick={handleVoiceRecording}
                    >
                        <Mic size={20} />
                    </button>
                )}
            </form>

            {/* Hidden file inputs */}
            <input 
                type="file"
                ref={fileInputRef}
                style={{ display: 'none' }}
                accept="*/*"
                multiple
                onChange={handleFileSelect}
            />
            
            <input 
                type="file"
                ref={imageInputRef}
                style={{ display: 'none' }}
                accept="image/*,video/*"
                multiple
                onChange={handleFileSelect}
            />
            
            {showEmojiPicker && (
                <div className="emoji-picker-container">
                    <div className="emoji-categories">
                        <button className="emoji-category active">Smileys</button>
                        <button className="emoji-category">Recent</button>
                        <button className="emoji-category">Objects</button>
                    </div>
                    <div className="emoji-grid">
                        {emojis.map((emoji, index) => (
                            <button 
                                key={index} 
                                className="emoji-button"
                                onClick={() => handleEmojiClick(emoji)}
                            >
                                {emoji}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {showAttachmentMenu && (
                <div className="attachment-menu">
                    <button 
                        className="attachment-option photo"
                        onClick={() => handleAttachmentClick('photo')}
                    >
                        <Image size={24} />
                        <span>Photo & Video</span>
                    </button>
                    <button 
                        className="attachment-option file"
                        onClick={() => handleAttachmentClick('file')}
                    >
                        <File size={24} />
                        <span>Document</span>
                    </button>
                    <button 
                        className="attachment-option location"
                        onClick={() => handleAttachmentClick('location')}
                    >
                        <MapPin size={24} />
                        <span>Location</span>
                    </button>
                </div>
            )}
        </div>
    );
};

export default ChatInput;
