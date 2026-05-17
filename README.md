<div align="center">

# 🗒️ Peblo Notes

**A full-stack, AI-powered notes workspace — built for thinkers who move fast.**

[![React](https://img.shields.io/badge/React_18-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)](https://postgresql.org/)
[![Gemini](https://img.shields.io/badge/Gemini_AI-8E75B2?style=for-the-badge&logo=google&logoColor=white)](https://aistudio.google.com/)

*Write notes. Let AI do the rest.*

</div>

---

## 🌟 What is Peblo Notes?

Peblo Notes is a full-stack notes application where every note is a workspace. Capture ideas, meeting notes, goals, or plans — then let the built-in AI assistant summarise them, extract action items, and suggest the perfect title. Share notes publicly with a single link. Track everything from a live dashboard.

Built as a submission for the **Peblo Full Stack Developer Challenge**.

---

## ✨ Features at a Glance

| | Feature | What it does |
|---|---|---|
| 🔐 | **Authentication** | Secure JWT-based signup & login with persistent sessions |
| 📝 | **Smart Notes Editor** | Rich editing with auto-save, tags, categories, and archiving |
| ✦ | **AI Assistant** | Summarise notes, extract action items, suggest titles — one click |
| 🔍 | **Search & Filter** | Full-text search with tag, category, and sort filters |
| 🌐 | **Public Sharing** | Shareable read-only links for any note |
| 📊 | **Live Dashboard** | Activity charts, tag clouds, AI usage stats, recent notes |

---

## 🖥️ Tech Stack

### Frontend
- **React 18** — component-driven UI with hooks
- **React Router v6** — client-side routing
- **Framer Motion** — fluid animations and transitions
- **Axios** — HTTP client with interceptors
- **React Hot Toast** — lightweight notification system
- **date-fns** — date formatting

### Backend
- **Node.js + Express** — fast, minimal API server
- **PostgreSQL + pg** — relational data with raw SQL
- **JWT + Bcrypt** — stateless auth with secure password hashing
- **Express Rate Limiter** — abuse protection on all routes
- **Morgan** — request logging

### AI
- **Google Gemini API** (`gemini-2.0-flash`) — summarisation, action extraction, title suggestion

---

## 🗂️ Project Structure

```
peblo-notes/
├── backend/
│   └── src/
│       ├── index.js          # Server entry + middleware setup
│       ├── middleware/        # JWT auth guard
│       ├── models/            # DB connection, migrations, seed
│       ├── routes/            # auth · notes · shared · insights
│       └── services/
│           └── ai.js          # Gemini AI integration
│
└── frontend/
    └── src/
        ├── App.jsx            # Router setup
        ├── components/        # Sidebar · NoteCard · AppLayout · ProtectedRoute
        ├── context/           # AuthContext · NotesContext
        ├── hooks/             # useNotes
        ├── lib/               # Axios API client
        ├── pages/             # Login · Notes · Editor · Dashboard · Archive · Shared
        └── styles/            # Per-component CSS + global theme
```

---

## ⚡ Quick Start

### Prerequisites

- Node.js 18+
- PostgreSQL 14+
- A [Google Gemini API key](https://aistudio.google.com) (free)

---

### 1. Clone the repo

```bash
git clone https://github.com/leonagoel/peblo-notes.git
cd peblo-notes
```

### 2. Set up the database

```bash
psql -U postgres -c "CREATE DATABASE peblo_notes;"
```

### 3. Configure the backend

```bash
cd backend
cp .env.example .env
```

Fill in `backend/.env`:

```env
DATABASE_URL=postgresql://postgres:yourpassword@localhost:5432/peblo_notes
JWT_SECRET=your_super_secret_key_here
GEMINI_API_KEY=your_gemini_api_key_here
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

```bash
npm install
npm run db:migrate     # set up tables
npm run db:seed        # (optional) load sample data
```

### 4. Configure the frontend

```bash
cd ../frontend
cp .env.example .env
```

Fill in `frontend/.env`:

```env
REACT_APP_API_URL=http://localhost:5000/api
```

```bash
npm install
```

### 5. Run the app

Open two terminals:

```bash
# Terminal 1 — Backend
cd backend && npm run dev
# → http://localhost:5000

# Terminal 2 — Frontend
cd frontend && npm start
# → http://localhost:3000
```

---

## 🔌 API Reference

### Auth
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/signup` | Register a new user |
| `POST` | `/api/auth/login` | Login and receive a JWT |
| `GET` | `/api/auth/me` | Get the current user |

### Notes *(JWT required)*
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/notes` | List notes — supports `?q=&tag=&category=&sort=&archived=` |
| `POST` | `/api/notes` | Create a note |
| `GET` | `/api/notes/:id` | Get a single note |
| `PATCH` | `/api/notes/:id` | Update a note |
| `DELETE` | `/api/notes/:id` | Delete a note |
| `POST` | `/api/notes/:id/generate-summary` | AI — summarise note |
| `POST` | `/api/notes/:id/generate-actions` | AI — extract action items |
| `POST` | `/api/notes/:id/generate-title` | AI — suggest a title |

### Other
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/shared/:shareId` | View a public note (no auth) |
| `GET` | `/api/insights` | Dashboard analytics data |
| `GET` | `/api/health` | Server health check |

---

## 🗃️ Database Schema

```sql
users
  id · name · email · password_hash · created_at

notes
  id · user_id · title · body · category · tags[]
  archived · share_id · is_public
  ai_summary · ai_action_items[] · ai_suggested_title
  ai_generated · ai_call_count · created_at · updated_at

ai_usage
  id · user_id · note_id · action_type · tokens_used · created_at
```

---

## 🔒 Security

- Passwords hashed with **bcrypt** (12 salt rounds)
- **JWT tokens** expire after 7 days
- **Rate limiting** — 200 req / 15 min on all routes; 10 req / min on AI endpoints
- **CORS** restricted to the configured frontend origin
- `.env` files excluded from version control — no secrets in the repo

---

## 📦 Sample AI Output

```json
{
  "summary": "Sprint planning session covering Q2 priorities: shipping the AI notes feature, refactoring authentication, and improving search performance by 40%.",
  "actionItems": [
    "Complete design review for new dashboard",
    "Resolve missing API keys for staging environment",
    "Refactor the authentication module"
  ],
  "suggestedTitle": "Q2 Sprint Planning — May 2026"
}
```

---

## 🚀 Deployment

| Layer | Recommended platforms |
|---|---|
| **Backend** | Railway · Render · Fly.io |
| **Frontend** | Vercel · Netlify |
| **Database** | Supabase · Neon · Railway |

Set all environment variables in your platform's dashboard — never in the codebase.

---

## 👤 Demo Credentials

After running `npm run db:seed`:

```
Email:    demo@peblo.com
Password: password123
```

---

<div align="center">

*Built with ❤️ by Leona Goel for the Peblo Full Stack Developer Challenge*

</div>
