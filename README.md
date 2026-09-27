# ChessCoin ♟️

ChessCoin is a mobile-first chess arena designed for a future Telegram Mini App.

## Current release

- ♟️ Legal chess rules powered by chess.js
- ⏱️ Bullet, Blitz and Rapid modes
- 🏆 Local ELO-style rating progression
- 🪙 Virtual coin economy and daily bonus
- 👤 Editable player profile and statistics
- 📊 Leaderboard screen
- 🎯 Challenge-code UI
- 📱 Responsive mobile-first interface
- 📲 PWA manifest
- 🔌 Wallet/TON integration placeholder
- 💾 Local persistence with localStorage
- 🌙 Minimal dark interface suitable for Telegram

## Important architecture note

This release deliberately keeps **real-money wagering and real crypto transfers disabled**. The frontend is prepared for the next production layer, but online matchmaking, server-authoritative games, Telegram authentication, persistent cloud accounts and TON Connect should be added through a secure backend before enabling them.

## Production roadmap

1. Telegram Mini App + Telegram user authentication
2. Server-authoritative real-time 1v1 games
3. Matchmaking and private rooms
4. Persistent ELO/ranking
5. Anti-cheat and game-result verification
6. Tournament system
7. TON Connect wallet linking
8. On-chain rewards only after product/legal review
9. Admin dashboard, moderation and analytics

## Realtime server

A WebSocket server is included in `server/` for authoritative 1v1 rooms. It is intentionally separated from the static frontend so the same UI can run locally without a backend. Set `VITE_MULTIPLAYER_URL` to the deployed WebSocket endpoint when connecting the production client.

```bash
cd server
npm install
npm start
```

The server currently handles room creation/joining, turn validation, legal moves and disconnect handling. Production deployment should add authenticated Telegram sessions, persistent storage, rate limits, anti-cheat controls and server-side clocks before real competitive rewards are enabled.

## Development

```bash
npm install
npm run dev
npm run build
```

The app is currently designed to remain usable without a backend, so the local chess experience works immediately.
