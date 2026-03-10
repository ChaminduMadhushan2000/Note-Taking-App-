# Collaborative Note-Taking App

A full-stack collaborative note-taking web app built with the **MERN stack** (MongoDB, Express, React, Node.js) and styled with **Tailwind CSS**. Features JWT authentication, a rich text editor, full-text search, and real-time collaborator management.

---

## Features

- **JWT Authentication** — Register & login with hashed passwords (bcrypt) and token-based sessions
- **Rich Text Editor** — React Quill integration for formatting notes
- **Full-Text Search** — MongoDB text index on title and content for instant search
- **Collaborator Management** — Invite users by email; collaborators can view and edit shared notes
- **Owner Permissions** — Only the note owner can delete notes or manage collaborators
- **iOS-Inspired UI** — Clean, minimal design with Tailwind CSS (frosted glass headers, rounded cards, soft shadows)

---

## Tech Stack

| Layer    | Technology                                                  |
| -------- | ----------------------------------------------------------- |
| Frontend | React 19, React Router, Axios, React Quill, Tailwind CSS v4 |
| Backend  | Node.js, Express 5, Mongoose, JWT, bcrypt                   |
| Database | MongoDB (Atlas or local)                                    |

---

## Project Structure

```
Note-Taking-App-/
├── backend/
│   ├── middleware/
│   │   └── authMiddleware.js      # JWT verification middleware
│   ├── models/
│   │   ├── Note.js                # Note schema (text index on title & content)
│   │   └── User.js                # User schema
│   ├── routes/
│   │   ├── authRoutes.js          # POST /register, /login
│   │   ├── noteRoutes.js          # CRUD + search + collaborator routes
│   │   └── userRoutes.js          # GET /users?email=...
│   ├── server.js                  # Express app entry point
│   ├── .env                       # Environment variables (do NOT commit)
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   └── CollaboratorModal.jsx
│   │   ├── context/
│   │   │   └── AuthContext.jsx     # Global auth state & hooks
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx       # Note grid + search
│   │   │   ├── Login.jsx
│   │   │   ├── NoteEditor.jsx      # Rich text editor page
│   │   │   └── Register.jsx
│   │   ├── utils/
│   │   │   └── api.js              # Axios instance with JWT interceptor
│   │   ├── App.jsx                 # Routes & auth guards
│   │   ├── main.jsx                # React entry point
│   │   └── index.css               # Tailwind import + Quill overrides
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
└── README.md
```

---

## Prerequisites

- **Node.js** v18 or later
- **MongoDB** — either a local instance or a [MongoDB Atlas](https://www.mongodb.com/atlas) cluster

---

## Environment Variables

Create a `backend/.env` file with the following:

```env
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<dbname>?retryWrites=true&w=majority
JWT_SECRET=replace_with_a_long_random_secret
```

| Variable     | Description                               |
| ------------ | ----------------------------------------- |
| `PORT`       | Port the Express server listens on        |
| `MONGO_URI`  | MongoDB connection string                 |
| `JWT_SECRET` | Secret key used to sign/verify JWT tokens |

> **Do not commit real credentials.** The `.gitignore` already excludes `.env` files.

---

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/<your-username>/Note-Taking-App-.git
cd Note-Taking-App-
```

### 2. Install dependencies

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 3. Configure environment

Copy the template above into `backend/.env` and fill in your MongoDB URI and a secure JWT secret.

### 4. Start the development servers

```bash
# Terminal 1 — Backend (port 5000)
cd backend
npm run dev

# Terminal 2 — Frontend (port 5173)
cd frontend
npm run dev
```

Open **http://localhost:5173** in your browser.

---

## API Endpoints

### Auth (`/api/auth`)

| Method | Endpoint    | Body                        | Description       |
| ------ | ----------- | --------------------------- | ----------------- |
| POST   | `/register` | `{ name, email, password }` | Create a new user |
| POST   | `/login`    | `{ email, password }`       | Get a JWT token   |

### Notes (`/api/notes`) — all require `Authorization: Bearer <token>`

| Method | Endpoint             | Description                                 |
| ------ | -------------------- | ------------------------------------------- |
| GET    | `/`                  | List notes you own or collaborate on        |
| GET    | `/search?q=text`     | Full-text search on accessible notes        |
| GET    | `/:id`               | Get a single note (owner/collaborator only) |
| POST   | `/`                  | Create a new note                           |
| PUT    | `/:id`               | Update title/content (owner/collaborator)   |
| DELETE | `/:id`               | Delete a note (owner only)                  |
| PUT    | `/:id/collaborators` | Add collaborator by email (owner only)      |
| PATCH  | `/:id/collaborators` | Add collaborator by userId (owner only)     |
| DELETE | `/:id/collaborators` | Remove collaborator by userId (owner only)  |

### Users (`/api/users`) — requires `Authorization: Bearer <token>`

| Method | Endpoint      | Description             |
| ------ | ------------- | ----------------------- |
| GET    | `/?email=...` | Look up a user by email |
