# Classroom and Teacher Management System

A full-stack web app for managing classrooms, students, competencies, schedules, scores and teacher salaries, with separate **Administrator** and **Teacher** portals.

| Layer    | Stack                                                                    |
| -------- | ------------------------------------------------------------------------ |
| Client   | React 19, Vite, React Router, Tailwind CSS, Axios, React Hook Form, Zod  |
| Server   | Node.js (≥ 22.9), Express 5, Mongoose, JWT, bcryptjs, Helmet, Zod        |
| Database | MongoDB Atlas                                                            |

```
client/   React + Vite single-page app (admin and teacher portals)
server/   Express REST API — the only thing that talks to MongoDB
```

## Development status

| Phase | Scope                                                         | Status      |
| ----- | ------------------------------------------------------------- | ----------- |
| 1     | Project setup, environment config, API connection             | ✅ Done     |
| 2     | Authentication, password hashing, JWT, RBAC, protected routes | ✅ Done     |
| 3     | Admin dashboard and CRUD (users, students, classrooms, …)     | Done except competencies and schedules |
| 4     | Teacher modules (classrooms, students, schedule, assessments, scores) | Classrooms, students, and scores done |
| 5     | Salary configuration and calculation                          | Not started |
| 6     | Security hardening                                            | Partly done (see below) |
| 7     | Testing                                                       | Auth covered |
| 8     | Deployment                                                    | Configured (GitHub Pages + Render) |

Sidebar links for modules that are not built yet open a "Not built yet" page.

### Student portal

Students sign in to `/student`: dashboard, attendance, grades, subjects, schedule, announcements, finance, documents, notifications and profile, plus global search (Ctrl K) and a notification bell.

**Grades are real**: they are computed by the API from the scores teachers record (`GET /api/students/me/grades`). The other sections (attendance, schedule, finance, documents, notifications) still run on **mock data** in `client/src/mocks/student/`, accessed only through `client/src/services/student.service.js`. Replacing that service's functions with API calls is all it takes to connect them.

### How grades are computed

Each **subject** has its own grading weights, set by admins on the Subjects page and used by every class of that subject in every semester:

- **Category weights** (Quiz, Assignment, Project, Examination, Participation, Other; total 100%) combine scores *within* a grading period. Scores in a category are pooled (total score ÷ total maximum). Categories with no scores yet are left out and the remaining weights re-normalized, so a missing quiz doesn't count as zero.
- **Period weights** (Prelim, Midterm, Final; total 100%) combine the three period grades into the **final rating**, which appears once all three have scores.
- The rating maps to the 1.00–5.00 grade point scale (75 = 3.00 passing). GWA is the unit-weighted average of grade points over completed semesters.

The logic lives in `server/src/services/grading.service.js` (unit-tested in `server/tests/grading.test.js`). Changes a student makes (profile edits, document requests, read notifications, photo) are kept in the browser's `localStorage`. Downloadable documents are generated PDFs marked as samples.

## Getting started

### 1. Configure the server

`server/.env` is not committed. Copy the template if you don't have one:

```bash
cp server/.env.example server/.env
```

Then fill in:

| Variable                  | What to put there                                                                 |
| ------------------------- | --------------------------------------------------------------------------------- |
| `MONGODB_URI`             | Your Atlas connection string (Atlas → **Database** → **Connect** → **Drivers**). Include a database name, e.g. `…mongodb.net/ctms?…` |
| `JWT_SECRET`              | 32+ random characters: `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"` |
| `SEED_ADMIN_PASSWORD`     | Password for the first admin account (8–72 chars, a letter and a number)          |
| `SEED_TEACHER_PASSWORD`   | Optional demo teacher account; leave empty to skip                                |
| `SEED_STUDENT_PASSWORD`   | Optional demo student (Juan Dela Cruz, `SEED_STUDENT_EMAIL`); leave empty to skip |

In Atlas, also allow your IP under **Network Access**.

### 2. Install, seed and run

```bash
# API — http://localhost:5050/api
cd server
npm install
npm run seed    # creates the admin (and demo teacher/student) from SEED_* values; safe to re-run
npm run seed:demo  # optional: subjects, faculty, classmates, 5 semesters of classes and scores; runs once
npm run dev

# Client — http://localhost:5173 (in a second terminal)
cd client
npm install
npm run dev
```

Sign in with the `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` from `server/.env`.

> The API uses port **5050**, not 5000: on Windows, port 5000 is often held by a system service.

### 3. Run the tests

```bash
cd server
npm test
```

Tests use an in-memory MongoDB (`mongodb-memory-server`), so they never touch Atlas. The first run downloads a MongoDB binary.

## Deployment

| Part   | Host                     | URL                                   |
| ------ | ------------------------ | ------------------------------------- |
| Client | GitHub Pages (free)      | https://jirodc.github.io/project1/    |
| API    | Render free web service  | `https://<service-name>.onrender.com` |
| DB     | MongoDB Atlas            | —                                     |

GitHub Pages only serves static files, so the API runs on Render.

### API on Render (one time)

1. In [Render](https://render.com): **New → Blueprint**, connect this repository. `render.yaml` defines the service.
2. When prompted, enter `MONGODB_URI` (the same Atlas string as `server/.env`). `JWT_SECRET` is generated automatically.
3. In Atlas → **Network Access**, allow `0.0.0.0/0`. Render's free tier has no fixed outgoing IP.
4. Once deployed, open `https://<service-name>.onrender.com/api/health` and check it says `"database":"connected"`.

Free Render services sleep after 15 minutes idle, so the first request after that can take up to a minute.

### Client on GitHub Pages (one time)

1. The repository must be **public** for free GitHub Pages.
2. **Settings → Pages → Build and deployment → Source: GitHub Actions.**
3. **Settings → Secrets and variables → Actions → Variables → New repository variable:** `VITE_API_URL` = `https://<service-name>.onrender.com/api`.
4. **Actions → Deploy client to GitHub Pages → Run workflow.**

After that, every push to `main` that changes `client/` redeploys the site (`.github/workflows/deploy-client.yml`).

## Environment variables

**Server** (`server/.env`): `PORT`, `NODE_ENV`, `MONGODB_URI`, `JWT_SECRET`, `JWT_EXPIRES_IN` (default `1d`), `CLIENT_URL` (comma-separated allowed origins), `TRUST_PROXY` (set to `1` behind Render/Railway/Nginx), `SEED_*`.

**Client** (`client/.env`): `VITE_API_URL` only. Everything in the client bundle is public, so database credentials and JWT secrets must never go there.

## API

All responses use one envelope:

```json
{ "success": true,  "message": "Login successful", "data": { } }
{ "success": false, "message": "Validation failed", "error": "One or more fields are invalid",
  "details": [{ "field": "email", "message": "Enter a valid email address" }] }
```

Authenticated requests send `Authorization: Bearer <token>`.

| Method | Endpoint             | Access        | Description                                            |
| ------ | -------------------- | ------------- | ------------------------------------------------------ |
| GET    | `/api/health`        | Public        | API and database status                                |
| POST   | `/api/auth/login`    | Public        | `{ email, password }` → `{ user, token }`. Rate limited to 10 failed attempts / 15 min |
| GET    | `/api/auth/me`       | Signed in     | Current user                                           |
| POST   | `/api/auth/logout`   | Signed in     | Records the sign-out; the client discards the token    |
| POST   | `/api/auth/change-password` | Signed in | `{ currentPassword, newPassword }`. Shares the login rate limit |

Academic modules (lists accept `?page&limit&search` plus the filters shown; `DELETE` deactivates, it never removes):

| Endpoints | Access | Notes |
| --------- | ------ | ----- |
| `/api/users` (`GET`, `POST`, `GET/PUT/DELETE /:id`, `POST /:id/reset-password`) | Admin | Filters `role`, `status`. Admins can't deactivate themselves or the last active admin. |
| `/api/subjects` (+ `/:id`) | Read: admin, teacher · Write: admin | Includes `grading` weights, validated to total 100%. |
| `/api/students` (+ `/:id`, `/lookup?search=`) | Read: admin, teacher · Write: admin | Creating a student also creates their login. Teachers only see students in their classes. |
| `/api/students/me`, `/api/students/me/grades` | Student | The signed-in student's record and computed grade report. |
| `/api/classrooms` (+ `/:id`, `/:id/gradebook`, `PUT /:id/students`) | Read and class list: admin, class teacher · Other writes: admin | Teachers only ever see their own classes; others return 404. |
| `/api/scores` (`GET ?classroomId=`, `POST`, `PUT/DELETE /:id`) | Admin, class teacher | Students must be enrolled; score can't exceed the maximum. |
| `/api/dashboard/admin`, `/api/activity-logs` | Admin | Counts and the audit trail. |
| POST   | `/api/auth/register` | Admin only    | Create an account `{ firstName, lastName, email, password, role?, status? }` |

### Authentication and authorization

- Passwords are hashed with bcrypt (12 rounds) and never returned by the API.
- `authenticateUser` verifies the JWT **and reloads the user on every request**, so deactivating an account or changing its role takes effect immediately.
- `requireRole('admin')` / `requireRole('teacher')` guards routes on the server. The React route guards are only for UX.
- Login returns the same error for an unknown email and a wrong password, and takes the same time for both.
- `admin`, `teacher` and `student` accounts each sign in to their own portal; the others are off-limits.
- There is no public sign-up. Administrators create accounts.

### Security already in place

Helmet headers, a CORS allow-list, JSON body size limit (100 kb), rate limiting (500 req / 15 min per IP overall), removal of `$` and dotted keys from request bodies (NoSQL injection), Zod validation, and centralized error handling that never exposes stack traces.

## Project structure

```
server/src/
  config/        environment.js (validated env), database.js
  controllers/   thin HTTP handlers
  middleware/    auth, role, validation, sanitize, rate limit, error
  models/        Mongoose schemas (User, ActivityLog)
  routes/        route definitions, mounted under /api
  services/      business logic (auth.service.js)
  utils/         jwt, password, AppError, apiResponse, activityLogger
  validators/    Zod request schemas
  scripts/       seed.js
server/tests/    node:test + supertest suites

client/src/
  components/    common (Button, TextField, Alert…), navigation (Sidebar, Topbar, DashboardLayout), dashboard
  config/        navigation.js — sidebar structure per portal
  context/       AuthContext (session state)
  hooks/         useAuth
  layouts/       AdminLayout, TeacherLayout
  pages/         auth, admin, teacher, shared
  routes/        AppRoutes, ProtectedRoute / GuestRoute
  services/      api.js (Axios instance), auth.service.js
  utils/         roles, errors, tokenStorage
```
