# Business Rules

## BR-001

Every registered user must have a unique email address.

---

## BR-002

Each transaction belongs to exactly one authenticated user.

---

## BR-003

Every transaction must belong to exactly one category.

---

## BR-004

Transaction amounts must be greater than zero.

---

## BR-005

Every transaction must be classified as either Income or Expense.

---

## BR-006

Adding, editing, or deleting a transaction (including historical backdated entries) immediately triggers dynamic recalculation of dashboard totals, monthly summaries, and affected budget progress.

---

## BR-007

Budget progress is automatically recalculated whenever transactions change.

---

## BR-008

Users cannot access another user's financial information.

---

## BR-009

Savings goals must have positive target values.

---

## BR-010

Only authenticated users may create, edit, or delete financial data.

---

## BR-011

Deleted transactions cannot be recovered.

---

## BR-012

All timestamps should be stored using UTC.

---

## BR-013

Custom categories can only be deleted after all associated transactions are reassigned to another active category or moved to a system default "Uncategorized" category.

---

## BR-014

A budget applies to one category during one calendar month.

---

## BR-015

Dashboard summaries are generated dynamically from transaction data.

---

## BR-016

Savings goal progress is updated via explicit progress entries or contributions; progress percentages are calculated dynamically based on target amounts.

---

## BR-017

The system provides pre-seeded read-only default categories for common income and expense types; user-created custom categories may be edited or deleted by the owning user.

---

## BR-018

Preferred currency settings control display formatting symbols globally and do not execute exchange rate conversions.

---

## BR-019

Account deletion permanently purges all user profile information, transactions, budgets, categories, and savings goals, and cannot be undone.

---

## BR-020

Total account balance is calculated as cumulative income minus cumulative expenses; when total expenses exceed income, the balance shall be presented as a negative value formatted according to the user's preferred currency symbol.