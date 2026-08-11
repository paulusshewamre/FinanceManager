import { test, describe } from "node:test";
import assert from "node:assert";
import {
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  registerSchema,
} from "../../lib/validations/auth";

describe("Authentication Zod Schemas", () => {
  describe("registerSchema", () => {
    test("validates valid registration input and trims strings", () => {
      const valid = registerSchema.safeParse({
        name: "  Jane Doe  ",
        email: "  jane@example.com  ",
        password: "securePassword123!",
        confirmPassword: "securePassword123!",
      });
      assert.strictEqual(valid.success, true);
      if (valid.success) {
        assert.strictEqual(valid.data.name, "Jane Doe");
        assert.strictEqual(valid.data.email, "jane@example.com");
      }
    });

    test("fails on short name", () => {
      const invalid = registerSchema.safeParse({
        name: "A",
        email: "jane@example.com",
        password: "securePassword123!",
        confirmPassword: "securePassword123!",
      });
      assert.strictEqual(invalid.success, false);
    });

    test("fails on invalid email format", () => {
      const invalid = registerSchema.safeParse({
        name: "Jane Doe",
        email: "invalid-email-address",
        password: "securePassword123!",
        confirmPassword: "securePassword123!",
      });
      assert.strictEqual(invalid.success, false);
    });

    test("fails on password shorter than 8 characters", () => {
      const invalid = registerSchema.safeParse({
        name: "Jane Doe",
        email: "jane@example.com",
        password: "short",
        confirmPassword: "short",
      });
      assert.strictEqual(invalid.success, false);
    });

    test("fails when passwords do not match", () => {
      const invalid = registerSchema.safeParse({
        name: "Jane Doe",
        email: "jane@example.com",
        password: "securePassword123!",
        confirmPassword: "differentPassword123!",
      });
      assert.strictEqual(invalid.success, false);
    });
  });
  describe("loginSchema", () => {
    test("validates valid email and password", () => {
      const valid = loginSchema.safeParse({
        email: "user@example.com",
        password: "securepassword123",
        rememberMe: true,
      });
      assert.strictEqual(valid.success, true);
    });

    test("fails on invalid email format", () => {
      const invalid = loginSchema.safeParse({
        email: "invalid-email",
        password: "password123",
      });
      assert.strictEqual(invalid.success, false);
      if (!invalid.success) {
        assert.strictEqual(
          invalid.error.issues[0].message,
          "Please enter a valid email address"
        );
      }
    });

    test("fails on empty password", () => {
      const invalid = loginSchema.safeParse({
        email: "user@example.com",
        password: "",
      });
      assert.strictEqual(invalid.success, false);
      if (!invalid.success) {
        assert.strictEqual(
          invalid.error.issues[0].message,
          "Password is required"
        );
      }
    });
  });

  describe("forgotPasswordSchema", () => {
    test("validates valid email", () => {
      const valid = forgotPasswordSchema.safeParse({
        email: "reset@example.com",
      });
      assert.strictEqual(valid.success, true);
    });

    test("rejects malformed email", () => {
      const invalid = forgotPasswordSchema.safeParse({
        email: "not-an-email",
      });
      assert.strictEqual(invalid.success, false);
    });
  });

  describe("resetPasswordSchema", () => {
    test("validates matching passwords with 8+ characters", () => {
      const valid = resetPasswordSchema.safeParse({
        password: "newSecretPassword123",
        confirmPassword: "newSecretPassword123",
      });
      assert.strictEqual(valid.success, true);
    });

    test("fails when password is too short", () => {
      const invalid = resetPasswordSchema.safeParse({
        password: "short",
        confirmPassword: "short",
      });
      assert.strictEqual(invalid.success, false);
    });

    test("fails when passwords do not match", () => {
      const invalid = resetPasswordSchema.safeParse({
        password: "newSecretPassword123",
        confirmPassword: "differentPassword123",
      });
      assert.strictEqual(invalid.success, false);
      if (!invalid.success) {
        assert.strictEqual(
          invalid.error.issues[0].message,
          "Passwords do not match"
        );
      }
    });
  });
});
