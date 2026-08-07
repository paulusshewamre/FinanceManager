# Engineering Standards & Development Handbook

## Application: Personal Finance Manager (v1.0 MVP)
**Role:** Principal Software Architect  
**Status:** Mandatory Engineering Guidelines  
**Traceability:** [system-architecture.md](file:///home/blart/Documents/webProjects/FinanceManager/docs/system-architecture.md) | [technology-decisions.md](file:///home/blart/Documents/webProjects/FinanceManager/docs/technology-decisions.md)

---

# 1. Core Engineering & Architecture Principles

All code written for this project must adhere to four foundational software engineering principles:

### 1.1 SOLID Principles
* **Single Responsibility Principle (SRP):** Every component, Server Action, and domain utility function must have exactly one reason to change. Presentation components only display UI; domain engines only calculate math; repositories only fetch data.
* **Open/Closed Principle (OCP):** Modules must be open for extension but closed for modification. New features (e.g. new chart types or category rules) should be added via extension rather than editing core logic.
* **Liskov Substitution Principle (LSP):** Abstractions and interfaces must be replaceable with subtype implementations without altering application correctness.
* **Interface Segregation Principle (ISP):** Components should depend on minimal, specific interfaces rather than large monolithic prop objects.
* **Dependency Inversion Principle (DIP):** High-level domain logic must depend on abstractions, not low-level database or ORM implementation details.

### 1.2 Pragmatic Clean Architecture
* **Strict Layering:** Dependencies flow strictly inwards: `UI Layer ➔ Application Layer ➔ Domain Core Layer  Infrastructure Layer`.
* **Framework Agnostic Domain:** Business calculations (Net Balance, Budget Warnings, Savings Goal Progress) must remain pure TypeScript functions with zero dependencies on React, Next.js, or Prisma.

### 1.3 DRY (Don't Repeat Yourself) & KISS (Keep It Simple, Stupid)
* **Avoid Duplication:** Centralize shared Zod validation schemas, formatters, and domain rules in dedicated utility modules.
* **Avoid Overengineering:** Favor explicit, readable TypeScript code over complex generic abstractions or unneeded design patterns.

---

# 2. Naming Conventions

Consistency across naming enables instant code comprehension for human developers and AI coding agents:

| Asset Type | Convention | Example |
| :--- | :--- | :--- |
| **Directory / Folders** | Kebab-case | `modules/savings-goals/`, `components/forms/` |
| **React Components** | PascalCase | `TransactionList.tsx`, `BudgetCard.tsx` |
| **Utilities & Hooks** | camelCase | `useTransactionFilter.ts`, `formatCurrency.ts` |
| **Server Actions** | Verb + Noun (camelCase) | `createTransactionAction()`, `deleteAccountAction()` |
| **TypeScript Types/Interfaces** | PascalCase | `TransactionRecord`, `BudgetWarningState` |
| **Zod Schemas** | PascalCase + `Schema` | `CreateTransactionSchema`, `BudgetFormSchema` |
| **Constants / Enums** | UPPER_SNAKE_CASE | `DEFAULT_CURRENCY_SYMBOL`, `BUDGET_WARN_THRESHOLD` |
| **Environment Variables** | UPPER_SNAKE_CASE | `DATABASE_URL`, `BETTER_AUTH_SECRET` |

---

# 3. Directory & Component Organization Rules

### 3.1 Directory Organization Rules
* **App Router Directory (`app/`):** Contains strictly Next.js routing files (`page.tsx`, `layout.tsx`, `loading.tsx`, `error.tsx`). Pages act as lightweight wrappers passing server-fetched data into module views.
* **Modules Directory (`modules/`):** Houses feature domain logic organized by business domain (`auth`, `transactions`, `categories`, `budgets`, `savings-goals`, `dashboard`). Each module directory contains:
  * `domain/` — Pure TypeScript business rules and formulas.
  * `actions/` — Next.js Server Actions for input validation and mutations.
  * `components/` — Feature-specific presentation components.
* **Component Library (`components/ui/`):** Contains primitive Stitch UI / shadcn / Radix components (Buttons, Modals, Inputs, Cards).

### 3.2 Component Design Rules
* **Purity:** Keep presentation components pure. Pass data down via typed props.
* **Size Limit:** No single component file should exceed 200 lines of code. Split complex UI views into sub-components.

---

# 4. TypeScript Conventions

* **Strict Mode:** `tsconfig.json` must enforce `strict: true` with zero tolerance for `any` types.
* **Type Assertions:** Avoid type assertions (`as Type`); favor type guards and Zod schema parsing.
* **Explicit Function Return Types:** All exported domain functions and Server Actions must explicitly define return types.

```typescript
// Good Practice Example
export function calculateNetBalance(
  incomeTotal: Decimal,
  expenseTotal: Decimal
): Decimal {
  return incomeTotal.minus(expenseTotal);
}
```

---

# 5. Boundary Validation & Error Handling Standards

### 5.1 Input Boundary Validation
* All data entering the application via forms or API requests **must be validated using Zod schemas** before reaching domain logic.
* Business rules must be encoded directly in schemas (e.g. Transaction Amount > 0 [BR-004](file:///home/blart/Documents/webProjects/FinanceManager/docs/business-rules.md#L17)).

```typescript
// Shared Schema Standard
export const TransactionInputSchema = z.object({
  amount: z.number().positive("Transaction amount must be greater than zero."),
  type: z.enum(["Income", "Expense"]),
  categoryId: z.string().min(1, "Category selection is required."),
  transactionDate: z.date(),
  merchantName: z.string().optional(),
  notes: z.string().optional(),
});
```

### 5.2 Error Handling Standards
* **Server Action Responses:** Server Actions must return structured result objects `{ success: boolean, data?: T, error?: string }` instead of throwing unhandled exceptions to the client.
* **User Feedback:** Display user-friendly inline field error messages for validation failures.
* **Logging:** Log unhandled operational errors on the server side with structured context; never leak raw database stack traces to client components.

---

# 6. Documentation Standards

* **Self-Documenting Code:** Write clear variable and function names that express intent without requiring trivial comments.
* **JSDoc Comments:** Document non-obvious domain formulas, complex algorithms, or business rules directly above function headers.
* **Markdown References:** When adding or updating code implementing a documented requirement, reference the specific requirement ID (e.g., `// Implements FR-044 & BR-007`).

---

# 7. Git Workflow & Version Control

### 7.1 Branching Strategy
```
main (Production Release)
  ├── feature/auth-password-reset
  ├── feature/transaction-backdating
  └── fix/category-reassignment-modal
```
* `main`: Represents production-ready code aligned with current release milestones.
* `feature/*`: Short-lived feature branches created per Product Backlog ticket (e.g., `feature/PB-101-registration`).
* `fix/*`: Bug fix branches addressing identified defects.

### 7.2 Semantic Commit Message Guidelines
Commits must follow conventional commit formatting:
* `feat(transactions): add transaction date backdating support (FR-027)`
* `fix(categories): enforce transaction reassignment on category deletion (BR-013)`
* `docs(readme): update setup instructions`
* `test(budgets): add unit test for 80% warning threshold (FR-044)`
* `refactor(dashboard): optimize net balance calculation query`

---

# 8. AI Collaboration Guidelines (Stitch, Antigravity CLI & Gemini)

To maximize velocity when coding with AI agents:

1. **Stitch UI Component Imports:**
   * Import Stitch UI components into `components/ui/` or feature component folders.
   * Adapt component props to accept domain models defined in TypeScript without modifying visual styling primitives.
2. **Antigravity CLI Prompt Execution:**
   * Execute task prompts incrementally by targeting isolated feature modules (e.g., "Implement PB-203 custom category deletion in `modules/categories`").
   * Require Antigravity CLI to run unit tests (`npm run test`) after completing each code edit.
3. **Gemini Code Review Gates:**
   * Pass generated pull requests through Gemini code review against this `development-standards.md` specification.

---

# 9. Pull Request & Code Review Checklist

Before merging any Pull Request into `main`, verify:

- [ ] **Functional Correctness:** All acceptance criteria in the Product Backlog ticket are satisfied.
- [ ] **Traceability:** Requirement IDs (`FR-*`) and Business Rules (`BR-*`) are explicitly referenced.
- [ ] **Type Safety:** Zero `any` types; TypeScript builds cleanly without warnings (`npm run build`).
- [ ] **Validation Enforced:** Zod schema validation protects input boundaries.
- [ ] **Domain Isolation:** Business logic functions are pure and uncoupled from UI/DB frameworks.
- [ ] **Multi-Tenant Security:** Queries enforce `userId` filtering ([BR-008](file:///home/blart/Documents/webProjects/FinanceManager/docs/business-rules.md#L45)).
- [ ] **Testing Passed:** Unit and integration tests pass with zero errors (`npm run test`).
- [ ] **Design Aesthetics:** Visual views match Stitch UI design outputs with responsive dark/light mode support.
