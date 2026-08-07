# Implementation Plan

**Application:** Personal Finance Manager (v1.0 MVP)  
**Document Type:** Technical Implementation Strategy & Architecture Translation  
**Status:** Approved & Authoritative  
**Source Documents:** All specifications in [`docs/`](file:///home/blart/Documents/webProjects/FinanceManager/docs/) & Stitch Project `projects/1473126339490422326`  

---

## 1. Implementation Objectives & Principles

### 1.1 Objectives
The primary objective of the implementation phase is to build the Personal Finance Manager web application incrementally, translating approved requirements, architecture, database schemas, API contracts, and Stitch UI designs into a production-grade codebase without introducing architectural drift or undocumented features.

### 1.2 Development Principles
1. **Incremental Feature Slicing:** Build vertical feature slices (Database $\rightarrow$ Business Logic $\rightarrow$ API Route $\rightarrow$ UI Component $\rightarrow$ Tests) wherever possible to deliver testable, reviewable software increments.
2. **Absolute Multi-Tenant Isolation:** Enforce user boundary protection globally across all database queries (`where: { userId }`), session validators, and API route handlers ([BR-001](file:///home/blart/Documents/webProjects/FinanceManager/docs/business-rules.md#L5)).
3. **Financial Calculation Accuracy:** Mandatory 2-decimal precision (`tabular-nums` formatting) and deterministic calculations for net cumulative balance, monthly cash flows, budget progressive warnings (80% Amber / 100%+ Red Alert Overrun), and savings goal contributions.
4. **Stitch UI Fidelity:** Use approved Stitch designs (`projects/1473126339490422326`) as the visual benchmark for page structure, dark slate theme (`#0f1418`), typography, card layouts, and component primitives.
5. **AI-Assisted Discipline:** Antigravity operates under strict task boundaries, executing assigned tasks, writing automated tests, and verifying acceptance criteria before committing code.

---

## 2. Technical Stack & Initialization Strategy

### 2.1 Approved Stack
* **Framework:** Next.js (App Router, Server Components, Route Handlers, Server Actions).
* **Language:** TypeScript (Strict mode enabled).
* **Styling:** Vanilla CSS + Tailwind CSS (Tailwind variables mapped to `design-system.md` tokens).
* **UI Primitives & Icons:** `shadcn/ui` + Radix UI Primitives + Lucide React.
* **Database & ORM:** PostgreSQL + Prisma ORM.
* **Authentication:** Better Auth (Session token cookies, bcrypt password hashing).
* **Validation & Forms:** Zod schemas + React Hook Form (`@hookform/resolvers/zod`).
* **Data Visualization:** Recharts.
* **Testing:** Jest + React Testing Library (Unit/Component) + Playwright (E2E).
* **Deployment:** Vercel (Frontend & Serverless Functions) + Neon PostgreSQL (Database).

### 2.2 Directory & Module Architecture
```
/
├── app/                        # Next.js App Router Pages & API Routes
│   ├── (auth)/                 # Auth routes (/login, /register, /forgot-password, /reset-password)
│   ├── (dashboard)/            # Authenticated layout & views (/dashboard, /transactions, etc.)
│   ├── api/                    # Route Handlers (/api/auth, /api/transactions, etc.)
│   ├── layout.tsx              # Root HTML & Dark Slate Theme Provider
│   └── page.tsx                # Public Landing / Auth Redirect
├── components/                 # React UI Components
│   ├── ui/                     # Primitives (button, card, dialog, progress, badge, input)
│   ├── layout/                 # Top Header Bar & Collapsible Left Sidebar
│   ├── forms/                  # React Hook Form dialogs (TransactionModal, BudgetModal)
│   └── charts/                 # Recharts Donut & Bar chart wrappers
├── lib/                        # Shared Utilities & Business Logic
│   ├── auth/                   # Better Auth setup & session context helpers
│   ├── db/                     # Prisma client instance & extensions
│   ├── validations/            # Zod validation schemas matching backend-api-design.md
│   └── calculations/           # Financial calculation utilities (Net balance, Budget %)
├── prisma/                     # Database Schema & Migrations
│   ├── schema.prisma           # Authoritative Prisma Schema
│   └── seed.ts                 # System default categories seeder script
├── public/                     # Static Assets & Icons
└── tests/                      # Automated Test Suite
    ├── unit/                   # Financial calculation unit tests
    ├── integration/            # API Route & Prisma multi-tenant tests
    └── e2e/                    # Playwright end-to-end user flows
```

---

## 3. Core Implementation Strategies

### 3.1 Database & Prisma Strategy
- Prisma Client initialized as a singleton in `lib/db/prisma.ts`.
- Soft deletion is disabled; hard delete cascading transaction blocks (`prisma.$transaction`) are enforced for User Account Purging ([BR-019](file:///home/blart/Documents/webProjects/FinanceManager/docs/business-rules.md#L106)).
- Mandatory foreign key constraints (`userId`, `categoryId`, `budgetId`, `goalId`) with proper index optimizations (`@@index([userId, transactionDate])`).

### 3.2 Authentication & Multi-Tenant Session Strategy
- Better Auth handles session tokens stored in secure HTTP-only cookies.
- Middleware intercepts requests under `(dashboard)` and `/api/*` to extract `session.user.id`.
- Helper function `getAuthenticatedUserId()` guarantees non-null `userId` or throws `401 Unauthorized` before any controller logic executes.

### 3.3 Domain Calculation & Backdating Strategy
- **Net Balance:** Cumulative $\sum \text{Income} - \sum \text{Expense}$ for all transactions owned by `userId`.
- **Historical Backdating:** Edits to past dates automatically trigger re-calculation of monthly budget spending totals and cumulative net balance ([FR-027](file:///home/blart/Documents/webProjects/FinanceManager/docs/product-requirements.md#L150)).
- **Budget Alerts:** Live progressive status calculation:
  - Normal: $P_b < 80\%$
  - Amber Warning: $80\% \le P_b < 100\%$ (`AlertTriangle` badge)
  - Crimson Alert: $P_b \ge 100\%$ (`AlertOctagon` overrun badge)

### 3.4 API & Validation Strategy
- Request bodies and query params validated using Zod schemas at API boundaries.
- Standardized API response format:
  ```json
  {
    "success": true,
    "data": { ... },
    "error": null
  }
  ```
- Error response taxonomy: `400 Bad Request`, `401 Unauthorized`, `403 Forbidden`, `404 Not Found`, `409 Conflict` (Category deletion blocked when active entries exist), `500 Internal Error`.

### 3.5 Stitch-to-Code UI Component Translation
- **Design Tokens:** Tailwind configuration extends colors with Dark Slate baseline (`bg-slate-950: #0f1418`, `card: #1b2024`, `border: #303539`, `emerald: #10b981`, `rose: #f43f5e`, `amber: #f59e0b`, `sky: #38bdf8`).
- **Typography:** `font-sans` maps to Geist / Inter, `font-mono` maps to JetBrains Mono with `font-variant-numeric: tabular-nums`.
- **Responsive Layout:** 12-column grid for desktop views; touch single-column stack with fixed bottom bar (5 icons) and `+` FAB for mobile (<768px).

---

## 4. Security, Testing & AI Collaboration Rules

### 4.1 Security Implementation Standards
- Multi-Tenant SQL Isolation: Every Prisma query MUST contain `where: { userId }`.
- Password Protection: Minimum 8 characters, bcrypt hashed.
- Account Hard Purge: Requires password confirmation and explicit `"DELETE MY ACCOUNT"` string entry.

### 4.2 Automated Testing Standards
- **Unit Tests (Jest):** 100% coverage for monetary calculations, backdated edits, and budget warning thresholds.
- **Integration Tests (Supertest/Jest):** API routes tested against a test database for authorization and error codes.
- **E2E Tests (Playwright):** Full user flows (Register $\rightarrow$ Add Transaction $\rightarrow$ Budget Warning $\rightarrow$ Savings Goal Contribution $\rightarrow$ Account Purge).

### 4.3 AI Implementation Rules (Antigravity Guidance)
1. Read the task specification in `implementation-task-specification.md` before coding.
2. Implement ONLY the assigned task without modifying unrelated files or architecture.
3. Write required unit/integration tests for the task.
4. Verify all tests pass before completing the step.
5. Report changes, test results, and any assumptions explicitly.
