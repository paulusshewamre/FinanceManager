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
      <body className="antialiased bg-background text-foreground min-h-screen transition-colors duration-200" suppressHydrationWarning>
        <UserPreferencesProvider>{children}</UserPreferencesProvider>
      </body>
    </html>
  );
}
