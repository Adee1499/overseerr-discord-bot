# Overseerr Discord Bot

A lightweight Discord bot that lets users **search titles** and **request movies/TV** via your **Overseerr** instance - right from Discord. Built in **TypeScript**, ships with a **Dockerfile**, and includes a **.env.sample** to get you started quickly.

---

## Features
- Slash-command driven UX (clean, discoverable)
- Search for movies/TV and create Overseerr requests from Discord
- Run locally (Node) or as a container (Docker)

---

## Prerequisites
- **Discord** bot application and token (Discord Developer Portal)
- **Overseerr** URL and **API key** (Settings → General → API Key). Keep this key secret; it grants admin-level access.
- Node.js (LTS) and **pnpm**/**npm** (or use Docker)

> Tip: If you use slash commands, remember to **register/deploy** them for your guild or globally.

---

## Quick start (local)

```bash
git clone https://github.com/Adee1499/overseerr-discord-bot.git
cd overseerr-discord-bot

# install deps (choose one)
pnpm install    # recommended
# npm install

# copy env template and fill in values
cp .env.sample .env

# run the bot (adjust if your package.json uses different scripts)
pnpm start
# npm run start
