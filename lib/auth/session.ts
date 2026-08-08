import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";

export class UnauthorizedError extends Error {
  constructor(message = "Authentication required") {
    super(message);
    this.name = "UnauthorizedError";
  }
}

/**
 * Guarantees a non-null userId for authenticated operations.
 * Throws UnauthorizedError if no valid session cookie exists.
 */
export async function getAuthenticatedUserId(): Promise<string> {
  const reqHeaders = await headers();
  const session = await auth.api.getSession({
    headers: reqHeaders,
  });

  if (!session || !session.user || !session.user.id) {
    throw new UnauthorizedError("Unauthenticated request");
  }

  return session.user.id;
}
