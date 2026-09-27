# ChessCoin Telegram Bot

The production bot can expose the Mini App with a menu button and deep links.

Recommended commands:

- /start — open ChessCoin
- /play — open the Mini App
- /match — enter matchmaking
- /tournaments — show available tournaments
- /profile — open player profile
- /help — show commands

Set these values in the bot deployment:

- TELEGRAM_BOT_TOKEN
- MINI_APP_URL=https://chesscoin.optia.shop

The bot should use Telegram's official Bot API and Web App / Mini App mechanisms. Keep bot tokens server-side only.