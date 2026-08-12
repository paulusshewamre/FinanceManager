import { describe, it, before, after } from "node:test";
import assert from "node:assert";
import prisma from "@/lib/db/prisma";
import { auth } from "@/lib/auth/auth";
import { GET, POST } from "@/app/api/categories/route";
import { PUT, DELETE } from "@/app/api/categories/[id]/route";
import { CategoryType } from "@prisma/client";
import { proxy } from "../../proxy";
import { NextRequest } from "next/server";

import { ensureDbConnected } from "../test-utils";

function extractCookieHeader(setCookieHeader: string | null): string {
  if (!setCookieHeader) return "";
  return setCookieHeader
    .split(/,\s(?=[a-zA-Z0-9_\-]+=)/)
    .map((c) => c.split(";")[0].trim())
    .filter(Boolean)
    .join("; ");
}

describe("Category API Routes (TSK-021)", () => {
  let testUserId: string;
  let testUserEmail = `test-cat-${Date.now()}@example.com`;
  let cookieHeader: string;
  let customCategoryId: string;

  before(async () => {
    // Warm up Neon DB connection to handle serverless cold-start wakeups
    await ensureDbConnected();

    // Register user via Better Auth API to ensure valid session
    const authRes = await auth.api.signUpEmail({
      asResponse: true,
      body: {
        email: testUserEmail,
        password: "SecurePassword123!",
        name: "Test Category User",
      },
    });

    cookieHeader = extractCookieHeader(authRes.headers.get("set-cookie"));
    const data = await authRes.json();
    testUserId = data.user.id;
  });

  after(async () => {
    // Clean up test user (cascade deletes session, profile, custom categories)
    if (testUserId) {
      await prisma.user.delete({
        where: { id: testUserId },
      }).catch(() => {});
    }
  });

  it("returns 401 Unauthorized for unauthenticated requests via proxy", async () => {
    const req = new NextRequest("http://localhost:3000/api/categories");
    const res = proxy(req);
    assert.strictEqual(res.status, 401);
    const body = await res.json();
    assert.strictEqual(body.error.code, "UNAUTHENTICATED");
  });

  it("POST /api/categories creates a custom category when authenticated", async () => {
    const req = new NextRequest("http://localhost:3000/api/categories", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        cookie: cookieHeader,
      },
      body: JSON.stringify({
        name: "Fitness",
        type: CategoryType.EXPENSE,
      }),
    });

    const res = await POST(req);
    assert.strictEqual(res.status, 201);
    const body = await res.json();
    assert.strictEqual(body.name, "Fitness");
    assert.strictEqual(body.type, "EXPENSE");
    assert.strictEqual(body.isSystemDefault, false);
    assert.strictEqual(body.userId, testUserId);
    customCategoryId = body.id;
  });

  it("POST /api/categories prevents duplicate category name for same type", async () => {
    const req = new NextRequest("http://localhost:3000/api/categories", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        cookie: cookieHeader,
      },
      body: JSON.stringify({
        name: "Fitness",
        type: CategoryType.EXPENSE,
      }),
    });

    const res = await POST(req);
    assert.strictEqual(res.status, 409);
    const body = await res.json();
    assert.ok(body.error.includes("already exists"));
  });

  it("GET /api/categories returns system defaults and user custom categories", async () => {
    const req = new NextRequest("http://localhost:3000/api/categories", {
      headers: {
        cookie: cookieHeader,
      },
    });

    const res = await GET(req);
    assert.strictEqual(res.status, 200);
    const categories = await res.json();
    assert.ok(Array.isArray(categories));
    
    // Must contain Groceries (system default) and Fitness (custom)
    const groceries = categories.find((c: any) => c.name === "Groceries");
    const fitness = categories.find((c: any) => c.name === "Fitness");
    assert.ok(groceries);
    assert.strictEqual(groceries.isSystemDefault, true);
    assert.ok(fitness);
    assert.strictEqual(fitness.id, customCategoryId);
  });

  it("PUT /api/categories/[id] updates user custom category", async () => {
    const req = new NextRequest(`http://localhost:3000/api/categories/${customCategoryId}`, {
      method: "PUT",
      headers: {
        "content-type": "application/json",
        cookie: cookieHeader,
      },
      body: JSON.stringify({
        name: "Gym & Health",
        type: CategoryType.EXPENSE,
      }),
    });

    const res = await PUT(req, { params: Promise.resolve({ id: customCategoryId }) });
    assert.strictEqual(res.status, 200);
    const body = await res.json();
    assert.strictEqual(body.name, "Gym & Health");
  });

  it("PUT /api/categories/[id] prevents modifying system default categories", async () => {
    const defaultCat = await prisma.category.findFirst({
      where: { isSystemDefault: true },
    });
    assert.ok(defaultCat);

    const req = new NextRequest(`http://localhost:3000/api/categories/${defaultCat.id}`, {
      method: "PUT",
      headers: {
        "content-type": "application/json",
        cookie: cookieHeader,
      },
      body: JSON.stringify({
        name: "Modified System Name",
        type: CategoryType.EXPENSE,
      }),
    });

    const res = await PUT(req, { params: Promise.resolve({ id: defaultCat.id }) });
    assert.strictEqual(res.status, 403);
    const body = await res.json();
    assert.ok(body.error.includes("System default categories cannot be modified"));
  });

  it("DELETE /api/categories/[id] prevents deleting system default categories", async () => {
    const defaultCat = await prisma.category.findFirst({
      where: { isSystemDefault: true },
    });
    assert.ok(defaultCat);

    const req = new NextRequest(`http://localhost:3000/api/categories/${defaultCat.id}`, {
      method: "DELETE",
      headers: {
        cookie: cookieHeader,
      },
    });

    const res = await DELETE(req, { params: Promise.resolve({ id: defaultCat.id }) });
    assert.strictEqual(res.status, 403);
    const body = await res.json();
    assert.ok(body.error.includes("System default categories cannot be deleted"));
  });

  it("DELETE /api/categories/[id] deletes user custom category", async () => {
    const req = new NextRequest(`http://localhost:3000/api/categories/${customCategoryId}`, {
      method: "DELETE",
      headers: {
        cookie: cookieHeader,
      },
    });

    const res = await DELETE(req, { params: Promise.resolve({ id: customCategoryId }) });
    assert.strictEqual(res.status, 200);
    const body = await res.json();
    assert.strictEqual(body.message, "Category deleted successfully");

    const deleted = await prisma.category.findUnique({
      where: { id: customCategoryId },
    });
    assert.strictEqual(deleted, null);
  });
});
