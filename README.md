# HealthCare+ – Full-stack appointment management system

HealthCare+ upgrades the supplied React + Vite project into a full-stack app. It keeps the original idea, ten doctors, patient/doctor/admin roles, dashboards, appointment statuses and responsive layout.

## Features

- Patient signup and login; passwords are hashed with bcrypt.
- JWT authentication and role-based API permissions.
- Browse ten unique specialist profiles with experience, biographies, images, fees and doctor-specific working schedules.
- Patients book 30-minute appointment slots within each doctor’s schedule, cannot select past times, and can cancel their own pending appointments.
- Doctors see assigned requests, approve or reject them with a mandatory rejection reason, and mark approved visits completed.
- Admin homepage focuses on pending requests; separate Patients, Doctors and Appointments tabs provide record history and management.
- SQLite stores users, doctors and appointments persistently.
- Loading states, success/error notifications and mobile-friendly layout.

## Technology

- React 18 + Vite: frontend.
- Node.js + Express: REST API.
- SQLite + better-sqlite3: persistent database.
- bcryptjs: password hashing.
- jsonwebtoken: login tokens.
- cors and dotenv: local frontend access and environment configuration.

## Requirements

- Node.js 20 LTS or newer (18.18+ should also work).
- npm (included with Node.js).

## Setup (Windows, macOS or Linux)

Open the project folder `HealthCare-Plus` in VS Code.

### 1. Create your environment file

Copy `.env.example` to `.env` in the project root.

Windows Command Prompt:
```bat
copy .env.example .env
```

PowerShell:
```powershell
Copy-Item .env.example .env
```

macOS/Linux:
```bash
cp .env.example .env
```

Open `.env` and replace `JWT_SECRET` with a long random string (at least 32 characters). Keep `.env` private; do not upload it to GitHub.

### 2. Install backend dependencies

Open **Terminal 1 – Backend**:
```bash
cd backend
npm install
```

### 3. Start the backend

In the same Terminal 1:
```bash
npm run dev
```
Expected message:
```text
HealthCare+ API listening on http://localhost:5000
```
The database is created automatically at `database/healthcare.sqlite` on first start.

Check the API by opening `http://localhost:5000/api/health`. It should return JSON with `"status":"ok"`.

### 4. Install frontend dependencies

Open **Terminal 2 – Frontend** from the project root:
```bash
cd frontend
npm install
```

### 5. Start the frontend

In Terminal 2:
```bash
npm run dev
```
Open the URL Vite prints, normally `http://localhost:5173`.

Keep both terminals running while using the app.

## Demo login accounts

| Role | Email | Password |
|---|---|---|
| Admin | admin@healthcare.com | admin123 |
| Doctor (Dr. Anil Kumar) | doctor@healthcare.com | doctor123 |
| Other seeded doctors | `drfirstname...@healthcare.com` (normalized doctor name) | doctor123 |

Create patient accounts using the signup tab. The legacy doctor demo account is assigned to Dr. Anil Kumar. Each seeded doctor also has a login: use the email formed by removing spaces and punctuation from the doctor name and appending `@healthcare.com` (for example, `drpriyasharma@healthcare.com`) with password `doctor123`.

## API endpoints

All routes are prefixed with `/api`.

| Method | Endpoint | Access | Purpose |
|---|---|---|---|
| GET | `/health` | Public | API health check |
| POST | `/auth/signup` | Public | Create patient account |
| POST | `/auth/login` | Public | Login and receive JWT |
| GET | `/doctors` | Logged in | List/search doctors |
| GET | `/appointments` | Logged in | List appointments visible to role |
| POST | `/appointments` | Patient | Book an appointment |
| PATCH | `/appointments/:id/status` | Role checked | Update/cancel status |
| DELETE | `/appointments/:id` | Admin | Delete appointment |
| GET | `/admin/summary` | Admin | Patient list and statistics |

Protected requests send `Authorization: Bearer <token>`. The server checks both the token and the user's role/ownership before changing data.

## How one booking works

1. A patient selects a doctor, an available date and a 30-minute time slot in `PatientDashboard.jsx`.
2. React sends `POST /api/appointments` using `api.js`.
3. Express checks the JWT, patient role, date, doctor schedule, working hours and past-time restriction.
4. The backend reads the doctor's fee from SQLite and inserts the appointment.
5. A SQLite unique partial index prevents duplicate active bookings for the same doctor/date/time. Express returns the saved appointment.
6. React updates the appointments list and shows a success notification.

The browser does not decide the appointment fee or write to the database directly.

## Important files

- `frontend/src/App.jsx`: session, role-based dashboard selection and notifications.
- `frontend/src/api.js`: common function for backend requests.
- `frontend/src/pages/`: login and role-specific dashboards.
- `frontend/src/components/`: reusable interface pieces.
- `backend/server.js`: Express server and API route registration.
- `backend/middleware/auth.js`: JWT and role checks.
- `backend/routes/`: authentication, doctors, appointments and admin endpoints.
- `database/schema.sql`: database table definitions.
- `backend/database.js`: opens SQLite and inserts initial doctors/demo users.\n- `database/schema.sql`: database table definitions.
- `.env.example`: required environment variable template.

## Test checklist

1. Start backend and frontend in separate terminals.
2. Open `/api/health`; expect `status: ok`.
3. Login as admin; expect ten doctors, patient/appointment counts and admin controls.
4. Logout and login as doctor; expect doctor appointment dashboard.
5. Create a patient account; expect the patient dashboard.
6. Search for each specialty; expect ten distinct doctor profiles.
7. Select a future date and book; expect a pending appointment.
8. Login as doctor; approve or reject the request (enter a rejection reason when rejecting), or mark an approved visit completed.
9. Login as patient; refresh the page; expect the updated status to remain.
10. Cancel another pending appointment as the patient.
11. Login as admin; change a status or delete an appointment.
12. Stop and restart the backend; existing users and appointments should remain.

For a clean demo database, stop the backend and delete `database/healthcare.sqlite` plus its `-shm` and `-wal` files. Restart the backend to seed the demo accounts and doctors again. This permanently resets local demo data.

## Production and demo security notes

This is a hackathon/local demonstration starter, not a production medical-record system. Do not store real patient health information. For production, add HTTPS, secure cookie-based token handling, rate limiting, audit logs, backups, stronger account recovery, privacy controls and a formal security review. Demo credentials are public and must not be used in a deployed public instance.

## Build the frontend

From `frontend/`:
```bash
npm run build
```
Vite writes the production files to `frontend/dist/`.
