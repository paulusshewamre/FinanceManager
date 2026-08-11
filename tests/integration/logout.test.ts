import { describe, it, before, after } from "node:test";
import assert from "node:assert";
import prisma from "@/lib/db/prisma";
import { auth } from "@/lib/auth/auth";
import { GET } from "@/app/api/categories/route";
import { NextRequest } from "next/server";

function extractCookieHeader(setCookieHeader: string | null): string {
  if (!setCookieHeader) return "";
  return setCookieHeader
    .split(/,\s(?=[a-zA-Z0-9_\-]+=)/)
    .map((c) => c.split(";")[0].trim())
    .filter(Boolean)
    .join("; ");
}

describe("Secure Logout Integration & DB Session Invalidation (Functionality 4)", () => {
  let testUserId: string;
  let testUserEmail = `logout-test-${Date.now()}@example.com`;
  let cookieHeader: string;
  let rawSetCookie: string;
  let tokenStr: string;

  before(async () => {
    // Warm up Neon DB connection to handle serverless cold-start wakeups
    await prisma.$queryRaw`SELECT 1`;

    // Sign up test user
    const res = await auth.api.signUpEmail({
      asResponse: true,
      body: {
        email: testUserEmail,
        password: "SecurePassword123!",
        name: "Logout Test User",
      },
    });

    rawSetCookie = res.headers.get("set-cookie") || "";
    cookieHeader = extractCookieHeader(rawSetCookie);
    const data = await res.json();
    testUserId = data.user.id;
    tokenStr = data.token;
  });

  after(async () => {
    // Clean up test user
    if (testUserId) {
      await prisma.user.delete({
        where: { id: testUserId },
      }).catch(() => {});
    }
  });

  it("verifies user is authenticated before logout", async () => {
    // Check that session exists in DB
    const activeSession = await prisma.session.findFirst({
      where: { userId: testUserId },
    });
    assert.ok(activeSession, "Session should exist in database prior to logout");

    // Check protected API access succeeds
    const req = new NextRequest("http://localhost:3000/api/categories", {
      headers: { cookie: cookieHeader },
    });
    const res = await GET(req);
    assert.strictEqual(res.status, 200, "Authenticated user should access protected API");
  });

  it("executes sign-out, deletes session row in DB, clears session cookie, and revokes access", async () => {
    // Call Better Auth signOut endpoint
    const signOutRes = await auth.api.signOut({
      asResponse: true,
      headers: {
        cookie: cookieHeader,
      },
    });

    assert.strictEqual(signOutRes.status, 200, "Sign-out response should be HTTP 200 OK");

    // Verify Set-Cookie header clears session cookie
    const clearCookieHeader = signOutRes.headers.get("set-cookie");
    assert.ok(clearCookieHeader, "Sign-out must set Set-Cookie header");
    assert.ok(
      clearCookieHeader.includes("better-auth.session_token=;") ||
        clearCookieHeader.includes("Max-Age=0") ||
        clearCookieHeader.includes("Expires=Thu, 01 Jan 1970"),
      "Set-Cookie must clear session_token"
    );

    // Verify session row is purged from PostgreSQL database
    const purgedSession = await prisma.session.findFirst({
      where: { userId: testUserId },
    });
    assert.strictEqual(purgedSession, null, "Session record must be deleted from database upon logout");

    // Verify subsequent API request with old session cookie is rejected with 401
    const revokedReq = new NextRequest("http://localhost:3000/api/categories", {
      headers: { cookie: cookieHeader },
    });
    const revokedRes = await GET(revokedReq);
    assert.strictEqual(revokedRes.status, 401, "Revoked session cookie must return 401 Unauthorized");
  });
});
