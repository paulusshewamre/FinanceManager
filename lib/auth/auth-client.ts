import { createAuthClient } from "better-auth/react";

/**
 * Authoritative Better Auth React Client.
 * Provides hooks and authentication methods for client components.
 * Omit baseURL to automatically use relative paths (/api/auth) on both localhost and Vercel.
 */
export const authClient = createAuthClient();

export const { useSession, signIn, signUp, signOut, requestPasswordReset, resetPassword } = authClient;
