##🎵 Melodia

A modern, full-stack music streaming web app built with Next.js, featuring YouTube-powered playback, custom playlists, synced lyrics, and a polished dark-themed UI.

![Melodia Screenshot](./screenshot.png)
<!-- Replace with an actual screenshot from /mnt/user-data or your repo root before pushing -->

---

## ✨ Features

- **YouTube-powered playback** — search and stream any track available on YouTube
- **Custom playlists** — create playlists, add/remove tracks, auto-generated mosaic cover art from track thumbnails
- **Smart empty states** — colorful gradient placeholders for playlists with no tracks yet
- **Explore page** — discover new music through curated mood/genre category rows (Feel Good, Chill Beats, Bollywood Hits, Workout Energy, and more), with a per-row shuffle to surface new picks
- **Synced lyrics panel** — auto-scrolling, fade-in karaoke-style lyrics as tracks play
- **Time-of-day theming** — homepage greeting and accent tones shift between morning, afternoon, evening, and late night
- **Ambient background glow** — subtle color glow derived from the currently playing track's album art
- **Authentication** — secure sign-up/sign-in via Clerk, with profile management
- **Responsive design** — adaptive layout across desktop, tablet, and mobile (collapsible sidebar, bottom tab bar on mobile)
- **Resilient error handling** — graceful fallback states for API quota limits, failed requests, and empty search results

---

## 🛠️ Tech Stack

| Layer          | Technology                                   |
|----------------|-----------------------------------------------|
| Framework      | Next.js (App Router)                         |
| Language       | TypeScript                                   |
| Styling        | Tailwind CSS                                 |
| Authentication | Clerk                                        |
| Music Data     | YouTube Data API                             |
| Lyrics         | Musixmatch / Genius / Lyrics API             |
| Deployment     | Vercel                                        |

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- A [YouTube Data API](https://console.cloud.google.com/apis/library/youtube.googleapis.com) key
- A [Clerk](https://clerk.com) account for authentication keys
- API keys for lyrics providers (Musixmatch / Genius / Lyrics API)

### Installation

```bash
git clone https://github.com/your-username/melodia.git
cd melodia
npm install
```

### Environment Variables

Create a `.env.local` file in the root directory with the following:

```env
YOUTUBE_API_KEY=your_youtube_api_key
MUSIXMATCH_API_KEY=your_musixmatch_api_key
GENIUS_API_KEY=your_genius_api_key
LYRICS_API_KEY=your_lyrics_api_key

NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
```

> ⚠️ Never commit `.env.local` to version control. It's already excluded via `.gitignore`.

### Run Locally

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to view the app.

### Production Build

```bash
npm run build
npm run start
```

---

## 📁 Project Structure

```
melodia/
├── app/                  # Next.js App Router pages
│   ├── (main)/
│   │   ├── explore/      # Explore / discovery page
│   │   ├── search/       # Search page
│   │   └── playlist/     # Dynamic playlist pages
│   ├── sign-in/
│   └── sign-up/
├── components/           # Shared UI components (Sidebar, PlayerBar, Cards, etc.)
├── hooks/                # Custom hooks (usePlayer, usePlaylists, etc.)
├── lib/                  # API clients (YouTube, lyrics providers)
└── public/               # Static assets
```

---

## 🗺️ Roadmap

- [ ] Offline/downloaded playback support
- [ ] Collaborative playlists
- [ ] Cross-device playback sync
- [ ] Dark/light theme toggle

---

## 📄 License

This project is for educational and portfolio purposes.

---

## 👤 Author

**Rimmi Bhardwaj**
B.Tech CSE @ Lovely Professional University
[LinkedIn](#) · [GitHub](#)
