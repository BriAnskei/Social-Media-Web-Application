[TOC]

# This will just fucos on the key takeaways

---

# Notes on Uploading and Deleting Files with Node.js

## Uploading Directory

This line creates the directory specified in `uploadPath` synchronously using Node.js's `fs` module:

```js
fs.mkdirSync(uploadPath, { recursive: true });
```

### Explanation

- `mkdirSync` is a method to **make a directory synchronously**.
- `uploadPath` is the path to create (e.g., `uploads/posts/123`).
- `{ recursive: true }` means:
  - If any parent folders (like `uploads/` or `uploads/posts/`) don’t exist, they’ll be automatically created.
  - Without `recursive: true`, it would throw an error if parent folders are missing.

---

## Deleting a File

You **don't need to use `multer` to delete a file**, and you **should not use `_removeFile`** since it's a private function.

Instead, delete the file using Node.js’s `fs.unlink` method.

### Example

Wherever you have access to `req.file`, you can do the following:

- [This will just fucos on the key takeaways](#this-will-just-fucos-on-the-key-takeaways)
- [Notes on Uploading and Deleting Files with Node.js](#notes-on-uploading-and-deleting-files-with-nodejs)
  - [Uploading Directory](#uploading-directory)
    - [Explanation](#explanation)
  - [Deleting a File](#deleting-a-file)
    - [Example](#example)
- [📘 Redux Toolkit: Async Thunk \& Loading State](#-redux-toolkit-async-thunk--loading-state)
  - [🧩 Topic](#-topic)
  - [✅ How `createAsyncThunk` Works](#-how-createasyncthunk-works)
    - [🔍 Internal Flow](#-internal-flow)
  - [🔁 Example Flow](#-example-flow)
  - [🧠 Important Notes](#-important-notes)
- [Key Notes on React, Redux \& MongoDB](#key-notes-on-react-redux--mongodb)
  - [🎯 `position: relative`](#-position-relative)
- [MongoDB Collection](#mongodb-collection)
- [Development Notes](#development-notes)
  - [Redux Toolkit Async Thunks](#redux-toolkit-async-thunks)
    - [What is action.meta.arg?](#what-is-actionmetaarg)
    - [Example Use Case](#example-use-case)
    - [Why is it Useful?](#why-is-it-useful)
    - [Key Points](#key-points)
  - [MongoDB Compound Index: `conversationId` + `createdAt`](#mongodb-compound-index-conversationid--createdat)
    - [What is this?](#what-is-this)
    - [🔍 What It Does](#-what-it-does)
    - [Example Use Case](#example-use-case-1)
    - [Why Is It Fast?](#why-is-it-fast)
    - [How MongoDB Stores Data vs Index](#how-mongodb-stores-data-vs-index)
    - [Analogy](#analogy)
    - [Summary](#summary)
  - [MongoDB Storage: Memory vs Disk](#mongodb-storage-memory-vs-disk)
    - [💾 What Does "Disk" Mean in This Context?](#-what-does-disk-mean-in-this-context)
    - [Example:](#example-1)
    - [In Memory vs On Disk](#in-memory-vs-on-disk)
  - [Indexing in MongoDB for Performance](#indexing-in-mongodb-for-performance)
    - [✅ Why Define Indexes in Code (like your Mongoose example)?](#-why-define-indexes-in-code-like-your-mongoose-example)
  - [TypeScript Fixes](#typescript-fixes)
    - [PayloadAction Type Error Fix](#payloadaction-type-error-fix)
      - [What's wrong?](#whats-wrong)
      - [Explanation](#explanation-1)
      - [Possible Fixes:](#possible-fixes)
      - [Final Corrected Version (likely intended):](#final-corrected-version-likely-intended)
    - [Express Router TypeError Fix](#express-router-typeerror-fix)
      - [Error Message:](#error-message)
      - [💥 Cause:](#-cause)
      - [✅ Solution:](#-solution)
  - [MongoDB Index vs createIndex](#mongodb-index-vs-createindex)
  - [Mongoose Populate() Method](#mongoose-populate-method)
  - [Testing req.params in Postman](#testing-reqparams-in-postman)
    - [✅ When to Use req.params:](#-when-to-use-reqparams)
    - [📌 Example Express Route:](#-example-express-route)
    - [🧪 How to Test in Postman:](#-how-to-test-in-postman)
      - [✅ Correct URL format:](#-correct-url-format)
      - [❌ Incorrect URL format (won't work with req.params):](#-incorrect-url-format-wont-work-with-reqparams)
    - [✅ In Your Controller:](#-in-your-controller)

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

````

> ✅ This is the standard and safe way to remove files using Node.js.

---

# ⚠️ Avoid Mutating While Iterating: A Must-Know for Clean Code

When working with structures like `FormData`, arrays, maps, sets, or objects—**never modify them directly (add/delete items) while you're looping over them.**

---

## 💡 Why Is This a Problem?

Mutating during iteration causes **unpredictable behavior**:

- Items might get **skipped**.
- The loop might behave **inconsistently**.
- You might silently miss data or even introduce bugs.

---

## ✅ The Right Way: Copy Before You Mutate

If you need to modify something while looping, **make a copy first**.

### ✅ Good Example: Working with `FormData`

```ts
const form = new FormData();
// ...form gets populated...

// Step 1: Copy entries into an array
const entries = Array.from(form.entries());

// Step 2: Now it's safe to iterate and mutate
for (const [key, value] of entries) {
  console.log(`${key}: ${value}`);
  form.delete(key); // ✅ Safe mutation
}
````

---

# 📘 Redux Toolkit: Async Thunk & Loading State

## 🧩 Topic

Managing the loading state during an `asyncThunk` that also dispatches synchronous reducers like `deleteList`.

---

## ✅ How `createAsyncThunk` Works

When you dispatch an `asyncThunk` (e.g., `removeNotifList`), Redux Toolkit automatically dispatches **three lifecycle actions**:

- **`pending`** – Dispatched immediately when the thunk starts  
  → `state.loading = true`

- **`fulfilled`** – Dispatched when the async function completes successfully  
  → `state.loading = false`

- **`rejected`** – Dispatched when the async function throws or uses `rejectWithValue`  
  → `state.loading = false`

### 🔍 Internal Flow

- All async logic is handled inside a `try/catch` block.
- You can dispatch **synchronous reducers** (e.g., `deleteList`) **inside** the thunk.
- The loading state remains `true` until the thunk resolves (either fulfilled or rejected).
- Even if local state updates are synchronous, the `loading` flag is not reset until the async operation ends.

---

## 🔁 Example Flow

```ts
dispatch(removeNotifList("123"));
// → state.loading = true  (pending)

await API call...

dispatch(deleteList("123"));
// → updates local state (e.g., remove item from UI)

return result;
// → state.loading = false (fulfilled)
```

---

## 🧠 Important Notes

- The `loading` state is **tied to the async thunk’s lifecycle**, not the time taken by internal reducers.
- Synchronous reducers like `deleteList` **do not affect** the timing of `pending` or `fulfilled` actions.
- If a reducer is **computationally expensive** (e.g., `O(n)` or more), it might still cause a **UI freeze** unless:
  - It’s optimized (e.g., batched updates, memoization)
  - Or offloaded (e.g., to a web worker)

---

💡 Use this structure to confidently manage async and sync logic together while keeping your UI responsive and predictable.

# Key Notes on React, Redux & MongoDB

## 🎯 `position: relative`

- Establishes positioning context for `absolute` children.
- Example:

  ```css
  .suggestions-dropdown {
    position: absolute;
    top: 100%;
    left: 0;
  }


  Without it, absolute elements use nearest positioned ancestor or viewport.
  ```

overflow: visible
Allows child elements to extend beyond parent boundaries.

Useful for dropdowns/tooltips that need to "escape" their container.

# MongoDB Collection

```ts
const collection: Collection = db.collection('yourCollection');

collection: Represents a MongoDB "table" (document group)

Methods: .find(), .insertOne(), etc.
```

Example query:

```ts
.find({
name: { $regex: query, $options: 'i' } // Case-insensitive search
})
.limit(10)
```

Redux Best Practices
✅ Do:

Store serializable data only

Dispatch from components

For modals:

```ts
// Option 1 (Recommended):
const Modal = ({ postId, show }) => {...}

// Option 2:
const Modal = () => {
const { postId, show } = useSelector(...);
}
```

❌ Don't:

Store refs in Redux (breaks serializability)

Dispatch in reducers

Example of bad practice:

```ts
// Avoid:
state.popover.target = ref; // MutableRefObject isn't serializable
```

---

Component Placement
Component Mount Location Recommendation
Modal ❌ Deep in tree Use Portal
Popover ✅ Near trigger Watch overflow
TypeScript Error Fix

```ts
// Error: MutableRefObject in Redux state
// Solution:
interface PopoverState {
  show: boolean;
  postId: string;
  // Remove target: MutableRefObject
}
```

```ts
// Handle ref locally instead:
const targetRef = useRef<HTMLSpanElement>(null);
```

# Development Notes

## Redux Toolkit Async Thunks

### What is action.meta.arg?

When using `createAsyncThunk` in Redux Toolkit, any arguments passed to the thunk when dispatched are stored in `action.meta.arg`.

This allows access to the original input data inside reducers, even after the async operation completes.

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

### Why is it Useful?

- **Optimistic Updates**:

  - If an API call fails, you can revert state changes using the original data from `meta.arg`.

- **Debugging & Logging**:

  - Helps track what arguments triggered the action.

- **Conditional Logic**:
  - Allows reducers to make decisions based on the initial input.

### Key Points

- Only available in thunks created with `createAsyncThunk`.
- Useful for error handling and state rollbacks.
- Part of the `action.meta` object, which may also contain other metadata (e.g., `requestId`).

> 📌 **Use Case**: If you modify state optimistically before an API call, `meta.arg` helps undo changes if the call fails.

## MongoDB Compound Index: `conversationId` + `createdAt`

### What is this?

```js
MessageSchema.index({ conversationId: 1, createdAt: -1 });
```

This line creates a compound index in MongoDB using Mongoose.

### 🔍 What It Does

Creates an index on:

- `conversationId` in ascending order (1)
- `createdAt` in descending order (-1)

Helps MongoDB efficiently retrieve messages for a specific conversation, sorted by newest first.

### Example Use Case

```js
Message.find({ conversationId: someId }).sort({ createdAt: -1 }).limit(20);
```

This query:

- Retrieves the latest 20 messages in a conversation.
- Runs fast if the compound index exists.

### Why Is It Fast?

**Without an index**:

- MongoDB scans the whole collection.
- Filters for `conversationId`.
- Sorts in memory by `createdAt`.
- Returns top 20.

**With the compound index**:

- MongoDB jumps directly to `conversationId: someId`.
- Documents are already sorted by `createdAt: -1`.
- MongoDB just picks the top 20.

✅ No full scan. No in-memory sort. Super efficient.

### How MongoDB Stores Data vs Index

MongoDB does NOT store the actual documents physically sorted by the index.

- The index is a separate B-tree structure.
- Think of it like a catalog that points to where documents are stored.

### Analogy

- 🗃️ Collection = warehouse of boxes
- 📚 Index = catalog/map telling you where the latest 20 messages are
- 🧍 MongoDB = worker that follows the index to fetch only what's needed

### Summary

| Feature      | With Compound Index                   | Without Index                     |
| ------------ | ------------------------------------- | --------------------------------- |
| Query Speed  | ⚡ Fast (uses index)                  | 🐌 Slow (scans entire collection) |
| Memory Usage | ✅ Low                                | ❌ High (in-memory sort)          |
| Scalability  | ✅ Efficient even with large datasets | ❌ Slows down as data grows       |

> 💡 **Tip**: Always create compound indexes to match:
>
> - The fields used in your `.find()`
> - The fields used in your `.sort()`

## MongoDB Storage: Memory vs Disk

When we mention "disk" in collection storage, it refers to the physical storage layer — where MongoDB saves your data on your computer's or server's hard drive or SSD.

### 💾 What Does "Disk" Mean in This Context?

In databases, "disk" usually refers to the non-volatile storage device where data is stored permanently (until deleted).

So when MongoDB stores a document, it:

- Writes that data to the disk (your file system), not just to RAM (which is temporary).
- Uses internal data files (e.g., `.wt` files in WiredTiger engine) to store collections and indexes.

### Example:

```js
db.messages.insertOne({
  conversationId: "abc123",
  content: "Hey!",
  createdAt: new Date(),
});
```

MongoDB:

- Saves this document into a file on your disk (behind the scenes).
- Updates any indexes (also stored on disk) to include this new document.

### In Memory vs On Disk

| Feature         | In Memory (RAM)                        | On Disk (Storage)                         |
| --------------- | -------------------------------------- | ----------------------------------------- |
| Temporary       | Yes                                    | No                                        |
| Fast to access  | Very fast                              | Slower                                    |
| Power-dependent | Data lost on shutdown                  | Data persists across restarts             |
| MongoDB example | Uses RAM to cache frequently-used data | Writes documents and indexes to .wt files |

MongoDB uses both:

- RAM to cache recently used data (for performance)
- Disk for actual, durable storage of all collections and indexes

## Indexing in MongoDB for Performance

You can create indexes either:

- Visually in MongoDB Compass or MongoDB Atlas (web UI), OR
- Programmatically like in your Mongoose schema

### ✅ Why Define Indexes in Code (like your Mongoose example)?

- **Consistency**: Every time your app starts or deploys, Mongoose can ensure indexes are created.
- **Version Control**: Your index definitions live with your codebase, so you can track changes in Git.
- **Portability**: If you move to another MongoDB instance (e.g., for staging/production), your indexes go with the code — no manual setup needed.
- **Automation**: You don't have to manually re-create indexes in Compass or Atlas after wiping or seeding your DB.

## TypeScript Fixes

### PayloadAction Type Error Fix

The error in this line:

```typescript
openChatWindow: (state, action: PayloadAction<{currentUser: string} extends Conversation>) => {
```

is due to incorrect TypeScript syntax in the generic type passed to PayloadAction.

#### What's wrong?

You wrote:

```typescript
PayloadAction<{currentUser: string} extends Conversation>
```

This is not a valid type. You're using the `extends` keyword inside a type argument as if it's a type, but it's a conditional expression and should be used differently.

#### Explanation

The `extends` keyword in TypeScript is for:

- Generic constraints: `<T extends SomeType>`
- Conditional types: `T extends U ? X : Y`

What you wrote appears to attempt a conditional type, but it's incorrectly formed.

#### Possible Fixes:

1. If you're trying to define that the payload should be a Conversation object that includes a `currentUser: string`:

   ```typescript
   PayloadAction<Conversation>;
   ```

   Assuming Conversation already includes `currentUser: string`.

2. If you're trying to enforce that the payload must extend Conversation and must include currentUser, use an intersection:

   ```typescript
   PayloadAction<Conversation & { currentUser: string }>;
   ```

3. If you meant to do a conditional type (unlikely here), it would look like:
   ```typescript
   PayloadAction<{ currentUser: string } extends Conversation ? X : Y>;
   ```
   But again, this is rarely needed in Redux actions.

#### Final Corrected Version (likely intended):

```typescript
openChatWindow: (state, action: PayloadAction<Conversation & { currentUser: string }>) => {
```

### Express Router TypeError Fix

#### Error Message:

```typescript
No overload matches this call.
The last overload gave the following error.
Argument of type '(req: AuthReq, res: Response) => Promise<any>' is not assignable to parameter of type 'Application<Record<string, any>>'.
```

#### 💥 Cause:

This error occurs because the function you're passing to `router.post()` uses a custom `AuthReq` type for `req`, and TypeScript doesn't automatically know that it is compatible with `express.Request`.

Your controller:

```typescript
(req: AuthReq, res: Response) => Promise<any>;
```

Expected by Express:

```typescript
(req: Request, res: Response, next?: NextFunction) => any;
```

#### ✅ Solution:

1. Ensure your AuthReq type extends Express's Request:

   ```typescript
   import { Request } from "express";

   export interface AuthReq extends Request {
     userId?: string;
   }
   ```

2. Use AuthReq properly in your controller:

   ```typescript
   export const createContact = async (
     req: AuthReq,
     res: Response
   ): Promise<void> => {
     // your logic here
   };
   ```

3. Avoid casting unless necessary. Prefer strong typing over:
   ```typescript
   createContact as unknown as (req: Request, res: Response) => void;
   ```

> 🧠 **Tip**: This usually happens when using custom middleware to add properties like `userId` to `req`. Always make sure your types reflect those changes by extending Request.

## MongoDB Index vs createIndex

| Concept                      | Explanation                                                                                                                                                                     |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **`index()` in Mongoose**    | Used in schema definition: `schema.index(...)` — it's how you **define an index** in your Mongoose model.                                                                       |
| **`createIndex` in MongoDB** | A **MongoDB shell or driver command** used to **create an index directly** on a collection. Equivalent to what Mongoose ends up doing behind the scenes if `autoIndex` is true. |

Reference: [Mongoose Documentation on Indexes](https://mongoosejs.com/docs/guide.html#indexes)

## Mongoose Populate() Method

Last Updated: 08 Apr, 2025

The `populate()` method in Mongoose is used to automatically replace a field in a document with the actual data from a related document. It simplifies handling referenced documents and helps replace ObjectIds with the actual data from related collections. This article explores the Mongoose populate() method, explains its functionality with examples, and guides you through the process of setting it up and using it effectively in your projects.

## Testing req.params in Postman

### ✅ When to Use req.params:

Use `req.params` when your Express route includes parameters in the URL path (e.g. `:userId`, `:contactId`).

### 📌 Example Express Route:

```typescript
messageRouter.post("/contact/drop/:userId/:contactId", removeContact);
```

### 🧪 How to Test in Postman:

Make sure your URL in Postman matches the route and includes the parameters in the path, not as query strings.

#### ✅ Correct URL format:

```
POST http://localhost:4000/api/messages/contact/drop/67825d3cf3d482781298e0c6/682027120274533cf5fe66c3
```

#### ❌ Incorrect URL format (won't work with req.params):

```
POST http://localhost:4000/api/messages/contact/drop?userId=...&contactId=...
```

The above format will result in `req.params.userId` being undefined.

### ✅ In Your Controller:

```typescript
const { userId, contactId } = req.params;
// userId = "67825d3cf3d482781298e0c6"
// contactId = "682027120274533cf5fe66c3"
```
