# TeleChat - Telegram-like Chat Application

A modern, real-time chat application built with React and Appwrite, featuring group chats, direct messaging, and a Telegram-inspired UI.

## Features

- 🚀 Real-time messaging with Appwrite
- 💬 Global chat, group chats, and direct messaging
- 👥 User profiles and online status
- ⌨️ Typing indicators
- 📱 Responsive design (mobile-friendly)
- 🎨 Modern Telegram-like UI
- 🔐 User authentication and authorization

## Setup Instructions

### 1. Clone and Install Dependencies

```bash
git clone <your-repo-url>
cd ChatApp
npm install
```

### 2. Set up Appwrite Project

1. Create an account at [Appwrite Cloud](https://cloud.appwrite.io)
2. Create a new project
3. Go to Database and create a new database
4. Create the following collections with their attributes:

#### Collection: `messages`
- `user_id` (string, required)
- `username` (string, required) 
- `body` (string, required)
- `group_id` (string, optional)

#### Collection: `groups`
- `name` (string, required)
- `created_by` (string, required)
- `created_at` (datetime, required)

#### Collection: `dm_messages`
- `sender_id` (string, required)
- `sender_name` (string, required)
- `receiver_id` (string, required)
- `body` (string, required)
- `is_read` (boolean, default: false)

#### Collection: `group_members`
- `user_id` (string, required)
- `group_id` (string, required)
- `role` (string, required, default: "member")
- `joined_at` (datetime, required)

#### Collection: `users`
- `name` (string, required)
- `email` (string, required)
- `is_online` (boolean, default: false)
- `last_seen` (datetime, required)
- `avatar_url` (string, optional)
- `bio` (string, optional)

#### Collection: `typing_status`
- `user_id` (string, required)
- `chat_id` (string, required)
- `chat_type` (string, required)
- `updated_at` (datetime, required)

#### Collection: `contacts`
- `user_id` (string, required)
- `contact_id` (string, required)
- `added_at` (datetime, required)
- `status` (string, required, default: "active")

### 3. Configure Permissions

For each collection, set the following permissions:

**Create permissions:** Any authenticated user
**Read permissions:** Any authenticated user  
**Update permissions:** Document owner (for messages) or Any authenticated user (for typing_status)
**Delete permissions:** Document owner

### 4. Environment Variables

1. Copy `.env.example` to `.env`
2. Fill in your Appwrite project details:

```env
VITE_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
VITE_PROJECT_ID=your_project_id
VITE_DATABASE_ID=your_database_id
VITE_COLLECTION_ID_MESSAGES=your_messages_collection_id
VITE_COLLECTION_ID_GROUPS=your_groups_collection_id
VITE_COLLECTION_ID_DM_MESSAGES=your_dm_messages_collection_id
VITE_COLLECTION_ID_GROUP_MEMBERS=your_group_members_collection_id
VITE_COLLECTION_ID_USERS=your_users_collection_id
VITE_COLLECTION_ID_TYPING_STATUS=your_typing_status_collection_id
VITE_COLLECTION_ID_CONTACTS=your_contacts_collection_id
```

### 5. Run the Application

```bash
npm run dev
```

## Usage

1. **Register/Login:** Create an account or log in with existing credentials
2. **Global Chat:** Join the global chat room where everyone can participate
3. **Create Groups:** Create private group chats and invite members
4. **Direct Messages:** Send private messages to other users
5. **Real-time Features:** Enjoy real-time messaging, typing indicators, and online status

## Architecture

- **Frontend:** React with Vite
- **Backend:** Appwrite (BaaS)
- **Real-time:** Appwrite Realtime subscriptions
- **Authentication:** Appwrite Auth
- **Database:** Appwrite Database
- **Styling:** Custom CSS (no external UI libraries)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - feel free to use this project for learning or production!
