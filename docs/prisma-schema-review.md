# Prisma Schema Review & Traceability Report

## Application: Personal Finance Manager (v1.0 MVP)
**Role:** Database Architect & Senior Engineer  
**Status:** Verification & Schema Validation Report  
**Traceability:** [product-requirements.md](file:///home/blart/Documents/webProjects/FinanceManager/docs/product-requirements.md) | [business-rules-and-edge-cases.md](file:///home/blart/Documents/webProjects/FinanceManager/docs/business-rules-and-edge-cases.md) | [database-design.md](file:///home/blart/Documents/webProjects/FinanceManager/docs/database-design.md)

---

# 1. Executive Summary

This report validates that the logical database design in [database-design.md](file:///home/blart/Documents/webProjects/FinanceManager/docs/database-design.md) and the future Prisma ORM schema fully satisfy all approved functional requirements ([FR-001](file:///home/blart/Documents/webProjects/FinanceManager/docs/product-requirements.md#L13)–[FR-063](file:///home/blart/Documents/webProjects/FinanceManager/docs/product-requirements.md#L312)) and business rules ([BR-001](file:///home/blart/Documents/webProjects/FinanceManager/docs/business-rules.md#L3)–[BR-020](file:///home/blart/Documents/webProjects/FinanceManager/docs/business-rules.md#L112)).

---

# 2. Requirement-to-Model Traceability Matrix

| Requirement ID | Requirement Description | Prisma Model Target | Field / Constraint Mapping |
| :--- | :--- | :--- | :--- |
| **FR-001** | User Registration | `User` | `User.email`, `User.createdAt` |
| **FR-002** | User Login | `User`, `Session`, `Account` | Better Auth identity & session fields |
| **FR-003** | Secure Logout | `Session` | Session token invalidation |
| **FR-004** | Password Reset | `User`, `VerificationToken` | Reset token verification mapping |
| **FR-005** | Session Persistence | `Session` | `Session.expiresAt` cookie persistence |
| **FR-006** | Account Deletion | `User` + All Models | `onDelete: Cascade` across user relationships |
| **FR-010** | Net Account Balance | `Transaction` | Computed `SUM(Income) - SUM(Expense)` via `Decimal` amount |
| **FR-011** | Total Monthly Income | `Transaction` | Filtered `SUM(amount)` where `type = INCOME` |
| **FR-012** | Total Monthly Expense | `Transaction` | Filtered `SUM(amount)` where `type = EXPENSE` |
| **FR-013** | Monthly Financial Summary | `Transaction` | Query filtered by `transactionDate` calendar month range |
| **FR-014** | Recent Activity List | `Transaction` | Query ordered by `transactionDate DESC` |
| **FR-020** | Create Transaction | `Transaction` | `amount`, `type`, `categoryId`, `transactionDate`, `merchantName`, `notes` |
| **FR-021** | Edit Transaction | `Transaction` | Dynamic field update on `Transaction` |
| **FR-022** | Delete Transaction | `Transaction` | Permanent row deletion (`BR-011`) |
| **FR-023** | Search Transactions | `Transaction` | Filter on `merchantName`, `notes` |
| **FR-024** | Filter Transactions | `Transaction` | B-Tree indexed filters on `type`, `categoryId`, `transactionDate` |
| **FR-025** | Categorize Transaction | `Transaction`, `Category` | Foreign key `Transaction.categoryId ➔ Category.id` |
| **FR-027** | Date & Merchant Fields | `Transaction` | `transactionDate` (DateTime), `merchantName` (String) |
| **FR-028** | Historical Backdating Recalculation | `Transaction` | Indexed backdating triggering dynamic balance queries |
| **FR-030** | Create Custom Category | `Category` | `Category.userId = FK`, `isSystemDefault = false` |
| **FR-031** | Edit Custom Category | `Category` | Update `Category.name`, `Category.type` |
| **FR-032** | Delete Custom Category | `Category` | Restricted delete with transaction reassignment (`BR-013`) |
| **FR-033** | Pre-seeded Default Categories | `Category` | `Category.userId = NULL`, `isSystemDefault = true` |
| **FR-034** | Category Classification by Type | `Category` | Enum `Category.type` (`INCOME` / `EXPENSE`) |
| **FR-035** | Category Deletion Reassignment | `Transaction` | Bulk update `Transaction.categoryId` to target category ID |
| **FR-040** | Monthly Category Budget | `Budget` | `spendingLimit`, `year`, `month`, `categoryId` |
| **FR-043** | Budget Progress Monitoring | `Budget`, `Transaction` | Spending comparison `SUM(Transaction.amount)` vs `Budget.spendingLimit` |
| **FR-044** | Visual Warning Thresholds | Calculated View | Threshold logic evaluating 80% and 100%+ spending limits |
| **FR-050** | Create Savings Goal | `SavingsGoal` | `name`, `targetAmount`, `targetCompletionDate` |
| **FR-053** | Track Savings Goal Progress | `SavingsGoal` | Percentage calculation `(accumulatedBalance / targetAmount) * 100` |
| **FR-054** | Log Savings Contributions | `SavingsGoal` | Increment `accumulatedBalance += contribution` |
| **FR-055** | Savings Goal Completion Status | `SavingsGoal` | Enum `SavingsGoal.status` (`IN_PROGRESS` / `COMPLETED`) |
| **FR-060** | Update Profile Info | `Profile`, `User` | Update `Profile.displayName`, `User.email` |
| **FR-062** | Preferred Currency Symbol | `Profile` | `Profile.preferredCurrencySymbol` (String, default `"$"`)|
| **FR-063** | Light/Dark Theme Switch | `Profile` | `Profile.themePreference` (String, default `"dark"`) |

---

# 3. Business Rule Validation

```mermaid
graph TD
    BR1[BR-001: Unique Email] -->|Mapped To| C1[User.email @unique]
    BR8[BR-008: User Isolation] -->|Mapped To| C2[Mandatory userId FK on all models]
    BR13[BR-013: Category Reassignment] -->|Mapped To| C3[Transaction.categoryId FK + onDelete: Restrict]
    BR14[BR-014: Monthly Budget] -->|Mapped To| C4[Budget @unique(userId, categoryId, year, month)]
    BR17[BR-017: System Categories] -->|Mapped To| C5[Category.isSystemDefault Boolean]
    BR18[BR-018: Currency Symbol] -->|Mapped To| C6[Profile.preferredCurrencySymbol String]
    BR19[BR-019: Account Hard Purge] -->|Mapped To| C7[User ➔ All Models onDelete: Cascade]
    BR20[BR-020: Net Balance] -->|Mapped To| C8[Transaction.amount Decimal 12,2]
```

* **BR-001 (Unique Email):** Enforced via `@unique` on `User.email`.
* **BR-004 & BR-009 (Positive Amounts):** Validated at application boundary via Zod schema parsing.
* **BR-008 (User Isolation):** Enforced by mandatory `userId` relation fields across all user models.
* **BR-012 (UTC Normalization):** All timestamp fields mapped to Prisma `DateTime` (native PostgreSQL `TIMESTAMPTZ`).
* **BR-013 (Category Reassignment):** Foreign key constraint on `Transaction.categoryId` prevents cascading deletes (`onDelete: Restrict`).
* **BR-014 (Monthly Budget Uniqueness):** Enforced via composite unique key `@@unique([userId, categoryId, year, month])` on `Budget`.
* **BR-018 (Currency Symbol):** Stored as visual prefix string in `Profile.preferredCurrencySymbol`.
* **BR-019 (Account Hard Purge):** Enforced via `onDelete: Cascade` on all user-dependent relations.
* **BR-020 (Cumulative Net Balance):** Supported by using exact `Decimal` precision for `Transaction.amount`.

---

# 4. Relationship & Integrity Verification

* **User ➔ Profile:** 1:1 bidirectional relation (`User.profile` / `Profile.user`). Verified.
* **User ➔ Transaction:** 1:N relation (`User.transactions` / `Transaction.user`). Verified.
* **Category ➔ Transaction:** 1:N relation (`Category.transactions` / `Transaction.category`). Verified.
* **Category ➔ Budget:** 1:N relation (`Category.budgets` / `Budget.category`). Verified.
* **User ➔ Budget:** 1:N relation (`User.budgets` / `Budget.user`). Verified.
* **User ➔ SavingsGoal:** 1:N relation (`User.savingsGoals` / `SavingsGoal.user`). Verified.
* **Missing Entities / Relationships Check:** All 7 domain entities identified in [domain-analysis.md](file:///home/blart/Documents/webProjects/FinanceManager/docs/domain-analysis.md) and Better Auth session models are completely represented. Zero missing entities or orphaned relationships.

---

# 5. Future Migration & Scalability Assessment

* **Prisma Schema Migration Safety:** Schema changes use standard `prisma migrate dev` migrations with full SQL change history.
* **Database Branching Compatibility:** Compatible with **Neon PostgreSQL** serverless branching for zero-downtime schema updates and isolated preview environments.
* **Scalability:** Composite indexes on `Transaction(userId, transactionDate)` and `Transaction(userId, categoryId, transactionDate)` prevent full table scans as ledger records grow.

---

# 6. Pre-Implementation Recommendations

1. **Pre-seed Default System Categories Migration:** Create a dedicated database seeding script (`prisma/seed.ts`) to automatically populate standard system default categories (`isSystemDefault = true`, `userId = null`) for Income and Expense types upon initial database deployment ([BR-017](file:///home/blart/Documents/webProjects/FinanceManager/docs/business-rules.md#L94)).
2. **Include "Uncategorized" System Category:** Ensure the seeding script includes a default `"Uncategorized"` category to support category reassignment workflows ([BR-013](file:///home/blart/Documents/webProjects/FinanceManager/docs/business-rules.md#L73)).
3. **Enforce Zod Schema Boundary Validation:** Pair Prisma `Decimal` fields with Zod `z.number().positive()` parsing at Server Action input boundaries to guarantee data sanitization before persistence.
