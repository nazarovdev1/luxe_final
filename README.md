# Luxe - Premium E-commerce & Social Commerce Platform

Luxe is a React + Node.js e-commerce platform with social commerce, admin tooling, mobile-first pages, loyalty features, and integrations for AI styling, visual search, Telegram notifications, Firebase push notifications, and Plesk deployment.

## Tech Stack

- Frontend: React 18, React Router, Tailwind CSS, Lucide icons, Socket.io client
- Backend: Node.js 22, Express 5, MongoDB/Mongoose, Socket.io, Winston, Helmet, rate limiting
- Integrations: OpenAI, ImageKit, Telegram Bot API, Firebase FCM, Prerender.io
- Deployment: GitHub Actions build pipeline with Plesk/SFTP deployment support

## Main Features

- Product catalog with images, colors, sizes, badges, ratings, discounts, and early-access controls
- Cart, checkout, order tracking, coupons, promo codes, and gift cards
- Admin dashboard for products, orders, reels, blogs, announcements, coupons, badges, and challenges
- Social commerce: reels, comments, style feed, lookbooks, livestream chat
- Loyalty system: points, VIP levels, badges, challenges, leaderboard
- AI stylist and visual search endpoints
- Desktop and `/mobile/*` route trees with automatic device routing
- PWA install prompt, offline indicator, and push notification support

## Local Setup

Requirements:

- Node.js 22+
- MongoDB connection string

Install dependencies:

```bash
npm ci
cd client && npm ci --legacy-peer-deps
cd ../server && npm ci
```

Use npm as the canonical package manager for this repository. Keep `package-lock.json` files committed and use `npm ci` for repeatable local, CI, and Docker installs.

Create `server/.env`:

```env
NODE_ENV=development
PORT=3003
MONGO_URL=mongodb+srv://username:password@cluster.mongodb.net/luxe
JWT_SECRET=change-this-secret

TELEGRAM_BOT_TOKEN=your_telegram_bot_token
TELEGRAM_CHAT_ID=your_telegram_chat_id

IMAGEKIT_PRIVATE_KEY=your_imagekit_private_key
IMAGEKIT_PUBLIC_KEY=your_imagekit_public_key
IMAGEKIT_URL_ENDPOINT=https://ik.imagekit.io/your_imagekit_id

PRERENDER_TOKEN=your_prerender_token
FIREBASE_PROJECT_ID=your_firebase_project_id
FIREBASE_PRIVATE_KEY=your_firebase_private_key
FIREBASE_CLIENT_EMAIL=your_firebase_client_email
OPENAI_API_KEY=your_openai_api_key
```

Create `client/.env` when browser-side integrations are needed:

```env
REACT_APP_API_URL=/api
REACT_APP_IMAGEKIT_PUBLIC_KEY=your_imagekit_public_key
```

Run locally:

```bash
# terminal 1
cd server
npm run dev

# terminal 2
cd client
npm start
```

## Useful Commands

```bash
# Frontend production build
cd client && npm run build

# Backend syntax check
cd server && npm run verify

# Backend production dependency audit
cd server && npm audit --omit=dev --audit-level=high
```

## Deployment

The GitHub Actions workflow builds the React app, copies `client/build` into `server/public`, creates `server/tmp/restart.txt` for Passenger/Plesk, and deploys the server folder via SFTP.

Deployment depends on npm lockfiles: CI, Docker, and production installs should use `npm ci` or `npm ci --omit=dev` instead of yarn, pnpm, or ad-hoc `npm install`. The Docker image expects `client/build` to exist before `docker build` and installs backend production dependencies from `server/package-lock.json`.

Production secrets must live outside git and Docker build contexts. Configure them in GitHub Actions secrets, Plesk environment variables, or `server/.env` on the host only. If a secret, database dump, Firebase service account, API key, or `.env` file was ever committed, rotate the credential before the next deploy and remove the exposed value from all deployment targets.

Before deploying, complete [the production release checklist](reports/production-release-checklist.md). Required server environment coverage includes `CLIENT_URL`, `CORS_ORIGINS`, `LOG_LEVEL`, SMS provider variables, and payment-provider credentials in addition to the base variables shown above. Keep optional integration variables unset when their feature is disabled; never use source-code fallback credentials.

Plesk settings:

- Application Root: `/server`
- Document Root: `/server/public`
- Startup File: `server.js`
- Environment variables: configure production secrets in `server/.env`
- Dependencies: after deploying package changes, run Plesk's npm install action or `npm ci --omit=dev` in `/server` so Passenger starts with dependencies matching `server/package-lock.json`.
