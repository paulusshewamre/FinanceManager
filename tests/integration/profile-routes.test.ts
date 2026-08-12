import { describe, it, before, after } from "node:test";
import assert from "node:assert";
import prisma from "@/lib/db/prisma";
import { auth } from "@/lib/auth/auth";
import { GET as getProfile, PUT as updateProfile } from "@/app/api/user/profile/route";
import { DELETE as deleteAccount } from "@/app/api/user/account/route";
import { ensureDbConnected } from "../test-utils";
import { NextRequest } from "next/server";

function extractCookieHeader(setCookieHeader: string | null): string {
  if (!setCookieHeader) return "";
  return setCookieHeader
    .split(/,\s(?=[a-zA-Z0-9_\-]+=)/)
    .map((c) => c.split(";")[0].trim())
    .filter(Boolean)
    .join("; ");
}

describe("Profile Settings & Account Purge API Routes (TSK-070)", () => {
  let testUserId: string;
  let testUserEmail = `test-profile-${Date.now()}@example.com`;
  let cookieHeader: string;

  before(async () => {
    await ensureDbConnected();

    // Register test user
    const authRes = await auth.api.signUpEmail({
      asResponse: true,
      body: {
        email: testUserEmail,
        password: "SecurePassword123!",
        name: "Test Profile User",
      },
    });

    cookieHeader = extractCookieHeader(authRes.headers.get("set-cookie"));
    const data = await authRes.json();
    testUserId = data.user.id;
  });

  after(async () => {
    if (testUserId) {
      await prisma.user.delete({
        where: { id: testUserId },
      }).catch(() => {});
    }
  });

  it("returns 401 Unauthorized for unauthenticated profile GET request", async () => {
    const req = new NextRequest("http://localhost:3000/api/user/profile");
    const res = await getProfile(req);
    assert.strictEqual(res.status, 401);
  });

  it("GET /api/user/profile returns user details and default profile", async () => {
    const req = new NextRequest("http://localhost:3000/api/user/profile", {
      headers: { cookie: cookieHeader },
    });
    const res = await getProfile(req);
    assert.strictEqual(res.status, 200);

    const body = await res.json();
    assert.strictEqual(body.user.email, testUserEmail);
    assert.strictEqual(body.profile.preferredCurrencySymbol, "$");
    assert.strictEqual(body.profile.themePreference, "dark");
  });

  it("PUT /api/user/profile rejects invalid currency symbols (BR-018)", async () => {
    const req = new NextRequest("http://localhost:3000/api/user/profile", {
      method: "PUT",
      headers: {
        cookie: cookieHeader,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        preferredCurrencySymbol: "BTC", // Invalid currency
      }),
    });
    const res = await updateProfile(req);
    assert.strictEqual(res.status, 400);

    const body = await res.json();
    assert.strictEqual(body.error, "Validation error");
  });

  it("PUT /api/user/profile updates preferred currency symbol to € and display name", async () => {
    const req = new NextRequest("http://localhost:3000/api/user/profile", {
      method: "PUT",
      headers: {
        cookie: cookieHeader,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        displayName: "Updated Profile User",
        preferredCurrencySymbol: "€",
      }),
    });
    const res = await updateProfile(req);
    assert.strictEqual(res.status, 200);

    const body = await res.json();
    assert.strictEqual(body.profile.displayName, "Updated Profile User");
    assert.strictEqual(body.profile.preferredCurrencySymbol, "€");
  });

  it("DELETE /api/user/account executes 7-table cascading hard purge (BR-019)", async () => {
    // Create test user financial records to verify purge
    const category = await prisma.category.create({
      data: {
        userId: testUserId,
        name: "Purge Test Category",
        type: "EXPENSE",
      },
    });

    await prisma.transaction.create({
      data: {
        userId: testUserId,
        categoryId: category.id,
        amount: 150.0,
        type: "EXPENSE",
        transactionDate: new Date(),
      },
    });

    await prisma.savingsGoal.create({
      data: {
        userId: testUserId,
        name: "Purge Goal",
        targetAmount: 500.0,
        targetDate: new Date(Date.now() + 86400000),
      },
    });

    const req = new NextRequest("http://localhost:3000/api/user/account", {
      method: "DELETE",
      headers: { cookie: cookieHeader },
    });
    const res = await deleteAccount(req);
    assert.strictEqual(res.status, 200);

    // Verify 7-table hard purge in DB
    const deletedUser = await prisma.user.findUnique({ where: { id: testUserId } });
    assert.strictEqual(deletedUser, null);

    const userTxs = await prisma.transaction.findMany({ where: { userId: testUserId } });
    assert.strictEqual(userTxs.length, 0);

    const userCategories = await prisma.category.findMany({ where: { userId: testUserId } });
    assert.strictEqual(userCategories.length, 0);

    const userSavings = await prisma.savingsGoal.findMany({ where: { userId: testUserId } });
    assert.strictEqual(userSavings.length, 0);

    // Mark testUserId null so after() cleanup doesn't error
    testUserId = "";
  });
});
