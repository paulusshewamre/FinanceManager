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
 * Accepts optional Request or Headers instance, defaulting to next/headers context.
 * Throws UnauthorizedError if no valid session cookie exists.
 */
export async function getAuthenticatedUserId(req?: Request | Headers): Promise<string> {
  try {
    let reqHeaders: Headers;
    if (req instanceof Headers) {
      reqHeaders = req;
    } else if (req && "headers" in req) {
      reqHeaders = req.headers;
    } else {
      reqHeaders = await headers();
    }

    const session = await auth.api.getSession({
      headers: reqHeaders,
    });

    if (!session || !session.user || !session.user.id) {
      throw new UnauthorizedError("Unauthenticated request");
    }

    return session.user.id;
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      throw error;
    }
    console.error("getAuthenticatedUserId execution error:", error);
    throw error;
  }
}
