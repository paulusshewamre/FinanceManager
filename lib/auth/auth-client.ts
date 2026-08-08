import { createAuthClient } from "better-auth/react";

/**
 * Authoritative Better Auth React Client.
 * Provides hooks and authentication methods for client components.
 */
export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
});

export const { useSession, signIn, signUp, signOut } = authClient;
