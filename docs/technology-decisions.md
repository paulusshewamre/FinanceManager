# Architecture Decision Records (ADRs) & Technology Stack Specifications

## Application: Personal Finance Manager (v1.0 MVP)
**Role:** Principal Software Architect  
**Status:** Approved Technology Stack Baseline  
**Traceability:** [product-requirements.md](file:///home/blart/Documents/webProjects/FinanceManager/docs/product-requirements.md) | [system-architecture.md](file:///home/blart/Documents/webProjects/FinanceManager/docs/system-architecture.md) | [scope.md](file:///home/blart/Documents/webProjects/FinanceManager/docs/scope.md)

---

# Executive Summary

This document captures the formal **Architecture Decision Records (ADRs)** for all technology stack selections governing the **Personal Finance Manager** web application. Every technology choice is evaluated based on its alignment with core product principles: **Simplicity**, **Speed**, **Reliability**, **Security**, and **Developer Velocity for a Solo Engineer collaborating with AI tools**.

---

# ADR-001: Frontend Core — Next.js (App Router), React & TypeScript

* **Status:** Approved
* **Context:** The application requires fast initial dashboard load times under 2 seconds ([FR-010](file:///home/blart/Documents/webProjects/FinanceManager/docs/product-requirements.md#L57)), responsive desktop/mobile layouts, and strict type safety across financial domain entities.
* **Why it fits THIS project:** Next.js App Router seamlessly unifies server-side rendering (React Server Components) for instant page displays with client-side interactivity for forms and charts. TypeScript enforces strict compile-time validation over financial calculation interfaces.
* **Advantages:**
  * Zero-waterfall server rendering for financial dashboards.
  * Direct server-client type sharing for domain models.
  * Built-in routing, image optimization, and bundle splitting.
* **Trade-offs:** Server/Client component boundary learning curve and strict hydration constraint requirements.
* **Alternatives Considered:** Single Page Application (Vite + React SPA) or Traditional MVC (Express + EJS).
* **Selection Justification:** Next.js App Router offers superior performance and eliminates client-side data fetching waterfalls, directly satisfying performance NFR requirements.

---

# ADR-002: User Interface & Component Ecosystem — Stitch, Tailwind CSS, shadcn/ui, Radix UI & Lucide React

* **Status:** Approved
* **Context:** The project requires a visually stunning, modern aesthetic (dark mode, glassmorphism, dynamic transitions) that wows users at first glance while remaining accessible and compatible with AI UI design generation via **Stitch**.
* **Why it fits THIS project:** Stitch generates high-fidelity component layouts using Tailwind CSS utility classes and Radix UI headless primitives. Combined with `shadcn/ui`, the UI components live directly inside the codebase as editable React components rather than an opaque external node dependency.
* **Advantages:**
  * 100% component ownership and styling customizability.
  * Seamless integration of Stitch UI designs without architectural refactoring.
  * Built-in accessibility (WAI-ARIA compliant) via Radix UI primitives.
  * Rich dark/light mode theme switching ([FR-063](file:///home/blart/Documents/webProjects/FinanceManager/docs/product-requirements.md#L312)).
* **Trade-offs:** Utility class verbosity in JSX files.
* **Alternatives Considered:** Styled Components, Emotion, or monolithic UI libraries (MUI, Ant Design).
* **Selection Justification:** shadcn/ui + Tailwind CSS provides complete styling flexibility, dark mode support out of the box, and perfect compatibility with Stitch-generated designs.

---

# ADR-003: Backend Architecture — Next.js Route Handlers & Server Actions

* **Status:** Approved
* **Context:** The backend must handle secure user authentication, form submissions, business validations, and dynamic recalculations without adding unnecessary microservice complexity for a solo developer.
* **Why it fits THIS project:** Server Actions enable direct, type-safe mutation handling for forms (e.g. logging transactions, editing budgets), eliminating the overhead of writing custom REST API boilerplate. Route Handlers provide standard HTTP endpoints for authentication callbacks.
* **Advantages:**
  * Eliminates API endpoint boilerplate and manual fetch code.
  * Full end-to-end TypeScript type safety between forms and server logic.
  * Automatic security context execution on the server side.
* **Trade-offs:** Server Actions are tightly coupled to Next.js server runtime.
* **Alternatives Considered:** Separate Express.js / Nest.js REST API server.
* **Selection Justification:** Colocating Server Actions within Next.js reduces operational overhead, eliminates network API serialization code, and maximizes solo developer velocity.

---

# ADR-004: Database Engine & ORM — PostgreSQL, Neon & Prisma ORM

* **Status:** Approved
* **Context:** Financial ledgers demand strict ACID compliance, transactional integrity, relational foreign key constraints (e.g., category reassignment on deletion [BR-013](file:///home/blart/Documents/webProjects/FinanceManager/docs/business-rules.md#L73)), and serverless database scaling.
* **Why it fits THIS project:** PostgreSQL provides bulletproof relational data consistency and fixed-point numeric types (`Decimal(12,2)`). **Neon** delivers serverless PostgreSQL with instant branching and auto-scaling. **Prisma ORM** generates type-safe database query clients directly from schema declarations.
* **Advantages:**
  * Guaranteed ACID transactions for financial ledger integrity.
  * Type-safe database queries automatically synchronized with TypeScript types.
  * Seamless database migrations and serverless connection pooling via Neon.
* **Trade-offs:** Prisma ORM schema migrations require strict schema declaration discipline.
* **Alternatives Considered:** MongoDB (NoSQL lacks multi-table ACID guarantees), Drizzle ORM, or raw SQL queries.
* **Selection Justification:** PostgreSQL + Prisma ensures zero financial data loss ([NFR Reliability](file:///home/blart/Documents/webProjects/FinanceManager/docs/product-requirements.md#L171)), strict multi-tenant isolation, and complete type safety.

---

# ADR-005: Authentication Framework — Better Auth

* **Status:** Approved
* **Context:** User authentication must support email/password registration ([FR-001](file:///home/blart/Documents/webProjects/FinanceManager/docs/product-requirements.md#L13)), secure login ([FR-002](file:///home/blart/Documents/webProjects/FinanceManager/docs/product-requirements.md#L20)), session persistence ([FR-005](file:///home/blart/Documents/webProjects/FinanceManager/docs/product-requirements.md#L41)), transactional email password reset ([FR-004](file:///home/blart/Documents/webProjects/FinanceManager/docs/product-requirements.md#L34)), and account deletion ([FR-006](file:///home/blart/Documents/webProjects/FinanceManager/docs/product-requirements.md#L48)).
* **Why it fits THIS project:** Better Auth is a modern, lightweight, developer-focused authentication framework built specifically for TypeScript and Next.js App Router, integrating seamlessly with Prisma ORM sessions.
* **Advantages:**
  * Complete developer ownership over user session data inside PostgreSQL.
  * Built-in support for password hashing, session tokens, and security reset tokens.
  * Native compatibility with Next.js Server Actions and Route Handlers.
* **Trade-offs:** Requires self-managed email dispatch configuration for password resets.
* **Alternatives Considered:** NextAuth.js / Auth.js, Clerk, or Auth0.
* **Selection Justification:** Better Auth avoids third-party vendor lock-in, stores user sessions directly within Neon PostgreSQL, and natively supports custom hard-purge account deletion logic ([BR-019](file:///home/blart/Documents/webProjects/FinanceManager/docs/business-rules.md#L106)).

---

# ADR-006: Schema Validation — Zod

* **Status:** Approved
* **Context:** Input parameters across transaction creation, category boundaries, and profile preferences must be strictly validated before domain logic execution (e.g. Amount > 0 [BR-004](file:///home/blart/Documents/webProjects/FinanceManager/docs/business-rules.md#L17)).
* **Why it fits THIS project:** Zod allows declaring TypeScript-first validation schemas once, reusing them across client-side forms and server-side Actions seamlessly.
* **Advantages:**
  * Single source of truth for validation rules and static TypeScript types.
  * Comprehensive error reporting for form field validation errors.
  * Zero runtime dependencies.
* **Trade-offs:** Complex schema compositions require careful type inference handling.
* **Alternatives Considered:** Yup, Joi, or custom validation functions.
* **Selection Justification:** Zod is the industry standard for TypeScript validation, seamlessly integrating with React Hook Form and Next.js Server Actions.

---

# ADR-007: Form Handling — React Hook Form

* **Status:** Approved
* **Context:** Interactive transaction, budget, and goal creation modals require responsive, performant input handling with immediate validation feedback.
* **Why it fits THIS project:** React Hook Form leverages uncontrolled components to minimize re-renders during user typing and integrates natively with Zod schemas via `@hookform/resolvers`.
* **Advantages:**
  * Superior rendering performance with zero lag during user input.
  * Seamless integration with Zod validation schemas.
  * Built-in field error handling and state management.
* **Trade-offs:** Requires understanding uncontrolled component input refs.
* **Alternatives Considered:** Formik or plain React state management.
* **Selection Justification:** React Hook Form reduces component re-renders and provides clean integration with shadcn/ui form controls.

---

# ADR-008: Client & Server State Management — TanStack Query (React Query)

* **Status:** Approved
* **Context:** The application must maintain synchronized client-side cache state after transaction mutations, updating dashboard metrics and budget indicators dynamically ([BR-006](file:///home/blart/Documents/webProjects/FinanceManager/docs/business-rules.md#L19)).
* **Why it fits THIS project:** TanStack Query handles server state fetching, caching, background refetching, and optimistic updates, keeping client components synchronized with database state.
* **Advantages:**
  * Automatic cache invalidation and background refetching after Server Actions.
  * Built-in loading, error, and stale-while-revalidate states.
  * Reduces boilerplate state management code.
* **Trade-offs:** Requires managing cache query keys systematically.
* **Alternatives Considered:** Redux Toolkit, Zustand standalone, or MobX.
* **Selection Justification:** TanStack Query excels at managing server state, eliminating the need for complex global state stores like Redux.

---

# ADR-009: Data Visualizations & Analytics — Recharts

* **Status:** Approved
* **Context:** The dashboard requires visual spending analytics by category and monthly cash flow trend charts ([FR-015](file:///home/blart/Documents/webProjects/FinanceManager/docs/product-requirements.md#L92)).
* **Why it fits THIS project:** Recharts is a composable, declarative React charting library built natively on SVG, making it responsive and fully customizable via CSS.
* **Advantages:**
  * Native React component architecture fitting seamlessly into JSX.
  * Fully responsive SVG rendering across mobile and desktop views.
  * Easy custom tooltip and color mapping matching dark mode design tokens.
* **Trade-offs:** Large dataset rendering performance (not an issue for aggregated monthly financial data).
* **Alternatives Considered:** Chart.js, D3.js, or Victory.
* **Selection Justification:** Recharts provides clean declarative React syntax and easy integration with Tailwind CSS design tokens.

---

# ADR-010: Quality Assurance & Testing Suite — Jest, React Testing Library & Playwright

* **Status:** Approved
* **Context:** Financial calculations (Net Balance, Budget Progress, Savings Percentages) and business workflows must be fully verified to ensure zero data corruption or logic errors.
* **Why it fits THIS project:** **Jest** provides unit test execution for domain math engines; **React Testing Library** verifies interactive component rendering; **Playwright** executes end-to-end browser testing across user workflows.
* **Advantages:**
  * Multi-layered test coverage (Unit, Integration, E2E).
  * Automated regression testing for backdated transaction recalculations ([BR-006](file:///home/blart/Documents/webProjects/FinanceManager/docs/business-rules.md#L19)).
  * Cross-browser automated validation via Playwright.
* **Trade-offs:** E2E tests require dedicated test database setup.
* **Alternatives Considered:** Cypress, Vitest.
* **Selection Justification:** Combining Jest and Playwright delivers industry-standard quality assurance covering both business calculation logic and critical E2E user flows.

---

# ADR-011: Deployment & Serverless Infrastructure — Vercel & Neon PostgreSQL

* **Status:** Approved
* **Context:** The application must be deployed to a production environment with continuous deployment pipelines, automatic preview environments, and global CDN delivery.
* **Why it fits THIS project:** **Vercel** provides native hosting for Next.js App Router with automatic edge routing and zero-config deployment. **Neon** provides serverless PostgreSQL with instant database branching for preview environments.
* **Advantages:**
  * Zero-config CI/CD deployment pipeline linked to Git branches.
  * Instant serverless scaling and global content distribution.
  * Database branching on Neon for isolated testing preview environments.
* **Trade-offs:** Serverless cold starts (mitigated by Neon connection pooling and Vercel edge runtime).
* **Alternatives Considered:** AWS ECS / Docker on EC2, Render, or Railway.
* **Selection Justification:** Vercel + Neon offers the fastest deployment lifecycle, zero server maintenance overhead for a solo developer, and production-grade reliability.
