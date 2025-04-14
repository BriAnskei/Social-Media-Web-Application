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
