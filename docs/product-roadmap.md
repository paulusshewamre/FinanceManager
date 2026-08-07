# Product Roadmap & Release Strategy

## Application: Personal Finance Manager (v1.0 MVP)
**Role:** Senior Product Manager  
**Phase:** Product Planning & Delivery Strategy

---

# 1. Product Vision & Strategic Alignment

Personal Finance Manager v1.0 aims to deliver a clean, fast, and reliable web application for personal budgeting, income and expense management, dynamic net account balance tracking, and savings goals.

The product roadmap translates approved requirements into structured delivery phases, clear milestones, release plans, risk mitigations, and a Definition of Done (DoD).

---

# 2. MoSCoW Feature Prioritization

All product features from [product-requirements.md](file:///home/blart/Documents/webProjects/FinanceManager/docs/product-requirements.md) are prioritized using the **MoSCoW** framework:

| Priority | Requirement ID | Feature Description | Rationale |
| :--- | :--- | :--- | :--- |
| **Must Have (P0)** | [FR-001](file:///home/blart/Documents/webProjects/FinanceManager/docs/product-requirements.md#L13)–[FR-003](file:///home/blart/Documents/webProjects/FinanceManager/docs/product-requirements.md#L27), [FR-005](file:///home/blart/Documents/webProjects/FinanceManager/docs/product-requirements.md#L41) | Registration, Login, Logout, Session Persistence | Core security and access prerequisite for isolated user data ([BR-008](file:///home/blart/Documents/webProjects/FinanceManager/docs/business-rules.md#L45)). |
| **Must Have (P0)** | [FR-004](file:///home/blart/Documents/webProjects/FinanceManager/docs/product-requirements.md#L34) | Password Reset via Transactional Email | Critical user account recovery capability ([UC-011](file:///home/blart/Documents/webProjects/FinanceManager/docs/use-cases.md#L133)). |
| **Must Have (P0)** | [FR-006](file:///home/blart/Documents/webProjects/FinanceManager/docs/product-requirements.md#L48) | Account Deletion & Permanent Data Purging | Privacy compliance and complete user data lifecycle control ([BR-019](file:///home/blart/Documents/webProjects/FinanceManager/docs/business-rules.md#L106), [UC-014](file:///home/blart/Documents/webProjects/FinanceManager/docs/use-cases.md#L169)). |
| **Must Have (P0)** | [FR-010](file:///home/blart/Documents/webProjects/FinanceManager/docs/product-requirements.md#L57)–[FR-014](file:///home/blart/Documents/webProjects/FinanceManager/docs/product-requirements.md#L85) | Dynamic Net Balance, Income/Expense Cards, Recent Activity | Core dashboard metrics showing net balance and financial health ([BR-020](file:///home/blart/Documents/webProjects/FinanceManager/docs/business-rules.md#L112)). |
| **Must Have (P0)** | [FR-020](file:///home/blart/Documents/webProjects/FinanceManager/docs/product-requirements.md#L101)–[FR-022](file:///home/blart/Documents/webProjects/FinanceManager/docs/product-requirements.md#L115), [FR-025](file:///home/blart/Documents/webProjects/FinanceManager/docs/product-requirements.md#L136) | Create, Edit, Delete Income/Expense Transactions | Core ledger functionality for recording financial transactions. |
| **Must Have (P0)** | [FR-027](file:///home/blart/Documents/webProjects/FinanceManager/docs/product-requirements.md#L150) | Transaction Date & Merchant/Payee Name Fields | Essential transaction metadata for auditability and search. |
| **Must Have (P0)** | [FR-033](file:///home/blart/Documents/webProjects/FinanceManager/docs/product-requirements.md#L187), [FR-034](file:///home/blart/Documents/webProjects/FinanceManager/docs/product-requirements.md#L194) | Pre-seeded System Categories & Classification by Type | Immediate onboarding enablement ([BR-017](file:///home/blart/Documents/webProjects/FinanceManager/docs/business-rules.md#L94)). |
| **Must Have (P0)** | [FR-030](file:///home/blart/Documents/webProjects/FinanceManager/docs/product-requirements.md#L166)–[FR-032](file:///home/blart/Documents/webProjects/FinanceManager/docs/product-requirements.md#L180), [FR-035](file:///home/blart/Documents/webProjects/FinanceManager/docs/product-requirements.md#L201) | Custom Category CRUD & Transaction Reassignment | Category organization with non-destructive deletion workflow ([BR-013](file:///home/blart/Documents/webProjects/FinanceManager/docs/business-rules.md#L73)). |
| **Must Have (P0)** | [FR-040](file:///home/blart/Documents/webProjects/FinanceManager/docs/product-requirements.md#L210)–[FR-043](file:///home/blart/Documents/webProjects/FinanceManager/docs/product-requirements.md#L231) | Category Monthly Budget Creation & Real-Time Monitoring | Primary budgeting value proposition for spending discipline ([BR-014](file:///home/blart/Documents/webProjects/FinanceManager/docs/business-rules.md#L81)). |
| **Must Have (P0)** | [FR-050](file:///home/blart/Documents/webProjects/FinanceManager/docs/product-requirements.md#L247)–[FR-054](file:///home/blart/Documents/webProjects/FinanceManager/docs/product-requirements.md#L275) | Savings Goal CRUD & Progress Contribution Recording | Target saving tracking and incremental progress logging ([BR-016](file:///home/blart/Documents/webProjects/FinanceManager/docs/business-rules.md#L88)). |
| **Should Have (P1)** | [FR-044](file:///home/blart/Documents/webProjects/FinanceManager/docs/product-requirements.md#L238) | Proactive Visual Warnings (80% & 100%+ Thresholds) | Early overspending prevention and visual feedback. |
| **Should Have (P1)** | [FR-028](file:///home/blart/Documents/webProjects/FinanceManager/docs/product-requirements.md#L157) | Dynamic Recalculations from Backdated Edits | Ensures historical integrity when backdating transactions ([BR-006](file:///home/blart/Documents/webProjects/FinanceManager/docs/business-rules.md#L32)). |
| **Should Have (P1)** | [FR-023](file:///home/blart/Documents/webProjects/FinanceManager/docs/product-requirements.md#L122), [FR-024](file:///home/blart/Documents/webProjects/FinanceManager/docs/product-requirements.md#L129) | Keyword/Merchant Search & Multi-Parameter Filter | Enhances usability for finding past transactions. |
| **Should Have (P1)** | [FR-062](file:///home/blart/Documents/webProjects/FinanceManager/docs/product-requirements.md#L305) | Global Preferred Currency Symbol Settings | Visual display customization without exchange rate complexity ([BR-018](file:///home/blart/Documents/webProjects/FinanceManager/docs/business-rules.md#L100)). |
| **Could Have (P2)** | [FR-015](file:///home/blart/Documents/webProjects/FinanceManager/docs/product-requirements.md#L92) | Spending Analytics Visualizations | Graphical insights enhancing financial understanding. |
| **Could Have (P2)** | [FR-055](file:///home/blart/Documents/webProjects/FinanceManager/docs/product-requirements.md#L282) | Savings Goal Achievement Status Badges | Motivation indicator when targets are reached. |
| **Could Have (P2)** | [FR-063](file:///home/blart/Documents/webProjects/FinanceManager/docs/product-requirements.md#L312) | Light / Dark Theme Switching | Aesthetic personalization preference. |
| **Could Have (P2)** | [FR-061](file:///home/blart/Documents/webProjects/FinanceManager/docs/product-requirements.md#L298) | Profile Picture Avatar Upload | Profile customization enhancement. |
| **Won't Have (v1.0)** | Scope Out | Bank Sync, OCR Receipt Scanning, AI Assistant, Mobile App, Push Marketing, FX Currency Rate Conversion | Out of scope for MVP v1.0 as specified in [scope.md](file:///home/blart/Documents/webProjects/FinanceManager/docs/scope.md). |

---

# 3. Development Phases & Project Milestones

Development is organized into 4 sequential phases, each ending in a major Project Milestone:

```mermaid
gantt
    title Personal Finance Manager v1.0 Development Timeline
    dateFormat  YYYY-MM-DD
    section Phase 1: Identity & Security
    Auth & Security Foundation      :active, p1, 2026-09-01, 14d
    Milestone 1: Alpha Release      :milestone, m1, 2026-09-15, 0d
    section Phase 2: Ledger & Categories
    Transactions & Categories Engine: p2, 2026-09-16, 21d
    Milestone 2: Beta Release       :milestone, m2, 2026-10-07, 0d
    section Phase 3: Budgets & Savings
    Budgeting & Savings Management  : p3, 2026-10-08, 21d
    Milestone 3: Release Candidate  :milestone, m3, 2026-10-29, 0d
    section Phase 4: Analytics & Launch
    Dashboard Analytics & UX Polish  : p4, 2026-10-30, 14d
    Milestone 4: Production MVP GA  :milestone, m4, 2026-11-13, 0d
```

### Phase 1: User Identity & Profile Security
* **Focus:** Secure authentication, account recovery, account deletion, and preferred currency display settings.
* **Requirements:** [FR-001](file:///home/blart/Documents/webProjects/FinanceManager/docs/product-requirements.md#L13)–[FR-006](file:///home/blart/Documents/webProjects/FinanceManager/docs/product-requirements.md#L48), [FR-060](file:///home/blart/Documents/webProjects/FinanceManager/docs/product-requirements.md#L291), [FR-062](file:///home/blart/Documents/webProjects/FinanceManager/docs/product-requirements.md#L305).
* **Milestone 1 (Alpha Release):** Core security framework validated; users can register, log in, reset password, update currency symbol preference, and purge account data.

### Phase 2: Financial Ledger & Category Engine
* **Focus:** Income/Expense transaction recording, merchant & date fields, pre-seeded default categories, custom category management with reassignment rules, search & filtering.
* **Requirements:** [FR-020](file:///home/blart/Documents/webProjects/FinanceManager/docs/product-requirements.md#L101)–[FR-027](file:///home/blart/Documents/webProjects/FinanceManager/docs/product-requirements.md#L150), [FR-030](file:///home/blart/Documents/webProjects/FinanceManager/docs/product-requirements.md#L166)–[FR-035](file:///home/blart/Documents/webProjects/FinanceManager/docs/product-requirements.md#L201).
* **Milestone 2 (Beta Release):** Functional ledger operational; users can categorize, search, filter, and backdate income and expense transactions.

### Phase 3: Budgeting, Savings & Recalculation Engine
* **Focus:** Category monthly budgets, 80%/100%+ visual warning indicators, savings goals & progress contributions, dynamic historical recalculation engine.
* **Requirements:** [FR-028](file:///home/blart/Documents/webProjects/FinanceManager/docs/product-requirements.md#L157), [FR-040](file:///home/blart/Documents/webProjects/FinanceManager/docs/product-requirements.md#L210)–[FR-044](file:///home/blart/Documents/webProjects/FinanceManager/docs/product-requirements.md#L238), [FR-050](file:///home/blart/Documents/webProjects/FinanceManager/docs/product-requirements.md#L247)–[FR-055](file:///home/blart/Documents/webProjects/FinanceManager/docs/product-requirements.md#L282).
* **Milestone 3 (Release Candidate):** Complete budgeting and savings logic operational; real-time recalculation verified against [BR-006](file:///home/blart/Documents/webProjects/FinanceManager/docs/business-rules.md#L32) and [BR-016](file:///home/blart/Documents/webProjects/FinanceManager/docs/business-rules.md#L88).

### Phase 4: Analytics Dashboard & Launch Readiness
* **Focus:** Net balance dashboard cards, spending analytics, calendar month summaries, dark mode theme toggle, end-to-end acceptance testing, deployment.
* **Requirements:** [FR-010](file:///home/blart/Documents/webProjects/FinanceManager/docs/product-requirements.md#L57)–[FR-015](file:///home/blart/Documents/webProjects/FinanceManager/docs/product-requirements.md#L92), [FR-061](file:///home/blart/Documents/webProjects/FinanceManager/docs/product-requirements.md#L298), [FR-063](file:///home/blart/Documents/webProjects/FinanceManager/docs/product-requirements.md#L312).
* **Milestone 4 (Production MVP Release GA):** Production launch sign-off; complete feature set delivered according to [mvp-definition.md](file:///home/blart/Documents/webProjects/FinanceManager/docs/mvp-definition.md).

---

# 4. Release Plan (Sprint Schedule)

The delivery is structured into 6 two-week iterations (Sprints):

| Sprint | Objective | Deliverables / Requirements Covered | Target Milestone |
| :--- | :--- | :--- | :--- |
| **Sprint 1** | Identity & Security Foundation | FR-001, FR-002, FR-003, FR-005, FR-060, FR-062 | Sprint 1 Review |
| **Sprint 2** | Password Recovery & Account Purge | FR-004, FR-006, UC-011, UC-014, BR-019 | **Milestone 1: Alpha** |
| **Sprint 3** | Core Ledger & Pre-seeded Categories | FR-020, FR-021, FR-022, FR-025, FR-027, FR-033, FR-034 | Sprint 3 Review |
| **Sprint 4** | Custom Categories, Search & Filtering | FR-023, FR-024, FR-030, FR-031, FR-032, FR-035, BR-013 | **Milestone 2: Beta** |
| **Sprint 5** | Category Budgeting & Savings Goals | FR-040, FR-041, FR-042, FR-043, FR-044, FR-050–FR-055 | Sprint 5 Review |
| **Sprint 6** | Dynamic Recalculation & Analytics Dashboard | FR-010–FR-015, FR-028, FR-061, FR-063, BR-006, BR-020 | **Milestone 4: MVP Launch** |

---

# 5. Product Risk Analysis Matrix

| Risk ID | Risk Description | Probability | Impact | Mitigation Strategy |
| :--- | :--- | :--- | :--- | :--- |
| **PR-01** | **Historical Recalculation Errors:** Backdated edits skew past monthly summaries or net balance totals. | Medium | High | Enforce mandatory dynamic recalculation triggers ([FR-028](file:///home/blart/Documents/webProjects/FinanceManager/docs/product-requirements.md#L157), [BR-006](file:///home/blart/Documents/webProjects/FinanceManager/docs/business-rules.md#L32)) with regression validation suites for net balance ([BR-020](file:///home/blart/Documents/webProjects/FinanceManager/docs/business-rules.md#L112)). |
| **PR-02** | **Category Deletion Data Loss:** Deleting a category orphaned user transactions. | Medium | High | Mandate user transaction reassignment modal before deletion can proceed ([FR-035](file:///home/blart/Documents/webProjects/FinanceManager/docs/product-requirements.md#L201), [BR-013](file:///home/blart/Documents/webProjects/FinanceManager/docs/business-rules.md#L73)). |
| **PR-03** | **Multi-Currency Expectation Misalignment:** Users expect live FX exchange rate conversions when selecting currency symbol. | High | Medium | Explicitly label settings as "Display Currency Symbol Preference" ([FR-062](file:///home/blart/Documents/webProjects/FinanceManager/docs/product-requirements.md#L305), [BR-018](file:///home/blart/Documents/webProjects/FinanceManager/docs/business-rules.md#L100)) and highlight FX conversion as Out of Scope. |
| **PR-04** | **Incomplete Account Purging:** Account deletion leaves residual transaction records. | Low | High | Enforce hard purge validation covering profile, transactions, budgets, categories, and goals ([FR-006](file:///home/blart/Documents/webProjects/FinanceManager/docs/product-requirements.md#L48), [BR-019](file:///home/blart/Documents/webProjects/FinanceManager/docs/business-rules.md#L106)). |
| **PR-05** | **Scope Creep from Out-of-Scope Requests:** Requests for bank sync or receipt scanning during development. | High | Medium | Strictly enforce boundary compliance against [scope.md](file:///home/blart/Documents/webProjects/FinanceManager/docs/scope.md) and deferred backlog placement. |

---

# 6. Definition of Done (DoD)

A User Story or Feature is considered **Done** and ready for production release when:

1. **Functional Acceptance:** All acceptance criteria specified in the Product Backlog ticket are met and verified against the relevant Use Case.
2. **Business Rule Compliance:** The feature strictly adheres to all applicable Business Rules ([BR-001](file:///home/blart/Documents/webProjects/FinanceManager/docs/business-rules.md#L3)–[BR-020](file:///home/blart/Documents/webProjects/FinanceManager/docs/business-rules.md#L112)).
3. **Cross-Device Responsiveness:** The UI functions correctly across Desktop, Tablet, and Mobile viewport standards without horizontal scrolling or visual breakage.
4. **Data Isolation & Security:** User data privacy is enforced so that authenticated users can only view or modify their own records ([BR-008](file:///home/blart/Documents/webProjects/FinanceManager/docs/business-rules.md#L45)).
5. **Quality Assurance:** Manual or automated scenario testing passes with zero open critical or high-severity defects.
6. **Documentation Traceability:** Product backlog tickets, user stories, and requirements links are fully traceable and updated.
