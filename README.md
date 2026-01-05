# Web Penetration Testing Platform

A full-stack web security scanning platform:

- Frontend (React + Vite) for scan submission, history, and reporting
- API (Express + MongoDB) for auth, scan orchestration, and persistence
- Scanner Engine (Laravel) that runs the actual scans and returns results

## Contents

- [Project Overview](#project-overview)
- [Architecture](#architecture)
- [Key Features](#key-features)
- [Tech Stack](#tech-stack)
- [Repo Structure](#repo-structure)
- [Quick Start (Local)](#quick-start-local)
- [Environment Variables](#environment-variables)
- [Common Troubleshooting](#common-troubleshooting)
- [Component READMEs](#component-readmes)

## Project Overview

This project helps teams run repeatable security scans against web targets and review results in a dashboard.
The Express API translates UI selections (scan mode + tools) into the Laravel scanner contract, tracks scan IDs, and stores reports.

## Architecture

```
Browser (React/Vite)
	|
	|  /api (Vite proxy in dev)
	v
Express API (Node.js)
	- Auth, users
	- Scan modes/tools (MongoDB)
	- Scan submissions + report tracking
	v
Laravel Scanner Engine
	- Runs scan jobs + builds results
	- Optional callback/webhook flow
```

## Key Features

- Authentication (email/password + OAuth providers)
- Scan submission with preset modes and custom tool selection
- Scan history + detailed scan result views
- Responsive dashboard layout (desktop + mobile drawer)
- Branded HTML password-reset emails (supports embedded logo via CID)

## Tech Stack

- Frontend: React, TypeScript, Vite, Tailwind, shadcn/ui, Ant Design (Drawer)
- API: Node.js, Express, Mongoose (MongoDB), Passport (OAuth), Nodemailer
- Scanner: Laravel (job-based scan execution)

## Repo Structure

```
backend/
	express/          # Node/Express API
	laravel/          # Laravel scanner engine
frontend/
	web/              # React/Vite dashboard
	mobile/           # Mobile app (optional / separate)
```

## Quick Start (Local)

### Prerequisites

- Node.js (LTS recommended)
- MongoDB running locally
- PHP + Composer (for Laravel engine)

### 1) Start MongoDB

Make sure MongoDB is reachable (example: `mongodb://localhost:27017/...`).

### 2) Start Express API

```bash
cd backend/express
npm install
npm run dev
```

Default: `http://localhost:8000`

### 3) Start Laravel scanner engine

Laravel setup is documented in [backend/laravel/README.md](backend/laravel/README.md).

General commands:

```bash
cd backend/laravel
composer install
php artisan serve
```

Tip: Express uses `8000` by default, so run Laravel on a different port in local dev:

```bash
php artisan serve --port=8001
```

If scans are queued, run a worker:

```bash
php artisan queue:work
```

### 4) Start the Frontend (React/Vite)

```bash
cd frontend/web
npm install
npm run dev
```

Default: `http://localhost:8080`

In development, Vite proxies `http://localhost:8080/api` to `http://localhost:8000` (see [frontend/web/vite.config.ts](frontend/web/vite.config.ts)).

## Environment Variables

### Express (backend/express/.env)

Minimum set:

- `PORT` (default: `8000`)
- `NODE_ENV` (`development` or `production`)
- `MONGO_URL`
- `JWT_SECRET`
- `CLIENT_URL` (frontend origin, e.g. `http://localhost:8080`)
- `SERVER_URL` (Express origin, e.g. `http://localhost:8000`)

Scanner engine routing:

- `SCANNER_BASE_URL` (e.g. `http://localhost:8001` for local Laravel)
- `SCANNER_CALLBACK_URL` (optional)

Email (password reset):

- `EMAIL_USER`, `EMAIL_PASS`
- `EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_SECURE` (optional)
- `EMAIL_FROM` (optional)
- `EMAIL_MODE` (`log` to disable sending in dev)

Email logo options:

- `EMAIL_LOGO_MODE` (`cid` recommended, or `url`)
- `EMAIL_LOGO_PATH` (when `cid`)
- `EMAIL_LOGO_URL` (when `url`, must be a direct image URL)

OAuth (optional):

- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`
- `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`

### Frontend (frontend/web)

- `VITE_API_URL` (optional)
	- default is `/api` which is proxied to Express in dev

## Common Troubleshooting

- Frontend builds but lint fails: run `npm run lint` in `frontend/web`.
- Email logo not showing: many email clients block remote images; use `EMAIL_LOGO_MODE=cid` with a local PNG path.
- API requests failing in dev: confirm the Vite proxy and `CLIENT_URL`/`SERVER_URL` are aligned.
- Scanner errors: check Laravel logs and ensure required CLI tools exist on the host.
- Scanner points to hosted engine: set `SCANNER_BASE_URL` in `backend/express/.env`.

## Component READMEs

- Express API: [backend/express/README.md](backend/express/README.md)
- Laravel scanner engine: [backend/laravel/README.md](backend/laravel/README.md)
- Frontend web: [frontend/web/README.md](frontend/web/README.md)
