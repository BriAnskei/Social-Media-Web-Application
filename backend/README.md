# Node.js Web Architecture Best Practices

## Request Object Properties

| Property     | Used For                        | Example                   | Data Type        |
| ------------ | ------------------------------- | ------------------------- | ---------------- |
| `req.body`   | Creating/updating data          | `{ "name": "Brian" }`     | JSON or form     |
| `req.params` | Identifying a specific resource | `/users/123` → `id = 123` | String           |
| `req.query`  | Filtering/sorting/pagination    | `/products?sort=price`    | String key-value |

## Service Layer Pattern

### ✅ Best Practice: Create a Service Layer Between Controllers and Models

Instead of calling controller functions directly from other controllers or accessing models directly, create a dedicated service layer.

### Benefits

- Controllers remain thin (just handling HTTP requests/responses)
- Business logic is centralized
- Avoids tight coupling between components
- Easier to test and maintain

### Folder Structure

```
├── controllers/
│   ├── conversation.controller.js
│   └── message.controller.js
├── services/
│   └── conversation.service.js
└── models/
    ├── Conversation.js
    └── Message.js
```

### Example Implementation

**conversation.service.js**

```javascript
import Conversation from "../models/Conversation.js";

export const updateConversationOnNewMessage = async (
  conversationId,
  messageData
) => {
  return await Conversation.findByIdAndUpdate(
    conversationId,
    {
      lastMessage: messageData.content,
      updatedAt: new Date(),
    },
    { new: true }
  );
};

export const getConversations = async (userId) => {
  return await Conversation.find({ participants: userId })
    .sort({ updatedAt: -1 })
    .populate("participants", "username avatar");
};
```

**message.controller.js**

```javascript
import Message from "../models/Message.js";
import { updateConversationOnNewMessage } from "../services/conversation.service.js";

export const sendMessage = async (req, res) => {
  try {
    const { conversationId, content } = req.body;
    const userId = req.user._id; // Assuming auth middleware

    // Save the message
    const newMessage = await Message.create({
      conversation: conversationId,
      sender: userId,
      content,
    });

    // Update the conversation via service layer
    await updateConversationOnNewMessage(conversationId, newMessage);

    res.status(201).json(newMessage);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to send message", error: error.message });
  }
};
```

**conversation.controller.js**

```javascript
import { getConversations } from "../services/conversation.service.js";

export const getUserConversations = async (req, res) => {
  try {
    const userId = req.user._id; // Assuming auth middleware

    // Use service layer to get data
    const conversations = await getConversations(userId);

    res.status(200).json(conversations);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to fetch conversations", error: error.message });
  }
};
```

## ⚠️ Anti-Pattern: Controller-to-Controller Calls

### Why to Avoid

- Controllers should only handle HTTP requests/responses
- Direct controller dependencies create tight coupling
- Makes testing more difficult
- Confuses responsibility boundaries

### ❌ Bad Example

```javascript
// Don't do this!
import { updateConversation } from "./conversation.controller.js";

export const sendMessage = async (req, res) => {
  // ...message logic...

  // Direct controller-to-controller call
  await updateConversation(req, res); // BAD!

  // ...
};
```

## Event-Based Communication

### Using EventEmitter vs Socket.io

Node.js has two common event systems that are often confused:

1. **Node.js EventEmitter** - For internal application events
2. **Socket.io** - For client-server real-time communication

### EventEmitter Pattern (Server-Side Only)

**events.js**

```javascript
import { EventEmitter } from "events";
export const appEvents = new EventEmitter();
```

**contact.service.js**

```javascript
import { appEvents } from "./events.js";

export const createContact = async (contactData) => {
  // Save contact to database
  const contact = await Contact.create(contactData);

  // Emit internal event
  appEvents.emit("createOrUpdate-contact", {
    type: "create",
    data: contact,
  });

  return contact;
};
```

**server.js**

```javascript
import { appEvents } from "./events.js";
import { io } from "./socket.js";

// Listen for internal events and broadcast to clients
appEvents.on("createOrUpdate-contact", (payload) => {
  console.log("Contact created/updated:", payload);

  // Now broadcast to all connected clients using socket.io
  io.emit("contact-changed", payload);
});
```

### Socket.io Room Pattern

For efficient notifications to multiple clients:

```javascript
// Setting up a notification room
const postNotificationRoom = `post-notification:${postId}`;

// When a user follows a post
socket.join(postNotificationRoom);

// Broadcasting to all followers of a post
io.to(postNotificationRoom).emit("post-notification", {
  postId,
  action: "updated",
  data: updatedPost,
});
```

## Socket.io Connection Example

```javascript
// socket.js
import { Server } from "socket.io";

export const setupSocketIO = (httpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL,
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log(`User connected: ${socket.id}`);

    // Handle client-to-server events
    socket.on("join-conversation", (conversationId) => {
      socket.join(`conversation:${conversationId}`);
      console.log(`${socket.id} joined conversation ${conversationId}`);
    });

    socket.on("disconnect", () => {
      console.log(`User disconnected: ${socket.id}`);
    });
  });

  return io;
};
```

## Summary of Best Practices

1. Use a service layer to separate business logic from controllers
2. Keep controllers focused only on HTTP request/response handling
3. Use EventEmitter for internal application communication
4. Use Socket.io for client-server real-time communication
5. Organize your code by responsibility with clear folder structure

# 📝 Note on Mongoose timestamps Option

In the MessageSchema, the line:

```typescript
{
  timestamps: true;
}
```

automatically adds the following fields to every document:

- **createdAt**: Timestamp when the document is first created.
- **updatedAt**: Timestamp when the document is last updated (initially the same as createdAt, but automatically updated by Mongoose on future updates).

These fields are not explicitly defined in the schema, but Mongoose manages them internally when `timestamps: true` is used.

## ✅ Example Output:

```json
{
  "createdAt": "2025-06-14T10:48:38.245Z",
  "updatedAt": "2025-06-14T10:48:38.245Z"
}
```

## 🔧 To customize:

**Only include createdAt:**

```typescript
{ timestamps: { createdAt: true, updatedAt: false } }
```

**Disable both:**
Remove or omit the timestamps option.
