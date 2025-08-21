# Social Media App

A full-stack social media application where users can connect, share posts, and engage with each other through likes, comments, and real-time conversations.

![Homepage Screenshot](homepage-screenshot.png)

## ✨ Features

### Core Functionality

- **User Profiles**: Create and customize user profiles with profile pictures and bio
- **Follow System**: Follow and unfollow other users to build your network
- **Post Creation**: Upload and share posts with the community
- **Engagement**: Like and comment on posts from other users
- **Real-time Messaging**: Have conversations with other users via Socket.IO
- **Privacy Controls**: Set profile to private to control post visibility

### Notifications

Users receive real-time notifications for:

- New followers
- Likes on their posts
- Comments on their posts
- Direct messages

### Advanced Features

- **Content Filtering**: Filter content from profile pictures to conversations
- **Real-time Updates**: Live updates for posts, likes, comments, and messages
- **Desktop Application**: Optimized for desktop usage

## 🛠️ Tech Stack

### Frontend

- **React 18** - Modern React with hooks and functional components
- **TypeScript** - Type-safe development
- **Redux Toolkit** - State management
- **Material-UI** - Component library for consistent UI
- **Bootstrap** - Additional styling and layout
- **Socket.IO Client** - Real-time communication
- **React Router** - Client-side routing
- **Axios** - HTTP client for API calls
- **Vite** - Fast development build tool

### Backend

- **Node.js** with **Express** - Server framework
- **TypeScript** - Type-safe backend development
- **MongoDB** with **Mongoose** - Database and ODM
- **Socket.IO** - Real-time bidirectional communication
- **BullMQ** - Job queue for background processing
- **Redis** - Caching and session storage
- **JWT** - Authentication tokens
- **Multer** - File upload handling
- **bcrypt** - Password hashing

## 📦 Installation

### Prerequisites

- Node.js (v16 or higher)
- MongoDB
- Redis

### Clone the Repository

```bash
git clone <repository-url>
cd social-media-app
```

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

### Backend Setup

```bash
cd backend
npm install

# Start the main server
npm run server

# Start background workers
npm run worker
```

### Environment Variables

Create a `.env` file in the backend directory:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/socialmedia
JWT_SECRET=your_jwt_secret_here
REDIS_HOST=localhost
REDIS_PORT=6379
```

## 🚀 Usage

1. **Registration/Login**: Create an account or log in with existing credentials
2. **Profile Setup**: Upload a profile picture and add your bio
3. **Discover Users**: Find and follow other users
4. **Create Posts**: Share your thoughts, images, or updates
5. **Engage**: Like and comment on posts from users you follow
6. **Chat**: Send direct messages to other users
7. **Notifications**: Stay updated with real-time notifications

## 📱 Key Components

### Frontend Structure

- **Components**: Reusable UI components
- **Pages**: Main application pages (Home, Profile, Messages)
- **Store**: Redux store configuration and slices
- **Services**: API service functions
- **Utils**: Helper functions and utilities

### Backend Structure

- **Routes**: API endpoint definitions
- **Models**: MongoDB schemas
- **Controllers**: Request handling logic
- **Middleware**: Authentication and validation
- **Workers**: Background job processors
- **Socket**: Real-time event handlers

## 🔧 Scripts

### Frontend

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run lint` - Run ESLint
- `npm run preview` - Preview production build

### Backend

- `npm run server` - Start development server with nodemon
- `npm run build` - Compile TypeScript to JavaScript
- `npm start` - Start production server
- `npm run worker` - Start background workers

## 🌟 Background Processing

The application uses BullMQ for handling background tasks:

- **Comment Notifications**: Process comment notification jobs
- **Like Notifications**: Handle like notification jobs
- **Message Processing**: Manage message delivery
- **Upload Processing**: Handle file uploads
- **General Workers**: Process various background tasks

## 🔒 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Input validation and sanitization
- CORS configuration
- Private profile settings

## 📊 Real-time Features

- Live notifications
- Real-time messaging
- Live post updates
- Instant like/comment updates

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🐛 Known Issues

- File upload size limitations
- Desktop-only design (mobile responsiveness not implemented)
- Redis connection handling in production

## 🔮 Future Enhancements

- Mobile responsive design
- Story/Status feature
- Video post support
- Advanced search functionality
- User blocking/reporting system
- Dark mode support
- Mobile app development

## 📞 Support

If you encounter any issues or have questions, please open an issue in the repository.

---

**Built with ❤️ using React, Express, and modern web technologies**
