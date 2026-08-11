import { describe, it } from "node:test";
import assert from "node:assert";
import { sendPasswordResetEmail } from "@/lib/email";

describe("Resend Email Service Integration", () => {
  it("logs reset link safely when RESEND_API_KEY is not set", async () => {
    const res = await sendPasswordResetEmail({
      to: "test-user@example.com",
      url: "http://localhost:3000/reset-password?token=mocktoken123",
      userName: "Test User",
    });

    assert.strictEqual(res.success, true);
    // When RESEND_API_KEY is not set in env, it falls back safely to 'log' mode
    if (!process.env.RESEND_API_KEY) {
      assert.strictEqual(res.mode, "log");
    } else {
      assert.strictEqual(res.mode, "resend");
    }
  });
});
