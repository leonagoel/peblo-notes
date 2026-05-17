# 🚀 Peblo AI Notes Workspace

A full-stack, collaborative, AI-powered notes workspace built for the Peblo Full Stack Developer Challenge.

![Stack](https://img.shields.io/badge/Frontend-React_18-61DAFB?style=flat&logo=react)
![Stack](https://img.shields.io/badge/Backend-Node.js_+_Express-339933?style=flat&logo=nodedotjs)
![Stack](https://img.shields.io/badge/Database-PostgreSQL-4169E1?style=flat&logo=postgresql)
![Stack](https://img.shields.io/badge/AI-Anthropic_Claude-7C5AF7?style=flat)

---

## ✨ Features

| Feature | Details |
|---|---|
| 🔐 **Authentication** | JWT-based signup/login, protected routes, persistent sessions |
| 📝 **Notes Workspace** | Create, edit, tag, categorise, archive notes with auto-save |
| ✦ **AI Integration** | Summaries, action items, title suggestions via Claude API |
| 🔍 **Search & Filter** | Full-text search, tag & category filtering, sort options |
| 🌐 **Public Sharing** | Shareable public links with clean read-only view |
| 📊 **Dashboard** | Activity charts, tag usage, recent notes, AI usage stats |

---

## 🗂 Project Structure

```
peblo-notes/
├── backend/              # Express API
│   ├── src/
│   │   ├── index.js      # Server entry point
│   │   ├── middleware/   # JWT auth middleware
│   │   ├── models/       # DB connection, migrations, seed
│   │   ├── routes/       # auth, notes, shared, insights
│   │   └── services/     # AI service (Anthropic SDK)
│   ├── .env.example
│   └── package.json
│
├── frontend/             # React app
│   ├── src/
│   │   ├── App.jsx        # Router setup
│   │   ├── components/    # Sidebar, NoteCard, AppLayout, ProtectedRoute
│   │   ├── context/       # AuthContext, NotesContext
│   │   ├── hooks/         # useNotes
│   │   ├── lib/           # Axios API client
│   │   ├── pages/         # Login, Notes, Editor, Dashboard, Archive, Shared
│   │   └── styles/        # Per-component CSS + global
│   ├── .env.example
│   └── package.json
│
└── README.md
```

---

## ⚡ Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- An [Anthropic API key](https://console.anthropic.com)

---

### 1. Clone the repository

```bash
git clone https://github.com/yourname/peblo-notes.git
cd peblo-notes
```

---

### 2. Set up the database

```bash
# Create a PostgreSQL database
psql -U postgres -c "CREATE DATABASE peblo_notes;"
```

---

### 3. Configure the backend

```bash
cd backend
cp .env.example .env
```

Edit `backend/.env`:

```env
DATABASE_URL=postgresql://postgres:yourpassword@localhost:5432/peblo_notes
JWT_SECRET=your_super_secret_key_here
ANTHROPIC_API_KEY=sk-ant-your-key-here
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

```bash
npm install

# Run database migrations
npm run db:migrate

# (Optional) Seed sample data
npm run db:seed
```

---

### 4. Configure the frontend

```bash
cd ../frontend
cp .env.example .env
```

Edit `frontend/.env`:

```env
REACT_APP_API_URL=http://localhost:5000/api
```

```bash
npm install
```

---

### 5. Run the app

Open **two terminals**:

**Terminal 1 — Backend:**
```bash
cd backend
npm run dev
# API running at http://localhost:5000
```

**Terminal 2 — Frontend:**
```bash
cd frontend
npm start
# App running at http://localhost:3000
```

---

## 🔌 API Reference

### Authentication
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/signup` | Register new user |
| POST | `/api/auth/login` | Login, receive JWT |
| GET | `/api/auth/me` | Get current user |

### Notes (require `Authorization: Bearer <token>`)
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/notes` | List notes (supports `?q=&tag=&category=&sort=&archived=`) |
| POST | `/api/notes` | Create note |
| GET | `/api/notes/:id` | Get single note |
| PATCH | `/api/notes/:id` | Update note |
| DELETE | `/api/notes/:id` | Delete note |
| POST | `/api/notes/:id/generate-summary` | AI summary |
| POST | `/api/notes/:id/generate-actions` | AI action items |
| POST | `/api/notes/:id/generate-title` | AI title suggestion |

### Other
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/shared/:shareId` | Public note (no auth) |
| GET | `/api/insights` | Dashboard data |
| GET | `/api/health` | Health check |

---

## 🎨 Tech Stack

**Frontend**
- React 18 with hooks
- React Router v6
- Framer Motion (animations)
- Axios (HTTP client)
- React Hot Toast (notifications)
- date-fns (date formatting)

**Backend**
- Node.js + Express
- PostgreSQL with `pg`
- JWT authentication (`jsonwebtoken`)
- Bcrypt password hashing
- Express Rate Limiter
- Morgan (logging)

**AI**
- Anthropic Claude SDK (`claude-opus-4-5`)
- Features: summarisation, action item extraction, title suggestion

---

## 🗃 Database Schema

```sql
users          -- id, name, email, password_hash, created_at
notes          -- id, user_id, title, body, category, tags[], archived,
               -- share_id, is_public, ai_summary, ai_action_items[],
               -- ai_suggested_title, ai_generated, ai_call_count
ai_usage       -- id, user_id, note_id, action_type, tokens_used
```

---

## 🔒 Security

- Passwords hashed with bcrypt (12 rounds)
- JWT tokens expire after 7 days
- Rate limiting on all API routes (200 req/15min)
- Stricter AI endpoint limiting (10 req/min)
- CORS restricted to frontend origin
- No secrets committed — use `.env` files only

---

## 📦 Sample AI Output

```json
{
  "summary": "Weekly project planning discussion covering Q2 roadmap priorities including AI feature shipping, auth refactoring, and search performance improvements.",
  "actionItems": ["Prepare UI mockups", "Review API structure", "Schedule design review"],
  "suggestedTitle": "Q2 Sprint Planning Notes"
}
```

---

## 🚀 Deployment

**Backend** → Railway, Render, or Fly.io  
**Frontend** → Vercel or Netlify  
**Database** → Supabase, Railway, or Neon

Set all environment variables in your deployment platform.

---

## 👤 Demo Credentials

If you ran `npm run db:seed`:
- Email: `demo@peblo.com`
- Password: `password123`

---

*Built with ❤️ for the Peblo Full Stack Developer Challenge*
