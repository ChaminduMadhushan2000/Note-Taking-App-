# 📝 Collaborative Note-Taking App

A full-stack **MERN** (MongoDB, Express, React, Node.js) note-taking web app I built for my university project. It lets you create and edit rich-text notes, search through them instantly, and share notes with other users as collaborators. The frontend is styled with **Tailwind CSS** and bundled with **Vite** for a fast dev experience.

---

## ✨ Features

- **JWT Authentication** – sign up and log in with hashed passwords (bcrypt) and Bearer token sessions
- **Rich Text Editor** – write formatted notes using React Quill (bold, headings, lists, code blocks, etc.)
- **Full-Text Search** – MongoDB text index on title + content so you can find notes instantly
- **Collaborator Management** – invite other users by email; collaborators can view and edit shared notes
- **Owner-Only Permissions** – only the note owner can delete notes or add/remove collaborators
- **Clean iOS-Inspired UI** – minimal design using Tailwind (frosted glass headers, rounded cards, soft shadows)

---

## 🛠️ Tech Stack

| Layer    | Technologies                                                    |
| -------- | --------------------------------------------------------------- |
| Frontend | React 19, Vite 7, React Router, Axios, React Quill, Tailwind v4 |
| Backend  | Node.js, Express 5, Mongoose, JSON Web Tokens, bcrypt           |
| Database | MongoDB (Atlas or local)                                        |

---

## 📁 Project Structure

```
Note-Taking-App-/
├── backend/
│   ├── middleware/
│   │   └── authMiddleware.js       # checks the JWT token on protected routes
│   ├── models/
│   │   ├── Note.js                 # note schema + text index for search
│   │   └── User.js                 # user schema (name, email, password)
│   ├── routes/
│   │   ├── authRoutes.js           # register & login endpoints
│   │   ├── noteRoutes.js           # CRUD, search, and collaborator routes
│   │   └── userRoutes.js           # look up users by email
│   ├── server.js                   # main entry point – sets up express & mongo
│   ├── .env                        # env variables (don't commit this!)
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   └── CollaboratorModal.jsx   # bottom sheet to manage collaborators
│   │   ├── context/
│   │   │   └── AuthContext.jsx         # global auth state (login, logout, etc.)
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx           # main note grid with search bar
│   │   │   ├── Login.jsx               # login page
│   │   │   ├── NoteEditor.jsx          # rich text editor page
│   │   │   └── Register.jsx            # registration page
│   │   ├── utils/
│   │   │   └── api.js                  # axios instance with token interceptor
│   │   ├── App.jsx                     # routes & auth guards
│   │   ├── main.jsx                    # react entry point
│   │   └── index.css                   # tailwind imports + quill style tweaks
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
└── README.md
```

---

## 📋 Prerequisites

- **Node.js** v18+
- **MongoDB** – either a local instance or a free [MongoDB Atlas](https://www.mongodb.com/atlas) cluster

---

## ⚙️ Environment Variables

Create a file called `backend/.env` and add the following:

```env
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<dbname>?retryWrites=true&w=majority
JWT_SECRET=replace_with_a_long_random_secret
```

| Variable     | What it does                              |
| ------------ | ----------------------------------------- |
| `PORT`       | Port the backend server runs on           |
| `MONGO_URI`  | Your MongoDB connection string            |
| `JWT_SECRET` | Secret key for signing & verifying tokens |

> ⚠️ **Don't commit real credentials.** The `.gitignore` already excludes `.env` files.

---

## 🚀 Local Setup Instructions

### 1. Clone the repo

```bash
git clone https://github.com/<your-username>/Note-Taking-App-.git
cd Note-Taking-App-
```

### 2. Install dependencies

```bash
# install backend packages
cd backend
npm install

# install frontend packages
cd ../frontend
npm install
```

### 3. Set up your environment

Copy the template above into `backend/.env` and fill in your own MongoDB URI and a strong JWT secret.

### 4. Start both servers

Open **two terminals**:

```bash
# Terminal 1 – start the backend (runs on port 5000)
cd backend
npm run dev

# Terminal 2 – start the frontend (runs on port 5173)
cd frontend
npm run dev
```

Then open **http://localhost:5173** in your browser and you're good to go!

---

## 📡 API Endpoints

### Auth – `/api/auth`

| Method | Route       | Body                        | What it does         |
| ------ | ----------- | --------------------------- | -------------------- |
| POST   | `/register` | `{ name, email, password }` | registers a new user |
| POST   | `/login`    | `{ email, password }`       | returns a JWT token  |

### Notes – `/api/notes` _(all routes need `Authorization: Bearer <token>`)_

| Method | Route                | What it does                                   |
| ------ | -------------------- | ---------------------------------------------- |
| GET    | `/`                  | list all notes you own or collaborate on       |
| GET    | `/search?q=text`     | full-text search across your accessible notes  |
| GET    | `/:id`               | get a single note (must be owner/collaborator) |
| POST   | `/`                  | create a new note                              |
| PUT    | `/:id`               | update title or content                        |
| DELETE | `/:id`               | delete a note (owner only)                     |
| PUT    | `/:id/collaborators` | add a collaborator by email (owner only)       |
| PATCH  | `/:id/collaborators` | add a collaborator by userId (owner only)      |
| DELETE | `/:id/collaborators` | remove a collaborator (owner only)             |

### Users – `/api/users` _(needs `Authorization: Bearer <token>`)_

| Method | Route         | What it does            |
| ------ | ------------- | ----------------------- |
| GET    | `/?email=...` | look up a user by email |

---

## 📄 License

This project was built for educational purposes as part of a university assignment.
