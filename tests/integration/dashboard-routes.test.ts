import test from "node:test";
import assert from "node:assert/strict";
import { auth } from "@/lib/auth/auth";
import { GET as getDashboard } from "@/app/api/dashboard/route";
import { GET as getAnalytics } from "@/app/api/analytics/route";
import prisma from "@/lib/db/prisma";

test("Dashboard & Analytics API Routes (TSK-060)", async (t) => {
  let userCookie = "";
  let userId = "";
  let categoryId = "";

  t.before(async () => {
    const testEmail = `dashboard_${Date.now()}@example.com`;
    const password = "TestPassword123!";

    const user = await auth.api.signUpEmail({
      body: {
        email: testEmail,
        password,
        name: "Dashboard Test User",
      },
      asResponse: true,
    });

    const setCookie = user.headers.get("set-cookie");
    assert.ok(setCookie, "Signup should return a set-cookie header");
    userCookie = setCookie.split(";")[0];

    const dbUser = await prisma.user.findUnique({
      where: { email: testEmail },
    });
    assert.ok(dbUser, "User should exist in database");
    userId = dbUser.id;

    // Seed test category
    const cat = await prisma.category.create({
      data: {
        userId,
        name: "Test Groceries",
        type: "EXPENSE",
        isSystemDefault: false,
      },
    });
    categoryId = cat.id;

    // Seed test transactions
    const now = new Date();
    await prisma.transaction.create({
      data: {
        userId,
        categoryId,
        amount: 500,
        type: "INCOME",
        transactionDate: now,
        merchantName: "Salary Deposit",
      },
    });

    await prisma.transaction.create({
      data: {
        userId,
        categoryId,
        amount: 150,
        type: "EXPENSE",
        transactionDate: now,
        merchantName: "Supermarket Purchase",
      },
    });

    // Seed test budget with 80%+ spend to trigger warning alert
    await prisma.budget.create({
      data: {
        userId,
        categoryId,
        amount: 150, // Spent $150 of $150 = 100% EXCEEDED
        month: now.getMonth() + 1,
        year: now.getFullYear(),
      },
    });
  });

  t.after(async () => {
    if (userId) {
      await prisma.transaction.deleteMany({ where: { userId } });
      await prisma.budget.deleteMany({ where: { userId } });
      await prisma.savingsGoal.deleteMany({ where: { userId } });
      await prisma.category.deleteMany({ where: { userId } });
      await prisma.session.deleteMany({ where: { userId } });
      await prisma.account.deleteMany({ where: { userId } });
      await prisma.user.delete({ where: { id: userId } });
    }
  });

  await t.test("returns 401 Unauthorized for unauthenticated GET /api/dashboard", async () => {
    const req = new Request("http://localhost:3000/api/dashboard", { method: "GET" });
    const res = await getDashboard(req);
    assert.equal(res.status, 401);
  });

  await t.test("GET /api/dashboard returns correct net balance, recent txs, and budget warnings", async () => {
    const req = new Request("http://localhost:3000/api/dashboard", {
      method: "GET",
      headers: { Cookie: userCookie },
    });

    const res = await getDashboard(req);
    assert.equal(res.status, 200);

    const body = await res.json();
    assert.ok(body.summary);
    assert.equal(body.summary.totalIncomeAllTime, 500);
    assert.equal(body.summary.totalExpenseAllTime, 150);
    assert.equal(body.summary.netBalance, 350); // $500 - $150 = $350

    assert.ok(Array.isArray(body.recentTransactions));
    assert.equal(body.recentTransactions.length, 2);

    assert.ok(Array.isArray(body.budgetAlerts));
    assert.equal(body.budgetAlerts.length, 1);
    assert.equal(body.budgetAlerts[0].status, "EXCEEDED");
  });

  await t.test("GET /api/analytics returns category breakdown and 6-month trends", async () => {
    const req = new Request("http://localhost:3000/api/analytics?months=6", {
      method: "GET",
      headers: { Cookie: userCookie },
    });

    const res = await getAnalytics(req);
    assert.equal(res.status, 200);

    const body = await res.json();
    assert.equal(body.monthsCount, 6);
    assert.ok(Array.isArray(body.categoryBreakdown));
    assert.ok(Array.isArray(body.monthlyTrends));
    assert.equal(body.monthlyTrends.length, 6);

    const currentMonthTrend = body.monthlyTrends[body.monthlyTrends.length - 1];
    assert.equal(currentMonthTrend.income, 500);
    assert.equal(currentMonthTrend.expense, 150);
    assert.equal(currentMonthTrend.net, 350);
  });
});
