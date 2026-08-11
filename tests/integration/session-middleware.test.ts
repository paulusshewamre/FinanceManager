import { describe, it, before, after } from "node:test";
import assert from "node:assert";
import prisma from "@/lib/db/prisma";
import { auth } from "@/lib/auth/auth";
import { proxy } from "../../proxy";
import { NextRequest } from "next/server";
import { GET, POST } from "@/app/api/categories/route";
import { PUT, DELETE } from "@/app/api/categories/[id]/route";
import { CategoryType } from "@prisma/client";

function extractCookieHeader(setCookieHeader: string | null): string {
  if (!setCookieHeader) return "";
  // Extract name=value pair from each Set-Cookie entry
  return setCookieHeader
    .split(/,\s(?=[a-zA-Z0-9_\-]+=)/)
    .map((c) => c.split(";")[0].trim())
    .filter(Boolean)
    .join("; ");
}

describe("Session Middleware & Multi-Tenant Protection (Functionality 3)", () => {
  let userAId: string;
  let userBId: string;
  let userACookie: string;
  let userBCookie: string;
  let userACategoryId: string;

  before(async () => {
    // Warm up Neon DB connection to handle serverless cold-start wakeups
    await prisma.$queryRaw`SELECT 1`;

    // Create User A
    const resA = await auth.api.signUpEmail({
      asResponse: true,
      body: {
        name: "User A",
        email: `userA-${Date.now()}@example.com`,
        password: "PasswordUserA123!",
      },
    });
    userACookie = extractCookieHeader(resA.headers.get("set-cookie"));
    const userAData = await resA.json();
    userAId = userAData.user.id;

    // Create User B
    const resB = await auth.api.signUpEmail({
      asResponse: true,
      body: {
        name: "User B",
        email: `userB-${Date.now()}@example.com`,
        password: "PasswordUserB123!",
      },
    });
    userBCookie = extractCookieHeader(resB.headers.get("set-cookie"));
    const userBData = await resB.json();
    userBId = userBData.user.id;

    // Create a custom category owned by User A
    const catA = await prisma.category.create({
      data: {
        name: "User A Custom Cat",
        type: CategoryType.EXPENSE,
        userId: userAId,
        isSystemDefault: false,
      },
    });
    userACategoryId = catA.id;
  });

  after(async () => {
    // Clean up test users
    if (userAId) {
      await prisma.user.delete({ where: { id: userAId } }).catch(() => {});
    }
    if (userBId) {
      await prisma.user.delete({ where: { id: userBId } }).catch(() => {});
    }
  });

  it("allows public access to all public pages without authentication", () => {
    const publicPaths = ["/", "/login", "/register", "/forgot-password", "/reset-password"];
    for (const path of publicPaths) {
      const req = new NextRequest(`http://localhost:3000${path}`);
      const res = proxy(req);
      assert.strictEqual(res.headers.get("location"), null, `Path ${path} should be accessible publicly`);
    }
  });

  it("redirects unauthenticated access on protected pages to /login with redirectTo parameter", () => {
    const protectedPages = ["/dashboard", "/categories", "/settings"];
    for (const path of protectedPages) {
      const req = new NextRequest(`http://localhost:3000${path}`);
      const res = proxy(req);
      assert.strictEqual(res.status, 307);
      const redirectUrl = res.headers.get("location");
      assert.ok(redirectUrl?.includes(`/login?redirectTo=${encodeURIComponent(path)}`));
    }
  });

  it("returns 401 Unauthorized with correct JSON for unauthenticated API requests", async () => {
    const req = new NextRequest("http://localhost:3000/api/categories");
    const res = proxy(req);
    assert.strictEqual(res.status, 401);
    const body = await res.json();
    assert.strictEqual(body.error.code, "UNAUTHENTICATED");
    assert.strictEqual(body.error.message, "Authentication required");
  });

  it("allows access to protected pages when valid session cookie is present", () => {
    const req = new NextRequest("http://localhost:3000/dashboard", {
      headers: {
        cookie: userACookie,
      },
    });
    const res = proxy(req);
    assert.strictEqual(res.headers.get("location"), null);
  });

  it("enforces multi-tenant isolation: User B cannot access or modify User A's custom category", async () => {
    // User B tries to view categories -> User A's custom category must NOT be included
    const getReq = new NextRequest("http://localhost:3000/api/categories", {
      headers: {
        cookie: userBCookie,
      },
    });
    const getRes = await GET(getReq);
    assert.strictEqual(getRes.status, 200);
    const userBCategories = await getRes.json();
    assert.ok(Array.isArray(userBCategories), "Expected array of categories for User B");
    const foundUserACat = userBCategories.find((c: any) => c.id === userACategoryId);
    assert.strictEqual(foundUserACat, undefined, "User B should not see User A's custom category");

    // User B tries to PUT (update) User A's category -> Returns 403 Forbidden
    const putReq = new NextRequest(`http://localhost:3000/api/categories/${userACategoryId}`, {
      method: "PUT",
      headers: {
        "content-type": "application/json",
        cookie: userBCookie,
      },
      body: JSON.stringify({
        name: "Hacked Category Name",
        type: CategoryType.EXPENSE,
      }),
    });
    const putRes = await PUT(putReq, { params: Promise.resolve({ id: userACategoryId }) });
    assert.strictEqual(putRes.status, 403);
    const putBody = await putRes.json();
    assert.ok(putBody.error.includes("Forbidden"));

    // User B tries to DELETE User A's category -> Returns 403 Forbidden
    const delReq = new NextRequest(`http://localhost:3000/api/categories/${userACategoryId}`, {
      method: "DELETE",
      headers: {
        cookie: userBCookie,
      },
    });
    const delRes = await DELETE(delReq, { params: Promise.resolve({ id: userACategoryId }) });
    assert.strictEqual(delRes.status, 403);
    const delBody = await delRes.json();
    assert.ok(delBody.error.includes("Forbidden"));
  });
});
