import prisma from "@/lib/db/prisma";

/**
 * Utility function to warm up Neon DB connection with retries before integration test execution.
 */
export async function ensureDbConnected() {
  let attempts = 0;
  const maxAttempts = 3;

  while (attempts < maxAttempts) {
    try {
      attempts++;
      await prisma.user.findFirst({ select: { id: true } });
      return;
    } catch (err: any) {
      if (attempts < maxAttempts) {
        console.warn(`[ensureDbConnected] Connection attempt ${attempts} timed out. Retrying in 1s...`);
        await new Promise((r) => setTimeout(r, 1000));
      } else {
        throw err;
      }
    }
  }
}
