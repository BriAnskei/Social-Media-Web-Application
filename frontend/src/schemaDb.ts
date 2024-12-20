posconst mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }, // hashed
  profilePicture: { type: String, default: "" }, // URL to profile picture
  bio: { type: String, maxLength: 160 }, // Optional bio
  followers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], // Followers
  following: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], // Following
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("User", userSchema);



const mongoose = require("mongoose");

const postSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // Post author
  content: { type: String, required: true }, // Text of the post
  image: { type: String, default: "" }, // Optional image in the post
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], // Users who liked the post
  comments: [
    {
      user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      content: { type: String, required: true },
      createdAt: { type: Date, default: Date.now },
    },
  ],
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Post", postSchema);


const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
  receiver: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // Notification recipient
  sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // Notification sender
  type: { 
    type: String, 
    enum: ["like", "comment", "follow"], 
    required: true 
  }, // Type of notification
  post: { type: mongoose.Schema.Types.ObjectId, ref: "Post" }, // Optional, for post-related notifications
  message: { type: String }, // Optional message
  read: { type: Boolean, default: false }, // Whether the notification has been read
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Notification", notificationSchema);



const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
  sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  receiver: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  content: { type: String, required: true },
  isRead: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Message", messageSchema);


const mongoose = require("mongoose");

const feedSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  posts: [{ type: mongoose.Schema.Types.ObjectId, ref: "Post" }], // List of posts in the feed
  lastUpdated: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Feed", feedSchema);
