---
name: web-accessibility-a11y
description: WCAG 2.1 AA accessibility guidelines, keyboard navigation, focus trapping, screen-reader compatibility, ARIA semantics, color contrast, and dual-coding standards for the Personal Finance Manager. Use when auditing accessibility, ensuring keyboard support, adding ARIA labels, or checking contrast compliance.
---

# Web Accessibility (a11y) Skill

**Application:** Personal Finance Manager  
**Role:** Web Accessibility (a11y) Engineer & WCAG Specialist  
**Source of Truth:** [`docs/ui-ux-specification.md`](file:///home/blart/Documents/webProjects/FinanceManager/docs/ui-ux-specification.md), [`docs/design-system.md`](file:///home/blart/Documents/webProjects/FinanceManager/docs/design-system.md), [`docs/screen-and-flow-specification.md`](file:///home/blart/Documents/webProjects/FinanceManager/docs/screen-and-flow-specification.md)

---

## 1. Scope & Backend Freeze Rule

> [!IMPORTANT]
> **CRITICAL PROJECT RULE — FRONTEND ONLY (BACKEND FROZEN)**  
> This skill governs frontend accessibility standards, semantic DOM structure, keyboard interaction, ARIA attributes, and visual contrast. It is strictly prohibited to modify:
> - Database & Prisma (`prisma/`, `schema.prisma`, migrations, seeds)
> - Better Auth configuration & auth logic (`lib/auth*`)
> - API contracts, endpoints, and Route Handlers (`app/api/`)
> - Server Actions (`modules/*/actions/`)
> - Business logic & financial calculation engines (`modules/*/domain/`)
> - Backend architecture
> 
> All accessibility enhancements must be implemented exclusively within presentation components and JSX markup.

---

## 2. WCAG 2.1 AA Core Standards

All user interfaces in Personal Finance Manager must achieve **WCAG 2.1 Level AA** compliance. Financial data clarity requires special care so that numbers, warnings, and states are clear to all users regardless of assistive technology or visual capabilities.

---

## 3. Semantic HTML & DOM Hierarchy

1. **Semantic Landmarks:** Structure every page using semantic tags:
   - `<header>`: Utility header bar containing search, theme toggle, and profile.
   - `<nav aria-label="Main Navigation">`: Sidebar (desktop) and bottom bar (mobile).
   - `<main id="main-content">`: Main content container.
   - `<section aria-labelledby="section-title">`: Financial feature modules (e.g. Recent Transactions, Budget Overview).
2. **Heading Hierarchy:** Strictly one `<h1>` per view, followed logically by `<h2>` for section cards and `<h3>` for nested sub-cards. Never skip heading levels.
3. **Buttons vs. Links:** Use `<button>` for actions/mutations (e.g., Add, Delete, Save, Toggle). Use `<a>` / `<Link>` strictly for navigation to distinct URLs.

---

## 4. Color Contrast & Dual-Coding Rules

### 4.1 Contrast Ratios
- **Body Text:** Minimum **4.5:1** contrast ratio against its background in both Dark (`#090D16`) and Light (`#F8FAFC`) modes.
- **Large Text ($\ge$ 18pt or 14pt bold):** Minimum **3:1** contrast ratio.
- **UI Components & Icons:** Minimum **3:1** contrast ratio against adjacent backgrounds.

### 4.2 Dual-Coding (Never Rely on Color Alone)
Color alone must **never** be the sole conveyor of financial information or system state:
- **Income Transactions:** Green text (`text-emerald-500`) **AND** upward arrow icon (`ArrowUpRight`) **AND** explicit positive sign (`+$500.00`) **AND** `aria-label="Income: $500.00"`.
- **Expense Transactions:** Rose text (`text-rose-500`) **AND** downward arrow icon (`ArrowDownLeft`) **AND** explicit negative sign (`-$85.00`) **AND** `aria-label="Expense: $85.00"`.
- **Budget Warnings:**
  - 80%–99%: Amber color **AND** `AlertTriangle` icon **AND** visible badge `"Approaching Limit (85%)"`.
  - 100%+: Red color **AND** `AlertOctagon` icon **AND** visible badge `"Budget Exceeded (115%)"`.

---

## 5. Keyboard Navigation & Focus Management

1. **Full Keyboard Operability:** Every interactive element must be reachable and operable via `Tab`, `Shift+Tab`, `Enter`, and `Space`.
2. **Focus-Visible Indicators:** Never suppress focus outlines without providing high-contrast replacements:
   - Standard: `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-950`.
3. **Focus Trapping & Escape Key (Modals & Drawers):**
   - Radix UI and Vaul primitives must trap focus within the active dialog when open.
   - Pressing `Escape` must dismiss the dialog and return focus to the triggering element.
4. **Skip Navigation Link:** Include a `"Skip to main content"` link at the top of the root layout for keyboard users:
   - `<a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 ...">Skip to content</a>`.

---

## 6. ARIA, Forms & Screen Reader Parity

### 6.1 Icon-Only Buttons
All icon-only action triggers (e.g. Edit, Delete, Close, Theme Toggle, FAB) **must** include an accessible name via `aria-label` or visually hidden screen reader text:
```tsx
<button
  aria-label="Delete transaction 'Groceries $85.00'"
  className="..."
>
  <Trash2 className="h-4 w-4" aria-hidden="true" />
  <span className="sr-only">Delete transaction</span>
</button>
```

### 6.2 Dialog Semantics
Every modal dialog must include:
- `DialogTitle` (announced to screen readers upon open).
- `DialogDescription` (explains modal purpose, e.g. for destructive reassignment).

### 6.3 Form Accessibility & Error Association
1. **Explicit Labeling:** Every form input must have an associated `<label htmlFor="field-id">` or `aria-labelledby`.
2. **Error Linkage:** Connect inline validation errors to inputs via `aria-invalid={!!error}` and `aria-describedby="field-error-id"`.
3. **Required Fields:** Mark required inputs with `aria-required="true"`.

### 6.4 Screen Reader Live Regions
- Use `aria-live="polite"` for asynchronous dynamic updates (e.g. balance recalculations, budget status changes, toast announcements):
```tsx
<div aria-live="polite" aria-atomic="true" className="sr-only">
  {statusAnnouncement}
</div>
```

---

## 7. Accessible Data Tables & Visualizations

### 7.1 Financial Data Tables
- Use `<th>` elements with `scope="col"` for all table header columns.
- Numeric columns should specify `className="text-right tabular-nums"`.
- Table container should include a descriptive `aria-label="Transaction Ledger"`.

### 7.2 Chart Accessibility (Recharts)
- Charts must provide accessible descriptions: `<figure role="region" aria-label="Category Spending Breakdown Chart">`.
- Provide an accessible text/table fallback summary alongside or within the chart container for screen reader users.

---

## 8. Touch Targets & Reduced Motion

1. **Touch Target Size:** Interactive targets on touch screens must meet minimum **44 × 44 px** bounds.
2. **Reduced Motion (`prefers-reduced-motion`):**
   - Respect user OS motion preferences by applying `motion-reduce:transition-none motion-reduce:animate-none`.
   - Disable non-essential background animations and shimmer pulses when reduced motion is preferred.

---

## 9. Skill Pipeline & Interaction

When executing UI enhancements, follow this strict pipeline order:
```
1. modern-frontend-design  --> Defines tokens, typography, colors, component styles
2. ui-ux-design-patterns   --> Organizes interaction flows, 5-state handling, form ergonomics
3. responsive-web-design   --> Implements adaptive viewports (375px to 1440px+), mobile navigation
4. web-accessibility-a11y  --> Guarantees WCAG 2.1 AA, keyboard focus, ARIA, and contrast
5. Browser / E2E Verification --> Verifies visual correctness without modifying backend code
```

---

## 10. Verification Criteria

Before declaring an accessibility audit/task complete, verify:
- [ ] Text contrast meets minimum 4.5:1 ratio (3:1 for large text/badges).
- [ ] Dual-coding is enforced for all income, expense, and budget warning states.
- [ ] Icon-only buttons possess descriptive `aria-label` attributes.
- [ ] Form inputs are linked to error messages via `aria-describedby`.
- [ ] Modals trap focus and close gracefully with the `Escape` key.
- [ ] Entire interface is navigable using only the keyboard (`Tab` / `Enter` / `Space`).
- [ ] Touch targets measure at least 44×44px on mobile devices.
- [ ] Zero changes made to backend files, Prisma, database, or API contracts.
