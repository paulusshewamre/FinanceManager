---
name: ui-ux-design-patterns
description: Interaction patterns, user flows, form usability, 5-state UI models, dialog/drawer conventions, and destructive action safeguards for the Personal Finance Manager. Use when designing workflows, transaction forms, modal interactions, search/filtering, feedback systems, or reducing user friction.
---

# UI/UX Design Patterns Skill

**Application:** Personal Finance Manager  
**Role:** Senior UX Architect & Interaction Designer  
**Source of Truth:** [`docs/ui-ux-specification.md`](file:///home/blart/Documents/webProjects/FinanceManager/docs/ui-ux-specification.md), [`docs/screen-and-flow-specification.md`](file:///home/blart/Documents/webProjects/FinanceManager/docs/screen-and-flow-specification.md), [`docs/business-rules.md`](file:///home/blart/Documents/webProjects/FinanceManager/docs/business-rules.md)

---

## 1. Scope & Backend Freeze Rule

> [!IMPORTANT]
> **CRITICAL PROJECT RULE — FRONTEND ONLY (BACKEND FROZEN)**  
> This skill governs user experience flow, frontend interaction models, form validations, and presentation-layer safeguards. It is strictly prohibited to modify:
> - Database & Prisma (`prisma/`, `schema.prisma`, migrations, seeds)
> - Better Auth configuration & auth logic (`lib/auth*`)
> - API contracts, endpoints, and Route Handlers (`app/api/`)
> - Server Actions (`modules/*/actions/`)
> - Business logic & financial calculation engines (`modules/*/domain/`)
> - Backend architecture
> 
> All UI/UX interaction patterns must integrate cleanly with existing Server Action signatures and client-side schemas.

---

## 2. Core UX Goals & Information Hierarchy

1. **3-Second Glance Test ([FR-010](file:///home/blart/Documents/webProjects/FinanceManager/docs/product-requirements.md#L57)):** Enable users to instantly comprehend total net balance, monthly cashflow (Income vs Expense), and urgent budget warnings upon loading the Dashboard Hub.
2. **10-Second Transaction Logging:** Enable recording a transaction from anywhere in the app in under 10 seconds via persistent Header CTA or Mobile Floating Action Button (FAB).
3. **Proactive Financial Alerts ([FR-044](file:///home/blart/Documents/webProjects/FinanceManager/docs/product-requirements.md#L238)):** Provide unambiguous visual warnings (Amber at 80%–99%, Crimson at 100%+) before overspending occurs.
4. **Data Loss Safeguards:** Multi-tier confirmation models for destructive actions (category reassignment [BR-013](file:///home/blart/Documents/webProjects/FinanceManager/docs/business-rules.md#L73) and permanent account purge [BR-019](file:///home/blart/Documents/webProjects/FinanceManager/docs/business-rules.md#L106)).

---

## 3. The 5 Essential UI States Architecture

Every data-driven view and container must explicitly implement the 5-state model:

```
1. Loading State       --> Component-matched Skeletons & Shimmers (No Layout Shift)
2. Ideal / Success     --> Full interactive data display (Cards, Tables, Charts)
3. Empty State         --> Contextual icon + friendly explanation + primary CTA
4. Filtered Empty      --> Search/filter miss notice + "Clear Filters" CTA
5. Error State         --> Inline field validation / Toast banners with Retry
```

### 3.1 Empty States Guidelines
- **Dashboard (New User):** Show `$0.00` balance with prompt: *"No financial activity logged yet. Add your first transaction to get started."* with `+ Add Transaction` button ([EC-001](file:///home/blart/Documents/webProjects/FinanceManager/docs/business-rules-and-edge-cases.md#L116)).
- **Transactions Table (Filtered):** Show *"No transactions match your filter criteria."* with a button to `Reset Filters`.
- **Budgets / Goals:** Show empty state card with guidance on setting the first spending limit or savings target.

---

## 4. Key Interaction Patterns & Workflows

### 4.1 Transaction Entry & Editing Flow
- **Trigger:** Global `+ Add Transaction` button in desktop header or mobile FAB.
- **Type Toggle:** `Expense` (default) vs. `Income` toggle tabs at the top of the form.
- **Dynamic Category Filtering:** Category dropdown dynamically filters to list only categories matching the active transaction type ([FR-034](file:///home/blart/Documents/webProjects/FinanceManager/docs/product-requirements.md#L194)).
- **Date Handling:** Prefills with current UTC date. Supports calendar picker for historical backdating ([FR-027](file:///home/blart/Documents/webProjects/FinanceManager/docs/product-requirements.md#L150)).
- **Backdating Feedback:** When saving a historical entry, render subtle toast: *"Historical transaction saved. Historical summary updated."* ([BR-006](file:///home/blart/Documents/webProjects/FinanceManager/docs/business-rules.md#L32)).

### 4.2 Form Usability & Monetary Input Ergonomics
- **Positive Amount Enforcement:** Input accepts only positive numbers; immediately displays helper text *"Amount must be greater than zero"* on non-positive values ([BR-004](file:///home/blart/Documents/webProjects/FinanceManager/docs/business-rules.md#L21)).
- **Auto 2-Decimal Formatting:** On `blur`, auto-format inputs (e.g. `45` $\rightarrow$ `45.00`).
- **Validation Timing:** Client-side Zod validation runs `onBlur` and `onSubmit`. Errors clear dynamically as valid input is entered.
- **Submission Safeguard:** Submit buttons show a loading spinner and are disabled while mutations are in-flight to prevent duplicate submissions.

### 4.3 Search & Multi-Parameter Filtering
- **Search Input:** Debounced text input searching merchant/payee and notes fields ([FR-023](file:///home/blart/Documents/webProjects/FinanceManager/docs/product-requirements.md#L122)).
- **Filter Controls:** Type filter (`All`, `Income`, `Expense`), Category selector, and Date range selector ([FR-024](file:///home/blart/Documents/webProjects/FinanceManager/docs/product-requirements.md#L129)).
- **Active Filter Badges:** Show dismissible pills for active filters and a one-click `Clear All Filters` action.

### 4.4 Modals vs. Drawers Ergonomics
- **Desktop ($\ge$ 768px):** Centered Radix UI Dialogs with focus trap and backdrop overlay.
- **Mobile (< 768px):** Smooth Vaul slide-up bottom sheets / drawers anchored to the viewport bottom for thumb-friendly interaction.

---

## 5. Destructive Action Hierarchy

| Action Level | Example | UI Pattern & Safeguard |
| :--- | :--- | :--- |
| **Low / Standard** | Single Transaction / Budget Delete | Lightweight confirmation modal: *"Are you sure you want to delete expense 'Groceries $85.00'?"* with `Cancel` and `Delete` buttons ([BR-011](file:///home/blart/Documents/webProjects/FinanceManager/docs/business-rules.md#L65)). |
| **Medium (Cascading)** | Custom Category Deletion | **Mandatory Reassignment Modal:** If category has active transactions, block direct deletion. Require selecting a replacement category (defaulting to `"Uncategorized"`) before enabling the `Reassign & Delete` action ([BR-013](file:///home/blart/Documents/webProjects/FinanceManager/docs/business-rules.md#L73)). |
| **High (Irreversible)** | Permanent Account Purge | **High-Friction Purge Modal:** Displays danger warnings, requires entering account password AND typing `"DELETE MY ACCOUNT"` into an input before enabling the destructive red button ([BR-019](file:///home/blart/Documents/webProjects/FinanceManager/docs/business-rules.md#L106)). |

---

## 6. Feedback & Notification Conventions

1. **Optimistic Updates:** Immediate UI updates for fast local interactions (e.g. toggles, filter chips, local state).
2. **Toast Notifications:** Dispatched via `@radix-ui/react-toast` or equivalent for completed Server Actions:
   - Success: *"Transaction added successfully."*
   - Warning: *"Budget limit reached (100%)."*
   - Error: *"Failed to save transaction. Please check your connection and try again."*
3. **Inline Field Errors:** Rendered directly below the relevant input field with high-contrast text and error icon.

---

## 7. Skill Pipeline & Interaction

When executing UI enhancements, follow this strict pipeline order:
```
1. modern-frontend-design  --> Defines tokens, typography, colors, component styles
2. ui-ux-design-patterns   --> Organizes interaction flows, 5-state handling, form ergonomics
3. responsive-web-design   --> Implements adaptive viewports (375px to 1440px+), mobile navigation
4. web-accessibility-a11y  --> Guarantees WCAG 2.1 AA, keyboard focus, ARIA, and contrast
5. Browser / E2E Verification --> Verifies visual correctness without modifying backend code
```

---

## 8. Verification Criteria

Before declaring a UI/UX interaction task complete, verify:
- [ ] Primary dashboard figures satisfy the 3-second glance test.
- [ ] Transaction creation flow is intuitive and accessible within 10 seconds.
- [ ] All 5 UI states (Loading, Ideal, Empty, Filtered, Error) are handled on every view.
- [ ] Category deletion properly triggers the mandatory reassignment workflow when active transactions exist.
- [ ] Destructive actions use the appropriate safety and friction levels.
- [ ] In-flight form submissions disable duplicate clicks with visual spinners.
- [ ] Zero backend code, database schemas, or business calculations were modified.
