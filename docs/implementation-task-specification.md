# Implementation Task Specification

**Application:** Personal Finance Manager (v1.0 MVP)  
**Document Type:** Detailed Implementation Task Backlog & Traceability Matrix  
**Status:** Approved & Authoritative  
**Source Documents:** All approved specifications in [`docs/`](file:///home/blart/Documents/webProjects/FinanceManager/docs/) & Stitch Project `projects/1473126339490422326`  

---

## Task Inventory Overview

This backlog specifies every implementation task required to build the Personal Finance Manager MVP. Each task is a granular, independently reviewable unit of work with full requirement traceability, acceptance criteria, and testing guidelines.

---

## Milestone 0: Project Setup & Infrastructure Foundation (`M0-INFRA`)

### Task `TSK-001`: Next.js 14 App Router & TypeScript Initialization
* **Task ID:** `TSK-001`
* **Milestone:** `M0-INFRA` | **Feature:** Project Baseline
* **Objective:** Initialize the Next.js 14 App Router repository with TypeScript strict mode and ESLint rules.
* **Requirements Addressed:** [FR-063](file:///home/blart/Documents/webProjects/FinanceManager/docs/product-requirements.md#L312)
* **Dependencies:** None | **Preconditions:** Node.js 18+ installed.
* **Expected Behavior:** `npm run dev` starts a clean Next.js server on `http://localhost:3000`.
* **Acceptance Criteria:**
  1. Next.js 14 App Router layout initialized.
  2. TypeScript strict mode enabled in `tsconfig.json`.
  3. ESLint & Prettier rules configured.
* **Definition of Done:** Repository initialized, clean build without warnings.

### Task `TSK-002`: Tailwind CSS & Deep Ledger Design Tokens Setup
* **Task ID:** `TSK-002`
* **Milestone:** `M0-INFRA` | **Feature:** UI Design System Setup
* **Objective:** Configure Tailwind CSS tokens matching `design-system.md` and Stitch theme (`#0f1418` dark slate).
* **Requirements Addressed:** [FR-063](file:///home/blart/Documents/webProjects/FinanceManager/docs/product-requirements.md#L312)
* **Stitch Design Reference:** `assets/4ecba593fd3b426c83fa615df47fa257` ("Deep Ledger")
* **Dependencies:** `TSK-001` | **Preconditions:** `TSK-001` complete.
* **Acceptance Criteria:**
  1. CSS variables configured in `app/globals.css` for `--bg-slate-950: #0f1418`, `--surface-card: #1b2024`, `--border-slate: #303539`, `--emerald: #10b981`, `--rose: #f43f5e`, `--amber: #f59e0b`, `--sky: #38bdf8`.
  2. Fonts configured: Geist Sans (`font-sans`), Inter (`font-body`), JetBrains Mono (`font-mono`).
* **Definition of Done:** Root layout renders dark slate background with proper typography tokens.

### Task `TSK-003`: `shadcn/ui` Component Primitives Initialization
* **Task ID:** `TSK-003`
* **Milestone:** `M0-INFRA` | **Feature:** UI Components
* **Objective:** Install and configure core `shadcn/ui` primitives (`Button`, `Card`, `Dialog`, `Progress`, `Badge`, `Input`, `Select`, `Table`, `Drawer`).
* **Dependencies:** `TSK-002` | **Preconditions:** Tailwind CSS setup complete.
* **Acceptance Criteria:** Primitives installed in `components/ui/` styled with dark slate borders and `rounded-lg` / `rounded-xl` radii.
* **Definition of Done:** Components exported and verified via basic render test.

### Task `TSK-004`: Prisma ORM Setup & Neon Database Connection
* **Task ID:** `TSK-004`
* **Milestone:** `M0-INFRA` | **Feature:** Database Connection
* **Objective:** Configure Prisma ORM and establish connection pooling to Neon PostgreSQL.
* **Requirements Addressed:** [FR-063](file:///home/blart/Documents/webProjects/FinanceManager/docs/product-requirements.md#L312)
* **Dependencies:** `TSK-001` | **Preconditions:** Neon DB instance active.
* **Acceptance Criteria:** `prisma/schema.prisma` initialized; `npx prisma db push` succeeds.
* **Definition of Done:** Singleton Prisma client in `lib/db/prisma.ts` executes test query (`prisma.$queryRaw`).

---

## Milestone 1: Identity, Authentication & Session Context (`M1-AUTH`)

### Task `TSK-010`: User & Auth Models in Prisma Schema
* **Task ID:** `TSK-010`
* **Milestone:** `M1-AUTH` | **Feature:** Auth Database Schema
* **Objective:** Add `User`, `Account`, `Session`, `VerificationToken` models to `prisma/schema.prisma` matching `database-design.md`.
* **Database Models:** `User`, `Account`, `Session`, `VerificationToken`
* **Dependencies:** `TSK-004` | **Preconditions:** Prisma setup complete.
* **Acceptance Criteria:** Schema defines unique `email`, `passwordHash`, `preferredCurrencySymbol` (default `"$"`), `createdAt`, `updatedAt`.
* **Definition of Done:** Migration executed, Prisma client types generated.

### Task `TSK-011`: Better Auth Integration & Session Middleware
* **Task ID:** `TSK-011`
* **Milestone:** `M1-AUTH` | **Feature:** Better Auth Setup
* **Objective:** Configure Better Auth handlers, HTTP-only session cookies, and multi-tenant middleware context.
* **Requirements Addressed:** [FR-001](file:///home/blart/Documents/webProjects/FinanceManager/docs/product-requirements.md#L12), [FR-003](file:///home/blart/Documents/webProjects/FinanceManager/docs/product-requirements.md#L27)
* **Security Considerations:** Multi-tenant boundary enforcement (`getAuthenticatedUserId()`).
* **Dependencies:** `TSK-010` | **Preconditions:** User schema active.
* **Acceptance Criteria:** Middleware protects `/dashboard` and `/api/*`, redirecting unauthenticated requests to `/login`.
* **Definition of Done:** Integration test verifies `401 Unauthorized` for missing session cookie.

### Task `TSK-012`: User Registration UI & API Endpoint (`/register`)
* **Task ID:** `TSK-012`
* **Milestone:** `M1-AUTH` | **Feature:** User Registration
* **Objective:** Implement `/register` page and `POST /api/auth/register` handler with Zod validation.
* **Requirements Addressed:** [FR-002](file:///home/blart/Documents/webProjects/FinanceManager/docs/product-requirements.md#L20)
* **Stitch Reference:** Screen `81346dd7e1c447409ec18ae69c3f3855`
* **Dependencies:** `TSK-011` | **Preconditions:** Better Auth active.
* **Acceptance Criteria:** Form validates email format and 8+ char password match; displays inline error if email exists ([FR-002](file:///home/blart/Documents/webProjects/FinanceManager/docs/product-requirements.md#L20)).
* **Definition of Done:** E2E test registers new user and redirects to `/dashboard`.

### Task `TSK-013`: User Login & Password Recovery Screens (`/login`, `/forgot-password`, `/reset-password`)
* **Task ID:** `TSK-013`
* **Milestone:** `M1-AUTH` | **Feature:** User Authentication
* **Objective:** Implement `/login`, `/forgot-password`, and `/reset-password` UI views and handlers.
* **Requirements Addressed:** [FR-001](file:///home/blart/Documents/webProjects/FinanceManager/docs/product-requirements.md#L12), [FR-004](file:///home/blart/Documents/webProjects/FinanceManager/docs/product-requirements.md#L34)
* **Stitch Reference:** Screens `f9dc05f5...`, `51f65e72...`, `9529bc98...`
* **Dependencies:** `TSK-012` | **Preconditions:** Registration working.
* **Acceptance Criteria:** Login sets HTTP-only session cookie; password reset issues recovery token and updates password hash.
* **Definition of Done:** E2E test verifies complete login and password reset flows.

---

## Milestone 2: Category Domain (Vertical Slice) (`M2-CAT`)

### Task `TSK-020`: Category Prisma Schema & System Defaults Seeder
* **Task ID:** `TSK-020`
* **Milestone:** `M2-CAT` | **Feature:** Category Schema
* **Objective:** Add `Category` model to `prisma/schema.prisma` and seed default categories.
* **Requirements Addressed:** [FR-016](file:///home/blart/Documents/webProjects/FinanceManager/docs/product-requirements.md#L98), [FR-017](file:///home/blart/Documents/webProjects/FinanceManager/docs/product-requirements.md#L104)
* **Business Rules:** [BR-012](file:///home/blart/Documents/webProjects/FinanceManager/docs/business-rules.md#L66), [BR-017](file:///home/blart/Documents/webProjects/FinanceManager/docs/business-rules.md#L94)
* **Dependencies:** `TSK-010` | **Preconditions:** Auth setup complete.
* **Acceptance Criteria:** `prisma/seed.ts` creates system defaults (`Groceries`, `Utilities`, `Housing`, `Salary`, `Freelance`, `Uncategorized (Expense)`, `Uncategorized (Income)`) with `isSystemDefault: true`.
* **Definition of Done:** `npx prisma db seed` runs idempotently.

### Task `TSK-021`: Category API Handlers & Validation Schemas
* **Task ID:** `TSK-021`
* **Milestone:** `M2-CAT` | **Feature:** Category API
* **Objective:** Implement `GET /api/categories`, `POST /api/categories`, `PUT /api/categories/[id]`, `DELETE /api/categories/[id]` route handlers.
* **Requirements Addressed:** [FR-016](file:///home/blart/Documents/webProjects/FinanceManager/docs/product-requirements.md#L98), [FR-018](file:///home/blart/Documents/webProjects/FinanceManager/docs/product-requirements.md#L110)
* **Dependencies:** `TSK-020` | **Preconditions:** Category model created.
* **Acceptance Criteria:** `POST` prevents duplicate category names per user; `DELETE` blocks deletion of system default categories ([BR-017](file:///home/blart/Documents/webProjects/FinanceManager/docs/business-rules.md#L94)).
* **Definition of Done:** Integration tests pass for category CRUD and system default protection.

### Task `TSK-022`: Category Management UI & Deletion Reassignment Modal
* **Task ID:** `TSK-022`
* **Milestone:** `M2-CAT` | **Feature:** Category UI
* **Objective:** Implement `/categories` page, Add Custom Category Modal (`/categories/add-edit`), and Category Deletion Reassignment Modal.
* **Requirements Addressed:** [FR-016](file:///home/blart/Documents/webProjects/FinanceManager/docs/product-requirements.md#L98), [FR-019](file:///home/blart/Documents/webProjects/FinanceManager/docs/product-requirements.md#L116)
* **Business Rules:** [BR-013](file:///home/blart/Documents/webProjects/FinanceManager/docs/business-rules.md#L73)
* **Stitch Reference:** Screens `fb151091...`, `d5f85161...`
* **Dependencies:** `TSK-021` | **Preconditions:** Category API active.
* **Acceptance Criteria:** Deleting a category with active transactions forces selecting a target replacement category (defaulting to `"Uncategorized (Expense)"`) before executing ([BR-013](file:///home/blart/Documents/webProjects/FinanceManager/docs/business-rules.md#L73)).
* **Definition of Done:** Category creation, editing, and reassignment deletion verified in UI.

---

## Milestone 3: Transactions Ledger & Backdating Engine (`M3-TXN`)

### Task `TSK-030`: Transaction Prisma Schema
* **Task ID:** `TSK-030`
* **Milestone:** `M3-TXN` | **Feature:** Transaction Schema
* **Objective:** Define `Transaction` model in `prisma/schema.prisma` with indexes on `(userId, transactionDate)`.
* **Requirements Addressed:** [FR-008](file:///home/blart/Documents/webProjects/FinanceManager/docs/product-requirements.md#L55)
* **Database Models:** `Transaction`, `User`, `Category`
* **Dependencies:** `TSK-020` | **Preconditions:** Category schema complete.
* **Acceptance Criteria:** Fields: `id`, `userId`, `categoryId`, `amount` (`Decimal(12,2)`), `type` (`INCOME`/`EXPENSE`), `transactionDate` (`DateTime`), `merchantName`, `notes`, `createdAt`, `updatedAt`.
* **Definition of Done:** Migration pushed, Prisma client updated.

### Task `TSK-031`: Transaction Search, Filter & Backdated Entry API
* **Task ID:** `TSK-031`
* **Milestone:** `M3-TXN` | **Feature:** Transaction API
* **Objective:** Implement `GET /api/transactions` (with pagination, search, date range, category filters) and `POST/PUT/DELETE /api/transactions` handlers.
* **Requirements Addressed:** [FR-008](file:///home/blart/Documents/webProjects/FinanceManager/docs/product-requirements.md#L55) to [FR-014](file:///home/blart/Documents/webProjects/FinanceManager/docs/product-requirements.md#L86), [FR-027](file:///home/blart/Documents/webProjects/FinanceManager/docs/product-requirements.md#L150)
* **Business Rules:** [BR-002](file:///home/blart/Documents/webProjects/FinanceManager/docs/business-rules.md#L11), [BR-003](file:///home/blart/Documents/webProjects/FinanceManager/docs/business-rules.md#L17), [BR-020](file:///home/blart/Documents/webProjects/FinanceManager/docs/business-rules.md#L112)
* **Dependencies:** `TSK-030` | **Preconditions:** Transaction schema active.
* **Acceptance Criteria:** Edits to historical transaction dates automatically trigger net cumulative balance and monthly budget recalculations ([FR-027](file:///home/blart/Documents/webProjects/FinanceManager/docs/product-requirements.md#L150)).
* **Definition of Done:** Integration tests verify multi-tenant isolation, backdated recalculations, and search/filtering.

### Task `TSK-032`: Transactions Ledger UI & Add/Edit Form Modal
* **Task ID:** `TSK-032`
* **Milestone:** `M3-TXN` | **Feature:** Transaction UI
* **Objective:** Implement `/transactions` page with tabular ledger and Add/Edit Transaction Modal (`/transactions/add-edit`).
* **Requirements Addressed:** [FR-008](file:///home/blart/Documents/webProjects/FinanceManager/docs/product-requirements.md#L55) to [FR-014](file:///home/blart/Documents/webProjects/FinanceManager/docs/product-requirements.md#L86)
* **Stitch Reference:** Screens `aa7744f8...`, `30d385d1...`, `836574dd...`
* **Dependencies:** `TSK-031` | **Preconditions:** Transaction API active.
* **Acceptance Criteria:** Table displays `JetBrains Mono` tabular amounts, income/expense badges, UTC date backdating picker, and search toolbar.
* **Definition of Done:** E2E test creates, edits, filters, and deletes transactions.

---

## Milestone 4: Monthly Budgets & Warning Threshold Engine (`M4-BUDGET`)

### Task `TSK-040`: Budget Prisma Schema
* **Task ID:** `TSK-040`
* **Milestone:** `M4-BUDGET` | **Feature:** Budget Schema
* **Objective:** Define `Budget` model in `prisma/schema.prisma` with unique constraint `@@unique([userId, categoryId, month, year])`.
* **Requirements Addressed:** [FR-020](file:///home/blart/Documents/webProjects/FinanceManager/docs/product-requirements.md#L122)
* **Database Models:** `Budget`, `User`, `Category`
* **Dependencies:** `TSK-020` | **Preconditions:** Category model complete.
* **Acceptance Criteria:** Enforces 1 budget per category per calendar month per user ([BR-007](file:///home/blart/Documents/webProjects/FinanceManager/docs/business-rules.md#L39)).
* **Definition of Done:** Migration executed.

### Task `TSK-041`: Budget API Route Handlers & Warning Calculation Engine
* **Task ID:** `TSK-041`
* **Milestone:** `M4-BUDGET` | **Feature:** Budget API & Calculation Engine
* **Objective:** Implement `GET /api/budgets` (with aggregated actual spending calculations) and `POST/PUT/DELETE /api/budgets` handlers.
* **Requirements Addressed:** [FR-020](file:///home/blart/Documents/webProjects/FinanceManager/docs/product-requirements.md#L122) to [FR-026](file:///home/blart/Documents/webProjects/FinanceManager/docs/product-requirements.md#L144), [FR-044](file:///home/blart/Documents/webProjects/FinanceManager/docs/product-requirements.md#L238)
* **Business Rules:** [BR-007](file:///home/blart/Documents/webProjects/FinanceManager/docs/business-rules.md#L39) to [BR-011](file:///home/blart/Documents/webProjects/FinanceManager/docs/business-rules.md#L60)
* **Dependencies:** `TSK-040`, `TSK-031` | **Preconditions:** Budget & Transaction models active.
* **Acceptance Criteria:** Calculates budget percentage $P_b = (\text{Spent} / \text{Limit}) \times 100$; flags Amber Warning ($80\% \le P_b < 100\%$) and Crimson Red Alert ($P_b \ge 100\%$) ([FR-044](file:///home/blart/Documents/webProjects/FinanceManager/docs/product-requirements.md#L238)). Budget overruns DO NOT block transaction creation ([BR-010](file:///home/blart/Documents/webProjects/FinanceManager/docs/business-rules.md#L55)).
* **Definition of Done:** Unit tests verify 80% Amber and 100%+ Red alert calculation edge cases.

### Task `TSK-042`: Monthly Budgets UI & Create/Edit Form Modal
* **Task ID:** `TSK-042`
* **Milestone:** `M4-BUDGET` | **Feature:** Budget UI
* **Objective:** Implement `/budgets` view and Create/Edit Monthly Budget Modal (`/budgets/create-edit`).
* **Requirements Addressed:** [FR-020](file:///home/blart/Documents/webProjects/FinanceManager/docs/product-requirements.md#L122) to [FR-026](file:///home/blart/Documents/webProjects/FinanceManager/docs/product-requirements.md#L144)
* **Stitch Reference:** Screens `c1bbd9d9...` (Benchmark), `305a84e3...`
* **Dependencies:** `TSK-041` | **Preconditions:** Budget API active.
* **Acceptance Criteria:** Renders category spending progress bars, Amber `AlertTriangle` badges, Red `AlertOctagon` overrun badges, and overall budget health header summary.
* **Definition of Done:** E2E test creates budget, adds transaction over 80%, and verifies warning badge appears.

---

## Milestone 5: Savings Goals & Atomic Contribution Engine (`M5-SAVINGS`)

### Task `TSK-050`: Savings Goal Prisma Schema
* **Task ID:** `TSK-050`
* **Milestone:** `M5-SAVINGS` | **Feature:** Savings Schema
* **Objective:** Define `SavingsGoal` model in `prisma/schema.prisma`.
* **Requirements Addressed:** [FR-028](file:///home/blart/Documents/webProjects/FinanceManager/docs/product-requirements.md#L156)
* **Dependencies:** `TSK-010` | **Preconditions:** Auth schema active.
* **Acceptance Criteria:** Fields: `id`, `userId`, `name`, `targetAmount` (`Decimal(12,2)`), `accumulatedBalance` (`Decimal(12,2)`), `targetDate` (`DateTime`), `status` (`IN_PROGRESS`/`COMPLETED`), `createdAt`, `updatedAt`.
* **Definition of Done:** Migration pushed.

### Task `TSK-051`: Savings Goal API Handlers & Atomic Contribution Handler
* **Task ID:** `TSK-051`
* **Milestone:** `M5-SAVINGS` | **Feature:** Savings API
* **Objective:** Implement `GET /api/savings`, `POST /api/savings`, `POST /api/savings/[id]/contribute` route handlers.
* **Requirements Addressed:** [FR-028](file:///home/blart/Documents/webProjects/FinanceManager/docs/product-requirements.md#L156) to [FR-034](file:///home/blart/Documents/webProjects/FinanceManager/docs/product-requirements.md#L188), [FR-050](file:///home/blart/Documents/webProjects/FinanceManager/docs/product-requirements.md#L247)
* **Business Rules:** [BR-014](file:///home/blart/Documents/webProjects/FinanceManager/docs/business-rules.md#L78), [BR-015](file:///home/blart/Documents/webProjects/FinanceManager/docs/business-rules.md#L83), [BR-016](file:///home/blart/Documents/webProjects/FinanceManager/docs/business-rules.md#L88)
* **Dependencies:** `TSK-050` | **Preconditions:** Savings Goal schema active.
* **Acceptance Criteria:** `/contribute` atomically increments `accumulatedBalance`; updates `status` to `COMPLETED` when `accumulatedBalance >= targetAmount` ([BR-016](file:///home/blart/Documents/webProjects/FinanceManager/docs/business-rules.md#L88)).
* **Definition of Done:** Integration test verifies atomic contribution and auto-completion status update.

### Task `TSK-052`: Savings Goals UI & Contribution Modal
* **Task ID:** `TSK-052`
* **Milestone:** `M5-SAVINGS` | **Feature:** Savings UI
* **Objective:** Implement `/savings` page, Create Savings Goal Modal (`/savings/create-goal`), and Record Contribution Modal.
* **Requirements Addressed:** [FR-028](file:///home/blart/Documents/webProjects/FinanceManager/docs/product-requirements.md#L156) to [FR-034](file:///home/blart/Documents/webProjects/FinanceManager/docs/product-requirements.md#L188)
* **Stitch Reference:** Screens `bf274b00...`, `4ff5c944...`, `df8f5a76...`
* **Dependencies:** `TSK-051` | **Preconditions:** Savings API active.
* **Acceptance Criteria:** Goal cards display target progress ring/bar; completed goals render gold completion badge; contribution modal updates balance in real-time.
* **Definition of Done:** E2E test creates goal, logs contributions to 100%, and verifies `COMPLETED` badge.

---

## Milestone 6: Dashboard Hub & Financial Analytics (`M6-DASHBOARD`)

### Task `TSK-060`: Aggregated Dashboard & Analytics API Handlers
* **Task ID:** `TSK-060`
* **Milestone:** `M6-DASHBOARD` | **Feature:** Dashboard API
* **Objective:** Implement `GET /api/dashboard` and `GET /api/analytics` aggregated data endpoints.
* **Requirements Addressed:** [FR-005](file:///home/blart/Documents/webProjects/FinanceManager/docs/product-requirements.md#L41), [FR-006](file:///home/blart/Documents/webProjects/FinanceManager/docs/product-requirements.md#L47), [FR-015](file:///home/blart/Documents/webProjects/FinanceManager/docs/product-requirements.md#L92)
* **Business Rules:** [BR-020](file:///home/blart/Documents/webProjects/FinanceManager/docs/business-rules.md#L112)
* **Dependencies:** `TSK-031`, `TSK-041`, `TSK-051` | **Preconditions:** Core APIs working.
* **Acceptance Criteria:** Returns Net Cumulative Balance ($\sum \text{Income} - \sum \text{Expense}$), total monthly income/expense, recent 5 transactions, category breakdown percentages, and 6-month historical cashflow trends.
* **Definition of Done:** Integration test verifies metric aggregation accuracy.

### Task `TSK-061`: Dashboard Hub & Mobile Viewport UI (`/dashboard`)
* **Task ID:** `TSK-061`
* **Milestone:** `M6-DASHBOARD` | **Feature:** Dashboard UI
* **Objective:** Implement `/dashboard` page for Desktop and Mobile responsive viewports.
* **Requirements Addressed:** [FR-005](file:///home/blart/Documents/webProjects/FinanceManager/docs/product-requirements.md#L41) to [FR-007](file:///home/blart/Documents/webProjects/FinanceManager/docs/product-requirements.md#L50)
* **Stitch Reference:** Screens `3e06aa43...`, `1bc34c7e...`, `d5447c40...` (Mobile)
* **Dependencies:** `TSK-060` | **Preconditions:** Aggregated API ready.
* **Acceptance Criteria:** Displays Net Balance card (Emerald green for positive, Rose red for negative `-$250.00` [BR-020](file:///home/blart/Documents/webProjects/FinanceManager/docs/business-rules.md#L112)), cashflow summary cards, proactive budget alert banner, recent activity feed, and mobile bottom nav + FAB.
* **Definition of Done:** Responsive UI verified on desktop (1280px) and mobile (375px).

### Task `TSK-062`: Analytics & Financial Trends UI (`/analytics`)
* **Task ID:** `TSK-062`
* **Milestone:** `M6-DASHBOARD` | **Feature:** Analytics UI
* **Objective:** Implement `/analytics` page with Recharts Donut and Bar charts.
* **Requirements Addressed:** [FR-015](file:///home/blart/Documents/webProjects/FinanceManager/docs/product-requirements.md#L92)
* **Stitch Reference:** Screen `95c642a5...`
* **Dependencies:** `TSK-060` | **Preconditions:** Dashboard API ready.
* **Acceptance Criteria:** Renders interactive Recharts Category Spending Donut Chart and 6-month Income vs Expense Bar Trend Chart with opaque Dark Slate hover tooltips.
* **Definition of Done:** Visual render and data binding verified.

---

## Milestone 7: Account Settings & Data Hard Purging (`M7-SETTINGS`)

### Task `TSK-070`: Profile Settings & Preferred Currency API Handlers
* **Task ID:** `TSK-070`
* **Milestone:** `M7-SETTINGS` | **Feature:** Settings API
* **Objective:** Implement `PUT /api/user/profile` and `DELETE /api/user/account` (Hard Purge) endpoints.
* **Requirements Addressed:** [FR-035](file:///home/blart/Documents/webProjects/FinanceManager/docs/product-requirements.md#L194) to [FR-040](file:///home/blart/Documents/webProjects/FinanceManager/docs/product-requirements.md#L216)
* **Business Rules:** [BR-018](file:///home/blart/Documents/webProjects/FinanceManager/docs/business-rules.md#L100), [BR-019](file:///home/blart/Documents/webProjects/FinanceManager/docs/business-rules.md#L106)
* **Dependencies:** All prior domain models | **Preconditions:** User schema active.
* **Acceptance Criteria:** `PUT` updates `preferredCurrencySymbol` (`$`, `€`, `£`, `¥`); `DELETE` executes cascading `prisma.$transaction` hard purge across User, Transaction, Category, Budget, SavingsGoal, Session, Account rows ([BR-019](file:///home/blart/Documents/webProjects/FinanceManager/docs/business-rules.md#L106)).
* **Definition of Done:** Integration test verifies complete 7-table hard deletion.

### Task `TSK-071`: Settings UI & Permanent Account Deletion Modal (`/settings`)
* **Task ID:** `TSK-071`
* **Milestone:** `M7-SETTINGS` | **Feature:** Settings UI
* **Objective:** Implement `/settings` page, Preferred Currency selector, Light/Dark theme toggle, and Danger Zone Account Deletion Modal.
* **Requirements Addressed:** [FR-035](file:///home/blart/Documents/webProjects/FinanceManager/docs/product-requirements.md#L194) to [FR-040](file:///home/blart/Documents/webProjects/FinanceManager/docs/product-requirements.md#L216)
* **Stitch Reference:** Screens `33bfb057...`, `4c5d0631...`
* **Dependencies:** `TSK-070` | **Preconditions:** Settings API active.
* **Acceptance Criteria:** Display currency setting includes helper text explaining nominal prefix behavior ([BR-018](file:///home/blart/Documents/webProjects/FinanceManager/docs/business-rules.md#L100)); Account Deletion modal forces entering password and typing `"DELETE MY ACCOUNT"` string before enabling submit button.
* **Definition of Done:** E2E test changes currency symbol and executes account hard deletion.

---

## Milestone 8: E2E Quality Assurance & Production Deployment (`M8-PROD`)

### Task `TSK-080`: Comprehensive Playwright E2E Test Suite
* **Task ID:** `TSK-080`
* **Milestone:** `M8-PROD` | **Feature:** E2E Testing
* **Objective:** Write Playwright E2E tests covering all core user flows.
* **Dependencies:** All prior tasks | **Preconditions:** Entire app operational locally.
* **Acceptance Criteria:** Tests verify Register $\rightarrow$ Add Backdated Transaction $\rightarrow$ Budget Warning Alert $\rightarrow$ Savings Goal Contribution $\rightarrow$ Account Purge.
* **Definition of Done:** 100% Playwright test pass rate.

### Task `TSK-081`: Production Build, OWASP Hardening & Vercel Deployment
* **Task ID:** `TSK-081`
* **Milestone:** `M8-PROD` | **Feature:** Deployment
* **Objective:** Execute Vercel production build, run OWASP security audit, and deploy live app with Neon DB connection pooling.
* **Requirements Addressed:** [FR-061](file:///home/blart/Documents/webProjects/FinanceManager/docs/product-requirements.md#L300), [FR-062](file:///home/blart/Documents/webProjects/FinanceManager/docs/product-requirements.md#L306)
* **Dependencies:** `TSK-080` | **Preconditions:** All tests passing.
* **Acceptance Criteria:** `npm run build` passes cleanly; live Vercel URL boots cleanly; HTTPS SSL active.
* **Definition of Done:** Live production URL verified and operational.
