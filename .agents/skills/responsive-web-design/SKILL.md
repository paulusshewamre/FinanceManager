---
name: responsive-web-design
description: Multi-device layout standards, responsive navigation, table-to-card transformations, mobile touch ergonomics, viewport testing standards, and zero-overflow rules for the Personal Finance Manager. Use when designing mobile layouts, media queries, touch targets, or adapting desktop interfaces to mobile/tablet devices.
---

# Responsive Web Design Skill

**Application:** Personal Finance Manager  
**Role:** Responsive UI/UX & Mobile Layout Specialist  
**Source of Truth:** [`docs/design-system.md`](file:///home/blart/Documents/webProjects/FinanceManager/docs/design-system.md), [`docs/ui-ux-specification.md`](file:///home/blart/Documents/webProjects/FinanceManager/docs/ui-ux-specification.md), [`docs/screen-and-flow-specification.md`](file:///home/blart/Documents/webProjects/FinanceManager/docs/screen-and-flow-specification.md)

---

## 1. Scope & Backend Freeze Rule

> [!IMPORTANT]
> **CRITICAL PROJECT RULE — FRONTEND ONLY (BACKEND FROZEN)**  
> This skill governs layout adaptation across viewports, CSS grid/flex structures, touch targets, and client-side presentation transforms. It is strictly prohibited to modify:
> - Database & Prisma (`prisma/`, `schema.prisma`, migrations, seeds)
> - Better Auth configuration & auth logic (`lib/auth*`)
> - API contracts, endpoints, and Route Handlers (`app/api/`)
> - Server Actions (`modules/*/actions/`)
> - Business logic & financial calculation engines (`modules/*/domain/`)
> - Backend architecture
> 
> Layout modifications must purely reformat and adapt visual data presentation across screen sizes without altering backend data fetching logic.

---

## 2. Intentional Responsive Design Philosophy

Do **NOT** simply scale down or compress desktop layouts. Each viewport tier must feature intentional, ergonomic layouts tailored to that device's input mode and screen dimensions.

### Target Viewport Testing Matrix

| Breakpoint Tier | Viewport Width | Typical Target Devices | Layout Strategy |
| :--- | :--- | :--- | :--- |
| **Small Mobile** | `375px` | iPhone SE, Compact Android | 1-Column Stack, Minimal Header, Bottom Navigation, FAB, Compact Cards |
| **Standard Mobile** | `430px` | iPhone 14/15/16 Pro Max, Pixel | 1-Column Stack, Bottom Navigation, Full-width Bottom Sheets, FAB |
| **Tablet Portrait** | `768px` | iPad, Galaxy Tab | 2-Column Grid, Collapsible Side Drawer or Sub-Header Nav |
| **Desktop / Laptop**| `1280px` | Laptops, MacBooks | 3-Column Dashboard Grid, Persistent Left Sidebar, Header Actions |
| **Large Desktop** | `1440px+` | External Monitors, Ultra-wides | Max 1440px Centered Container (`max-w-7xl mx-auto`), Generous Whitespace |

---

## 3. Navigation Adaptations Across Viewports

### 3.1 Desktop ($\ge$ 1024px)
- **Left Sidebar:** Persistent vertical navigation menu with active route indicators, category links, and user profile pill.
- **Top Utility Header:** Contains Month Selector, Search trigger, Theme switch, and primary `+ Add Transaction` button.

### 3.2 Tablet (768px – 1023px)
- **Collapsible Sidebar / Top Nav:** Sidebar collapses into icon-only mode or top responsive navigation bar.
- **Header Actions:** Quick Add button remains accessible in the top right utility area.

### 3.3 Mobile (< 768px)
- **Fixed Bottom Navigation Bar:** Anchored at the bottom of the screen (`fixed bottom-0 left-0 right-0 z-50 bg-slate-900/95 backdrop-blur-md border-t border-slate-800 pb-safe`).
- **5 Primary Touch Targets:** `Dashboard`, `Transactions`, `Budgets`, `Savings`, `Settings`.
- **Floating Action Button (FAB):** Prominent circular `+` button anchored bottom-right above the navigation bar (`fixed bottom-20 right-5 z-50 shadow-xl bg-slate-100 dark:bg-slate-50 text-slate-900 rounded-full w-14 h-14 flex items-center justify-center`).

---

## 4. Component-Level Responsive Transformations

### 4.1 Responsive Tables vs. Mobile Cards
- **Desktop ($\ge$ 768px):** Full tabular Data Table (`<Table>`) with columns: `Date`, `Type`, `Category`, `Merchant/Payee`, `Notes`, `Amount`, `Actions`.
- **Mobile (< 768px):** Automatically transform table rows into touch-friendly **Transaction Cards**:
  - Top row: Merchant/Payee name + Category Badge + Right-aligned Amount (`text-base font-bold font-mono`).
  - Bottom row: Date (UTC formatted) + Optional Notes excerpt + Action trigger.
  - Prevents horizontal table scrolling and maintains instant readability.

### 4.2 Responsive Modals vs. Drawers
- **Desktop ($\ge$ 768px):** Centered Radix UI Dialog modal (`max-w-md w-full`) with backdrop blur.
- **Mobile (< 768px):** Smooth Vaul slide-up bottom sheet / drawer anchored to the bottom of the screen with a drag handle (`h-1.5 w-12 bg-slate-700 rounded-full mx-auto mb-3`).

### 4.3 Responsive Dashboard Grid
- **Hero Metrics:** 
  - Mobile: 1-column stacked cards (Net Balance Hero $\rightarrow$ Total Income $\rightarrow$ Total Expenses).
  - Tablet: 2-column grid.
  - Desktop: 3-column top summary row.
- **Budgets & Goals Grids:** `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6`.

### 4.4 Responsive Charts & Visualizations
- Always wrap Recharts inside `<ResponsiveContainer width="100%" height={...}>`.
- Set adaptive chart heights: `h-64 sm:h-72 lg:h-80`.
- Legend position: Stack below chart on mobile (`< 768px`) to prevent visual clipping; place beside chart on desktop.

---

## 5. Touch Targets & Mobile Ergonomics

1. **Minimum Touch Target Size:** All buttons, interactive icons, form inputs, and nav items must measure at least **44 × 44 px** (or 48 × 48 px where feasible) on mobile devices (`min-h-[44px] min-w-[44px]`).
2. **Thumb Zone Optimization:** Critical high-frequency actions (Add Transaction, Filter, Month Switcher) must be easily reachable within the lower half of mobile screens.
3. **Touch Feedback:** Provide active touch feedback (`active:scale-95 transition-transform duration-75`) without delay.

---

## 6. Horizontal Overflow & Text Wrapping Rules

1. **Zero Unintended Horizontal Scroll:** Root containers must enforce `overflow-x-hidden` or clean flex/grid boundaries. Never allow unexpected horizontal scrolling on mobile.
2. **Monetary Truncation Protection:** Financial amounts must never be truncated or clipped with ellipsis if readable. Prioritize wrapping metadata (notes/merchant) rather than shrinking amount values.
3. **Long Text Handling:** Merchant names and notes should use `truncate` or `line-clamp-1` / `line-clamp-2` with full text available on detail tap.

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

Before declaring a responsive design task complete, verify:
- [ ] Tested at **375px**, **430px**, **768px**, **1280px**, and **1440px+** viewports.
- [ ] No horizontal layout overflow occurs on 375px/430px mobile screens.
- [ ] Mobile navigation uses the fixed bottom bar + floating action button (FAB).
- [ ] Desktop data tables gracefully transform into mobile touch cards on `< 768px`.
- [ ] Modals switch to bottom sheets / drawers on mobile devices.
- [ ] Touch targets measure at least 44×44px on mobile viewports.
- [ ] Zero changes made to backend files, Prisma, database, or API contracts.
