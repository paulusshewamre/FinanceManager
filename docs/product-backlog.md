# Product Backlog

## Application: Personal Finance Manager (v1.0 MVP)
**Role:** Senior Product Manager  
**Status:** Prioritized Product Backlog  
**Traceability:** [product-requirements.md](file:///home/blart/Documents/webProjects/FinanceManager/docs/product-requirements.md) | [user-stories.md](file:///home/blart/Documents/webProjects/FinanceManager/docs/user-stories.md) | [use-cases.md](file:///home/blart/Documents/webProjects/FinanceManager/docs/use-cases.md) | [business-rules.md](file:///home/blart/Documents/webProjects/FinanceManager/docs/business-rules.md)

---

# Epic 1: User Identity & Security Management
**Target Release:** Sprint 1–2 (Milestone 1: Alpha Release)

### PB-101: User Registration
* **Priority:** Must Have (P0)
* **Traceability:** [FR-001](file:///home/blart/Documents/webProjects/FinanceManager/docs/product-requirements.md#L13) | [UC-001](file:///home/blart/Documents/webProjects/FinanceManager/docs/use-cases.md#L3) | [BR-001](file:///home/blart/Documents/webProjects/FinanceManager/docs/business-rules.md#L3)
* **User Story:** As a new user, I want to create an account, so that my financial information is securely stored.
* **Acceptance Criteria:**
  1. System displays email, password, and confirm password fields.
  2. Enforces unique email check ([BR-001](file:///home/blart/Documents/webProjects/FinanceManager/docs/business-rules.md#L3)).
  3. Displays confirmation message and redirects to login upon successful registration.
* **Sprint Assignment:** Sprint 1

---

### PB-102: Authentication & Session Persistence
* **Priority:** Must Have (P0)
* **Traceability:** [FR-002](file:///home/blart/Documents/webProjects/FinanceManager/docs/product-requirements.md#L20), [FR-003](file:///home/blart/Documents/webProjects/FinanceManager/docs/product-requirements.md#L27), [FR-005](file:///home/blart/Documents/webProjects/FinanceManager/docs/product-requirements.md#L41) | [UC-002](file:///home/blart/Documents/webProjects/FinanceManager/docs/use-cases.md#L16), [UC-010](file:///home/blart/Documents/webProjects/FinanceManager/docs/use-cases.md#L120) | [BR-008](file:///home/blart/Documents/webProjects/FinanceManager/docs/business-rules.md#L45)
* **User Story:** As a returning user, I want to log in and stay logged in, so that I can conveniently access my financial dashboard.
* **Acceptance Criteria:**
  1. Validates credentials and blocks unauthenticated access to private routes.
  2. Maintains active session across browser tab restarts.
  3. Provides secure logout ending active session.
* **Sprint Assignment:** Sprint 1

---

### PB-103: Account Recovery (Password Reset)
* **Priority:** Must Have (P0)
* **Traceability:** [FR-004](file:///home/blart/Documents/webProjects/FinanceManager/docs/product-requirements.md#L34) | [UC-011](file:///home/blart/Documents/webProjects/FinanceManager/docs/use-cases.md#L133)
* **User Story:** As a user, I want to reset my password via transactional email recovery, so that I can recover access to my account.
* **Acceptance Criteria:**
  1. User can request password reset token by entering registered email.
  2. Transactional email with secure recovery link is dispatched.
  3. User sets new password and can authenticate with updated credentials.
* **Sprint Assignment:** Sprint 2

---

### PB-104: Permanent Account Deletion
* **Priority:** Must Have (P0)
* **Traceability:** [FR-006](file:///home/blart/Documents/webProjects/FinanceManager/docs/product-requirements.md#L48) | [UC-014](file:///home/blart/Documents/webProjects/FinanceManager/docs/use-cases.md#L169) | [BR-019](file:///home/blart/Documents/webProjects/FinanceManager/docs/business-rules.md#L106)
* **User Story:** As a user, I want to permanently delete my account, so that my personal financial data is completely erased.
* **Acceptance Criteria:**
  1. System requires confirmation prompt before deletion.
  2. Permanently purges user account, transactions, categories, budgets, and savings goals ([BR-019](file:///home/blart/Documents/webProjects/FinanceManager/docs/business-rules.md#L106)).
  3. Immediately invalidates current session and redirects to public landing page.
* **Sprint Assignment:** Sprint 2

---

### PB-105: User Profile & Currency Preference Settings
* **Priority:** Should Have (P1)
* **Traceability:** [FR-060](file:///home/blart/Documents/webProjects/FinanceManager/docs/product-requirements.md#L291), [FR-062](file:///home/blart/Documents/webProjects/FinanceManager/docs/product-requirements.md#L305) | [UC-009](file:///home/blart/Documents/webProjects/FinanceManager/docs/use-cases.md#L107) | [BR-018](file:///home/blart/Documents/webProjects/FinanceManager/docs/business-rules.md#L100)
* **User Story:** As a user, I want to update my profile and currency symbol preference, so that my account matches my display needs.
* **Acceptance Criteria:**
  1. User can update display name and email address.
  2. User can select preferred currency symbol (e.g., $, €, £, ¥).
  3. Currency symbol updates visual prefix globally without executing exchange conversions ([BR-018](file:///home/blart/Documents/webProjects/FinanceManager/docs/business-rules.md#L100)).
* **Sprint Assignment:** Sprint 1

---

# Epic 2: Core Financial Ledger & Category Engine
**Target Release:** Sprint 3–4 (Milestone 2: Beta Release)

### PB-201: Transaction Creation & Attributes
* **Priority:** Must Have (P0)
* **Traceability:** [FR-020](file:///home/blart/Documents/webProjects/FinanceManager/docs/product-requirements.md#L101), [FR-025](file:///home/blart/Documents/webProjects/FinanceManager/docs/product-requirements.md#L136), [FR-027](file:///home/blart/Documents/webProjects/FinanceManager/docs/product-requirements.md#L150) | [UC-003](file:///home/blart/Documents/webProjects/FinanceManager/docs/use-cases.md#L29) | [BR-004](file:///home/blart/Documents/webProjects/FinanceManager/docs/business-rules.md#L21), [BR-005](file:///home/blart/Documents/webProjects/FinanceManager/docs/business-rules.md#L27)
* **User Story:** As a user, I want to add income and expense transactions with date and merchant details, so that I can accurately log my transactions.
* **Acceptance Criteria:**
  1. User inputs type (`Income`/`Expense`), positive amount (>0), category, transaction date, merchant/payee name, and optional notes.
  2. Transaction date defaults to current date, but supports historical backdating.
  3. Saved transaction appears in ledger and updates dashboard metrics.
* **Sprint Assignment:** Sprint 3

---

### PB-202: Pre-seeded Default Categories & Category Classification
* **Priority:** Must Have (P0)
* **Traceability:** [FR-033](file:///home/blart/Documents/webProjects/FinanceManager/docs/product-requirements.md#L187), [FR-034](file:///home/blart/Documents/webProjects/FinanceManager/docs/product-requirements.md#L194) | [BR-003](file:///home/blart/Documents/webProjects/FinanceManager/docs/business-rules.md#L15), [BR-017](file:///home/blart/Documents/webProjects/FinanceManager/docs/business-rules.md#L94)
* **User Story:** As a new user, I want pre-seeded categories available immediately, so that I can log transactions without manual category setup.
* **Acceptance Criteria:**
  1. System provides default read-only categories for Income (e.g., Salary, Freelance) and Expense (e.g., Housing, Groceries, Utilities).
  2. Categories are classified by type (`Income` vs `Expense`).
* **Sprint Assignment:** Sprint 3

---

### PB-203: Custom Category CRUD & Transaction Reassignment
* **Priority:** Must Have (P0)
* **Traceability:** [FR-030](file:///home/blart/Documents/webProjects/FinanceManager/docs/product-requirements.md#L166)–[FR-032](file:///home/blart/Documents/webProjects/FinanceManager/docs/product-requirements.md#L180), [FR-035](file:///home/blart/Documents/webProjects/FinanceManager/docs/product-requirements.md#L201) | [UC-012](file:///home/blart/Documents/webProjects/FinanceManager/docs/use-cases.md#L145) | [BR-013](file:///home/blart/Documents/webProjects/FinanceManager/docs/business-rules.md#L73)
* **User Story:** As a user, I want to create custom categories and reassign transactions when deleting a category, so that my transaction history remains organized.
* **Acceptance Criteria:**
  1. User can create, edit, and delete custom categories.
  2. Deleting a category with assigned transactions prompts mandatory reassignment to another active category or system "Uncategorized" default ([BR-013](file:///home/blart/Documents/webProjects/FinanceManager/docs/business-rules.md#L73)).
* **Sprint Assignment:** Sprint 4

---

### PB-204: Transaction Search & Multi-Filter System
* **Priority:** Should Have (P1)
* **Traceability:** [FR-023](file:///home/blart/Documents/webProjects/FinanceManager/docs/product-requirements.md#L122), [FR-024](file:///home/blart/Documents/webProjects/FinanceManager/docs/product-requirements.md#L129)
* **User Story:** As a user, I want to search and filter transactions, so that I can analyze specific spending activities.
* **Acceptance Criteria:**
  1. User can search by merchant name, notes, or keyword.
  2. User can filter by transaction type, category, date range, or amount.
* **Sprint Assignment:** Sprint 4

---

# Epic 3: Budgeting, Savings & Recalculation Engine
**Target Release:** Sprint 5–6 (Milestone 3: Release Candidate)

### PB-301: Monthly Category Budgeting
* **Priority:** Must Have (P0)
* **Traceability:** [FR-040](file:///home/blart/Documents/webProjects/FinanceManager/docs/product-requirements.md#L210)–[FR-043](file:///home/blart/Documents/webProjects/FinanceManager/docs/product-requirements.md#L231) | [UC-006](file:///home/blart/Documents/webProjects/FinanceManager/docs/use-cases.md#L68) | [BR-014](file:///home/blart/Documents/webProjects/FinanceManager/docs/business-rules.md#L81)
* **User Story:** As a user, I want to set monthly spending limits per category, so that I can control my expenses.
* **Acceptance Criteria:**
  1. User creates, edits, or deletes monthly category budgets for a specific calendar month ([BR-014](file:///home/blart/Documents/webProjects/FinanceManager/docs/business-rules.md#L81)).
  2. Progress bar displays spending against limit in real time.
* **Sprint Assignment:** Sprint 5

---

### PB-302: Proactive Budget Threshold Warnings
* **Priority:** Should Have (P1)
* **Traceability:** [FR-044](file:///home/blart/Documents/webProjects/FinanceManager/docs/product-requirements.md#L238)
* **User Story:** As a user, I want visual warnings when approaching my budget limit, so that I can prevent overspending.
* **Acceptance Criteria:**
  1. Displays yellow visual indicator when category spending reaches 80%–99% of budget limit.
  2. Displays red visual indicator when category spending reaches 100%+ of budget limit.
* **Sprint Assignment:** Sprint 5

---

### PB-303: Savings Goals & Contribution Logging
* **Priority:** Must Have (P0)
* **Traceability:** [FR-050](file:///home/blart/Documents/webProjects/FinanceManager/docs/product-requirements.md#L247)–[FR-054](file:///home/blart/Documents/webProjects/FinanceManager/docs/product-requirements.md#L275) | [UC-008](file:///home/blart/Documents/webProjects/FinanceManager/docs/use-cases.md#L94), [UC-013](file:///home/blart/Documents/webProjects/FinanceManager/docs/use-cases.md#L157) | [BR-009](file:///home/blart/Documents/webProjects/FinanceManager/docs/business-rules.md#L51), [BR-016](file:///home/blart/Documents/webProjects/FinanceManager/docs/business-rules.md#L88)
* **User Story:** As a user, I want to create savings goals and record progress contributions, so that I can reach my savings targets.
* **Acceptance Criteria:**
  1. User creates, edits, or deletes savings goals with target amount and completion date.
  2. User can record manual progress updates or contributions ([BR-016](file:///home/blart/Documents/webProjects/FinanceManager/docs/business-rules.md#L88)).
  3. Displays percentage progress and remaining balance.
* **Sprint Assignment:** Sprint 5

---

### PB-304: Dynamic Recalculations from Backdated Edits
* **Priority:** Should Have (P1)
* **Traceability:** [FR-028](file:///home/blart/Documents/webProjects/FinanceManager/docs/product-requirements.md#L157) | [BR-006](file:///home/blart/Documents/webProjects/FinanceManager/docs/business-rules.md#L32), [BR-007](file:///home/blart/Documents/webProjects/FinanceManager/docs/business-rules.md#L39)
* **User Story:** As a user, I want past edits to update summaries automatically, so that my historical records remain accurate.
* **Acceptance Criteria:**
  1. Adding, editing, or deleting backdated transactions immediately triggers dynamic recalculation of historical dashboard summaries and monthly budget progress ([BR-006](file:///home/blart/Documents/webProjects/FinanceManager/docs/business-rules.md#L32)).
* **Sprint Assignment:** Sprint 6

---

# Epic 4: Dashboard Analytics & Launch Polish
**Target Release:** Sprint 6 (Milestone 4: Production MVP GA Launch)

### PB-401: Dynamic Net Account Balance & Financial Summaries
* **Priority:** Must Have (P0)
* **Traceability:** [FR-010](file:///home/blart/Documents/webProjects/FinanceManager/docs/product-requirements.md#L57)–[FR-014](file:///home/blart/Documents/webProjects/FinanceManager/docs/product-requirements.md#L85) | [UC-007](file:///home/blart/Documents/webProjects/FinanceManager/docs/use-cases.md#L81) | [BR-020](file:///home/blart/Documents/webProjects/FinanceManager/docs/business-rules.md#L112)
* **User Story:** As a user, I want to see my net account balance and monthly summary on the dashboard, so that I understand my financial situation.
* **Acceptance Criteria:**
  1. Balance Card displays net total (`Total Income - Total Expenses`).
  2. When expenses exceed income, balance displays as a formatted negative value ([BR-020](file:///home/blart/Documents/webProjects/FinanceManager/docs/business-rules.md#L112)).
  3. Displays Income Card, Expense Card, Recent Activity, and calendar month selector.
* **Sprint Assignment:** Sprint 6

---

### PB-402: Spending Analytics & Visual Charts
* **Priority:** Could Have (P2)
* **Traceability:** [FR-015](file:///home/blart/Documents/webProjects/FinanceManager/docs/product-requirements.md#L92)
* **User Story:** As a user, I want visual spending charts, so that I can quickly identify my largest expense categories.
* **Acceptance Criteria:**
  1. Displays spending breakdown by category and monthly income vs expense trends.
* **Sprint Assignment:** Sprint 6

---

### PB-403: Theme Preferences (Light / Dark Mode)
* **Priority:** Could Have (P2)
* **Traceability:** [FR-063](file:///home/blart/Documents/webProjects/FinanceManager/docs/product-requirements.md#L312)
* **User Story:** As a user, I want to switch between light and dark mode, so that I can customize visual appearance.
* **Acceptance Criteria:**
  1. User toggles theme between light and dark mode; preference persists across sessions.
* **Sprint Assignment:** Sprint 6
