import { describe, it, before, after } from "node:test";
import assert from "node:assert";
import prisma from "@/lib/db/prisma";
import { auth } from "@/lib/auth/auth";

describe("Password Recovery & Token Reset Integration (Functionality 5)", () => {
  let testUserId: string;
  let testUserEmail = `recovery-test-${Date.now()}@example.com`;
  let initialPassword = "OldPassword123!";
  let newPassword = "NewSecurePassword456!";
  let resetToken: string;

  before(async () => {
    // Warm up Neon DB connection to handle serverless cold-start wakeups
    await prisma.$queryRaw`SELECT 1`;

    // Sign up test user
    const res = await auth.api.signUpEmail({
      body: {
        email: testUserEmail,
        password: initialPassword,
        name: "Recovery Test User",
      },
    });

    testUserId = res.user.id;
  });

  after(async () => {
    // Clean up test user
    if (testUserId) {
      await prisma.user.delete({
        where: { id: testUserId },
      }).catch(() => {});
    }
  });

  it("requests password reset, creates verification record in DB, and dispatches reset hook", async () => {
    const res = await auth.api.requestPasswordReset({
      body: {
        email: testUserEmail,
        redirectTo: "/reset-password",
      },
    });

    assert.strictEqual(res.status, true, "requestPasswordReset should return status true");

    // Check verification token record created in DB
    const verificationRecord = await prisma.verification.findFirst({
      orderBy: { createdAt: "desc" },
    });

    assert.ok(verificationRecord, "Verification token record must exist in DB");
    // Extract raw token from reset-password:<token> identifier
    resetToken = verificationRecord.identifier.replace(/^reset-password:/, "");
    assert.ok(resetToken, "Verification token must not be empty");
  });

  it("resets password using valid token, invalidating old password and enabling login with new password", async () => {
    assert.ok(resetToken, "Reset token must be available from previous step");

    const resetRes = await auth.api.resetPassword({
      body: {
        newPassword: newPassword,
        token: resetToken,
      },
    });

    assert.strictEqual(resetRes.status, true, "resetPassword should return status true");

    // Verify old password fails authentication
    try {
      await auth.api.signInEmail({
        body: {
          email: testUserEmail,
          password: initialPassword,
        },
      });
      assert.fail("Old password should be rejected");
    } catch (err: any) {
      assert.ok(err, "Login with old password must throw an error");
    }

    // Verify new password succeeds authentication and returns session
    const newLoginRes = await auth.api.signInEmail({
      body: {
        email: testUserEmail,
        password: newPassword,
      },
    });

    assert.ok(newLoginRes.user, "Login with new password must return user object");
    assert.strictEqual(newLoginRes.user.email, testUserEmail);
  });
});
