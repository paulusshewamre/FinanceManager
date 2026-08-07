# Product Requirements Document (PRD)

## Overview

Personal Finance Manager is a full-stack web application that enables users to securely manage their personal finances by tracking income, expenses, budgets, and savings goals while providing meaningful financial insights through dashboards and analytics.

---

# Functional Requirements

## Authentication

### FR-001
Users shall be able to register for a new account.

Priority: High

---

### FR-002
Users shall be able to log in using their email and password.

Priority: High

---

### FR-003
Users shall be able to log out securely.

Priority: High

---

### FR-004
Users shall be able to reset their password via transactional email recovery.

Priority: Medium

---

### FR-005
Users shall remain authenticated between browser sessions.

Priority: High

---

### FR-006
Users shall be able to permanently delete their account and purge all associated financial data.

Priority: Medium

---

## Dashboard

### FR-010
Display total account balance, calculated as total income minus total expenses (displays negative values when expenses exceed income).

Priority: High

---

### FR-011
Display total income for the selected timeframe.

Priority: High

---

### FR-012
Display total expenses for the selected timeframe.

Priority: High

---

### FR-013
Display monthly financial summary with calendar month selection.

Priority: High

---

### FR-014
Display recent transactions list.

Priority: High

---

### FR-015
Display spending analytics by category and timeframe.

Priority: Medium

---

## Transactions

### FR-020
Users can create transactions specifying type (Income or Expense), amount, category, date, merchant/payee name, and optional notes.

Priority: High

---

### FR-021
Users can edit existing transaction details.

Priority: High

---

### FR-022
Users can delete transactions.

Priority: High

---

### FR-023
Users can search transactions by keyword, merchant/payee, or notes.

Priority: Medium

---

### FR-024
Users can filter transactions by type, category, date range, or amount.

Priority: Medium

---

### FR-025
Users can categorize transactions under valid Income or Expense categories.

Priority: High

---

### FR-026
Users can attach optional notes to transactions.

Priority: Low

---

### FR-027
Users can specify transaction dates (including historical backdating) and merchant/payee names.

Priority: High

---

### FR-028
Retroactive edits or deletions of transactions shall automatically trigger dynamic recalculations of account balances, monthly summaries, and budget progress.

Priority: High

---

## Categories

### FR-030
Users can create custom categories.

Priority: Medium

---

### FR-031
Users can edit custom category names and types.

Priority: Medium

---

### FR-032
Users can delete custom categories.

Priority: Medium

---

### FR-033
The system shall provide pre-seeded default system categories for common income and expense types.

Priority: High

---

### FR-034
Categories shall be classified by transaction type (Income categories vs. Expense categories).

Priority: High

---

### FR-035
When a user deletes a custom category that has assigned transactions, the system shall require reassigning those transactions to another active category or to a default "Uncategorized" category.

Priority: High

---

## Budgets

### FR-040
Users can create monthly budgets per category for a specific calendar month.

Priority: High

---

### FR-041
Users can edit monthly budget limits.

Priority: Medium

---

### FR-042
Users can delete budgets.

Priority: Medium

---

### FR-043
Users can monitor real-time budget progress against category spending.

Priority: High

---

### FR-044
Users receive visual warning indicators when approaching budget limits (e.g., 80%) and when budgets are exceeded (100%+).

Priority: High

---

## Savings Goals

### FR-050
Users can create savings goals with a target name, target amount, and target completion date.

Priority: High

---

### FR-051
Users can edit savings goal targets, names, and completion dates.

Priority: Medium

---

### FR-052
Users can delete savings goals.

Priority: Medium

---

### FR-053
Users can track percentage progress and remaining balance toward each savings goal.

Priority: High

---

### FR-054
Users can manually update progress or record monetary contributions toward a savings goal.

Priority: High

---

### FR-055
Users can view goal achievement status (In Progress, Completed).

Priority: Medium

---

## Profile

### FR-060
Users can update profile information (display name, email address).

Priority: Medium

---

### FR-061
Users can upload a profile picture.

Priority: Low

---

### FR-062
Users can select a preferred currency symbol (e.g., $, €, £, ¥) for formatting visual displays across the application (without currency rate conversion).

Priority: Medium

---

### FR-063
Users can switch between light and dark mode themes.

Priority: Low

---

# Non-Functional Requirements

## Performance

Dashboard should load within two seconds under normal conditions.

## Security

Passwords must be securely hashed.

Authentication must protect all private routes.

## Reliability

No financial data should be lost during normal application usage.

## Maintainability

Code should follow clean architecture and modular design principles.

## Scalability

Architecture should support future feature expansion.

## Accessibility

Application should follow modern accessibility best practices.

## Responsiveness

Application must work correctly on desktop, tablet, and mobile devices.