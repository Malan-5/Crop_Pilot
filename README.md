# CropPilot

CropPilot is a college crop-care project adapted from Agrovision using React, Vite, Express and MongoDB. It has a redesigned green-and-cream interface, new branding and logo, and **username/password authentication only**. No Google, Firebase, phone or OTP login is used.

The app includes crop health scans, crop records, a care planner, a weather outlook, a scan journal, a private field journal, a growing guide and an account page. Analysis uses Kindwise; live weather uses OpenWeather. Those features need their respective backend API keys.

Use the **Field journal** to record your own crop, plot and field observations between scans, add a follow-up date, search and filter notes, and mark check-ins complete. Field notes are stored locally in the browser and kept separate for each signed-in account on that device; they are not synced to the server.

## Run locally

Requirements: Node.js 22.12+, npm and MongoDB.

From the project folder (PowerShell):

```powershell
npm.cmd run install:all
if (-not (Test-Path backend/.env)) { Copy-Item backend/.env.example backend/.env }
if (-not (Test-Path frontend/.env)) { Copy-Item frontend/.env.example frontend/.env }
```

Set the following in `backend/.env`:

```dotenv
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/croppilot
JWT_SECRET=your-private-random-secret
CLIENT_URL=http://localhost:5173
KINDWISE_API_KEY=your-kindwise-key
OPENWEATHER_API_KEY=your-openweather-key
```

Existing environment files are preserved. Keep an existing database name such as `agrovision` to retain its records. The existing `CLINT_URL` setting is accepted; new configurations use `CLIENT_URL`.

Generate a secret with `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` and copy it into the backend environment file. Set `VITE_API_URL=http://localhost:5000` in `frontend/.env` for production builds. During development, the browser requests `/api` from Vite, which forwards to `VITE_PROXY_TARGET` (default `http://127.0.0.1:5000`). This also works if the frontend uses another local port or is opened from another device.

Start your local MongoDB service, then run:

```powershell
npm.cmd run dev
```

Open **http://localhost:5173**. The backend runs at **http://localhost:5000**. Each folder also supports `npm.cmd run dev`. Use `npm.cmd` on Windows when PowerShell blocks `npm.ps1`; other shells can use `npm`.

Register at `/register`, then sign in at `/login`. Usernames use 3–32 characters, starting with a letter; letters, numbers, underscores, dots and hyphens are allowed. Passwords need at least eight characters and at most 72 UTF-8 bytes. Passwords are hashed with bcrypt; requests use JWT sessions. New usernames are unique without regard to capitalization.

Existing password accounts can still sign in with their usernames. Old phone-only or Google-only accounts cannot be claimed through registration; create a new, distinct username for this version.

## Checks

```powershell
npm.cmd run build
npm.cmd run lint
npm.cmd test
```

Tests start an isolated temporary MongoDB process. Put `mongod` on PATH or set `MONGOD_BINARY` to its executable path. Tests cover real database registration, duplicate handling, login, JWT validation and account-specific scans. They do not use your app database or call external APIs.

## API

| Method | Endpoint | Purpose |
| --- | --- | --- |
| POST | `/api/auth/register` | Create an account using username/password |
| POST | `/api/auth/login` | Sign in using username/password |
| GET | `/api/auth/me` | Read the current account |
| POST | `/api/scan` | Analyze and save a crop image |
| GET | `/api/scan/stats` | Read account statistics |
| GET | `/api/scan/history` | Read scan history |
| POST | `/api/treatment` | Schedule sprays for a scan |
| GET | `/api/treatment/upcoming` | Read upcoming sprays |
| GET | `/api/treatment/history` | Read spray history |
| PATCH | `/api/treatment/:treatmentId/spray/:sprayId` | Mark a spray complete |
| GET | `/api/weather/current` | Read current and forecast weather |
| GET | `/api/weather/advisory` | Read weather-based spray advice |

Protected requests use `Authorization: Bearer <token>`.

## Attribution and license

This is a modified existing project. Its upstream README declares **ISC**. Original documentation and copyright attribution are retained in [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md) and [docs/UPSTREAM_README.md](docs/UPSTREAM_README.md). Dependency licenses remain unchanged.
