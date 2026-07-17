# Production Release Checklist

Use this checklist for every production release. A failed required item blocks deployment.

## Automated gates

- [ ] `cd client && npm ci --legacy-peer-deps && CI=true npm run build` passes without warnings promoted to errors.
- [ ] `cd server && npm ci && npm run verify` passes.
- [ ] `cd server && npm audit --omit=dev --audit-level=high` passes.
- [ ] Payment provider sandbox tests cover success, decline, invalid signature, duplicate webhook, refund, and timeout.
- [ ] Guest and authenticated checkout smoke tests pass on mobile and desktop.

## Environment and secrets

- [ ] `NODE_ENV=production`, `PORT`, `MONGO_URL`, and a strong unique `JWT_SECRET` are set.
- [ ] `CLIENT_URL` and `CORS_ORIGINS` contain only production HTTPS origins.
- [ ] `TELEGRAM_BOT_TOKEN` and `TELEGRAM_CHAT_ID` are set; no credential fallback exists in source.
- [ ] ImageKit, Firebase, OpenAI, Prerender, SMS, and payment credentials are present only for enabled integrations.
- [ ] Any credential previously present in code or logs has been rotated.
- [ ] Production startup fails when required configuration or MongoDB connectivity is missing.

## Commerce invariants

- [ ] Product price, shipping fee, promotions, gift cards, and final total are calculated by the server.
- [ ] Customer gift-card issuance becomes active only after verified payment; until that flow exists, creation remains staff-only.
- [ ] Stock reservation/decrement and order creation are atomic and retry-safe.
- [ ] Payment webhooks verify signatures and are idempotent by provider transaction/event ID.
- [ ] Refund and failed-payment recovery have been exercised in sandbox.
- [ ] The return period is identical across product, checkout, FAQ, terms, and return-request UI.

## Operations and rollout

- [ ] A fresh production backup exists and a restore has been tested.
- [ ] Staging runs the exact artifact and environment shape intended for production.
- [ ] Health/readiness checks verify the process and MongoDB separately.
- [ ] Centralized error reporting, structured logs, payment-failure alerts, and checkout metrics are active.
- [ ] Deploy during a monitored window; verify catalog, login, checkout, order notification, and admin order view.
- [ ] Rollback artifact and database rollback/forward-fix procedure are documented and immediately available.
