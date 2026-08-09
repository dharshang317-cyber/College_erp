# Campus Ledger — College Maintenance ERP

A full-stack MERN system for managing attendance/exam eligibility, library
circulation, exam halls, placements, faculty attendance, and timetables
under one role-based platform.

**Built and working right now:** Auth + RBAC, Attendance & 75% Eligibility
Engine (with condonation workflow and bunk calculator), Library Management
(catalog, issue/return, fines, reservation queue).

**Scaffolded with a clear extension guide:** Exam Hall, Placement, Faculty
Attendance, Timetable — see `EXTENDING.md` for the exact models, endpoints,
and unique logic to add for each, following the same pattern as the two
modules already built.

## Project structure

```
college-erp/
├── backend/
│   ├── config/db.js
│   ├── models/          User, Subject, Attendance, CondonationRequest,
│   │                    Book, BookTransaction
│   ├── middleware/       auth.js (JWT), role.js (RBAC)
│   ├── controllers/      authController, attendanceController, libraryController
│   ├── routes/           authRoutes, attendanceRoutes, libraryRoutes
│   ├── server.js         Express + Socket.io entry point
│   ├── seed.js           sample data for local testing
│   └── .env.example
└── frontend/
    ├── src/
    │   ├── api/client.js         axios instance with JWT interceptor
    │   ├── context/AuthContext.jsx
    │   ├── components/Layout.jsx  sidebar shell, role-filtered nav
    │   └── pages/  Login, Dashboard, AttendancePage, LibraryPage
    ├── tailwind.config.js         "ledger" design tokens
    └── index.html
```

## Setup

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env
# edit .env: set MONGO_URI (local Mongo or MongoDB Atlas) and JWT_SECRET
npm run seed     # creates 4 sample users + subject + attendance + books
npm run dev      # starts on http://localhost:5000
```

Seeded logins (all password: `password123`):
- `admin@college.edu`
- `faculty@college.edu`
- `student@college.edu` — pre-loaded with 70% attendance in one subject, so you can see the "below threshold" state immediately
- `librarian@college.edu`

### 2. Frontend

```bash
cd frontend
npm install
npm run dev       # starts on http://localhost:5173
```

Create a `frontend/.env` if your backend isn't on the default port:
```
VITE_API_URL=http://localhost:5000/api
```

### 3. Try it

1. Log in as `student@college.edu` → go to **Attendance** → see the
   CSE301 card showing 70%, marked "Below threshold."
2. Log in as `librarian@college.edu` or `admin@college.edu` → go to
   **Library** → see "Introduction to Algorithms" showing 1/2 copies free.

## API quick reference

| Method | Endpoint | Access |
|---|---|---|
| POST | `/api/auth/register` | open (lock to admin in production) |
| POST | `/api/auth/login` | open |
| POST | `/api/attendance/mark` | faculty, admin |
| GET | `/api/attendance/student/:id/summary` | authenticated |
| POST | `/api/attendance/condonation` | student |
| PUT | `/api/attendance/condonation/:id/review` | admin |
| GET | `/api/library/books?search=&category=` | authenticated |
| POST | `/api/library/books/:id/issue` | librarian, admin |
| POST | `/api/library/books/:id/return` | librarian, admin |
| POST | `/api/library/books/:id/reserve` | student |
| GET | `/api/library/overdue` | librarian, admin |

## Next steps

Read `EXTENDING.md` for the model schemas, endpoint list, and the specific
"smart" logic (seating algorithm, combined eligibility filter, workload
variance, timetable conflict detection) to build for the remaining four
modules — each is designed to be a genuine talking point in your project
viva, not just a CRUD screen.

## Deployment (for your final submission)

- Backend → Render or Railway (free tier)
- Frontend → Vercel
- Database → MongoDB Atlas (free M0 cluster)
- Set `CLIENT_URL` in backend `.env` to your deployed frontend URL, and
  `VITE_API_URL` in frontend to your deployed backend URL, before building.
