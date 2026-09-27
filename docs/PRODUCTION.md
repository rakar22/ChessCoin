# ChessCoin production checklist

## Frontend
- Deploy the Vite build to chesscoin.optia.shop.
- Set VITE_MULTIPLAYER_URL to the public wss:// endpoint.
- Configure Telegram Mini App URL to https://chesscoin.optia.shop.

## Backend
- Node.js 22+.
- Set TELEGRAM_BOT_TOKEN.
- Set ALLOWED_ORIGIN.
- Use HTTPS/WSS.
- Persist users, games, ratings and tournaments in a real database.
- Add rate limits, reconnect/resume and observability.

## Telegram
- Create/configure the bot with BotFather.
- Register the Mini App URL.
- Configure the menu button to launch ChessCoin.
- Keep the bot token secret.

## Competitive integrity
- Server-authoritative moves and clocks.
- Verify every result server-side.
- Never trust client ELO, balance or reward values.
- Add anti-cheat and abuse detection before competitive rewards.

## TON
- Connect wallets only through a supported wallet connector.
- Never request or store seed phrases/private keys.
- Keep all reward accounting server-side.
- Do not enable real-value wagering/rewards until the legal and economic model has been reviewed for the target jurisdictions.
