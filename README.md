# The 2am Shoppers

**An AI shopping companion that remembers your interests, follows your budget and adapts when you respond.**

> Eslitec Hackathon · Problem Statement 1 · Personalised conversational commerce for working youths

---

## Repository layout

```
ai-ignition/
├── website/          Presentation site (open index.html in any browser)
│   ├── index.html
│   ├── styles.css
│   └── script.js
│
├── app/
│   ├── frontend/     React + Vite customer and business UI
│   └── backend/      Node.js + Express + SQLite API
│
└── 2amdepoloyers.md  Full project brief / spec
```

---

## Quick start

### 1 — Presentation website
Open `website/index.html` directly in a browser. No build step needed.

---

### 2 — App (frontend)

**Requirements:** Node.js 18+

```bash
cd app/frontend
npm install
npm run dev
```

Opens at **http://localhost:3003**

The app runs fully in the browser using Zustand + localStorage.
The backend is optional for the MVP demo — all state persists locally.

---

### 3 — App (backend)

**Requirements:** Node.js 18+, Python/uv (for better-sqlite3 native build if needed)

```bash
cd app/backend
cp .env.example .env          # fill in JWT_SECRET at minimum
npm install
npm run dev
```

Runs at **http://localhost:3001**

The frontend proxies `/api/*` to the backend via Vite's dev proxy.
Without the backend, the frontend still works using local store state.

---

## Two views

| View | Entry point | Who uses it |
|------|-------------|-------------|
| Customer | `/customer/onboarding` → `/customer` | Working youth shopper |
| Business | `/business/onboarding` → `/business` | Merchant / SMB |

On first load, `http://localhost:5173` shows a mode-select screen.

---

## Customer features

- **Onboarding** — interests, budget, quiet hours, payday reminder date
- **Home** — live AI notification cards with response buttons (Interested / Too expensive / Remind me later / etc.)
- **Wishlist** — save products with budget and reminder date; price-vs-budget alert
- **Discover feed** — TikTok-inspired cards: product demos, comparisons, group deals
- **Chat** — AI shopping companion; adapts to typed responses and quick-reply buttons
- **Settings** — update any preference at any time

---

## Business features

- **Onboarding** — goal, catalogue, demo customer import
- **Dashboard** — KPIs: customers, active journeys, verified purchases, conv-to-purchase rate, open support
- **Customers** — filterable by segment, inline segment editor
- **Journeys** — trigger-based journey creation; event log; record customer responses; auto-escalation
- **Catalogue** — add products, toggle stock status
- **Support** — handover cards, email-to-support link, resolved log; sales paused for open cases

---

## Backend API routes

| Method | Path | Description |
|--------|------|-------------|
| GET/POST/PATCH/DELETE | `/api/wishlist` | Customer wishlist items |
| GET/POST | `/api/conversations` | Conversation threads |
| POST | `/api/conversations/:id/reply` | Send message + get AI reply |
| POST | `/api/conversations/:id/close` | Close conversation |
| GET/POST/DELETE | `/api/reminders` | Customer reminders |
| GET/POST/PATCH/DELETE | `/api/catalogue` | Merchant product catalogue |
| GET/POST/PATCH | `/api/customers` | Customer records |
| POST | `/api/customers/import` | Bulk import |
| GET/POST | `/api/journeys` | Customer journeys |
| POST | `/api/journeys/:id/event` | Log customer response |
| POST | `/api/journeys/:id/close` | Close journey |
| GET | `/api/dashboard/summary` | KPI summary |
| GET | `/api/dashboard/segments` | Segment breakdown |
| GET | `/api/health` | Health check |

---

## AI conversation

**Default (no API key):** Rule-based response map covering all adaptation
cases from the spec (too expensive → alternatives, remind me later → schedule,
wrong style → update preferences, etc.).

**With OpenAI key:** Set `OPENAI_API_KEY` in `.env`. The backend calls
`gpt-4o-mini` with a system prompt grounded in the spec's rules.

**With Amazon Bedrock:** Swap `getLLMReply()` in
`app/backend/src/services/conversationService.js` for a Bedrock
`InvokeModelCommand` call.

---

## Hackathon demo script

1. Open the app and choose **Customer**.
2. Complete onboarding as **Alicia** — interests: Coffee, Workday Essentials; budget: $30.
3. On the Home screen, tap **"Interested, but too expensive"** on the coffee notification.
4. The AI offers a lower-cost alternative. Tap **"Remind me on the 25th"**.
5. Switch to **Business** view (use the ⇄ button in the sidebar).
6. Complete onboarding as **Brew & Bites** — load demo customers.
7. Go to **Journeys** → start a journey for Alicia with trigger: *Customer-requested reminder*.
8. Record the outcome as **Purchased** to close the journey.
9. Check the **Dashboard** — conv-to-purchase rate updates.

All simulated purchases, feeds and integrations are clearly labelled.

---

## Measurements (to fill in after timed demo)

| Metric | Manual workflow | With 2am Shoppers |
|--------|----------------|-------------------|
| Time to complete coordination | ___ min | ___ min |
| App switches | ___ | ___ |
| Messages sent manually | ___ | ___ |

> Hackathon sample data demonstrates the reporting process. It does not prove a real increase in retention or customer lifetime value.

---

## Development tools

- **Kiro** — requirements, design, implementation
- **IBM Bob** — analysis, debugging, code review, documentation

---

## Later enhancements

- Real marketplace integrations (Shopee API, etc.)
- Real short-video content and supported ad publishing
- Group-buy checkout flow
- Multilingual conversations
- Light/dark mode
- Broader analytics and product comparisons
- OAuth for external messaging channels (LINE, WhatsApp)
