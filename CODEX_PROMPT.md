# Build Task: iot-security-scanner

Build a complete, production-ready Next.js 15 App Router application.

PROJECT: iot-security-scanner
HEADLINE: Scan home IoT devices for security vulnerabilities
WHAT: Scans your home network to identify IoT devices and checks them against known vulnerability databases. Provides actionable security recommendations and monitors for new threats targeting your specific device models.
WHY: Home networks now have 20+ connected devices that ship with default passwords and rarely get security updates. Recent botnet attacks have turned smart cameras and routers into attack vectors, and most people have no visibility into their exposure.
WHO PAYS: Tech-savvy homeowners with smart home setups, remote workers concerned about network security, and small business owners running home offices who need to protect client data but lack enterprise IT resources.
NICHE: security-tools
PRICE: $$12/mo

ARCHITECTURE SPEC:
A Next.js web application that provides network scanning capabilities through a local agent/CLI tool that users install on their home network. The web dashboard displays scan results, vulnerability reports, and security recommendations with real-time monitoring.

PLANNED FILES:
- app/page.tsx
- app/dashboard/page.tsx
- app/scan/page.tsx
- app/devices/page.tsx
- app/api/scans/route.ts
- app/api/devices/route.ts
- app/api/vulnerabilities/route.ts
- app/api/webhooks/lemonsqueezy/route.ts
- components/DeviceCard.tsx
- components/VulnerabilityAlert.tsx
- components/ScanProgress.tsx
- lib/scanner.ts
- lib/vulnerability-db.ts
- lib/lemonsqueezy.ts
- lib/database.ts
- prisma/schema.prisma
- scripts/install-agent.sh

DEPENDENCIES: next, react, typescript, tailwindcss, prisma, @prisma/client, postgres, @lemonsqueezy/lemonsqueezy.js, node-nmap, axios, recharts, lucide-react, next-auth, bcryptjs, jsonwebtoken, zod, date-fns

REQUIREMENTS:
- Next.js 15 with App Router (app/ directory)
- TypeScript
- Tailwind CSS v4
- shadcn/ui components (npx shadcn@latest init, then add needed components)
- Dark theme ONLY — background #0d1117, no light mode
- Stripe Payment Link for payments (hosted checkout — use the URL directly as the Buy button href)
- Landing page that converts: hero, problem, solution, pricing, FAQ
- The actual tool/feature behind a paywall (cookie-based access after purchase)
- Mobile responsive
- SEO meta tags, Open Graph tags
- /api/health endpoint that returns {"status":"ok"}
- NO HEAVY ORMs: Do NOT use Prisma, Drizzle, TypeORM, Sequelize, or Mongoose. If the tool needs persistence, use direct SQL via `pg` (Postgres) or `better-sqlite3` (local), or just filesystem JSON. Reason: these ORMs require schema files and codegen steps that fail on Vercel when misconfigured.
- INTERNAL FILE DISCIPLINE: Every internal import (paths starting with `@/`, `./`, or `../`) MUST refer to a file you actually create in this build. If you write `import { Card } from "@/components/ui/card"`, then `components/ui/card.tsx` MUST exist with a real `export const Card` (or `export default Card`). Before finishing, scan all internal imports and verify every target file exists. Do NOT use shadcn/ui patterns unless you create every component from scratch — easier path: write all UI inline in the page that uses it.
- DEPENDENCY DISCIPLINE: Every package imported in any .ts, .tsx, .js, or .jsx file MUST be
  listed in package.json dependencies (or devDependencies for build-only). Before finishing,
  scan all source files for `import` statements and verify every external package (anything
  not starting with `.` or `@/`) appears in package.json. Common shadcn/ui peers that MUST
  be added if used:
  - lucide-react, clsx, tailwind-merge, class-variance-authority
  - react-hook-form, zod, @hookform/resolvers
  - @radix-ui/* (for any shadcn component)
- After running `npm run build`, if you see "Module not found: Can't resolve 'X'", add 'X'
  to package.json dependencies and re-run npm install + npm run build until it passes.

ENVIRONMENT VARIABLES (create .env.example):
- NEXT_PUBLIC_STRIPE_PAYMENT_LINK  (full URL, e.g. https://buy.stripe.com/test_XXX)
- NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY  (pk_test_... or pk_live_...)
- STRIPE_WEBHOOK_SECRET  (set when webhook is wired)

BUY BUTTON RULE: the Buy button's href MUST be `process.env.NEXT_PUBLIC_STRIPE_PAYMENT_LINK`
used as-is — do NOT construct URLs from a product ID, do NOT prepend any base URL,
do NOT wrap it in an embed iframe. The link opens Stripe's hosted checkout directly.

After creating all files:
1. Run: npm install
2. Run: npm run build
3. Fix any build errors
4. Verify the build succeeds with exit code 0

Do NOT use placeholder text. Write real, helpful content for the landing page
and the tool itself. The tool should actually work and provide value.
