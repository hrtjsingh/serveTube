# ServeTube

> **Ad-free, distraction-free YouTube.** Watch only what you want — not what the algorithm wants.

ServeTube is a focused YouTube and YouTube Music player with playlists, no ads, and no recommendation feed. Paste a link, build a queue, and play. No shorts carousel, no “up next” rabbit holes — just the videos you choose.

Built with **Next.js 15**, **MongoDB**, and **Tailwind CSS**.

---

## Table of Contents

- [Why ServeTube](#why-servetube)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Authentication](#authentication)
- [Playlists](#playlists)
- [PWA & Mobile](#pwa--mobile)
- [Themes](#themes)
- [API Reference](#api-reference)
- [Security](#security)
- [Deployment](#deployment)
- [Environment Variables](#environment-variables)
- [Scripts](#scripts)

---

## Why ServeTube

YouTube is built to keep you watching. ServeTube is built to let you **leave**.

| YouTube | ServeTube |
|---|---|
| Algorithm feed & recommendations | **Your playlists only** |
| Ads & sponsored interruptions | **Ad-free** `youtube-nocookie.com` embed |
| Endless “watch next” suggestions | **Your queue** — play next when *you* want |
| Account required for saved lists | **Guest mode** — full playlists in local storage |
| Playback stops when you navigate | **Global player** — music keeps playing across pages |

**Watch only what you want. Not what the algorithm wants.**

---

## Features

### Distraction-free player
- Ad-free playback via `youtube-nocookie.com`
- Paste any YouTube or **YouTube Music** watch link, or an 11-character video ID
- **Global player** — one YouTube instance; playback persists when you navigate
- **Mini player** on other pages; full player on home
- Auto-play next track in your queue (optional — it's *your* queue)
- **Resume playback** — continue where you left off or start from the beginning
- Mobile-friendly player with **landscape fullscreen**

### Your playlists, your rules
- Multiple named playlists with cover colours and descriptions
- Drag-to-reorder tracks
- **Import from YouTube / YouTube Music** — paste a playlist URL (requires API key)
- Export as JSON or copy URLs to clipboard
- **Guest local storage** — playlists saved in the browser, no account needed
- **Cloud sync** — sign in to persist playlists in MongoDB; local data merges on first login
- Manual sync with dirty-state tracking

### Auth & accounts
- Custom email/password auth — no Clerk, no Auth0
- bcrypt password hashing, JWT sessions in `httpOnly` cookies
- Free forever

### UI / UX
- Dark, Light, and AMOLED themes
- Mobile bottom navigation
- 4-step onboarding tour
- Watch history (last 50 videos)
- Profile and settings pages
- Toast notifications

### PWA
- Installable on Android and iOS
- Service worker for fast loads and offline UI shell
- Mobile viewport fixes for standalone mode

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router, Turbopack) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| Database | MongoDB via Mongoose |
| Auth | Custom JWT (jose) + bcrypt |
| Drag & Drop | @dnd-kit |
| HTTP Client | Axios |
| Icons | Lucide React |
| Player | react-youtube (global singleton) |
| Hosting | Vercel (recommended) |

---

## Project Structure

```
serveTube/
├── app/
│   ├── api/                    # Auth, playlists, users
│   ├── history/page.tsx
│   ├── playlists/page.tsx
│   ├── profile/page.tsx
│   ├── settings/page.tsx
│   ├── layout.tsx              # Root layout + GlobalPlayer
│   └── page.tsx                # Home — player + playlists
│
├── components/
│   ├── GlobalPlayer.tsx        # Persistent YouTube instance + mini player
│   ├── VideoPlayer.tsx         # Home player UI + playlist sidebar
│   ├── ResumePlaybackPrompt.tsx
│   ├── PlaylistManager.tsx
│   ├── Onboarding.tsx
│   ├── PwaViewportFix.tsx
│   ├── MobileNav.tsx
│   ├── AuthModal.tsx
│   └── ...
│
├── context/
│   ├── PlayerContext.tsx       # Global playback state
│   ├── AuthContext.tsx
│   └── ThemeContext.tsx
│
├── lib/
│   ├── localPlaylists.ts       # Guest playlist localStorage loader
│   ├── playlistProgress.ts     # Resume position persistence
│   ├── youtubeUrls.ts          # YouTube + Music URL parsing
│   ├── mobileFullscreen.ts     # Mobile fullscreen + landscape lock
│   └── ...
│
├── models/
│   ├── User.ts
│   └── Playlist.ts
│
└── public/
    ├── manifest.json
    └── sw.js
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB ([MongoDB Atlas](https://www.mongodb.com/cloud/atlas) free tier works)
- (Optional) YouTube Data API v3 key for playlist import

### Installation

```bash
git clone https://github.com/hrtjsingh/serveTube.git
cd serveTube
npm install
```

### Environment Variables

```bash
cp .env.example .env.local
```

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/servetube
JWT_SECRET=your-long-random-secret-here
NEXT_PUBLIC_APP_URL=http://localhost:3000
YOUTUBE_API_KEY=your-youtube-api-key   # optional — playlist import only
```

Generate a strong `JWT_SECRET`:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

> The server refuses to start if `JWT_SECRET` is missing or shorter than 32 characters.

### Running Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Authentication

### Signed-in users
1. **Register** — email, name, password (min 8 chars). Default playlist created automatically.
2. **Login** — JWT issued in an `httpOnly`, `SameSite=Strict` cookie (7-day expiry).
3. **Logout** — `DELETE /api/auth/me` clears the session.

### Guest mode
No account required. Playlists and watch history live in **local storage**. On first login, local videos merge into your cloud playlist automatically.

---

## Playlists

### Create
Click **New** in the sidebar. Name it, describe it, pick a cover colour.

### Import
1. Click **Import**
2. Paste a YouTube or YouTube Music playlist URL (`list=…`)
3. Preview → **Save Playlist**

> Requires `YOUTUBE_API_KEY`. Get one at [Google Cloud Console](https://console.cloud.google.com) (YouTube Data API v3).

### Export
Download JSON or copy all video URLs to clipboard.

### Sync
Signed-in users get a **Sync Now** button when local changes are pending. Add/remove operations can sync immediately.

### Resume
ServeTube remembers your last track and position per playlist. On return, choose **Continue from last watch** or **Start from beginning**.

---

## PWA & Mobile

**Android (Chrome):** Menu → *Add to Home Screen*  
**iOS (Safari):** Share → *Add to Home Screen*

- Standalone app mode (no browser chrome)
- Persistent playback across in-app navigation
- Mobile fullscreen with landscape lock on supported devices
- Bottom nav for thumb-friendly browsing

---

## Themes

| Theme | Background | Best for |
|---|---|---|
| **Dark** | Near-black | Default, low light |
| **Light** | White | Bright environments |
| **AMOLED** | True black | OLED screens, battery saving |

Preference saved in `localStorage`.

---

## API Reference

Protected routes require a valid `st_token` session cookie. Playlist routes verify ownership.

### Auth

| Method | Route | Description |
|---|---|---|
| `POST` | `/api/auth/register` | Create account |
| `POST` | `/api/auth/login` | Sign in |
| `GET` | `/api/auth/me` | Current session |
| `DELETE` | `/api/auth/me` | Logout |

**Rate limits:** login 10 / 15 min per IP; register 5 / hour per IP.

### Users

| Method | Route | Description |
|---|---|---|
| `GET` | `/api/users/save` | Current user document |
| `GET` | `/api/users/[userId]` | User's playlists (owner only) |

### Playlists

| Method | Route | Description |
|---|---|---|
| `POST` | `/api/playlists/add` | Create playlist |
| `POST` | `/api/playlists/import-youtube` | Import from YouTube |
| `POST` | `/api/playlists/[id]/update` | Replace songs array |
| `PATCH` | `/api/playlists/[id]/rename` | Update metadata |
| `DELETE` | `/api/playlists/[id]/delete` | Delete playlist |
| `POST` | `/api/playlists/[id]/add-song` | Add one video |
| `DELETE` | `/api/playlists/[id]/delete-song` | Remove one video |

**Limits:** 50 playlists per user, 500 songs per playlist.

---

## Security

Full OWASP-oriented audit in [SECURITY.md](./SECURITY.md).

- JWT auth on all protected routes
- IDOR prevention via `requirePlaylistOwner`
- Input validation and sanitisation
- Rate limiting with lockout
- Security headers (CSP, HSTS, X-Frame-Options, etc.)

### Production checklist

- [ ] Strong `JWT_SECRET` (48+ random chars)
- [ ] `NEXT_PUBLIC_APP_URL` set to production domain
- [ ] MongoDB Atlas IP whitelist
- [ ] WAF (Cloudflare / Vercel)
- [ ] Redis rate limiter for multi-instance deploys

---

## Deployment

### Vercel (recommended)

1. Push to GitHub
2. Import at [vercel.com/new](https://vercel.com/new)
3. Set `MONGODB_URI`, `JWT_SECRET`, `NEXT_PUBLIC_APP_URL`, optional `YOUTUBE_API_KEY`
4. Deploy

### Node.js host

```bash
npm run build
npm run start
```

Requires Node.js 18+ and HTTPS access to MongoDB (and optionally YouTube Data API).

---

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `MONGODB_URI` | Yes | MongoDB connection string |
| `JWT_SECRET` | Yes | Min 32-char secret for JWT signing |
| `NEXT_PUBLIC_APP_URL` | Yes | App URL for CORS (e.g. `https://servetube.vercel.app`) |
| `YOUTUBE_API_KEY` | No | Enables playlist import |

---

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Dev server (Turbopack) |
| `npm run build` | Production build |
| `npm run start` | Production server |
| `npm run lint` | ESLint |

---

## License

MIT
