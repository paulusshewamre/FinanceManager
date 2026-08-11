import { Resend } from "resend";

const resendApiKey = process.env.RESEND_API_KEY;
const resend = resendApiKey ? new Resend(resendApiKey) : null;
const emailFrom = process.env.EMAIL_FROM || "Finance Manager <onboarding@resend.dev>";

interface SendPasswordResetParams {
  to: string;
  url: string;
  userName?: string;
}

export async function sendPasswordResetEmail({ to, url, userName }: SendPasswordResetParams) {
  if (!resend) {
    console.log(`[AUTH LOG] RESEND_API_KEY is missing. Reset link for ${to}: ${url}`);
    return { success: true, mode: "log" };
  }

  const displayName = userName || to.split("@")[0];

  try {
    const { data, error } = await resend.emails.send({
      from: emailFrom,
      to: [to],
      subject: "Reset your Finance Manager password",
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <style>
              body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #0f1418; color: #dee3e8; margin: 0; padding: 24px; }
              .container { max-width: 560px; margin: 0 auto; background-color: #1b2024; border: 1px solid #303539; border-radius: 12px; padding: 32px; }
              h1 { color: #dee3e8; font-size: 24px; margin-top: 0; }
              p { color: #94a3b8; font-size: 15px; line-height: 1.6; }
              .button { display: inline-block; background-color: #38bdf8; color: #001e2c; font-weight: 600; text-decoration: none; padding: 12px 24px; border-radius: 8px; margin: 20px 0; }
              .footer { margin-top: 24px; font-size: 12px; color: #64748b; text-align: center; }
            </style>
          </head>
          <body>
            <div class="container">
              <h1>Password Reset Request</h1>
              <p>Hi ${displayName},</p>
              <p>We received a request to reset your password for your Finance Manager account. Click the button below to set a new password:</p>
              <a href="${url}" class="button">Reset Password</a>
              <p>If you didn't request a password reset, you can safely ignore this email.</p>
              <p class="footer">&copy; Finance Manager. Secure Personal Financial Management.</p>
            </div>
          </body>
        </html>
      `,
    });

    if (error) {
      console.warn(`[RESEND WARNING] Could not deliver email to ${to} via Resend (${error.message}).`);
      console.log(`[AUTH LOG FALLBACK] Reset link for ${to}: ${url}`);
      return { success: false, mode: "fallback_log", error: error.message };
    }

    console.log(`[AUTH EMAIL] Password reset email successfully sent via Resend to ${to} (ID: ${data?.id})`);
    return { success: true, mode: "resend", id: data?.id };
  } catch (err: unknown) {
    const errMsg = err instanceof Error ? err.message : String(err);
    console.warn(`[RESEND WARNING] Unexpected Resend error for ${to}: ${errMsg}`);
    console.log(`[AUTH LOG FALLBACK] Reset link for ${to}: ${url}`);
    return { success: false, mode: "fallback_log", error: errMsg };
  }
}
