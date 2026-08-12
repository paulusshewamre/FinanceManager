import { describe, it, before, after } from "node:test";
import assert from "node:assert";
import prisma from "@/lib/db/prisma";
import { auth } from "@/lib/auth/auth";
import { GET as getSavings, POST as createSavings } from "@/app/api/savings/route";
import { PUT as updateSavings, DELETE as deleteSavings } from "@/app/api/savings/[id]/route";
import { POST as contributeSavings } from "@/app/api/savings/[id]/contribute/route";

describe("Savings Goals API Routes & Atomic Contribution Engine (TSK-051)", () => {
  let userA: { id: string; cookie: string };
  let userB: { id: string; cookie: string };

  let goalAId: string;

  before(async () => {
    // Connection pool warmup
    for (let attempt = 1; attempt <= 5; attempt++) {
      try {
        await prisma.$queryRaw`SELECT 1`;
        break;
      } catch (err) {
        if (attempt === 5) throw err;
        await new Promise((r) => setTimeout(r, 1000 * attempt));
      }
    }

    // Register User A via Better Auth to obtain valid session cookie
    const emailA = `savings-api-usera-${Date.now()}@example.com`;
    const resA = await auth.api.signUpEmail({
      body: { email: emailA, password: "password123", name: "Savings User A" },
      asResponse: true,
    });
    const cookieA = resA.headers.get("set-cookie") || "";
    const dbUserA = await prisma.user.findUnique({ where: { email: emailA } });
    userA = { id: dbUserA!.id, cookie: cookieA };

    // Register User B via Better Auth to obtain valid session cookie
    const emailB = `savings-api-userb-${Date.now()}@example.com`;
    const resB = await auth.api.signUpEmail({
      body: { email: emailB, password: "password123", name: "Savings User B" },
      asResponse: true,
    });
    const cookieB = resB.headers.get("set-cookie") || "";
    const dbUserB = await prisma.user.findUnique({ where: { email: emailB } });
    userB = { id: dbUserB!.id, cookie: cookieB };
  });

  after(async () => {
    // Explicit cleanup for test users and records
    if (userA?.id) {
      await prisma.savingsGoal.deleteMany({ where: { userId: userA.id } }).catch(() => {});
      await prisma.session.deleteMany({ where: { userId: userA.id } }).catch(() => {});
      await prisma.user.delete({ where: { id: userA.id } }).catch(() => {});
    }
    if (userB?.id) {
      await prisma.savingsGoal.deleteMany({ where: { userId: userB.id } }).catch(() => {});
      await prisma.session.deleteMany({ where: { userId: userB.id } }).catch(() => {});
      await prisma.user.delete({ where: { id: userB.id } }).catch(() => {});
    }
  });

  it("returns 401 Unauthorized for unauthenticated requests", async () => {
    const unauthReq = new Request("http://localhost:3000/api/savings");
    const response = await getSavings(unauthReq);

    assert.strictEqual(response.status, 401);
  });

  it("POST /api/savings rejects zero or negative targetAmount (BR-014)", async () => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 30);

    const req = new Request("http://localhost:3000/api/savings", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: userA.cookie,
      },
      body: JSON.stringify({
        name: "Invalid Target Goal",
        targetAmount: 0,
        targetDate: futureDate.toISOString(),
      }),
    });

    const response = await createSavings(req);
    assert.strictEqual(response.status, 400);

    const json = await response.json();
    assert.strictEqual(json.error, "Validation error");
  });

  it("POST /api/savings rejects targetDate in the past (BR-015)", async () => {
    const pastDate = new Date("2020-01-01T00:00:00.000Z");

    const req = new Request("http://localhost:3000/api/savings", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: userA.cookie,
      },
      body: JSON.stringify({
        name: "Past Date Goal",
        targetAmount: 1000,
        targetDate: pastDate.toISOString(),
      }),
    });

    const response = await createSavings(req);
    assert.strictEqual(response.status, 400);

    const json = await response.json();
    assert.strictEqual(json.error, "Validation error");
  });

  it("POST /api/savings creates a savings goal for authenticated user", async () => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 60);

    const req = new Request("http://localhost:3000/api/savings", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: userA.cookie,
      },
      body: JSON.stringify({
        name: "Vacation Fund",
        targetAmount: 1000,
        targetDate: futureDate.toISOString(),
      }),
    });

    const response = await createSavings(req);
    assert.strictEqual(response.status, 201);

    const json = await response.json();
    assert.ok(json.id);
    goalAId = json.id;
    assert.strictEqual(json.name, "Vacation Fund");
    assert.strictEqual(json.targetAmount, 1000);
    assert.strictEqual(json.accumulatedBalance, 0);
    assert.strictEqual(json.percentage, 0);
    assert.strictEqual(json.status, "IN_PROGRESS");
  });

  it("GET /api/savings returns goals and summary stats for authenticated user", async () => {
    const req = new Request("http://localhost:3000/api/savings", {
      method: "GET",
      headers: {
        Cookie: userA.cookie,
      },
    });

    const response = await getSavings(req);
    assert.strictEqual(response.status, 200);

    const json = await response.json();
    assert.ok(json.summary);
    assert.ok(Array.isArray(json.goals));
    assert.strictEqual(json.goals.length, 1);
    assert.strictEqual(json.goals[0].id, goalAId);
  });

  it("POST /api/savings/[id]/contribute atomically increments balance and auto-completes status (BR-016)", async () => {
    // Contribute $600 towards $1000 goal
    const req1 = new Request(`http://localhost:3000/api/savings/${goalAId}/contribute`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: userA.cookie,
      },
      body: JSON.stringify({ amount: 600 }),
    });

    const res1 = await contributeSavings(req1, { params: Promise.resolve({ id: goalAId }) });
    assert.strictEqual(res1.status, 200);

    const json1 = await res1.json();
    assert.strictEqual(json1.accumulatedBalance, 600);
    assert.strictEqual(json1.percentage, 60);
    assert.strictEqual(json1.status, "IN_PROGRESS");

    // Contribute remaining $400 towards $1000 goal (reaching target balance)
    const req2 = new Request(`http://localhost:3000/api/savings/${goalAId}/contribute`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: userA.cookie,
      },
      body: JSON.stringify({ amount: 400 }),
    });

    const res2 = await contributeSavings(req2, { params: Promise.resolve({ id: goalAId }) });
    assert.strictEqual(res2.status, 200);

    const json2 = await res2.json();
    assert.strictEqual(json2.accumulatedBalance, 1000);
    assert.strictEqual(json2.percentage, 100);
    assert.strictEqual(json2.status, "COMPLETED");
  });

  it("PUT /api/savings/[id] prevents User B from modifying User A's savings goal (Multi-tenant lock)", async () => {
    const req = new Request(`http://localhost:3000/api/savings/${goalAId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Cookie: userB.cookie,
      },
      body: JSON.stringify({ name: "Hacked Goal Name" }),
    });

    const response = await updateSavings(req, { params: Promise.resolve({ id: goalAId }) });
    assert.strictEqual(response.status, 404);
  });

  it("POST /api/savings/[id]/contribute prevents User B from contributing to User A's savings goal (Multi-tenant lock)", async () => {
    const req = new Request(`http://localhost:3000/api/savings/${goalAId}/contribute`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: userB.cookie,
      },
      body: JSON.stringify({ amount: 500 }),
    });

    const response = await contributeSavings(req, { params: Promise.resolve({ id: goalAId }) });
    assert.strictEqual(response.status, 404);
  });

  it("DELETE /api/savings/[id] prevents User B from deleting User A's savings goal (Multi-tenant lock)", async () => {
    const req = new Request(`http://localhost:3000/api/savings/${goalAId}`, {
      method: "DELETE",
      headers: {
        Cookie: userB.cookie,
      },
    });

    const response = await deleteSavings(req, { params: Promise.resolve({ id: goalAId }) });
    assert.strictEqual(response.status, 404);
  });

  it("DELETE /api/savings/[id] deletes savings goal when authenticated owner", async () => {
    const req = new Request(`http://localhost:3000/api/savings/${goalAId}`, {
      method: "DELETE",
      headers: {
        Cookie: userA.cookie,
      },
    });

    const response = await deleteSavings(req, { params: Promise.resolve({ id: goalAId }) });
    assert.strictEqual(response.status, 200);

    const json = await response.json();
    assert.strictEqual(json.success, true);
  });
});
