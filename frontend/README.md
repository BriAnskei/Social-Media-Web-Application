# Developer Notes: Node.js, MongoDB, React & Redux Best Practices

## Table of Contents

- [File Handling in Node.js](#file-handling-in-nodejs)
- [Safe Data Iteration](#safe-data-iteration)
- [Redux Toolkit: Async Thunk & Loading State](#redux-toolkit-async-thunk--loading-state)
- [CSS Positioning Notes](#css-positioning-notes)
- [MongoDB Best Practices](#mongodb-best-practices)
- [Redux Best Practices](#redux-best-practices)
- [Component Placement](#component-placement)
- [Redux Toolkit: Understanding action.meta.arg](#redux-toolkit-understanding-actionmetaarg)
- [MongoDB Compound Indexing](#mongodb-compound-indexing)
- [MongoDB Storage: Memory vs Disk](#mongodb-storage-memory-vs-disk)
- [MongoDB Indexing Best Practices](#mongodb-indexing-best-practices)
- [TypeScript Error Fixes](#typescript-error-fixes)
- [Testing API Routes in Postman](#testing-api-routes-in-postman)

## File Handling in Node.js

### Creating Upload Directories

```javascript
const fs = require("fs");
fs.mkdirSync(uploadPath, { recursive: true });
```

**Key Points:**

- `mkdirSync` creates a directory synchronously
- `{ recursive: true }` automatically creates any missing parent directories
- Without recursive option, an error would occur if parent directories don't exist

### Deleting Files

Use `fs.unlink` from Node.js core (don't use multer's private `_removeFile`):

```javascript
const fs = require("fs");

if (req.file) {
  fs.unlink(req.file.path, (err) => {
    if (err) {
      console.error("Error deleting the file:", err);
    } else {
      console.log("File successfully deleted");
    }
  });
}
```

## Safe Data Iteration

### ⚠️ Never Modify While Iterating

When working with `FormData`, arrays, maps, sets, or objects, never modify them directly while iterating.

**Problems with direct modification during iteration:**

- Items might get skipped
- Loop behavior becomes unpredictable
- Silent bugs may occur

### ✅ The Right Way: Copy First

```typescript
const form = new FormData();
// ...form gets populated...

// Step 1: Copy entries into an array
const entries = Array.from(form.entries());

// Step 2: Now it's safe to iterate and mutate
for (const [key, value] of entries) {
  console.log(`${key}: ${value}`);
  form.delete(key); // ✅ Safe mutation
}
```

## Redux Toolkit: Async Thunk & Loading State

### How `createAsyncThunk` Works

When dispatching an async thunk, Redux Toolkit automatically dispatches three lifecycle actions:

1. **`pending`**: Dispatched immediately when thunk starts

   - Sets `state.loading = true`

2. **`fulfilled`**: Dispatched when async function completes successfully

   - Sets `state.loading = false`

3. **`rejected`**: Dispatched when async function throws or uses `rejectWithValue`
   - Sets `state.loading = false`

### Internal Flow

- Async logic runs inside a `try/catch` block
- Synchronous reducers can be dispatched inside the thunk
- Loading state remains `true` until the thunk resolves

### Example Flow

```typescript
dispatch(removeNotifList("123"));
// → state.loading = true  (pending)

await API call...

dispatch(deleteList("123"));
// → updates local state (e.g., remove item from UI)

return result;
// → state.loading = false (fulfilled)
```

### Important Notes

- Loading state is tied to the async thunk's lifecycle, not internal reducers
- Expensive reducers may still cause UI freezes unless optimized

## CSS Positioning Notes

### `position: relative`

- Establishes positioning context for `absolute` children
- Example:

  ```css
  .parent {
    position: relative;
  }

  .suggestions-dropdown {
    position: absolute;
    top: 100%;
    left: 0;
  }
  ```

- Without it, absolute elements use nearest positioned ancestor or viewport

### `overflow: visible`

- Allows child elements to extend beyond parent boundaries
- Useful for dropdowns/tooltips that need to "escape" their container

## MongoDB Best Practices

### Collection Usage

```typescript
const collection: Collection = db.collection("yourCollection");
// collection represents a MongoDB "table" (document group)
// Methods: .find(), .insertOne(), etc.
```

### Query Example

```typescript
collection
  .find({
    name: { $regex: query, $options: "i" }, // Case-insensitive search
  })
  .limit(10);
```

## Redux Best Practices

### ✅ Do:

- Store serializable data only
- Dispatch from components

### For modals:

```typescript
// Option 1 (Recommended):
const Modal = ({ postId, show }) => {...}

// Option 2:
const Modal = () => {
  const { postId, show } = useSelector(...);
}
```

### ❌ Don't:

- Store refs in Redux (breaks serializability)
- Dispatch in reducers

Example of bad practice:

```typescript
// Avoid:
state.popover.target = ref; // MutableRefObject isn't serializable
```

## Component Placement

| Component | Mount Location  | Recommendation |
| --------- | --------------- | -------------- |
| Modal     | ❌ Deep in tree | Use Portal     |
| Popover   | ✅ Near trigger | Watch overflow |

### TypeScript Fix Example

```typescript
// Error: MutableRefObject in Redux state
// Solution:
interface PopoverState {
  show: boolean;
  postId: string;
  // Remove target: MutableRefObject
}

// Handle ref locally instead:
const targetRef = useRef<HTMLSpanElement>(null);
```

## Redux Toolkit: Understanding action.meta.arg

### What is action.meta.arg?

When using `createAsyncThunk`, any arguments passed to the thunk when dispatched are stored in `action.meta.arg`.

### Example Use Case

```javascript
// Dispatching the thunk with arguments
dispatch(followToggled({ userId: "123", followerId: "456" }));

// Inside a reducer:
.addCase(followToggled.fulfilled, (state, action) => {
    if (!action.payload.success) {
        // Rollback by accessing original args
        const { userId, followerId } = action.meta.arg;
        // Revert changes in state
    }
})
```

### Why It's Useful

- **Optimistic Updates**: Allows reverting state changes if API calls fail
- **Debugging & Logging**: Tracks what arguments triggered the action
- **Conditional Logic**: Enables decisions based on initial input

### Key Points

- Only available in thunks created with `createAsyncThunk`
- Useful for error handling and state rollbacks
- Part of the `action.meta` object

## MongoDB Compound Indexing

### Creating a Compound Index

```javascript
MessageSchema.index({ conversationId: 1, createdAt: -1 });
```

This creates a compound index with:

- `conversationId` in ascending order (1)
- `createdAt` in descending order (-1)

### Use Case Example

```javascript
Message.find({ conversationId: someId }).sort({ createdAt: -1 }).limit(20);
```

This query efficiently:

- Finds messages for a specific conversation
- Returns the 20 most recent messages

### Performance Benefits

| Feature      | With Compound Index              | Without Index                     |
| ------------ | -------------------------------- | --------------------------------- |
| Query Speed  | ⚡ Fast (uses index)             | 🐌 Slow (scans entire collection) |
| Memory Usage | ✅ Low                           | ❌ High (in-memory sort)          |
| Scalability  | ✅ Efficient with large datasets | ❌ Slows as data grows            |

### How It Works

- Without index: MongoDB scans entire collection, filters, sorts in memory
- With index: MongoDB jumps directly to conversation ID, documents are pre-sorted

## MongoDB Storage: Memory vs Disk

### What "Disk" Means

In database contexts, "disk" refers to the physical storage where data is permanently saved (HDD or SSD).

### Storage Process

```javascript
db.messages.insertOne({
  conversationId: "abc123",
  content: "Hey!",
  createdAt: new Date(),
});
```

MongoDB:

- Saves the document to disk (in data files)
- Updates indexes (also stored on disk)

### Memory vs Disk Comparison

| Feature      | In Memory (RAM)      | On Disk (Storage)            |
| ------------ | -------------------- | ---------------------------- |
| Persistence  | Temporary            | Permanent                    |
| Access Speed | Very fast            | Slower                       |
| Durability   | Lost on shutdown     | Persists across restarts     |
| Usage        | Caches frequent data | Stores all documents/indexes |

## MongoDB Indexing Best Practices

### Why Define Indexes in Code?

```javascript
// Example in Mongoose schema
MessageSchema.index({ conversationId: 1, createdAt: -1 });
```

**Benefits:**

- **Consistency**: Ensures indexes exist on app startup
- **Version Control**: Index definitions live with your code
- **Portability**: Indexes deploy with code to any environment
- **Automation**: No need to manually recreate indexes after DB reset

## TypeScript Error Fixes

### PayloadAction Type Error Fix

**Error:**

```typescript
openChatWindow: (state, action: PayloadAction<{currentUser: string} extends Conversation>) => {
```

**Problem:**
Incorrect TypeScript syntax in the generic type. The `extends` keyword is used improperly.

**Solution:**

```typescript
// If Conversation should include currentUser:
openChatWindow: (state, action: PayloadAction<Conversation & { currentUser: string }>) => {
```

### Express Router TypeError Fix

**Error Message:**

```
No overload matches this call.
Argument of type '(req: AuthReq, res: Response) => Promise<any>' is not assignable to parameter of type 'Application<Record<string, any>>'.
```

**Cause:**
Custom `AuthReq` type not properly extending Express's `Request`.

**Solution:**

```typescript
import { Request } from "express";

export interface AuthReq extends Request {
  userId?: string;
}

export const createContact = async (
  req: AuthReq,
  res: Response
): Promise<void> => {
  // your logic here
};
```

## Testing API Routes in Postman

### When to Use req.params

Use `req.params` for parameters in the URL path (e.g., `:userId`, `:contactId`).

### Example Express Route

```typescript
messageRouter.post("/contact/drop/:userId/:contactId", removeContact);
```

### Testing in Postman

#### ✅ Correct URL format:

```
POST http://localhost:4000/api/messages/contact/drop/67825d3cf3d482781298e0c6/682027120274533cf5fe66c3
```

#### ❌ Incorrect URL format (won't work with req.params):

```
POST http://localhost:4000/api/messages/contact/drop?userId=...&contactId=...
```

### Controller Access

```typescript
const { userId, contactId } = req.params;
// userId = "67825d3cf3d482781298e0c6"
// contactId = "682027120274533cf5fe66c3"
```

Backend Request Types and Best Practices
Request Data Types
Where Used For Example Data Type
req.body Creating/updating data { "name": "Brian" } JSON or form
req.params Identifying a specific resource /users/123 → id = 123 String
req.query Filtering/sorting/pagination /products?sort=price String key-value
✅ Best Practice: Use a Service Layer Between Controllers and Models
Instead of calling a function from conversation.controller inside message.controller, or directly updating the Conversation model in the message controller, a cleaner approach is:

🛠 Create a conversation.service.js/ts file (or similar), and move shared logic there.

That way:

Controllers stay thin (just handling requests and responses)
Logic related to conversations is centralized
You avoid tight coupling between controllers
💡 Example Folder Structure
controllers/

- conversation.controller.js
- message.controller.js
  services/
- conversation.service.js
  models/
- Conversation.js
- Message.js
  🧠 Example Scenario
  When a message is sent, you want to update the conversation's lastMessage or updatedAt, etc.

conversation.service.js

js
import Conversation from '../models/Conversation.js';

export const updateConversationOnNewMessage = async (conversationId, messageData) => {
return await Conversation.findByIdAndUpdate(
conversationId,
{
lastMessage: messageData.content,
updatedAt: new Date(),
},
{ new: true }
);
};
message.controller.js

js
import { updateConversationOnNewMessage } from '../services/conversation.service.js';

export const sendMessage = async (req, res) => {
const { conversationId, content } = req.body;

// Save the message
const newMessage = await Message.create({ ... });
// Update the conversation
await updateConversationOnNewMessage(conversationId, newMessage);
res.status(201).json(newMessage);
};
⚠️ Why You Should Avoid Calling Controller in Controller
Controllers are for request/response logic only.
Calling one controller from another creates tight coupling, making it harder to maintain, test, or reuse.
✅ Summary: Recommended Pattern
Don't call conversation.controller from message.controller.
Don't put business logic in controllers.
Do create a conversation.service file and call that function from both controllers as needed.

# setTimeout(..., 0) for Scroll Adjustment

## Purpose

The `setTimeout(..., 0)` is used to defer execution of scroll adjustment until after the DOM has updated with newly rendered messages.

## Why It's Needed

### The Problem

- React and the browser don't immediately apply DOM changes when you call `setState` or render new components
- If you try to read or adjust scroll position immediately after rendering logic, the scroll height will still be the old value
- This doesn't account for new messages just added to the DOM

### The Solution

By wrapping logic in `setTimeout(..., 0)`, you tell the browser:

> "Wait until the current JavaScript call stack is finished and the DOM has painted, then run this."

This gives time for:

- React to complete rendering
- The updated DOM (including new messages) to reflect an accurate `scrollHeight`

## Implementation Example

```javascript
setTimeout(() => {
  const newScrollHeight = scrollElement.scrollHeight;
  const scrollDiff = newScrollHeight - lastScrollRef.current;
  scrollElement.scrollTop = scrollDiff;
  setIsFetchingMore(false);
}, 0);
```

## What Happens

1. `newScrollHeight` now includes the newly added messages
2. Compute how much taller the scroll container got (`scrollDiff`)
3. Adjust scroll position to preserve user's position (prevents jumping)
4. Set `setIsFetchingMore(false)` to mark end of loading phase

## Result

This technique ensures a smooth and accurate scroll experience in infinite scroll/message applications.
