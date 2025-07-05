# Contact Management Feature

## Overview

The ChatApp now includes a comprehensive contact management system that allows users to:

1. **Search for users** by name or email
2. **Add contacts** to their personal contact list
3. **View their contacts** in a dedicated tab
4. **Start direct messages** with their contacts

## How to Add Contacts

### For Users:

1. **Open the Contacts Tab**
   - Click on the "Contacts" tab in the sidebar (third tab with Users icon)

2. **Add New Contact**
   - Click the "Add Contact" button at the bottom of the contacts section
   - This opens the "Add New Contact" modal

3. **Search for Users**
   - Type at least 2 characters in the search box
   - Search by name or email address
   - Results will appear automatically (debounced search)

4. **Add a Contact**
   - Click the "+" button next to any user in the search results
   - The button will turn green with a checkmark to confirm addition
   - The user will be added to your contacts list
   - You can now start a direct message with them

### Features:

- **Real-time Search**: Search is debounced (500ms delay) for better performance
- **Duplicate Prevention**: Cannot add the same contact twice
- **Visual Feedback**: Loading states, success animations, and error handling
- **Mobile Responsive**: Works perfectly on mobile devices
- **Instant Updates**: Added contacts appear immediately in your contacts list

## Technical Implementation

### New Collections Required:

**contacts**
- `user_id` (string, required) - The user who added the contact
- `contact_id` (string, required) - The user being added as contact  
- `added_at` (datetime, required) - When the contact was added
- `status` (string, required, default: "active") - Contact status

### New API Functions:

- `addContact(userId, contactId)` - Add a new contact
- `removeContact(userId, contactId)` - Remove a contact
- `getUserContacts(userId)` - Get user's contact list
- `searchUsers(searchTerm, currentUserId)` - Search for users

### Components Added:

- **AddContactModal**: Modal for searching and adding contacts
- **Contact management in Sidebar**: Display contacts and add contact button

### Updated Components:

- **Sidebar**: Now fetches and displays user's actual contacts
- **Room**: Removed getAllUsers contact fetching (now handled in Sidebar)
- **appwriteConfig**: Added contact management functions

## Database Setup

Add this collection to your Appwrite database:

### Collection: `contacts`
```
Attributes:
- user_id (string, required)
- contact_id (string, required)  
- added_at (datetime, required)
- status (string, required, default: "active")

Permissions:
- Create: Any authenticated user
- Read: Any authenticated user
- Update: Document owner
- Delete: Document owner
```

### Environment Variables

Add to your `.env` file:
```
VITE_COLLECTION_ID_CONTACTS=your_contacts_collection_id
```

## Usage Flow

1. User opens Contacts tab
2. User clicks "Add Contact" 
3. Modal opens with search functionality
4. User types name/email to search
5. Search results appear with user info
6. User clicks "+" to add contact
7. Contact is added to database and appears in contacts list
8. User can click on contact to start DM conversation

## Benefits

- **Better User Experience**: Users only see their actual contacts, not all users
- **Privacy**: Users control who they want to add as contacts
- **Organized**: Clean separation between contacts and groups
- **Scalable**: Works efficiently even with large user bases
- **Telegram-like**: Matches familiar contact management patterns

## Future Enhancements

- Contact removal functionality
- Contact blocking/unblocking
- Contact status (online/offline/last seen)
- Contact nicknames/custom names
- Contact organization (favorites, groups)
- Contact import from phone/email
