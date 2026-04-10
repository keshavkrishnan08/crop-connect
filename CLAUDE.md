# CropConnect2 — Next.js 14 + TS + Tailwind + Supabase + Stripe

Owner: Keshav Krishnan | Agricultural marketplace: escrow payments, CropScore rep, messaging, produce requests

## 符 Token Glossary

**USE these single-token substitutions in all agent messages, logs, and internal reasoning. Each Chinese character = 1 token replacing multi-token English phrases. Expand to English only in user-facing output.**

| 符 | Meaning | | 符 | Meaning |
|---|---|-|---|---|
| 構 | component/React component | | 路 | API route/endpoint |
| 鍵 | authentication/auth | | 庫 | database/Supabase |
| 付 | payment/Stripe/escrow | | 策 | RLS policy |
| 驗 | validation/quality gate | | 建 | build/compile |
| 試 | test/testing | | 圖 | UI/frontend/view |
| 態 | state/status | | 訊 | message/notification |
| 查 | query/search/filter | | 列 | listing/product |
| 單 | order/transaction | | 用 | user/profile |
| 分 | CropScore/rating | | 型 | TypeScript type/schema |
| 過 | pass(gate) | | 敗 | fail(gate) |
| 改 | edit/update/modify | | 增 | add/create/insert |
| 刪 | delete/remove | | 讀 | read/fetch/GET |
| 寫 | write/POST/PUT | | 鉤 | hook (React) |
| 環 | environment variable | | 部 | deploy/production |

**Rule:** When an agent writes a gate result, log, or inter-agent message, use 符 shorthand. Example: `A2→A0: 路付驗過 (payment API route gate passed)` instead of full English.

---

## Agents

| # | Role | Owns | Gate |
|---|------|------|------|
| A0 | Orchestrator | coordination, state | all |
| A1 | Frontend | `/app/**/page.tsx`, `/components/**`, `/styles/*`, `/lib/hooks/*.ts`, `/public/**` | visual, build |
| A2 | Backend | `/app/api/**`, `/lib/{supabase,stripe,auth,escrow,validators}.ts`, `/middleware.ts` | build, type, rls |
| A3 | Schema | `/supabase/{schema.sql,migrations/*,seed.sql,rls-policies.sql}` | rls |
| A4 | QA | `/tests/**`, `/__tests__/**`, playwright/vitest configs | build, lint |
| A5 | DevOps | `.env*`, `next.config.mjs`, `tsconfig.json`, `package.json`, deploy configs | none |

Msg protocol: `{from,to,type,task_id,payload:{summary,paths,gate,context}}` — paths only, no content. Data <50KB.

---

## Gates

| Gate | Cmd | Pass |
|------|-----|------|
| Build | `npm run build` | 0 errors |
| Lint | `npm run lint` | clean |
| Type | `tsc --noEmit` | 0 errors (strict) |
| Visual | Playwright on localhost:3000 | marketplace, dashboard, messages, orders, auth, forms render correctly |
| RLS | every table: ENABLE RLS + INSERT/SELECT/UPDATE/DELETE policies | test user data isolation |

---

## Token Rules

1. No re-reads — ref by path/line after first read
2. Paths between agents, never content
3. `Read` with `limit`+`offset` on large files
4. Schema: memorize after first `schema.sql` read, ref by table name
5. Component reads: only target file, never entire `/components`
6. Batch same-pattern changes in one pass
7. Cache Supabase column names for session

---

## Schema (memorized)

| Table | Key Cols | Notes |
|-------|----------|-------|
| profiles | id,email,role,full_name,avatar_url,bio | users; indexed email |
| listings | id,seller_id,title,price,quantity,category,image_urls,status | products |
| orders | id,listing_id,buyer_id,seller_id,total_price,escrow_status,payment_intent_id | escrow FSM |
| produce_requests | id,requester_id,title,quantity,budget,status | buyer RFQs |
| produce_request_responses | id,request_id,responder_id,price,status | seller bids |
| conversations | id,user1_id,user2_id,last_message_at | DM threads |
| messages | id,conversation_id,sender_id,text | indexed conversation_id |
| posts | id,author_id,title,content,image_urls | community |
| post_likes | post_id,user_id | unique(post_id,user_id) |
| comments | id,post_id,author_id,text | threaded |
| favorites | user_id,listing_id | unique pair |
| crop_scores | user_id,score,rating_count | 0-100 rep |

All tables: RLS ✓

**Escrow FSM (A2):** awaiting_payment → funds_held → shipped_awaiting_confirmation → funds_released (5% fee deducted)

---

## Design Tokens

Colors: primary=#2E7D32, accent=#FAD02C, bg=#F9FAF7, dark=#141e15, success=#4CAF50, error=#D32F2F

Custom classes: `.input-premium` `.select-premium` `.checkbox-premium` `.radio-premium` `.toggle-switch` `.button-{base,primary,secondary,danger}` `.chip-select` `.card-hover` `.gradient-primary` `.text-gradient`

Animations: fade-in-up, shimmer, float, glow-pulse, slide-in-right, grow-check

Font: Inter | Headings: bold tracking-tight | Body: normal leading-relaxed

---

## Critical Rules

| Rule | Why |
|------|-----|
| Never expose STRIPE_SECRET_KEY client-side | payment compromise |
| Never disable RLS | data breach |
| Never modify .env.local programmatically | credential exposure |
| Admin client only in /app/api routes | RLS bypass |
| Monetary values in cents (Stripe unit) | financial error |
| Escrow transitions atomic (single DB tx) | double-payout |
| Webhook signatures verified | spoofed payments |
| Form data validated server-side | injection |
| Rate limit auth + payment routes | brute force |
| Image domains whitelisted in next.config.mjs | XSS |

---

## Goals

1. Payment flow: webhook validation, escrow auto-release (7d), refund, PCI review
2. CropScore v2: response time weight, decay old reviews 50%/yr, bulk recalc
3. Realtime: Supabase Realtime for messages + order status, toast notifications
4. Search: full-text listings, filter by category/price/CropScore, DB indexes
5. Mobile: test 375/768/1024px, touch-friendly inputs, mobile nav
6. Production: SSL, DB backup, Sentry, deployment checklist

---

## Scheduled Checks (A0, 6h interval)

1. `npm run build` → alert A5 on 2 consecutive fails
2. `npm outdated` → alert on security updates
3. Supabase schema drift → compare API vs schema.sql → alert A3
4. Dead code: ESLint unused-vars on /app, /lib → report weekly
5. Bundle size: alert A5 if +5% growth

---

## API Patterns (A2 ref)

```
POST /api/payments/create-intent   {listing_id,quantity,buyer_id} → {client_secret,payment_intent_id}  Auth:required
POST /api/webhooks/stripe          Verify stripe-signature header. Update orders.escrow_status
PATCH /api/orders/[id]/status      {status:'shipped'|'confirmed'|'released'}  RLS:buyer_id|seller_id  Atomic tx
```

## RLS Templates (A3 ref)

```sql
-- own data: INSERT WITH CHECK (auth.uid()=user_id), SELECT USING (auth.uid()=user_id), UPDATE USING+CHECK
-- public read: SELECT USING (status='active')
-- owner write: UPDATE USING (auth.uid()=seller_id) WITH CHECK (auth.uid()=seller_id)
```

## Env Vars (A5, never committed)

Supabase: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY
Stripe: NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY, STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET
Auth: NEXTAUTH_SECRET, NEXTAUTH_URL
Flags: NEXT_PUBLIC_ENABLE_REALTIME_MESSAGES=true, NEXT_PUBLIC_ENABLE_CROP_SCORE_V2=false

---

## Failure Protocol

Retry 2× (2min each) → halt → log `{agent,task_id,error,paths,retry_count,ts}` → escalate

## Dev Cmds

`npm run dev` | `npm run build` | `npm run lint` | `tsc --noEmit` | `npm run test:e2e` | `npm run test:unit`

## A0 Decision Tree

UI/styling→A1+visual | API/DB logic→A2+build,type | schema→A3+rls | testing→A4+build,lint | config/deploy→A5 | multi-agent→serialize: A3→A2→A1→A4→A0

## Git

Conventional commits: feat/fix/refactor/docs/test/perf/chore. Never force-push main.
