import { NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";
import { getAuthenticatedUserId, UnauthorizedError } from "@/lib/auth/session";

export async function DELETE(req: Request) {
  try {
    const userId = await getAuthenticatedUserId(req);

    // Enforce 7-table cascading hard purge per business rule BR-019
    await prisma.$transaction(
      async (tx) => {
        await tx.transaction.deleteMany({ where: { userId } });
        await tx.budget.deleteMany({ where: { userId } });
        await tx.savingsGoal.deleteMany({ where: { userId } });
        await tx.category.deleteMany({ where: { userId } });
        await tx.profile.deleteMany({ where: { userId } });
        await tx.session.deleteMany({ where: { userId } });
        await tx.account.deleteMany({ where: { userId } });
        await tx.user.delete({ where: { id: userId } });
      },
      {
        maxWait: 10000, // 10s max wait time for transaction connection
        timeout: 20000, // 20s execution timeout
      }
    );

    // Create expired session cookie headers to log out user immediately
    const response = NextResponse.json(
      { message: "Account and all associated financial data permanently deleted." },
      { status: 200 }
    );

    response.headers.append(
      "Set-Cookie",
      "better-auth.session_token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; SameSite=Lax"
    );
    response.headers.append(
      "Set-Cookie",
      "__Secure-better-auth.session_token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; Secure; SameSite=Lax"
    );

    return response;
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    console.error("DELETE /api/user/account error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
