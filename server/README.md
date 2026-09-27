# ChessCoin Realtime Server

WebSocket backend for 1v1 ChessCoin rooms.

## Run

```bash
npm install
npm start
```

The HTTP endpoint responds with a basic health payload. WebSocket clients can:

- create a room
- join a room
- submit legal moves
- resign
- receive authoritative FEN/history state
- receive timeout/disconnect events

## Production requirements

Before using this for competitive or financial rewards, add persistent storage, authenticated Telegram sessions, rate limiting, reconnect/resume, server-authoritative clocks with durable timestamps, anti-cheat controls, observability and abuse moderation.

The current server intentionally has no payment or crypto-transfer functionality.