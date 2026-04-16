# Build Task: iot-security-scanner

Build a complete, production-ready Next.js 15 App Router application.

PROJECT: iot-security-scanner
HEADLINE: Scan home IoT devices for security vulnerabilities
WHAT: None
WHY: None
WHO PAYS: None
NICHE: security-tools
PRICE: $$12/mo

ARCHITECTURE SPEC:
A Next.js web application that scans local networks for IoT devices and checks them against vulnerability databases. Users authenticate, run network scans, and receive detailed security reports with remediation suggestions.

PLANNED FILES:
- app/page.tsx
- app/dashboard/page.tsx
- app/scan/page.tsx
- app/api/scan/route.ts
- app/api/devices/route.ts
- app/api/vulnerabilities/route.ts
- app/api/webhooks/lemonsqueezy/route.ts
- components/DeviceCard.tsx
- components/VulnerabilityReport.tsx
- components/NetworkScanner.tsx
- lib/scanner.ts
- lib/vulnerability-db.ts
- lib/lemonsqueezy.ts
- lib/auth.ts

DEPENDENCIES: next, tailwindcss, prisma, @prisma/client, next-auth, @lemonsqueezy/lemonsqueezy.js, node-nmap, axios, zod, lucide-react, @radix-ui/react-dialog, @radix-ui/react-progress

REQUIREMENTS:
- Next.js 15 with App Router (app/ directory)
- TypeScript
- Tailwind CSS v4
- shadcn/ui components (npx shadcn@latest init, then add needed components)
- Dark theme ONLY — background #0d1117, no light mode
- Lemon Squeezy checkout overlay for payments
- Landing page that converts: hero, problem, solution, pricing, FAQ
- The actual tool/feature behind a paywall (cookie-based access after purchase)
- Mobile responsive
- SEO meta tags, Open Graph tags
- /api/health endpoint that returns {"status":"ok"}

ENVIRONMENT VARIABLES (create .env.example):
- NEXT_PUBLIC_LEMON_SQUEEZY_STORE_ID
- NEXT_PUBLIC_LEMON_SQUEEZY_PRODUCT_ID
- LEMON_SQUEEZY_WEBHOOK_SECRET

After creating all files:
1. Run: npm install
2. Run: npm run build
3. Fix any build errors
4. Verify the build succeeds with exit code 0

Do NOT use placeholder text. Write real, helpful content for the landing page
and the tool itself. The tool should actually work and provide value.


PREVIOUS ATTEMPT FAILED WITH:
Codex exited 1: Reading additional input from stdin...
OpenAI Codex v0.121.0 (research preview)
--------
workdir: /tmp/openclaw-builds/iot-security-scanner
model: gpt-5.3-codex
provider: openai
approval: never
sandbox: danger-full-access
reasoning effort: none
reasoning summaries: none
session id: 019d955d-68f4-78b1-bf53-110afe5e39df
--------
user
# Build Task: iot-security-scanner

Build a complete, production-ready Next.js 15 App Router application.

PROJECT: iot-security-scanner
HEADLINE: Scan home IoT devic
Please fix the above errors and regenerate.