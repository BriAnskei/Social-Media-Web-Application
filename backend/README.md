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

# Backend Development Notes

## Express.js Request Data Handling

### Understanding Express Request Objects

| Request Type       | Express Access              | Purpose                  | Why Not `req.body`?                |
| ------------------ | --------------------------- | ------------------------ | ---------------------------------- |
| Get resource by ID | `req.params.id`             | Extract ID from URL path | Data is in URL path, not body      |
| Search operations  | `req.query.q`               | Get search parameters    | GET requests don't support body    |
| Create/Update data | `req.body`                  | Access submitted data    | ✅ Correct place for new data      |
| Authentication     | `req.headers.authorization` | Get auth tokens          | Tokens belong in headers, not body |

### Detailed Request Data Mapping

| Where         | Used For                      | Example                         | Data Type              |
| ------------- | ----------------------------- | ------------------------------- | ---------------------- |
| `req.body`    | Creating/updating data        | `{ "name": "Brian" }`           | JSON or form data      |
| `req.params`  | Identifying specific resource | `/users/123` → `id = 123`       | String                 |
| `req.query`   | Filtering/sorting/pagination  | `/products?sort=price`          | String key-value pairs |
| `req.headers` | Authentication, metadata      | `Authorization: Bearer <token>` | String headers         |

### Example Route Implementations

```javascript
// GET /posts/:id - Get specific post
app.get("/posts/:id", (req, res) => {
  const postId = req.params.id; // From URL path
  // ... fetch post logic
});

// GET /search?q=react&category=tutorial
app.get("/search", (req, res) => {
  const query = req.query.q; // "react"
  const category = req.query.category; // "tutorial"
  // ... search logic
});

// POST /posts - Create new post
app.post("/posts", (req, res) => {
  const { title, content } = req.body; // From request body
  // ... create post logic
});

// Protected route with authentication
app.get("/protected", authenticateToken, (req, res) => {
  const token = req.headers.authorization; // "Bearer <token>"
  // ... protected logic
});
```

---

## Clean Architecture: Service Layer Pattern

### ✅ Best Practice: Implement Service Layer

Instead of calling one controller from another or directly manipulating models in controllers, use a dedicated service layer.

#### Benefits of Service Layer

- **Controllers stay thin** - only handle requests/responses
- **Logic centralization** - related business logic in one place
- **Avoid tight coupling** - controllers don't depend on each other
- **Better testability** - business logic can be tested independently

### Recommended Folder Structure

```
project/
├── controllers/
│   ├── conversation.controller.js
│   └── message.controller.js
├── services/
│   ├── conversation.service.js
│   └── message.service.js
├── models/
│   ├── Conversation.js
│   └── Message.js
└── routes/
    ├── conversation.routes.js
    └── message.routes.js
```

### Example Implementation

#### Service Layer

```javascript
// services/conversation.service.js
import Conversation from "../models/Conversation.js";

export const updateConversationOnNewMessage = async (
  conversationId,
  messageData
) => {
  return await Conversation.findByIdAndUpdate(
    conversationId,
    {
      lastMessage: messageData.content,
      lastMessageAt: new Date(),
      updatedAt: new Date(),
    },
    { new: true }
  );
};

export const getConversationById = async (conversationId) => {
  return await Conversation.findById(conversationId);
};

export const markConversationAsRead = async (conversationId, userId) => {
  return await Conversation.findByIdAndUpdate(
    conversationId,
    { $addToSet: { readBy: userId } },
    { new: true }
  );
};
```

#### Controller Implementation

```javascript
// controllers/message.controller.js
import { updateConversationOnNewMessage } from "../services/conversation.service.js";
import Message from "../models/Message.js";

export const sendMessage = async (req, res) => {
  try {
    const { conversationId, content } = req.body;

    // Create the message
    const newMessage = await Message.create({
      content,
      conversationId,
      senderId: req.user.id,
      createdAt: new Date(),
    });

    // Update the conversation using service
    await updateConversationOnNewMessage(conversationId, newMessage);

    res.status(201).json({
      success: true,
      message: newMessage,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};
```

### ⚠️ Anti-Patterns to Avoid

```javascript
// ❌ DON'T: Call controller from controller
import { updateConversation } from "./conversation.controller.js";

export const sendMessage = async (req, res) => {
  // ... message logic
  await updateConversation(req, res); // ❌ Tight coupling
};

// ❌ DON'T: Put business logic in controllers
export const sendMessage = async (req, res) => {
  // ❌ Too much business logic in controller
  const conversation = await Conversation.findById(conversationId);
  conversation.lastMessage = content;
  conversation.messageCount += 1;
  conversation.updatedAt = new Date();
  await conversation.save();

  // ❌ More complex logic that should be in service
  if (conversation.participants.length > 2) {
    // ... group chat logic
  }
};
```

---

## Socket.io and Event Management

### Understanding Event Systems

#### Node.js EventEmitter vs Socket.io Events

| System       | Purpose                     | Usage                                 | Scope            |
| ------------ | --------------------------- | ------------------------------------- | ---------------- |
| EventEmitter | Internal app communication  | `appEvents.emit()` / `appEvents.on()` | Server-side only |
| Socket.io    | Client-server communication | `socket.emit()` / `socket.on()`       | Client ↔ Server  |

### Common Misconception Fix

#### ❌ Problem: Mixing Event Systems

```javascript
// ❌ This won't work as expected
// In service:
appEvents.emit("createOrUpdate-contact", emitPayload);

// In socket handler:
socket.on("createOrUpdate-contact", (data) => {
  console.log(data); // This will NEVER execute
});
```

**Why it doesn't work:** `appEvents.emit()` only triggers `appEvents.on()` listeners, not socket listeners.

#### ✅ Solution Options

**Option 1: Direct Socket Emission**

```javascript
// services/contact.service.js
import { getIO } from "../socket/socket.js";

export const createOrUpdateContact = async (contactData) => {
  // ... business logic

  const io = getIO();
  io.emit("createOrUpdate-contact", emitPayload); // Notify all clients
};
```

**Option 2: EventEmitter Bridge Pattern**

```javascript
// events/appEvents.js
import { EventEmitter } from "events";
export const appEvents = new EventEmitter();

// services/contact.service.js
import { appEvents } from "../events/appEvents.js";

export const createOrUpdateContact = async (contactData) => {
  // ... business logic
  appEvents.emit("createOrUpdate-contact", emitPayload); // Internal event
};

// socket/socketHandler.js (or server setup)
import { appEvents } from "../events/appEvents.js";
import { getIO } from "./socket.js";

appEvents.on("createOrUpdate-contact", (data) => {
  console.log("createOrUpdateContact (appEvents)", data);

  const io = getIO();
  io.emit("createOrUpdate-contact", data); // Bridge to socket clients
});
```

### Advanced Socket.io Patterns

#### Room-Based Notifications (Future Implementation)

```javascript
// Future optimization for targeted notifications
const postNotificationRoom = `post-notification:${postId}`;

// Benefits:
// 1. Efficient Broadcasts - instead of individual notifications:
//    followers.forEach(follower => {
//      this.io.to(follower.socketId).emit(...) // ❌ Inefficient
//    });

// 2. Use room broadcasting:
//    this.io.to(postNotificationRoom).emit("post-notification", { ... }); // ✅ Efficient

// Implementation:
socket.join(postNotificationRoom); // User joins room when viewing post
this.io.to(postNotificationRoom).emit("post-notification", notificationData);
```

---

## Docker and Redis Setup

### Redis with Docker Compose

#### Quick Setup

```bash
# Run Redis via docker-compose
docker-compose up -d
```

#### What This Does:

- Downloads Redis image (if not already available)
- Starts Redis on port 6379
- Uses named volume `redis-data` for persistence

#### Verification

```bash
# Check if Redis is running
docker ps
```

You should see `redis:7.2` in the running containers list.

#### Basic Docker Compose Configuration

```yaml
# docker-compose.yml
version: "3.8"
services:
  redis:
    image: redis:7.2
    ports:
      - "6379:6379"
    volumes:
      - redis-data:/data

volumes:
  redis-data:
```

---

## Summary

### Key Takeaways

1. **React Components**: Always use PascalCase naming
2. **Clean Architecture**: Extract complex logic into custom hooks or utilities
3. **Function Arguments**: Use configuration objects for functions with multiple parameters
4. **Service Layer**: Keep controllers thin, use services for business logic
5. **Event Systems**: Understand the difference between EventEmitter and Socket.io
6. **Docker**: Use docker-compose for easy development environment setup

### Best Practices Checklist

- [ ] Component names use PascalCase
- [ ] Complex logic extracted from components
- [ ] Service layer implemented for business logic
- [ ] Controllers only handle request/response
- [ ] Event systems used appropriately
- [ ] Configuration objects used for multiple parameters
- [ ] Development environment containerized with Docker
