import { auth } from "@/lib/auth/auth";
import { toNextJsHandler } from "better-auth/next-js";

/**
 * Better Auth Route Handlers for Next.js App Router.
 * Serves authentication endpoints under /api/auth/*.
 */
export const { GET, POST } = toNextJsHandler(auth);
