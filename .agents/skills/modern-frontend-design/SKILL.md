---
name: modern-frontend-design
description: Master frontend design system, visual hierarchy, typography, semantic color tokens, financial data presentation, and component styling guidelines for the Personal Finance Manager. Use when styling, refining UI components, setting up design tokens, or improving visual polish.
---

# Modern Frontend Design Skill

**Application:** Personal Finance Manager  
**Role:** Frontend Design System Architect  
**Source of Truth:** [`docs/design-system.md`](file:///home/blart/Documents/webProjects/FinanceManager/docs/design-system.md), [`docs/ui-ux-specification.md`](file:///home/blart/Documents/webProjects/FinanceManager/docs/ui-ux-specification.md), [`docs/screen-and-flow-specification.md`](file:///home/blart/Documents/webProjects/FinanceManager/docs/screen-and-flow-specification.md)

---

## 1. Scope & Backend Freeze Rule

> [!IMPORTANT]
> **CRITICAL PROJECT RULE — FRONTEND ONLY (BACKEND FROZEN)**  
> This skill governs purely visual presentation, layout styling, and CSS/component tokens. It is strictly prohibited to modify:
> - Database & Prisma (`prisma/`, `schema.prisma`, migrations, seeds)
> - Better Auth configuration & auth logic (`lib/auth*`)
> - API contracts, endpoints, and Route Handlers (`app/api/`)
> - Server Actions (`modules/*/actions/`)
> - Business logic & financial calculation engines (`modules/*/domain/`)
> - Backend architecture
> 
> All frontend styling must consume existing data structures, props, and Server Action response contracts without altering backend payloads.

---

## 2. Visual Direction & Brand Personality

The visual identity of Personal Finance Manager balances **professional financial clarity** with **modern digital elegance**. It uses a dark-slate baseline with glassmorphic cards, crisp typography, and functional semantic accents.

- **Trustworthy & Precise:** Tabular monospace numbers, clear alignments, high contrast.
- **Modern & Refined:** Slate backgrounds (`#090D16` dark, `#F8FAFC` light), subtle card borders, smooth transitions.
- **Empowering & Proactive:** Clear status badges, distinct budget warning bars, and positive/negative financial indicators.

---

## 3. Semantic Color Token Architecture

The color system uses Tailwind CSS CSS variables supporting Dark and Light theme modes ([FR-063](file:///home/blart/Documents/webProjects/FinanceManager/docs/product-requirements.md#L312)):

| Token Purpose | Dark Theme Baseline | Light Theme Baseline | Tailwind Utility Class |
| :--- | :--- | :--- | :--- |
| **App Background** | Slate 950 (`#090D16`) | Slate 50 (`#F8FAFC`) | `bg-slate-950 dark:bg-slate-950` / `bg-slate-50` |
| **Surface / Card** | Slate 900/80 (`#0F172A`) | Slate 0 (`#FFFFFF`) | `bg-slate-900/80 dark:bg-slate-900/80` / `bg-white` |
| **Elevated Border** | Slate 800 (`#1E293B`) | Slate 200 (`#E2E8F0`) | `border-slate-800 dark:border-slate-800` / `border-slate-200` |
| **Primary Text** | Slate 50 (`#F8FAFC`) | Slate 900 (`#0F172A`) | `text-slate-50 dark:text-slate-50` / `text-slate-900` |
| **Muted Text** | Slate 400 (`#94A3B8`) | Slate 500 (`#64748B`) | `text-slate-400 dark:text-slate-400` / `text-slate-500` |
| **Income / Credit Accent** | Emerald 500 (`#10B981`) | Emerald 600 (`#059669`) | `text-emerald-500 dark:text-emerald-500` / `text-emerald-600` |
| **Expense / Debit Accent** | Rose 500 (`#F43F5E`) | Rose 600 (`#E11D48`) | `text-rose-500 dark:text-rose-500` / `text-rose-600` |
| **Net Balance Positive** | Emerald 500 (`#10B981`) | Emerald 600 (`#059669`) | `text-emerald-500` / `bg-emerald-500/10` |
| **Net Balance Negative** | Rose 500 (`#F43F5E`) | Rose 600 (`#E11D48`) | `text-rose-500` / `bg-rose-500/10` |
| **Budget Warning (80%–99%)** | Amber 500 (`#F59E0B`) | Amber 600 (`#D97706`) | `text-amber-500` / `bg-amber-500` |
| **Budget Alert (100%+)** | Red 600 (`#DC2626`) | Red 600 (`#DC2626`) | `text-red-600` / `bg-red-600` |

---

## 4. Typography Scale & Financial Formatting

### 4.1 Type Scale Tokens
- **Display (`text-display`):** `text-3xl lg:text-4xl font-bold tracking-tight` (Net Balance Hero Card)
- **Heading 1 (`text-h1`):** `text-2xl lg:text-3xl font-bold tracking-tight` (Page Titles)
- **Heading 2 (`text-h2`):** `text-xl lg:text-2xl font-semibold` (Section Titles)
- **Heading 3 (`text-h3`):** `text-lg font-semibold` (Card Headers)
- **Body (`text-body`):** `text-sm font-normal leading-relaxed` (General Content)
- **Subtle / Caption (`text-subtle`):** `text-xs font-medium text-slate-400` (Timestamps, metadata, labels)
- **Monetary Figures (`text-currency`):** `font-mono tracking-tight tabular-nums`

### 4.2 Financial Data Presentation Rules
1. **Explicit Decimals:** All currency values must display exactly 2 decimal places (e.g. `$1,250.00`, `$0.00`).
2. **Tabular Numbers:** Always apply `tabular-nums` / `font-mono` on monetary values in tables, cards, and lists so columns align vertically.
3. **Preferred Currency Prefix:** Prepend the user's selected currency symbol (`$`, `€`, `£`, `¥`) globally ([BR-018](file:///home/blart/Documents/webProjects/FinanceManager/docs/business-rules.md#L100)).
4. **Negative Balances:** Format negative net balances explicitly with a minus sign prepending the currency symbol (e.g., `-$250.00`) and styled in Rose text ([BR-020](file:///home/blart/Documents/webProjects/FinanceManager/docs/business-rules.md#L112)).
5. **Income vs. Expense Badges:** Income transactions carry a positive prefix `+$500.00` with an Emerald upward indicator (`ArrowUpRight`). Expenses carry a minus prefix `-$85.00` with a Rose downward indicator (`ArrowDownLeft`).

---

## 5. Spacing, Radius & Elevation System

### 5.1 Spacing Scale
- 4px baseline: `p-1` (4px), `p-2` (8px), `p-3` (12px), `p-4` (16px), `p-6` (24px), `p-8` (32px).
- Standard form vertical spacing: `space-y-4` (16px gap between input groups).
- Card internal padding: `p-4 sm:p-6`.

### 5.2 Border Radius Scale
- `rounded-md` (6px): Badges, small buttons, sub-indicators.
- `rounded-lg` (8px): Inputs, select dropdowns, standard buttons.
- `rounded-xl` (12px): Cards, panels, modal containers.
- `rounded-full` (9999px): Status pills, avatar circles, Floating Action Button (FAB).

### 5.3 Elevation & Shadows
- `shadow-sm`: Interactive cards, summary tiles, and table rows.
- `shadow-md`: Dropdown menus, tooltips, popovers.
- `shadow-xl`: Modal dialogs, bottom-sheet drawers, and FABs.

---

## 6. Component Styling Specifications

### 6.1 Cards & Containers
- Surface: `bg-slate-900/80 border border-slate-800 rounded-xl backdrop-blur-sm p-5`
- Net Balance Hero Card: Distinct gradient surface or subtle elevated ring (`ring-1 ring-slate-700/50`) to emphasize primary account metrics.
- Card Header: Flex container with title, icon, and optional action/filter menu.

### 6.2 Buttons & Interactive Elements
- **Default (Primary):** `bg-slate-100 text-slate-900 hover:bg-slate-200 dark:bg-slate-50 dark:text-slate-900 font-medium rounded-lg px-4 py-2 transition-colors`
- **Secondary:** `bg-slate-800 text-slate-100 hover:bg-slate-700 border border-slate-700`
- **Outline:** `border border-slate-700 text-slate-200 hover:bg-slate-800/50`
- **Destructive:** `bg-rose-600 text-white hover:bg-rose-700 font-medium`
- **Ghost:** `text-slate-400 hover:text-slate-100 hover:bg-slate-800/40`
- **Hover/Active Micro-interactions:** Smooth CSS transitions (`transition-all duration-150 active:scale-[0.98]`).
- **Focus Rings:** Visible `focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:outline-none`.

### 6.3 Form Controls
- Inputs / Selects: `bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500`
- Error Border: `border-rose-500 focus:border-rose-500 focus:ring-rose-500`
- Helper / Validation Text: `text-xs text-rose-400 mt-1 flex items-center gap-1`

### 6.4 Tables & Lists
- Table Headers: `text-xs font-semibold uppercase tracking-wider text-slate-400 bg-slate-900/50 px-4 py-3 border-b border-slate-800`
- Table Rows: `border-b border-slate-800/60 hover:bg-slate-800/30 transition-colors px-4 py-3 text-sm`
- Amounts Column: Right-aligned (`text-right font-mono tabular-nums`).

### 6.5 Charts & Data Visualizations (Recharts)
- Donut Chart (Category Spending): Clean rounded segments, subtle center label displaying Total Spent.
- Bar / Area Chart (Cash Flow Trends): Emerald bars for Income, Rose bars for Expense.
- Tooltips: Custom styled tooltip box matching card surface (`bg-slate-900 border border-slate-800 rounded-lg p-2.5 shadow-xl text-xs font-sans`).

### 6.6 Iconography Standard (Lucide React)
- Standard icon size: `h-4 w-4` (inline/badges) or `h-5 w-5` (card headers/navigation).
- Mappings:
  - Income: `TrendingUp`, `ArrowUpRight`
  - Expense: `TrendingDown`, `ArrowDownLeft`
  - Net Balance / Portfolio: `Wallet`, `LayoutDashboard`
  - Budgets / Limits: `PieChart`, `AlertTriangle` (80%), `AlertOctagon` (100%+)
  - Savings: `PiggyBank`, `Target`, `Award`
  - Categories: `Tag`, `FolderPlus`, `FolderSync`, `Lock`
  - Settings: `Settings`, `User`, `Sun`, `Moon`, `ShieldAlert`

### 6.7 UI State Indicators
1. **Loading State:** Shimmering Skeletons (`bg-slate-800/50 animate-pulse rounded-lg`) matching exact dimensions of cards, tables, and metric values.
2. **Empty State:** Centered layout with muted Lucide icon in a circular slate container (`bg-slate-800/50 p-4 rounded-full`), clear 2-line explanation, and primary action button.
3. **Error State:** Inline red alert callouts with `AlertCircle` icon and explicit retry action.

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

Before declaring a modern frontend styling task complete, verify:
- [ ] Theme tokens adhere strictly to the Slate/Emerald/Rose/Amber palette in `docs/design-system.md`.
- [ ] Monetary figures are formatted with `tabular-nums`, 2 decimal places, and correct currency prefix.
- [ ] Negative amounts explicitly render as `-$250.00` in Rose text.
- [ ] Micro-interactions have subtle transitions without layout jumping.
- [ ] Loading skeleton loaders match target component shapes.
- [ ] Zero changes made to backend files, Prisma, database, or API contracts.
