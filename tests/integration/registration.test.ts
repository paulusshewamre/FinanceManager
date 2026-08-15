import { describe, it, before, after } from "node:test";
import assert from "node:assert";
import prisma from "@/lib/db/prisma";
import { auth } from "@/lib/auth/auth";

describe("User Registration Integration & DB Behavior (Functionality 1)", () => {
  let createdUserId: string | null = null;
  const testEmail = `registration-test-${Date.now()}@example.com`;

  before(async () => {
    // Warm up Neon DB connection to handle serverless cold-start wakeups
    await prisma.$queryRaw`SELECT 1`;
  });

  after(async () => {
    if (createdUserId) {
      try {
        await prisma.user.delete({
          where: { id: createdUserId },
        });
      } catch (e) {
        console.error("Cleanup error:", e);
      }
    }
  });

  it("successfully registers user, creates user, account, profile, and session records in database", async () => {
    const res = await auth.api.signUpEmail({
      body: {
        name: "Test Registration User",
        email: testEmail,
        password: "StrongPassword123!",
      },
    });

    assert.ok(res, "Expected response from signUpEmail");
    assert.ok(res.user, "Expected user object in response");
    assert.strictEqual(res.user.email, testEmail);
    assert.strictEqual(res.user.name, "Test Registration User");
    createdUserId = res.user.id;

    // Verify User record in DB
    const userInDb = await prisma.user.findUnique({
      where: { id: createdUserId },
    });
    assert.ok(userInDb, "User record must exist in DB");
    assert.strictEqual(userInDb?.email, testEmail);

    // Verify Account record in DB
    const accountInDb = await prisma.account.findFirst({
      where: { userId: createdUserId },
    });
    assert.ok(accountInDb, "Account record must exist in DB");
    assert.strictEqual(accountInDb?.providerId, "credential");
    assert.ok(accountInDb?.password, "Hashed password must exist in Account record");

    // Verify Profile record in DB (auto-created via databaseHook)
    const profileInDb = await prisma.profile.findUnique({
      where: { userId: createdUserId },
    });
    assert.ok(profileInDb, "Profile record must exist in DB");
    assert.strictEqual(profileInDb?.displayName, "Test Registration User");
    assert.strictEqual(profileInDb?.preferredCurrencySymbol, "Br");
    assert.strictEqual(profileInDb?.themePreference, "dark");

    // Verify Session record in DB
    const sessionInDb = await prisma.session.findFirst({
      where: { userId: createdUserId },
    });
    assert.ok(sessionInDb, "Session record must exist in DB");
    assert.ok(sessionInDb?.token, "Session token must exist");
  });

  it("prevents duplicate registration with existing email and returns error without orphan records", async () => {
    try {
      await auth.api.signUpEmail({
        body: {
          name: "Duplicate User Attempt",
          email: testEmail,
          password: "AnotherPassword123!",
        },
      });
      assert.fail("Should have thrown error on duplicate registration");
    } catch (err: any) {
      assert.ok(err, "Error should be thrown on duplicate email registration");
    }

    // Verify count of users with testEmail remains exactly 1
    const count = await prisma.user.count({
      where: { email: testEmail },
    });
    assert.strictEqual(count, 1, "Duplicate email registration must not create second user record");
  });
});
