# IoT Security Scanner

IoT Security Scanner is a Next.js 15 App Router application that discovers IoT devices on your local network, maps findings to known vulnerabilities, and provides remediation guidance.

## Features

- Dark-mode-only security dashboard (`#0d1117` base)
- Local network discovery via bundled CLI (`scanner-cli`)
- Vulnerability intelligence from local rules plus NVD enrichment
- Device inventory with risk scoring and recommendations
- Stripe Payment Link paywall with cookie-based access gating
- Stripe-compatible webhook ingestion endpoint at `/api/webhooks/lemonsqueezy`
- Health endpoint at `/api/health` returning `{ "status": "ok" }`

## Environment Variables

Copy `.env.example` to `.env.local` and set values:

- `NEXT_PUBLIC_STRIPE_PAYMENT_LINK`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- `STRIPE_WEBHOOK_SECRET`

## Local Development

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Build

```bash
npm run build
npm run start
```

## Activation Flow (Paywall)

1. User clicks the Buy button (direct `NEXT_PUBLIC_STRIPE_PAYMENT_LINK` URL).
2. Stripe sends webhook events to `/api/webhooks/lemonsqueezy`.
3. Purchase records are stored in `data/store.json`.
4. User visits `/access/success` and activates access via:
- Stripe `session_id` query param
- or checkout email fallback
5. App sets an `iot_access` cookie and unlocks `/dashboard`, `/scan`, `/devices`.

## Scanner Notes

- Scanner first attempts `nmap` through `node-nmap`.
- If unavailable, scanner falls back to `arp -a` parsing.
- If host-level discovery is blocked, it returns a realistic sample inventory so UX remains functional.

## Data Storage

Persistence is JSON-file based (`data/store.json`) to avoid ORM/codegen complexity.

