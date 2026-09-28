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
| 3     | Admin dashboard and CRUD (users, students, classrooms, …)     | Not started |
| 4     | Teacher modules (classrooms, students, schedule, assessments, scores) | Not started |
| 5     | Salary configuration and calculation                          | Not started |
| 6     | Security hardening                                            | Partly done (see below) |
| 7     | Testing                                                       | Auth covered |
| 8     | Deployment                                                    | Not started |

Sidebar links for modules that are not built yet open a "Not built yet" page.

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

In Atlas, also allow your IP under **Network Access**.

### 2. Install, seed and run

```bash
# API — http://localhost:5050/api
cd server
npm install
npm run seed    # creates the admin (and demo teacher) from SEED_* values; safe to re-run
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
| POST   | `/api/auth/register` | Admin only    | Create an account `{ firstName, lastName, email, password, role?, status? }` |

### Authentication and authorization

- Passwords are hashed with bcrypt (12 rounds) and never returned by the API.
- `authenticateUser` verifies the JWT **and reloads the user on every request**, so deactivating an account or changing its role takes effect immediately.
- `requireRole('admin')` / `requireRole('teacher')` guards routes on the server. The React route guards are only for UX.
- Login returns the same error for an unknown email and a wrong password, and takes the same time for both.
- Only `admin` and `teacher` accounts can sign in. `student` accounts are records only for now.
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
