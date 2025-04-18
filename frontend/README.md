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

```js
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
```

````md
# 🎯 CSS & React + MongoDB Cheat Sheet

---

## 🎯 Why Use `position: relative`

`position: relative` is used to establish a positioning context for child elements with `position: absolute`.

- It **doesn't move the element itself** unless you add `top`, `left`, etc.
- It **tells child elements**: "You can use me as your positioning reference."

### 💡 Example:

```tsx
<div className="suggestion-wrapper">
  <input type="text" />
  <div className="suggestions-dropdown">...</div>
</div>
```
````

```css
.suggestion-wrapper {
  position: relative;
}

.suggestions-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
}
```

- The dropdown appears just below the input.
- `.suggestion-wrapper` is the anchor.

✅ Without `position: relative`, the child uses the **nearest positioned ancestor** or **the page**.

---

## 📌 `overflow: visible`

```css
overflow: visible; /* allow children to overflow */
```

- Lets child elements overflow outside the bounds of the parent.
- Useful for dropdowns, tooltips, popovers, etc.

---

## 📦 MongoDB: Collection and Search Query

### 🧾 What is `collection`?

```ts
const collection: Collection = db.collection("yourCollection");
```

- `collection`: Accesses a MongoDB collection (like a SQL table).
- `Collection` (capital C): A TypeScript type from MongoDB driver.

### 🔍 Purpose of the Query

```ts
const results = await collection
  .find({ name: { $regex: query, $options: "i" } })
  .limit(10)
  .toArray();
```

- **Searches `name` field** using regex (case-insensitive).
- Limits results to 10.
- Converts MongoDB cursor to a plain array.

### 📄 Example:

If query = "al", and collection has:

```json
{ "name": "Alice" }
{ "name": "Alina" }
{ "name": "Bob" }
```

Only Alice and Alina match.

---

## 🧠 Redux and Non-Serializable State

- **Refs (`useRef`) should not be stored in Redux**.
- Redux state should stay serializable for features like time-travel debugging.

### ✅ Solution:

Handle refs locally inside components, not in Redux:

```ts
const targetRef = useRef<HTMLSpanElement>(null);
```

---

## 🎛️ Modals vs Popovers in React

| Component | Mount Anywhere? | Best Practice                              |
| --------- | --------------- | ------------------------------------------ |
| Modal     | ❌ No           | Use `ReactDOM.createPortal()`              |
| Popover   | ✅ Yes          | Mount near trigger or use Portal if needed |

### ✅ Modals:

Mount near top of the tree to avoid `z-index`/`overflow` issues.

```tsx
ReactDOM.createPortal(<MyModal />, document.getElementById("modal-root"));
```

### ✅ Popovers:

Can be nested, but watch out for `overflow: hidden` or layout issues.

---

## 🔄 Dispatching Redux Actions From Components

### ✅ Allowed:

```tsx
const Popover = ({ postId }) => {
  const dispatch = useDispatch();

  const handleClick = () => {
    dispatch(yourReduxAction(postId));
  };

  return <button onClick={handleClick}>Click Me</button>;
};
```

### ❌ Not Allowed:

Don't dispatch actions **inside reducers**:

```ts
someReducer(state, action) {
  dispatch(anotherAction()); // ❌ Invalid
  return newState;
}
```

Reducers must be **pure functions**.

---

## 🎛️ Props-Based vs Redux-Based Modals

### Props-Based

```tsx
const EditPostModal: React.FC<{ postId: string; show: boolean }> = ({ postId, show }) => { ... }
```

✅ Good for separation, testing, reusability.
❌ Slightly more verbose.

### Redux-Based

```tsx
const EditPostModal: React.FC = () => {
  const { show, postId } = useSelector(
    (state: RootState) => state.global.editPostModal
  );
};
```

✅ Less boilerplate.
❌ Harder to test/reuse, hidden dependencies.

🏆 **Recommendation**: Use **Props-based** for scalable apps.

---

## 🧠 Bonus

If you must store a ref in Redux (not recommended):

```ts
(state as Draft<typeof initialState>).popover.target = target;
```

But again — **not recommended**.

```

```
