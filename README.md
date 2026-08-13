# Personal Finance Manager

[![Next.js](https://img.shields.io/badge/Next.js-16.3.0-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.0.0-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-7.9.1-2D3748?style=for-the-badge&logo=prisma&logoColor=white)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon_Serverless-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)](https://neon.tech/)
[![Vercel](https://img.shields.io/badge/Vercel-Deployed-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://vercel.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg?style=for-the-badge)](LICENSE)

A production-ready, full-stack personal finance application built with **Next.js 16 (App Router)**, **TypeScript**, **Better Auth**, **Prisma ORM**, and **Neon Serverless PostgreSQL**. The application provides enterprise-grade multi-tenant data isolation, zero-floating-point monetary precision, interactive budgeting warning engines, atomic savings goal management, and comprehensive financial analytics.

---

## 🌟 Executive Summary & Key Features

### 🔐 1. Authentication & Multi-Tenant Security
- **Better Auth Integration:** Secure email and password authentication backed by Prisma ORM.
- **Session Management:** HTTP-only, secure, samesite-protected session cookies with automatic 7-day expiration and 5-minute server-side cookie caching.
- **Password Recovery Flow:** Self-service password reset workflow with Resend email delivery and secure token verification.
- **Multi-Tenant Row-Level Locking:** Strict user data isolation enforced at both the API route and Edge Middleware proxy layers.
- **Cascading Account Hard Purge:** 7-table transactional data purge (`User`, `Session`, `Account`, `Profile`, `Category`, `Transaction`, `Budget`, `SavingsGoal`) compliant with privacy regulations.

### 💰 2. Transaction Engine & Monetary Precision
- **Exact Decimal Calculations:** All financial values utilize Prisma `Decimal` types to eliminate floating-point rounding inaccuracies.
- **Income & Expense Tracking:** Categorized income and expense records with customizable merchant names, notes, and dates.
- **Filtering & Search:** Real-time search, transaction type filtering, and paginated data feeds.
- **Backdated Transaction Support:** Allows logging past transactions with automatic historical budget recalculation.

### 📊 3. Category System & Default Seeding
- **System Defaults:** Pre-seeded system categories (*Groceries*, *Utilities*, *Housing*, *Salary*, *Freelance*, *Uncategorized*).
- **Custom User Categories:** Create custom categories tied to specific transaction types (*INCOME* vs *EXPENSE*).
- **Immutability Protection:** System default categories are protected against accidental edit or deletion.

### ⚠️ 4. Budgeting & Real-Time Warning Calculation Engine
- **Monthly Limit Enforcement:** Set spending limits per expense category for any target month and year.
- **Dynamic Status Transitions:** Real-time threshold evaluation:
  - 🟢 **`NORMAL`:** Spending is under 80% of budget limit.
  - 🟡 **`WARNING`:** Spending reaches or exceeds **80%** (Amber alert threshold).
  - 🔴 **`EXCEEDED`:** Spending reaches or exceeds **100%** (Crimson overrun alert).
- **Income Budget Prevention:** Enforces strict validation blocking budget creation on income categories.

### 🎯 5. Savings Goals & Atomic Contribution Engine
- **Progress Tracking:** Define target savings amounts, accumulative balances, and target dates.
- **Atomic Deposits:** Database transactions ensure concurrent deposits atomically increment accumulated balances.
- **Auto-Completion:** Automatically transitions goal status from `IN_PROGRESS` to `COMPLETED` when the target amount is met.

### 📈 6. Financial Analytics & Dashboard Overview
- **Real-Time Summary Metrics:** Net balance, monthly income, monthly expenses, net cashflow, and savings rate percentage.
- **6-Month Trend Analysis:** Historical income vs expense bar charts and monthly cashflow progression.
- **Category Expense Distribution:** Visual breakdown of top expense categories.

---

## 🛠️ Technology Stack

| Layer | Technology |
| :--- | :--- |
| **Framework** | [Next.js 16.3.0](https://nextjs.org/) (App Router & Turbopack) |
| **UI Library** | [React 19.0.0](https://react.dev/) |
| **Language** | [TypeScript 5.x](https://www.typescriptlang.org/) |
| **Styling & Design** | Vanilla CSS Design System with CSS Custom Properties (Dark Palette) |
| **Database** | [PostgreSQL](https://www.postgresql.org/) via [Neon Serverless](https://neon.tech/) |
| **ORM** | [Prisma 7.9.1](https://www.prisma.io/) with `@prisma/adapter-pg` connection pooling |
| **Authentication** | [Better Auth](https://www.better-auth.com/) |
| **Validation** | [Zod 3.24.x](https://zod.dev/) |
| **Email Service** | [Resend SDK](https://resend.com/) |
| **Testing** | Node.js Native Test Runner (`node --test`) & [Playwright E2E](https://playwright.dev/) |
| **Deployment** | [Vercel Serverless Platform](https://vercel.com/) |

---

## 📁 Repository Structure

```text
FinanceManager/
├── app/                        # Next.js App Router Routes & API Handlers
│   ├── (auth)/                 # Authentication pages (login, register, forgot-password, reset-password)
│   ├── api/                    # REST API Endpoints
│   │   ├── analytics/          # Analytics & trend aggregation API
│   │   ├── auth/[...all]/      # Better Auth route handler
│   │   ├── budgets/            # Budget management & status calculation APIs
│   │   ├── categories/         # Category CRUD APIs
│   │   ├── dashboard/          # Aggregated dashboard metrics API
│   │   ├── savings/            # Savings goals & contribution APIs
│   │   ├── transactions/       # Transaction CRUD & pagination APIs
│   │   └── user/               # Profile management & account purge APIs
│   ├── budgets/                # Budget Management Page
│   ├── categories/             # Category Management Page
│   ├── dashboard/              # Main Dashboard Page
│   ├── savings/                # Savings Goals Page
│   ├── settings/               # Profile & Account Settings Page
│   ├── transactions/           # Transaction Ledger Page
│   ├── layout.tsx              # Root Layout & Context Providers
│   └── page.tsx                # Landing Page
├── components/                 # Reusable React UI Components & Charts
├── docs/                       # Project Documentation & Debug Reports
│   └── production-deployment-debug-report.md
├── lib/                        # Core Utilities & Configuration
│   ├── auth/                   # Better Auth server configuration & session helpers
│   ├── calculations/           # Budget status engine & business logic
│   ├── db/                     # Prisma Client singleton & connection pool manager
│   ├── email/                  # Resend password reset email dispatch logic
│   └── validations/            # Zod input validation schemas
├── prisma/                     # Database Schema & Migration Scripts
│   ├── schema.prisma           # 7-table relational schema definition
│   └── seed.ts                 # Idempotent default categories seeder
├── tests/                      # Comprehensive Test Suites
│   ├── e2e/                    # Playwright end-to-end user journey tests
│   ├── integration/            # API route integration tests
│   └── unit/                   # Business logic & validation unit tests
├── proxy.ts                    # Next.js 16 Edge Proxy Middleware entrypoint
├── next.config.mjs             # Next.js config & OWASP security headers
└── vercel.json                 # Vercel deployment manifest
```

---

## 📋 Environment Variables Reference

Create a `.env` file in the root directory based on the following template:

```env
# Neon PostgreSQL Database Connection (Pooled)
DATABASE_URL="postgresql://user:password@ep-host-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require"

# Direct Database Connection (Unpooled - required for migrations)
DIRECT_URL="postgresql://user:password@ep-host.us-east-1.aws.neon.tech/neondb?sslmode=require"

# Better Auth Secret (Min 32 characters)
BETTER_AUTH_SECRET="your-super-secret-key-change-in-production"

# Application Base URLs
BETTER_AUTH_URL="http://localhost:3000"
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Optional Email Integration (Resend API Key)
RESEND_API_KEY="re_123456789"
```

---

## ⚡ Getting Started (Local Development)

### 1. Prerequisites
- **Node.js:** `v22.0.0` or higher
- **Package Manager:** `npm` (v10+)
- **Database:** PostgreSQL database instance or a free [Neon PostgreSQL](https://neon.tech/) project.

### 2. Installation
Clone the repository and install dependencies:

```bash
git clone https://github.com/paulusshewamre/FinanceManager.git
cd FinanceManager
npm install
```

### 3. Database Setup & Seeding
Push the Prisma schema to your database and seed system default categories:

```bash
# Push database schema
npx prisma db push

# Seed system default categories
npx prisma db seed
```

### 4. Run Development Server
Start the local development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to access the application.

---

## 🧪 Testing & Verification

The codebase is backed by **96 unit & integration tests** and Playwright end-to-end user journey tests.

### Run Unit & Integration Tests
```bash
npm test
```

### Run Playwright End-to-End Tests
```bash
# Install Playwright browser binaries (first time only)
npx playwright install chromium

# Execute E2E test suite
npm run test:e2e
```

### Production Build Verification
```bash
npm run build
```

---

## 🚀 Deployment Guide (Vercel)

This application is optimized for zero-downtime serverless deployment on **Vercel**.

1. **Push code to GitHub repository.**
2. **Import repository into Vercel.**
3. **Configure Environment Variables in Vercel Dashboard:**
   - `DATABASE_URL`
   - `DIRECT_URL`
   - `BETTER_AUTH_SECRET`
   - `BETTER_AUTH_URL` (`https://your-app.vercel.app`)
   - `NEXT_PUBLIC_APP_URL` (`https://your-app.vercel.app`)
4. **Deploy:** Vercel automatically runs `prisma generate && next build` to deploy your application.

---

## 📄 License

This project is licensed under the **MIT License**.
