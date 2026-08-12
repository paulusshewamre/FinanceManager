import type { Metadata } from "next";
import "./globals.css";
import { UserPreferencesProvider } from "@/lib/context/user-preferences-context";

export const metadata: Metadata = {
  title: "Personal Finance Manager",
  description: "Disciplined financial clarity with modern digital aesthetics",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased bg-[#0f1418] text-[#dee3e8] min-h-screen" suppressHydrationWarning>
        <UserPreferencesProvider>{children}</UserPreferencesProvider>
      </body>
    </html>
  );
}
