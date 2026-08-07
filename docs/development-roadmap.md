# Development Roadmap

**Application:** Personal Finance Manager (v1.0 MVP)  
**Document Type:** Dependency-Aware Implementation Roadmap & Quality Gates  
**Status:** Approved & Authoritative  
**Source Documents:** [`docs/implementation-plan.md`](file:///home/blart/Documents/webProjects/FinanceManager/docs/implementation-plan.md) & All approved architecture specifications  

---

## 1. Dependency Graph & Milestone Sequence

The roadmap is strictly ordered by architecture, database, API, and UI dependencies. Foundational infrastructure is established first, followed by core domain vertical feature slices:

```
[Milestone 0: Project Setup & Infrastructure Foundation]
                         │
                         ▼
[Milestone 1: Identity, Authentication & Multi-Tenant Context]
                         │
                         ▼
[Milestone 2: Category Domain (System Defaults & Custom Categories)]
                         │
                         ▼
[Milestone 3: Transactions Ledger & Backdated Calculation Engine]
                         │
                         ▼
[Milestone 4: Monthly Budgets & Warning Threshold Engine (80% / 100%+)]
                         │
                         ▼
[Milestone 5: Savings Goals & Atomic Contribution Engine]
                         │
                         ▼
[Milestone 6: Dashboard Hub & Financial Analytics Engine]
                         │
                         ▼
[Milestone 7: Account Settings & Data Hard Purging]
                         │
                         ▼
[Milestone 8: E2E Quality Assurance, Security Audit & Production Deployment]
```

---

## 2. Detailed Milestone Specifications

### Milestone 0: Project Setup & Infrastructure Foundation
* **Milestone ID:** `M0-INFRA`
* **Objective:** Initialize repository, Next.js App Router, TypeScript, Tailwind CSS theme, `shadcn/ui` primitives, Prisma client, and Neon PostgreSQL database connection.
* **Features:** Next.js project init, Tailwind theme variables (`#0f1418` dark slate), `shadcn/ui` button/card/dialog components, Prisma schema initialization, database connection pooling.
* **Dependencies:** None.
* **Expected Outcome:** Runnable local development server displaying dark slate foundation layout with active database connectivity.
* **Validation Criteria:** `npm run dev` boots cleanly, Prisma client connects to Neon DB without errors.
* **Exit Criteria:** Foundation Quality Gate Passed.

### Milestone 1: Identity, Authentication & Multi-Tenant Context
* **Milestone ID:** `M1-AUTH`
* **Objective:** Implement user registration, login, password recovery, session token handling, and multi-tenant middleware authorization context.
* **Features:** User model in Prisma, Better Auth integration, `/register` form, `/login` form, `/forgot-password` request, `/reset-password` confirmation, HTTP-only session cookies, session middleware.
* **Dependencies:** `M0-INFRA`.
* **Expected Outcome:** Authenticated session context available globally; unauthenticated users redirected to `/login`.
* **Validation Criteria:** User can register, log in, recover password, and access protected `/dashboard` routes.
* **Exit Criteria:** Authentication Quality Gate Passed.

### Milestone 2: Category Domain (Vertical Slice)
* **Milestone ID:** `M2-CAT`
* **Objective:** Implement system default and custom expense/income categories with deletion reassignment protection.
* **Features:** Category Prisma model, system defaults seeder (`Groceries`, `Utilities`, `Housing`, `Salary`, `Freelance`, `Uncategorized`), category CRUD API handlers, `/categories` view, Add Custom Category Modal (`/categories/add-edit`), Category Deletion Reassignment Modal ([BR-013](file:///home/blart/Documents/webProjects/FinanceManager/docs/business-rules.md#L73)).
* **Dependencies:** `M1-AUTH`.
* **Expected Outcome:** Categories can be created, updated, and deleted with mandatory transaction reassignment to `"Uncategorized (Expense)"`.
* **Validation Criteria:** System default categories locked; deleting a category with active transactions prompts for reassignment.
* **Exit Criteria:** Category Quality Gate Passed.

### Milestone 3: Transactions Ledger & Calculation Engine (Vertical Slice)
* **Milestone ID:** `M3-TXN`
* **Objective:** Implement transaction ledger, search/filter handlers, backdated date entry, and net balance calculation logic.
* **Features:** Transaction Prisma model, transaction CRUD API endpoints, `/transactions` view with search & multi-filter bar, Add/Edit Transaction Modal (`/transactions/add-edit`), historical UTC backdating date picker ([FR-027](file:///home/blart/Documents/webProjects/FinanceManager/docs/product-requirements.md#L150)), net cumulative balance recalculation logic.
* **Dependencies:** `M2-CAT`.
* **Expected Outcome:** User can log income/expenses, backdate transactions, filter by date/category/type, and view updated net balance.
* **Validation Criteria:** Transactions strictly isolated to logged-in user (`where: { userId }`), amounts display with `tabular-nums` JetBrains Mono formatting.
* **Exit Criteria:** Transaction Quality Gate Passed.

### Milestone 4: Monthly Budgets & Warning Engine (Vertical Slice)
* **Milestone ID:** `M4-BUDGET`
* **Objective:** Implement category monthly spending limits and progressive warning threshold alerts.
* **Features:** Budget Prisma model, budget CRUD API handlers, `/budgets` view, Create/Edit Budget Modal (`/budgets/create-edit`), spending aggregation calculator, Amber 80% warning badge (`AlertTriangle`), Red 100%+ overrun alert badge (`AlertOctagon`) ([FR-044](file:///home/blart/Documents/webProjects/FinanceManager/docs/product-requirements.md#L238)).
* **Dependencies:** `M3-TXN`.
* **Expected Outcome:** User sets monthly category budget limits; system triggers progressive visual warnings as spending occurs.
* **Validation Criteria:** Budget overrun does not block transaction entry; warning badges render correctly at 80% and 100% thresholds.
* **Exit Criteria:** Budget Quality Gate Passed.

### Milestone 5: Savings Goals & Atomic Contribution Engine (Vertical Slice)
* **Milestone ID:** `M5-SAVINGS`
* **Objective:** Implement savings goal target tracking and atomic contribution logging.
* **Features:** SavingsGoal Prisma model, savings goal CRUD API endpoints, `/savings` view, Create Goal Modal (`/savings/create-goal`), Record Contribution Modal, atomic `accumulatedBalance` increment logic, `COMPLETED` milestone badge logic ([FR-050](file:///home/blart/Documents/webProjects/FinanceManager/docs/product-requirements.md#L247)).
* **Dependencies:** `M1-AUTH`.
* **Expected Outcome:** User can track savings goals, log contributions, and see completion milestone indicators.
* **Validation Criteria:** Contributions correctly increment accumulated balance; 100% progress displays gold completion badge.
* **Exit Criteria:** Savings Quality Gate Passed.

### Milestone 6: Dashboard Hub & Financial Analytics Engine
* **Milestone ID:** `M6-DASHBOARD`
* **Objective:** Assemble main financial dashboard overview and visual trend charts.
* **Features:** Aggregated `/api/dashboard` endpoint, Net Balance Hero Card (`+$4,250.50` / `-$250.00`), Income/Expense cards, Recent Activity feed, Recharts category donut breakdown, `/analytics` 6-month cashflow trend bar chart view, mobile responsive view with bottom nav & FAB.
* **Dependencies:** `M3-TXN`, `M4-BUDGET`, `M5-SAVINGS`.
* **Expected Outcome:** Fully operational financial overview hub displaying real-time data visualizations.
* **Validation Criteria:** Dashboard metrics match ledger totals exactly; responsive mobile layout functions smoothly.
* **Exit Criteria:** Dashboard & Analytics Quality Gate Passed.

### Milestone 7: Account Settings & Data Hard Purging
* **Milestone ID:** `M7-SETTINGS`
* **Objective:** Implement user preferences, currency display symbol setting, and permanent account hard purging.
* **Features:** Profile updating, Preferred Currency Symbol dropdown (`$`, `€`, `£`, `¥`) ([BR-018](file:///home/blart/Documents/webProjects/FinanceManager/docs/business-rules.md#L100)), Light/Dark theme toggle, Danger Zone account deletion modal requiring password re-entry + typing `"DELETE MY ACCOUNT"` string input to trigger cascading `prisma.$transaction` hard purge ([BR-019](file:///home/blart/Documents/webProjects/FinanceManager/docs/business-rules.md#L106)).
* **Dependencies:** All prior domain milestones (`M1` through `M6`).
* **Expected Outcome:** User can change visual currency symbol prefix and permanently erase all user account records.
* **Validation Criteria:** Nominal currency preference updates UI labels without FX conversion; account deletion completely purges user rows across all 7 database tables.
* **Exit Criteria:** Settings & Security Quality Gate Passed.

### Milestone 8: E2E Quality Assurance & Production Deployment
* **Milestone ID:** `M8-PROD`
* **Objective:** Execute full test suite, perform security audit, deploy to Vercel and Neon DB, and verify production release.
* **Features:** Jest unit tests, Playwright E2E automation suite, OWASP security checks, Vercel production build, Neon PostgreSQL database migration execution.
* **Dependencies:** `M0` through `M7`.
* **Expected Outcome:** Live, secure, fully tested production web application.
* **Validation Criteria:** 100% test suite pass rate; production build succeeds on Vercel; live database connection verified.
* **Exit Criteria:** Production Readiness Quality Gate Passed.

---

## 3. Implementation Quality Gates Summary

| Quality Gate | Required Verifications | Mandatory Exit Action |
| :--- | :--- | :--- |
| **Gate 0: Foundation** | Next.js server boots cleanly, Prisma client connects to Neon DB. | Code review & git tag `v0.1-infra` |
| **Gate 1: Auth & Multi-Tenancy** | Better Auth session context active; unauthenticated API calls return 401. | Security test pass & git tag `v0.2-auth` |
| **Gate 2: Category Domain** | System defaults locked; category deletion forces transaction reassignment. | Integration test pass & git tag `v0.3-cat` |
| **Gate 3: Transactions** | Multi-tenant isolation verified; backdated entries recalculate net balance. | Unit & API test pass & git tag `v0.4-txn` |
| **Gate 4: Budgets** | Budget overrun does not block entries; Amber 80% / Red 100%+ badges render. | Calculation test pass & git tag `v0.5-budget` |
| **Gate 5: Savings** | Contribution increments accumulated balance; 100% displays completion badge. | Domain test pass & git tag `v0.6-savings` |
| **Gate 6: Dashboard & Analytics** | Dashboard values match ledger totals; mobile bottom nav and FAB function. | Visual & E2E test pass & git tag `v0.7-dash` |
| **Gate 7: Settings & Security** | Currency symbol updates prefix; account deletion hard-purges all user tables. | Purge test pass & git tag `v0.8-settings` |
| **Gate 8: Production Readiness** | 100% Playwright E2E tests passing; Vercel build succeeds. | Final sign-off & git tag `v1.0-release` |
