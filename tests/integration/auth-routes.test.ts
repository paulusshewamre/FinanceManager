import { test, describe } from "node:test";
import assert from "node:assert";
import { proxy } from "../../proxy";
import { NextRequest } from "next/server";

describe("Authentication Routes & Session Middleware Integration", () => {
  test("allows public access to /login", () => {
    const req = new NextRequest("http://localhost:3000/login");
    const res = proxy(req);
    // Should not redirect to /login
    assert.strictEqual(res.headers.get("location"), null);
  });

  test("allows public access to /forgot-password", () => {
    const req = new NextRequest("http://localhost:3000/forgot-password");
    const res = proxy(req);
    assert.strictEqual(res.headers.get("location"), null);
  });

  test("allows public access to /reset-password", () => {
    const req = new NextRequest("http://localhost:3000/reset-password");
    const res = proxy(req);
    assert.strictEqual(res.headers.get("location"), null);
  });

  test("redirects unauthenticated access on protected /dashboard to /login", () => {
    const req = new NextRequest("http://localhost:3000/dashboard");
    const res = proxy(req);
    assert.strictEqual(res.status, 307);
    assert.ok(res.headers.get("location")?.includes("/login"));
  });

  test("returns 401 Unauthorized for unauthenticated API requests", async () => {
    const req = new NextRequest("http://localhost:3000/api/transactions");
    const res = proxy(req);
    assert.strictEqual(res.status, 401);
    const body = await res.json();
    assert.strictEqual(body.error.code, "UNAUTHENTICATED");
  });
});
