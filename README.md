# ServeTube

> Ad-free YouTube player with multiple playlists, cloud sync, PWA support, and a custom auth system — built with Next.js 15, MongoDB, and Tailwind CSS.

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Variables](#environment-variables)
  - [Running Locally](#running-locally)
- [Authentication](#authentication)
- [Playlists](#playlists)
- [PWA & Offline Support](#pwa--offline-support)
- [Themes](#themes)
- [API Reference](#api-reference)
- [Security](#security)
- [Deployment](#deployment)
- [Environment Variables Reference](#environment-variables-reference)
- [Scripts](#scripts)

---

## Overview

ServeTube is a full-stack YouTube client that strips ads by embedding videos via the `youtube-nocookie.com` player. It supports multiple named playlists, YouTube playlist import, drag-to-reorder queues, watch history, cloud sync for signed-in users, and full local-storage fallback for guests.

The auth system is completely custom — no Clerk, no Auth0, no third-party dependencies. Email/password with bcrypt hashing and JWT sessions stored in httpOnly cookies.

---

## Features

### Player
- Plays any YouTube video via URL, share link, or 11-character video ID
- Ad-free embed using `youtube-nocookie.com`
- Auto-play next video in queue on end
- Skip to next / play previous controls
- Responsive player that fills its container at any screen size

### Playlists
- **Multiple playlists** — create, name, describe, and color-code unlimited playlists (up to 50 per account)
- **Drag-to-reorder** — reorder songs within a playlist by dragging
- **Import from YouTube** — paste any YouTube playlist URL or `PL…` ID to import all videos (requires YouTube Data API key)
- **Export** — download playlist as JSON or copy all URLs to clipboard
- **Local storage for guests** — full playlist functionality without an account, stored in the browser
- **Cloud sync** — sign in to persist playlists in MongoDB; local playlists merge automatically on first login
- **Manual sync button** — dirty-state tracking with a Sync Now button and last-synced timestamp

### Auth
- Email and password registration and login
- Passwords hashed with bcrypt (cost factor 12)
- Sessions stored in `httpOnly`, `SameSite=Strict` JWT cookies (7-day expiry)
- No third-party auth provider required

### UI / UX
- **Three themes** — Dark, Light, and AMOLED (true black for OLED screens), persisted across sessions
- **Mobile bottom navigation bar** — thumb-friendly nav on phones, hidden on desktop
- **Onboarding tour** — 4-step first-visit walkthrough, shown once, skippable
- **Watch history** — last 50 videos with timestamps, clearable per item or all at once
- **Toast notifications** — success, error, and info messages
- **Profile page** — stats (playlists, videos, watched), quick links, sign out
- **Settings page** — theme picker, account info, replay onboarding

### PWA
- Installable on Android and iOS ("Add to Home Screen")
- Service worker with network-first caching for API and cache-first for static assets
- Offline-capable for playlist data and UI shell

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router, Turbopack) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| Database | MongoDB via Mongoose |
| Auth | Custom JWT (jose) + bcrypt passwords |
| Drag & Drop | @dnd-kit/core + @dnd-kit/sortable |
| HTTP Client | Axios |
| Icons | Lucide React |
| Player | react-youtube |
| Hosting | Vercel (recommended) |

---

## Project Structure

```
serveTube/
├── app/
│   ├── api/
│   │   ├── auth/
│   │   │   ├── login/route.ts        # POST — email/password login
│   │   │   ├── register/route.ts     # POST — new account creation
│   │   │   └── me/route.ts           # GET — session check, DELETE — logout
│   │   ├── playlists/
│   │   │   ├── add/route.ts          # POST — create playlist
│   │   │   ├── import-youtube/route.ts # POST — import from YouTube API
│   │   │   └── [playlistId]/
│   │   │       ├── update/route.ts   # POST — replace songs array
│   │   │       ├── rename/route.ts   # PATCH — update name/description/color
│   │   │       ├── delete/route.ts   # DELETE — remove playlist
│   │   │       ├── add-song/route.ts # POST — append one video
│   │   │       └── delete-song/route.ts # DELETE — remove one video
│   │   └── users/
│   │       ├── save/route.ts         # GET — fetch current user from DB
│   │       └── [userId]/route.ts     # GET — fetch user's playlists
│   ├── history/page.tsx              # Watch history page
│   ├── playlists/page.tsx            # Playlist grid overview page
│   ├── profile/page.tsx              # User profile and stats
│   ├── settings/page.tsx             # Theme, account, onboarding
│   ├── globals.css                   # Tailwind base + theme variables
│   ├── layout.tsx                    # Root layout with providers
│   └── page.tsx                      # Home — URL input + video player
│
├── components/
│   ├── AuthModal.tsx                 # Sign in / Register modal
│   ├── header.tsx                    # Top nav with theme toggle
│   ├── MobileNav.tsx                 # Fixed bottom nav for mobile
│   ├── Onboarding.tsx                # First-visit 4-step tour
│   ├── PlaylistManager.tsx           # Create / edit / import / export playlists
│   ├── ThemeSwitcher.tsx             # Dark / Light / AMOLED picker
│   ├── VideoPlayer.tsx               # Main player + queue sidebar
│   ├── VideoInfo.tsx                 # Playlist row with thumbnail + title
│   ├── List.tsx                      # Drag-sortable song list wrapper
│   └── SortableVideoItem.tsx         # Individual draggable song row
│
├── context/
│   ├── AuthContext.tsx               # useAuth() hook — user, login, logout
│   └── ThemeContext.tsx              # useAppTheme() hook — dark/light/amoled
│
├── lib/
│   ├── auth.ts                       # bcrypt hashing + JWT sign/verify
│   ├── mongodb.ts                    # Mongoose connection with caching
│   ├── rateLimit.ts                  # In-memory rate limiter with lockout
│   ├── requireAuth.ts                # JWT cookie guard for API routes
│   ├── requirePlaylistOwner.ts       # Ownership check for playlist routes
│   └── validate.ts                   # Input validation and sanitisation
│
├── models/
│   ├── User.ts                       # name, email, passwordHash
│   └── Playlist.ts                   # userId, name, description, coverColor, songs[]
│
├── public/
│   ├── manifest.json                 # PWA manifest
│   └── sw.js                         # Service worker
│
├── middleware.ts                     # CORS + cross-origin request blocking
├── next.config.ts                    # Security headers, CORS, SW headers
├── .env.example                      # Required environment variables
└── SECURITY.md                       # Full security audit report
```

---

## Getting Started

### Prerequisites

- Node.js 18 or higher
- A MongoDB database (free tier at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas))
- (Optional) YouTube Data API v3 key for playlist import

### Installation

```bash
# Clone the repository
git clone https://github.com/hrtjsingh/serveTube.git
cd serveTube

# Install dependencies
npm install
# or
yarn install
```

### Environment Variables

Copy the example file and fill in your values:

```bash
cp .env.example .env.local
```

Then edit `.env.local`:

```env
# MongoDB connection string — required
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/servetube

# JWT secret — MUST be at least 32 random characters
# Generate one with: node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
JWT_SECRET=your-long-random-secret-here

# Your app URL — used for CORS origin validation
# Use http://localhost:3000 for local development
NEXT_PUBLIC_APP_URL=http://localhost:3000

# YouTube Data API v3 key — optional, only needed for playlist import
YOUTUBE_API_KEY=your-youtube-api-key
```

> **Important:** The server will refuse to start if `JWT_SECRET` is missing or shorter than 32 characters. This is intentional — a weak secret lets anyone forge authentication tokens.

### Running Locally

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Authentication

ServeTube uses a fully custom auth system with no third-party providers.

### How it works

1. **Register** — email, name, and password (min 8 chars). Password is hashed with bcrypt (cost factor 12) and stored. A default playlist is created automatically.
2. **Login** — email and password verified against the bcrypt hash. A signed JWT is issued and stored in an `httpOnly`, `SameSite=Strict` cookie.
3. **Session** — every protected API route reads the `st_token` cookie and verifies it with `requireAuth()`. The JWT expires after 7 days.
4. **Logout** — the cookie is cleared server-side via `DELETE /api/auth/me`.

### Guest mode

Users without an account get a fully functional experience. Playlists and watch history are stored in `localStorage`. On first login, any locally saved videos are automatically merged into the user's cloud playlist.

---

## Playlists

### Creating playlists

Click **New** in the playlist sidebar. Give it a name, an optional description, and pick a cover colour from the palette.

### Importing from YouTube

1. Click **Import** in the playlist sidebar
2. Paste a YouTube playlist URL (e.g. `https://youtube.com/playlist?list=PL...`) or a bare `PL...` ID
3. Click **Fetch** — ServeTube will preview the playlist name and video count
4. Click **Save Playlist** to add it to your account

> Requires `YOUTUBE_API_KEY` in your environment. Get one free at [Google Cloud Console](https://console.cloud.google.com) by enabling the YouTube Data API v3.

### Exporting playlists

Hover over any playlist and click the export icon to either:
- **Download as JSON** — saves a file with all video IDs and YouTube URLs
- **Copy URLs** — copies all video URLs to clipboard, one per line

### Syncing to database

When you're signed in, a sync panel appears above the queue. Changes made locally (reordering, adding, removing) mark the playlist as dirty and the **Sync Now** button turns active. Click it to push all changes to MongoDB. Individual add/remove operations sync immediately.

---

## PWA & Offline Support

ServeTube is installable as a Progressive Web App on both Android and iOS.

**On Android (Chrome):** tap the three-dot menu → *Add to Home Screen*  
**On iOS (Safari):** tap the Share icon → *Add to Home Screen*

Once installed, the app opens in standalone mode (no browser chrome). The service worker caches the UI shell and playlist data so the app loads instantly even on slow connections. API calls are attempted over the network first; if offline, they gracefully degrade.

---

## Themes

Three themes are available, toggled via the button in the header or the Settings page:

| Theme | Background | Best for |
|---|---|---|
| **Dark** | `oklch(0.145 0 0)` — near-black | General use in low light |
| **Light** | `oklch(1 0 0)` — pure white | Bright environments |
| **AMOLED** | `oklch(0 0 0)` — true black | OLED screens, maximum battery saving |

Your preference is persisted in `localStorage` and applied immediately on load with no flash.

---

## API Reference

All routes that modify data require a valid session cookie (`st_token`). All playlist routes also verify that the authenticated user owns the target playlist.

### Auth

| Method | Route | Description |
|---|---|---|
| `POST` | `/api/auth/register` | Create account. Body: `{ name, email, password }` |
| `POST` | `/api/auth/login` | Sign in. Body: `{ email, password }` |
| `GET` | `/api/auth/me` | Returns current session user or `null` |
| `DELETE` | `/api/auth/me` | Clears session cookie (logout) |

**Rate limits:** login is capped at 10 attempts per 15 minutes per IP with a 15-minute lockout. Registration is capped at 5 per hour per IP.

### Users

| Method | Route | Description |
|---|---|---|
| `GET` | `/api/users/save` | Returns full user document for the session user |
| `GET` | `/api/users/[userId]` | Returns all playlists for a user (owner only) |

### Playlists

| Method | Route | Description |
|---|---|---|
| `POST` | `/api/playlists/add` | Create playlist. Body: `{ name, description?, coverColor?, songs? }` |
| `POST` | `/api/playlists/import-youtube` | Import from YouTube. Body: `{ url }` |
| `POST` | `/api/playlists/[id]/update` | Replace entire songs array. Body: `{ songs: [{id}] }` |
| `PATCH` | `/api/playlists/[id]/rename` | Update metadata. Body: `{ name?, description?, coverColor? }` |
| `DELETE` | `/api/playlists/[id]/delete` | Delete playlist permanently |
| `POST` | `/api/playlists/[id]/add-song` | Append one video. Body: `{ id: "videoId" }` |
| `DELETE` | `/api/playlists/[id]/delete-song` | Remove one video. Body: `{ id: "videoId" }` |

**Limits:** max 50 playlists per user, max 500 songs per playlist.

---

## Security

A full end-to-end security audit was performed against OWASP Top 10. 19 vulnerabilities were identified and fixed across all severity levels.

### Summary of fixes

| Severity | Count | Examples |
|---|---|---|
| Critical | 5 | IDOR on all playlist routes, unawaited auth check, SHA-256 → bcrypt |
| High | 6 | Brute force, NoSQL injection, no input validation, no resource limits |
| Medium | 6 | No security headers, stack traces in errors, CSRF, CSS injection |
| Low | 4 | Password length, email validation, session duration, account lockout |

### Security architecture

- **`lib/requireAuth.ts`** — verifies the JWT cookie on every protected route
- **`lib/requirePlaylistOwner.ts`** — IDOR prevention: asserts `playlist.userId === token.id`
- **`lib/validate.ts`** — centralised input validation: video IDs, ObjectIds, hex colours, strings
- **`lib/rateLimit.ts`** — in-memory rate limiter with per-key lockout windows
- **`next.config.ts`** — full security header suite: CSP, HSTS, X-Frame-Options, Referrer-Policy, Permissions-Policy, COOP, CORP
- **`middleware.ts`** — blocks cross-origin mutating requests at the edge

See [SECURITY.md](./SECURITY.md) for the full audit report with every vulnerability, root cause, and fix applied.

### Production hardening checklist

- [ ] Set `JWT_SECRET` to a 48+ character random string (`node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`)
- [ ] Set `NEXT_PUBLIC_APP_URL` to your exact production domain
- [ ] Enable MongoDB Atlas IP access list — whitelist only your server IP
- [ ] Enable MongoDB Atlas audit logging
- [ ] Set up Cloudflare or Vercel WAF in front of the app
- [ ] Replace in-memory rate limiter with Redis (e.g. [Upstash](https://upstash.com)) if deploying multiple instances
- [ ] Rotate `JWT_SECRET` periodically (invalidates all active sessions)

---

## Deployment

### Deploy to Vercel (recommended)

1. Push your repository to GitHub
2. Import the project at [vercel.com/new](https://vercel.com/new)
3. Add environment variables in the Vercel dashboard:
   - `MONGODB_URI`
   - `JWT_SECRET`
   - `NEXT_PUBLIC_APP_URL` (set to your Vercel deployment URL)
   - `YOUTUBE_API_KEY` (optional)
4. Deploy

### Deploy to any Node.js host

```bash
npm run build
npm run start
```

The app requires Node.js 18+ and outbound HTTPS access to MongoDB Atlas and (optionally) the YouTube Data API.

---

## Environment Variables Reference

| Variable | Required | Description |
|---|---|---|
| `MONGODB_URI` | ✅ Yes | MongoDB connection string |
| `JWT_SECRET` | ✅ Yes | Min 32-char random string for signing JWTs |
| `NEXT_PUBLIC_APP_URL` | ✅ Yes | Full URL of deployed app (e.g. `https://servetube.vercel.app`) |
| `YOUTUBE_API_KEY` | Optional | YouTube Data API v3 key — enables playlist import |

---

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start development server with Turbopack |
| `npm run build` | Build production bundle |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |

---

## License

MIT
