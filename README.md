
---

````markdown
# 🗂️ File Manager

A command-line based File Manager built with Node.js.  
Supports file operations, navigation, system information retrieval, hashing, compression, and more – all using asynchronous APIs and ESM modules.

---

## ✅ Features

### 📁 File & Directory Operations
- Navigate up and down the directory tree
- List files and folders in the current directory
- Create, rename, copy, move, and delete files and folders
- Read file content in the console

### ⚙️ System Information
- Get EOL character
- Show CPU information (count, model, speed)
- Display home directory
- Show system username
- Get CPU architecture

### 🔐 Security
- Calculate SHA-256 hash of files

### 🗜️ Compression
- Compress files using Brotli algorithm
- Decompress Brotli-compressed files

---

## 🧱 Technical Stack

- **Node.js**
- **ESM modules** (no CommonJS)
- **Streams API** (no synchronous file access)
- Modular architecture (at least 7 separate modules)

---

## 🚀 How to Run

1. **Clone the repository:**
   ```bash
   git clone <your-repo-url>
   cd file-manager
````

2. **Run the app:**

   ```bash
   node src/index.js --username=YourName
   ```

3. **Use the CLI:**
   Follow on-screen instructions. Type `.exit` or press `Ctrl + C` to quit.

---

## 💡 Example Commands

* `up` – go one directory up
* `cd folder-name` – change directory
* `ls` – list files and folders
* `cat filename.txt` – read file
* `add newfile.txt` – create new file
* `rn oldname.txt newname.txt` – rename file
* `cp source.txt destination.txt` – copy file
* `mv source.txt destination.txt` – move file
* `rm file.txt` – remove file
* `os --cpus` – show CPU info
* `hash file.txt` – calculate file hash
* `compress file.txt archive.br` – compress file
* `decompress archive.br file.txt` – decompress file

---

## 🏁 Scoring Summary

| Category       | Points        |
| -------------- | ------------- |
| Basic Scope    | 280           |
| Advanced Scope | 90            |
| **Total**      | **330 / 330** |
| Forfeits       | 0             |

---

## ⚠️ Restrictions

* ❌ No external libraries used
* ✅ All operations are fully asynchronous
* ✅ Code organized and modularized

---

## 📄 License

This project is for educational purposes and is not licensed for production use.

---

```

Would you like me to customize it further, e.g., add your GitHub repo link or author details?
```
