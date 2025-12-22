# devConnect - Backend

> RESTful API and WebSocket server for devConnect professional networking platform

![Node.js](https://img.shields.io/badge/Node.js-20+-339933?logo=node.js)
![Express](https://img.shields.io/badge/Express-5.1-000000?logo=express)
![MongoDB](https://img.shields.io/badge/MongoDB-8.16-47A248?logo=mongodb)
![Socket.IO](https://img.shields.io/badge/Socket.IO-4.8-010101?logo=socket.io)

## 🌟 Features

### Core API
- **🔐 Authentication** - JWT-based auth with bcrypt password hashing
- **👤 User Management** - CRUD operations for user profiles
- **🤝 Connection System** - Send, accept, reject connection requests
- **💬 Real-time Chat** - Socket.IO powered messaging
- **🔔 Notification System** - Real-time and persistent notifications
- **📊 Feed Generation** - Smart user discovery algorithm

### Advanced Features
- **Offline Notification Support** - Unread counts persist in database
- **Socket Connection Tracking** - User online/offline status
- **Smart Notification Routing** - Only notify when user is not in chat
- **Secure Routes** - Protected endpoints with JWT middleware
- **CORS Configuration** - Secure cross-origin requests

## 🚀 Tech Stack

### Runtime & Framework
- **Node.js** - JavaScript runtime
- **Express 5.1** - Web application framework
- **Nodemon 3.1** - Development auto-reload

### Database
- **MongoDB 8.16** - NoSQL database
- **Mongoose 8.16** - MongoDB object modeling

### Authentication & Security
- **JWT (jsonwebtoken 9.0)** - Token-based authentication
- **bcrypt 6.0** - Password hashing
- **cookie-parser 1.4** - Cookie parsing middleware
- **validator 13.15** - Input validation

### Real-time Communication
- **Socket.IO 4.8** - WebSocket server for real-time features

### Configuration
- **dotenv 17.2** - Environment variable management
- **cors 2.8** - Cross-Origin Resource Sharing

## 📁 Project Structure

```
dev_tinder_be/
├── src/
│   ├── models/              # Mongoose models
│   │   ├── user.js         # User schema
│   │   ├── connectionRequest.js # Connection requests
│   │   └── chat.js         # Chat with unread counts
│   │
│   ├── routes/             # API routes
│   │   ├── auth.js         # Authentication routes
│   │   ├── profile.js      # Profile management
│   │   ├── user.js         # User operations
│   │   ├── request.js      # Connection requests
│   │   ├── chat.js         # Chat endpoints
│   │   └── forgetPassword.js # Password reset
│   │
│   ├── middlewares/        # Custom middleware
│   │   └── auth.js         # JWT authentication
│   │
│   ├── utils/              # Utilities
│   │   ├── socket.js       # Socket.IO configuration
│   │   └── validation.js   # Input validation
│   │
│   ├── config/             # Configuration
│   │   └── database.js     # MongoDB connection
│   │
│   └── app.js              # Main application file
│
├── .env                    # Environment variables
├── package.json
└── README.md
```

## 🛠️ Installation

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (local or Atlas)
- npm or yarn

### Setup

1. **Clone the repository**
```bash
git clone https://github.com/Prince6626/devConnect-be.git
cd devConnect-be
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment variables**
Create a `.env` file in the root directory:
```env
# Database
MONGODB_URI=mongodb://localhost:27017/devconnect
# or for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/devconnect

# JWT Secret
JWT_SECRET=your_super_secret_jwt_key_here

# Server Port
PORT=3000

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:5173
```

4. **Start development server**
```bash
npm run dev
```

The server will be available at `http://localhost:3000`

## 📜 Available Scripts

- `npm run dev` - Start development server with nodemon
- `npm test` - Run tests (to be implemented)

## 🗄️ Database Models

### User Model
```javascript
{
  firstName: String (required),
  lastName: String,
  emailId: String (required, unique),
  password: String (required),
  age: Number,
  gender: String (enum: male/female/others),
  photoUrl: String,
  about: String,
  skills: [String]
}
```

### Connection Request Model
```javascript
{
  fromUserId: ObjectId (ref: User),
  toUserId: ObjectId (ref: User),
  status: String (enum: interested/ignored/accepted/rejected)
}
```

### Chat Model
```javascript
{
  participants: [ObjectId] (ref: User),
  messages: [{
    senderId: ObjectId (ref: User),
    text: String,
    timestamps: true
  }],
  unreadCount: Map<userId, count> // For offline notifications
}
```

## 🔌 API Endpoints

### Authentication
```
POST   /signup              - Register new user
POST   /login               - User login
POST   /logout              - User logout
```

### Profile
```
GET    /profile/view        - Get current user profile
PATCH  /profile/edit        - Update user profile
```

### User Operations
```
GET    /user/feed           - Get user feed
GET    /user/connections    - Get user connections
GET    /user/requests/recieved - Get connection requests
```

### Connection Requests
```
POST   /request/send/:status/:toUserId - Send connection request
POST   /request/review/:status/:requestId - Review request
```

### Chat
```
GET    /chat/:targetUserId  - Get chat messages (clears unread count)
GET    /chat/unread/all     - Get all unread message counts
```

### Password Reset
```
POST   /forgetPassword      - Request password reset
```

## 🔌 WebSocket Events

### Client → Server
```javascript
// Register user for notifications
socket.emit('registerUser', { userId })

// Join chat room
socket.emit('joinChat', { userId, targetUserId })

// Send message
socket.emit('sendMessage', { 
  userId, 
  targetUserId, 
  firstName, 
  photoUrl, 
  text 
})
```

### Server → Client
```javascript
// Receive message in chat
socket.on('messageRecieved', { firstName, text, photoUrl })

// Receive notification (when not in chat)
socket.on('messageNotification', { senderId, senderName, text })
```

## 🔔 Notification System

### Architecture

**Database Layer**
- Unread counts stored in Chat model as Map
- Persists across sessions
- Incremented on message send

**Socket Layer**
- Tracks user connections (userId → socketId)
- Emits real-time notifications
- Only notifies if user not in active chat

**API Layer**
- `GET /chat/unread/all` - Fetch all unread counts
- `GET /chat/:userId` - Auto-clears unread count

### Flow
```
Message Sent
    ↓
Increment DB unread count
    ↓
Check if target user online
    ↓
If online but NOT in chat → Emit notification
    ↓
If offline → Count persists in DB
    ↓
User logs in → Fetches unread counts
```

## 🔒 Security

### Authentication
- JWT tokens stored in HTTP-only cookies
- Passwords hashed with bcrypt (10 rounds)
- Protected routes with auth middleware

### Validation
- Input validation with validator library
- Custom validation for emails, passwords
- Mongoose schema validation

### CORS
- Configured for specific frontend origin
- Credentials enabled for cookies

## 🚀 Deployment

### Environment Setup
```bash
# Production environment variables
NODE_ENV=production
MONGODB_URI=your_production_mongodb_uri
JWT_SECRET=your_production_secret
FRONTEND_URL=https://your-frontend-domain.com
```

### Deploy to Heroku
```bash
heroku create devconnect-api
git push heroku main
heroku config:set MONGODB_URI=your_uri
heroku config:set JWT_SECRET=your_secret
```

### Deploy to Railway
```bash
railway login
railway init
railway up
```

### Deploy to Render
1. Connect GitHub repository
2. Set environment variables
3. Deploy

## 🧪 Testing

### Manual Testing with Postman
Import the API collection (to be added) and test endpoints.

### Automated Testing
```bash
npm test
```
(Test suite to be implemented)

## 📊 Performance Optimization

- **Database Indexing** - Indexed fields for faster queries
- **Connection Pooling** - MongoDB connection pool
- **Socket.IO Rooms** - Efficient message routing
- **Map Data Structure** - O(1) unread count lookups

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the ISC License.

## 👨‍💻 Author

**Prince Patel**

## 🔗 Related Projects

- [devConnect Frontend](https://github.com/Prince6626/devConnect-fe) - React frontend application

## 🙏 Acknowledgments

- Express.js team for the robust framework
- MongoDB team for the flexible database
- Socket.IO team for real-time capabilities
- Open source community for amazing packages

---

**Note**: Make sure MongoDB is running before starting the server.
