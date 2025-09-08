<p align="center">
  <img src="https://raw.githubusercontent.com/Evren-os/Zaviye/main/.github/assets/zaviye.png" alt="Zaviye Logo" width="128">
</p>

# Zaviye

Stateless, client-side AI personas. Built with Next.js, React, TypeScript, Tailwind, and shadcn/ui.

## Overview

Zaviye is a simple way to run focused AI personas. You define a persona with a clear system prompt, send a single message, and get a response - no chat history, no server. It runs entirely in your browser, keeps your data local, and stays fast and predictable.

## Requirements

- Bun ≥ 1.1
- A Google Gemini API key

## Setup

```bash
git clone https://github.com/Evren-os/Zaviye.git
cd Zaviye

# Install deps
bun install

# Set your API key
echo 'GEMINI_API_KEY="your_api_key"' > .env.local

# Dev
bun run dev
```

Visit http://localhost:3000

## Build & Start

```bash
bun run build
bun run start
```

## Notes

- 100% client-side. No server storage. Single-turn, stateless API calls.
- Data (personas, histories, settings) is stored locally in your browser.

## License

MIT
