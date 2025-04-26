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
