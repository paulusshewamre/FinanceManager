# Design System Specification & Token Architecture

**Application:** Personal Finance Manager (v1.0 MVP)  
**Role:** Senior Product Designer & UX Architect  
**Status:** Visual Design System Specification (Stitch & shadcn/ui Compatible)  
**Traceability:** Compatible with approved stack ([ADR-002](file:///home/blart/Documents/webProjects/FinanceManager/docs/technology-decisions.md#L31)): Next.js, React, Tailwind CSS, shadcn/ui, Radix UI, Lucide React, and Stitch UI generation.

---

## 1. Visual Direction & Brand Personality

The visual identity of Personal Finance Manager balances **professional financial clarity** with **modern digital aesthetics**. It adopts a clean, glassmorphic dark-mode baseline with crisp typography, subtle elevated borders, and highly functional color accents.

### Brand Personality Attributes
* **Trustworthy & Precise:** Clear numerical alignment, high-contrast text, tabular financial figures.
* **Modern & Refined:** Dark slate backgrounds, subtle card gradients, smooth transitions.
* **Empowering & Proactive:** Energetic status highlights, intuitive warning banners, unambiguous financial status badges.

---

## 2. Color System & Semantic Token Architecture

The color system uses Tailwind CSS CSS variable tokens supporting automatic Dark and Light theme modes ([FR-063](file:///home/blart/Documents/webProjects/FinanceManager/docs/product-requirements.md#L312)).

```
Semantic Color Mapping:
┌─────────────────────────┬──────────────────────────┬──────────────────────────┐
│ Token Purpose           │ Dark Theme Baseline      │ Light Theme Baseline     │
├─────────────────────────┼──────────────────────────┼──────────────────────────┤
│ App Background          │ Slate 950 (#090D16)      │ Slate 50 (#F8FAFC)       │
│ Surface / Card          │ Slate 900/80 (#0F172A)   │ Slate 0 (#FFFFFF)        │
│ Elevated Border         │ Slate 800 (#1E293B)      │ Slate 200 (#E2E8F0)      │
│ Primary Text            │ Slate 50 (#F8FAFC)       │ Slate 900 (#0F172A)      │
│ Muted Text              │ Slate 400 (#94A3B8)      │ Slate 500 (#64748B)      │
│ Income / Credit Accent  │ Emerald 500 (#10B981)    │ Emerald 600 (#059669)    │
│ Expense / Debit Accent  │ Rose 500 (#F43F5E)       │ Rose 600 (#E11D48)       │
│ Net Balance Positive    │ Emerald 500 (#10B981)    │ Emerald 600 (#059669)    │
│ Net Balance Negative    │ Rose 500 (#F43F5E)       │ Rose 600 (#E11D48)       │
│ Budget Warning (80%+)   │ Amber 500 (#F59E0B)      │ Amber 600 (#D97706)      │
│ Budget Alert (100%+)    │ Red 600 (#DC2626)        │ Red 600 (#DC2626)        │
└─────────────────────────┴──────────────────────────┴──────────────────────────┘
```

---

## 3. Typography System

Powered by **Inter** / **Geist Sans** paired with **Geist Mono** for monetary data alignment.

```css
/* Typography Scale Tokens */
.text-display  { font-size: 2.25rem; line-height: 2.5rem; font-weight: 700; letter-spacing: -0.025em; } /* Net Balance Card */
.text-h1       { font-size: 1.875rem; line-height: 2.25rem; font-weight: 700; } /* Page Headers */
.text-h2       { font-size: 1.5rem; line-height: 2rem; font-weight: 600; } /* Section Titles */
.text-h3       { font-size: 1.25rem; line-height: 1.75rem; font-weight: 600; } /* Card Titles */
.text-body     { font-size: 0.875rem; line-height: 1.25rem; font-weight: 400; } /* General Body Text */
.text-subtle   { font-size: 0.75rem; line-height: 1rem; font-weight: 400; } /* Captions & Metadata */
.text-currency { font-family: ui-monospace, monospace; font-variant-numeric: tabular-nums; } /* Financial Amounts */
```

---

## 4. Spacing, Radius & Elevation System

### 4.1 Spacing Scale (Tailwind Baseline)
* `p-1` (4px), `p-2` (8px), `p-3` (12px), `p-4` (16px), `p-6` (24px), `p-8` (32px).
* Form gap spacing standard: `space-y-4` (16px between field groups).

### 4.2 Border Radius Scale
* Small (Badges, Buttons): `rounded-md` (6px).
* Medium (Inputs, Cards): `rounded-lg` (8px).
* Large (Modals, Glass Panels): `rounded-xl` (12px).
* Pill (Status Badges, FAB): `rounded-full` (9999px).

### 4.3 Elevation & Shadows
* `shadow-sm`: Interactive cards and table rows.
* `shadow-md`: Dropdown menus and popovers.
* `shadow-xl`: Modal dialogs and floating action buttons.

---

## 5. Iconography System

Powered by **Lucide React** icons ([ADR-002](file:///home/blart/Documents/webProjects/FinanceManager/docs/technology-decisions.md#L31)). Icon usage is standardized across feature modules:

* **Dashboard & Metrics:** `LayoutDashboard`, `TrendingUp` (Income), `TrendingDown` (Expense), `Wallet` (Balance), `Calendar`.
* **Transactions:** `ArrowUpRight` (Income entry), `ArrowDownLeft` (Expense entry), `Search`, `Filter`, `Plus`, `Pencil`, `Trash2`.
* **Categories:** `Tag`, `FolderPlus`, `FolderSync` (Reassignment), `Lock` (System Default Badge).
* **Budgets:** `PieChart`, `AlertTriangle` (80% Warning), `AlertOctagon` (100%+ Overrun Alert), `CheckCircle2`.
* **Savings:** `PiggyBank`, `Target`, `Award` (Completion Badge).
* **Settings & Navigation:** `Settings`, `User`, `Sun`, `Moon`, `LogOut`, `ShieldAlert` (Hard Purge).

---

## 6. Layout Grid & Responsive Breakpoints

Using standard Tailwind CSS grid breakpoints:

```
Breakpoint Specifications:
┌─────────────┬─────────────────┬──────────────────────────────────────────┐
│ Breakpoint  │ Viewport Width  │ Layout Grid Structure                    │
├─────────────┼─────────────────┼──────────────────────────────────────────┤
│ Mobile (sm) │ < 768px         │ 1-Column Stack, Fixed Bottom Nav + FAB   │
│ Tablet (md) │ 768px – 1023px  │ 2-Column Grid, Collapsible Nav Drawer    │
│ Desktop(lg) │ 1024px – 1279px │ 3-Column Grid, Left Sidebar Navigation   │
│ XL Desktop  │ ≥ 1280px        │ Max 1440px Container Grid                │
└─────────────┴─────────────────┴──────────────────────────────────────────┘
```

---

## 7. Reusable Component Inventory (shadcn/ui + Radix UI Base)

The UI system relies on a curated set of reusable primitive components matching the approved tech stack:

1. **Button (`components/ui/button.tsx`):** Variants: `default`, `secondary`, `outline`, `destructive`, `ghost`. Sizes: `sm`, `md`, `lg`, `icon`.
2. **Card (`components/ui/card.tsx`):** Container primitives (`CardHeader`, `CardTitle`, `CardContent`, `CardFooter`).
3. **Modal / Dialog (`components/ui/dialog.tsx`):** Radix accessible dialog wrappers for transaction forms, budget creation, and category reassignment.
4. **Bottom Sheet Drawer (`components/ui/drawer.tsx`):** Touch-optimized modal fallback for mobile viewports (< 768px).
5. **Data Table (`components/ui/table.tsx`):** Styled table rows with tabular numeric formatting and sort headers.
6. **Form Controls (`components/ui/form.tsx`, `input.tsx`, `select.tsx`):** Form primitives integrated with React Hook Form and Zod resolvers.
7. **Badge (`components/ui/badge.tsx`):** Status pill indicators (`Income`, `Expense`, `System Default`, `Approaching Limit`, `Exceeded`, `Completed`).
8. **Progress Bar (`components/ui/progress.tsx`):** Dynamic progress bar supporting custom color classes (`bg-emerald-500`, `bg-amber-500`, `bg-rose-500`).
9. **Toast Notification (`components/ui/toast.tsx`):** Lightweight feedback banners for async mutations.

---

## 8. Financial Data Presentation & Charting Principles

### 8.1 Monetary Display Rules
* All monetary amounts must be displayed with explicit 2-decimal formatting (e.g., `$1,250.00`).
* Amounts use `font-variant-numeric: tabular-nums` to ensure numbers align vertically in tables.
* The preferred currency symbol (`$`, `€`, `£`, `¥`) is prepended globally as a display prefix based on `Profile.preferredCurrencySymbol` ([BR-018](file:///home/blart/Documents/webProjects/FinanceManager/docs/business-rules.md#L100)).
* Negative account balance is explicitly presented as `-$250.00` in Rose/Crimson text ([BR-020](file:///home/blart/Documents/webProjects/FinanceManager/docs/business-rules.md#L112)).

### 8.2 Recharts Data Visualization Standards
* **Category Breakdown (Donut Chart):** Displays spending distribution by expense category. Uses curated harmonious palette contrasting against dark/light backgrounds. Custom tooltip displays category name, amount, and percentage of total monthly spending.
* **Monthly Trends (Bar/Area Chart):** Displays side-by-side Income (Emerald) vs. Expense (Rose) bars over calendar months ([FR-015](file:///home/blart/Documents/webProjects/FinanceManager/docs/product-requirements.md#L92)).
