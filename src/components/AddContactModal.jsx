import React, { useState, useEffect } from 'react';
import { Search, UserPlus, X, Check, AlertCircle } from 'react-feather';
import { searchUsers, addContact } from '../appwriteConfig';
import { useAuth } from '../utils/AuthContext';
import './AddContactModal.css';

const AddContactModal = ({ isOpen, onClose, onContactAdded }) => {
    const { user } = useAuth();
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [addingContactId, setAddingContactId] = useState(null);
    const [addedContacts, setAddedContacts] = useState(new Set());
    const [error, setError] = useState('');
    const [searchTimeout, setSearchTimeout] = useState(null);

    const handleSearch = async (term) => {
        if (term.trim().length < 2) {
            setSearchResults([]);
            setError('');
            return;
        }

        setIsSearching(true);
        setError('');
        try {
            const results = await searchUsers(term, user.$id);
            console.log('Search results:', results); // Debug log
            setSearchResults(results || []);
        } catch (error) {
            console.error('Error searching users:', error);
            setError('Failed to search users. Please try again.');
            setSearchResults([]);
        } finally {
            setIsSearching(false);
        }
    };

    const handleSearchChange = (e) => {
        const value = e.target.value;
        setSearchTerm(value);

        // Debounce search
        if (searchTimeout) {
            clearTimeout(searchTimeout);
        }

        const timeout = setTimeout(() => {
            handleSearch(value);
        }, 500);
        setSearchTimeout(timeout);
    };

    const handleAddContact = async (contactUser) => {
        setAddingContactId(contactUser.$id);
        setError('');
        
        try {
            await addContact(user.$id, contactUser.$id);
            
            // Mark as added
            setAddedContacts(prev => new Set([...prev, contactUser.$id]));
            
            // Remove from search results
            setSearchResults(prev => prev.filter(u => u.$id !== contactUser.$id));
            
            // Notify parent component
            if (onContactAdded) {
                onContactAdded(contactUser);
            }

            // Show success state briefly
            setTimeout(() => {
                setAddingContactId(null);
            }, 1500);
        } catch (error) {
            console.error('Error adding contact:', error);
            setError(error.message || 'Failed to add contact. Please try again.');
            setAddingContactId(null);
        }
    };

    const handleClose = () => {
        setSearchTerm('');
        setSearchResults([]);
        setAddingContactId(null);
        setAddedContacts(new Set());
        setError('');
        if (searchTimeout) {
            clearTimeout(searchTimeout);
        }
        onClose();
    };

    // Clear error after 5 seconds
    useEffect(() => {
        if (error) {
            const timer = setTimeout(() => setError(''), 5000);
            return () => clearTimeout(timer);
        }
    }, [error]);

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={handleClose}>
            <div className="add-contact-modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>Add New Contact</h2>
                    <button className="close-button" onClick={handleClose}>
                        <X size={20} />
                    </button>
                </div>

                <div className="modal-content">
                    <div className="search-section">
                        <div className="search-input-container">
                            <Search className="search-icon" size={18} />
                            <input
                                type="text"
                                placeholder="Search by name or email..."
                                value={searchTerm}
                                onChange={handleSearchChange}
                                className="search-input"
                                autoFocus
                            />
                        </div>
                    </div>

                    <div className="search-results">
                        {error && (
                            <div className="error-message">
                                <AlertCircle size={16} />
                                <span>{error}</span>
                            </div>
                        )}

                        {isSearching && (
                            <div className="loading-state">
                                <div className="spinner"></div>
                                <span>Searching...</span>
                            </div>
                        )}

                        {!isSearching && !error && searchTerm.length >= 2 && searchResults.length === 0 && (
                            <div className="no-results">
                                <div className="no-results-icon">👤</div>
                                <h3>No users found</h3>
                                <p>Try searching with a different name or email.</p>
                            </div>
                        )}

                        {!isSearching && !error && searchTerm.length < 2 && (
                            <div className="search-hint">
                                <div className="search-hint-icon">🔍</div>
                                <h3>Search for Users</h3>
                                <p>Enter at least 2 characters to search for users by name or email.</p>
                            </div>
                        )}

                        {!error && searchResults.length > 0 && (
                            <div className="user-list">
                                {searchResults.map((searchUser) => {
                                    const isAdding = addingContactId === searchUser.$id;
                                    const isAdded = addedContacts.has(searchUser.$id);
                                    
                                    return (
                                        <div key={searchUser.$id} className="user-item">
                                            <div className="user-avatar">
                                                {searchUser.name?.charAt(0).toUpperCase() || '?'}
                                            </div>
                                            <div className="user-info">
                                                <h4>{searchUser.name || 'Unknown User'}</h4>
                                                <p>{searchUser.email}</p>
                                            </div>
                                            <button
                                                className={`add-contact-button ${isAdding ? 'adding' : ''} ${isAdded ? 'added' : ''}`}
                                                onClick={() => !isAdding && !isAdded && handleAddContact(searchUser)}
                                                disabled={isAdding || isAdded}
                                                title={isAdded ? 'Contact added' : isAdding ? 'Adding...' : 'Add contact'}
                                            >
                                                {isAdded ? (
                                                    <Check size={16} className="success-icon" />
                                                ) : isAdding ? (
                                                    <div className="adding-spinner"></div>
                                                ) : (
                                                    <UserPlus size={16} />
                                                )}
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AddContactModal;
