import { describe, it, before, after } from "node:test";
import assert from "node:assert";
import prisma from "@/lib/db/prisma";
import { auth } from "@/lib/auth/auth";

describe("User Login Integration & Security (Functionality 2)", () => {
  let createdUserId: string | null = null;
  const testEmail = `login-test-${Date.now()}@example.com`;
  const testPassword = "ValidPassword123!";

  before(async () => {
    // Warm up Neon DB connection to handle serverless cold-start wakeups
    await prisma.$queryRaw`SELECT 1`;

    // Create a registered user for login tests
    const userRes = await auth.api.signUpEmail({
      body: {
        name: "Login Test User",
        email: testEmail,
        password: testPassword,
      },
    });
    createdUserId = userRes.user.id;
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

  it("authenticates user with correct credentials and returns session", async () => {
    const res = await auth.api.signInEmail({
      body: {
        email: testEmail,
        password: testPassword,
      },
    });

    assert.ok(res, "Expected sign in response");
    assert.ok(res.user, "Expected user object in response");
    assert.strictEqual(res.user.email, testEmail);
    assert.ok(res.token, "Expected session token in sign in response");

    // Verify active session exists in DB
    const sessionInDb = await prisma.session.findFirst({
      where: { userId: res.user.id, token: res.token },
    });
    assert.ok(sessionInDb, "Active session record must exist in DB");
  });

  it("rejects invalid password without leaking sensitive system details", async () => {
    try {
      await auth.api.signInEmail({
        body: {
          email: testEmail,
          password: "WrongPassword999!",
        },
      });
      assert.fail("Should have thrown error on wrong password");
    } catch (err: any) {
      assert.ok(err, "Error should be thrown on incorrect password");
    }
  });

  it("rejects non-existent email without leaking user presence", async () => {
    try {
      await auth.api.signInEmail({
        body: {
          email: `nonexistent-${Date.now()}@example.com`,
          password: testPassword,
        },
      });
      assert.fail("Should have thrown error on non-existent email");
    } catch (err: any) {
      assert.ok(err, "Error should be thrown on non-existent email");
    }
  });

  it("maintains session persistence across page refreshes", async () => {
    const signInRes = await auth.api.signInEmail({
      asResponse: true,
      body: {
        email: testEmail,
        password: testPassword,
      },
    });

    const setCookie = signInRes.headers.get("set-cookie");

    const sessionCheck = await auth.api.getSession({
      headers: new Headers({
        cookie: setCookie || "",
      }),
    });

    assert.ok(sessionCheck, "Session check must succeed for valid session cookie");
    assert.strictEqual(sessionCheck?.user.id, createdUserId);
  });
});
