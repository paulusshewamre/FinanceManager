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

    let session: any = null;
    let attempts = 0;
    const maxAttempts = 3;

    while (attempts < maxAttempts) {
      try {
        attempts++;
        session = await auth.api.getSession({
          headers: reqHeaders,
        });
        break;
      } catch (err: any) {
        // Handle database cold-start timeouts or transient connection pool delays
        const isTransientError =
          err?.code === "ETIMEDOUT" ||
          err?.message?.includes("ETIMEDOUT") ||
          err?.message?.includes("connection") ||
          err?.status === "INTERNAL_SERVER_ERROR" ||
          err?.body?.code === "FAILED_TO_GET_SESSION";

        if (isTransientError && attempts < maxAttempts) {
          const delay = attempts * 500;
          console.warn(`[getAuthenticatedUserId] Session lookup attempt ${attempts} encountered transient DB delay. Retrying in ${delay}ms...`);
          await new Promise((r) => setTimeout(r, delay));
          continue;
        }
        throw err;
      }
    }

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
