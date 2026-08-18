import { test, expect } from "@playwright/test";

test.describe("Public Landing Page E2E Test Suite", () => {
  const VIEWPORTS = [
    { name: "Mobile Small (375px)", width: 375, height: 667 },
    { name: "Mobile Large (430px)", width: 430, height: 932 },
    { name: "Tablet Portrait (768px)", width: 768, height: 1024 },
    { name: "Tablet Landscape (820px)", width: 820, height: 1180 },
    { name: "Desktop Small (1024px)", width: 1024, height: 768 },
    { name: "Desktop Medium (1280px)", width: 1280, height: 800 },
    { name: "Desktop Large (1440px)", width: 1440, height: 900 },
  ];

  test("Landing Page Core Content & Routing Verification", async ({ page }) => {
    await page.goto("/");

    // 1. Verify Page Title & Header Branding
    await expect(page).toHaveTitle(/Personal Finance Manager/);
    await expect(page.locator("header").getByText("FinanceManager")).toBeVisible();

    // 2. Verify Skip to Main Content Link
    const skipLink = page.locator('a[href="#main-content"]');
    await expect(skipLink).toHaveCount(1);

    // 3. Verify Hero Section & Value Proposition
    const heroHeading = page.locator("#hero-heading");
    await expect(heroHeading).toBeVisible();
    await expect(heroHeading).toContainText("Master your money");

    // 4. Verify Ethiopian Birr (Br) and Global Currencies Mention
    await expect(page.locator("body")).toContainText("Ethiopian Birr (Br)");
    await expect(page.locator("body")).toContainText("USD ($)");
    await expect(page.locator("body")).toContainText("EUR (€)");
    await expect(page.locator("body")).toContainText("GBP (£)");

    // 5. Verify Hero Snapshot / Mockup Content
    await expect(page.locator("body")).toContainText("+Br 24,580.00");
    await expect(page.locator("body")).toContainText("Total Net Balance");
    await expect(page.locator("body")).toContainText("+Br 32,400");
    await expect(page.locator("body")).toContainText("-Br 7,820");

    // 6. Verify Features Section
    const featuresHeading = page.locator("#features-heading");
    await expect(featuresHeading).toBeVisible();
    await expect(page.getByRole("heading", { name: "Track Every Transaction" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Control Category Budgets" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Build Milestone Savings" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Visual Financial Analytics" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Native Multi-Currency" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "3-Second Financial Clarity" })).toBeVisible();

    // 7. Verify How It Works 3-Step Section
    const howItWorksHeading = page.locator("#how-it-works-heading");
    await expect(howItWorksHeading).toBeVisible();
    await expect(page.getByRole("heading", { name: "Log Your Transactions" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Set Budgets & Savings Targets" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Understand Your Progress" })).toBeVisible();

    // 8. Verify Interactive Product Preview Tabs
    const previewSection = page.locator("#preview");
    await expect(previewSection).toBeVisible();

    // Test tab switches
    await previewSection.locator('button[role="tab"]:has-text("Transactions Ledger")').click();
    await expect(previewSection.getByRole("heading", { name: "Transactions Ledger" })).toBeVisible();

    await previewSection.locator('button[role="tab"]:has-text("Budgets & Alerts")').click();
    await expect(previewSection.getByRole("heading", { name: "Monthly Category Budgets" })).toBeVisible();
    await expect(previewSection.getByText("82.0% Warning")).toBeVisible();

    await previewSection.locator('button[role="tab"]:has-text("Savings Goals")').click();
    await expect(previewSection.getByRole("heading", { name: "Savings Goals & Targets" })).toBeVisible();
    await expect(previewSection.getByText("Emergency Fund")).toBeVisible();

    await previewSection.locator('button[role="tab"]:has-text("Trends & Analytics")').click();
    await expect(previewSection.getByRole("heading", { name: "Expense Analytics & Distribution" })).toBeVisible();

    // 9. Verify Benefits Section
    const benefitsHeading = page.locator("#benefits-heading");
    await expect(benefitsHeading).toBeVisible();
    await expect(page.getByRole("heading", { name: "Unambiguous Financial Clarity" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Proactive Overspending Prevention" })).toBeVisible();

    // 10. Verify Final CTA Section
    const ctaHeading = page.locator("#cta-heading");
    await expect(ctaHeading).toBeVisible();
    await expect(ctaHeading).toContainText("Take control of your financial future today");

    // 11. Verify Footer
    const footer = page.locator("footer");
    await expect(footer).toBeVisible();
    await expect(footer).toContainText("Personal Finance Manager");
    await expect(footer).toContainText("System Status: Operational");
    await expect(footer).toContainText("Supported Currencies");
  });

  test("CTA Routing Safety & Auth Exemption Verification", async ({ page }) => {
    await page.goto("/");

    // Verify Get Started links point to /register
    const registerLinks = page.locator('a[href="/register"]');
    const registerCount = await registerLinks.count();
    expect(registerCount).toBeGreaterThanOrEqual(2);

    // Verify Log In links point to /login
    const loginLinks = page.locator('a[href="/login"]');
    const loginCount = await loginLinks.count();
    expect(loginCount).toBeGreaterThanOrEqual(2);

    // Click hero Get Started and verify navigation
    await registerLinks.first().click();
    await page.waitForURL("**/register");
    await expect(page.locator("h2, h1, div").filter({ hasText: "Create Account" }).first()).toBeVisible();

    // Return home and click Sign In
    await page.goto("/");
    await loginLinks.first().click();
    await page.waitForURL("**/login");
    await expect(page.locator("h2, h1, div").filter({ hasText: "Welcome Back" }).first()).toBeVisible();
  });

  test("Theme Toggle Mode Switcher on Landing Page", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Locate theme toggle button
    const themeBtn = page.locator('button[aria-label*="Switch to"], button[aria-label="Toggle theme"]').first();
    await expect(themeBtn).toBeVisible();

    // Initial theme check
    const initialTheme = await page.evaluate(() =>
      document.documentElement.classList.contains("light") ? "light" : "dark"
    );

    // Click toggle
    await themeBtn.click();
    await page.waitForTimeout(500);

    const toggledTheme = await page.evaluate(() =>
      document.documentElement.classList.contains("light") ? "light" : "dark"
    );

    expect(toggledTheme).not.toBe(initialTheme);
  });

  // Responsive Testing Across All 7 Viewports
  for (const vp of VIEWPORTS) {
    test(`Zero Horizontal Overflow & Responsive Layout at ${vp.name}`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto("/");
      await page.waitForLoadState("networkidle");

      // Verify zero horizontal scroll
      const { scrollWidth, clientWidth } = await page.evaluate(() => ({
        scrollWidth: document.documentElement.scrollWidth,
        clientWidth: document.documentElement.clientWidth,
      }));

      expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 1); // Allow at most 1px rounding margin

      // Verify Hero heading is visible
      await expect(page.locator("#hero-heading")).toBeVisible();

      // On mobile and tablet viewports (< 1024px), verify mobile menu button
      if (vp.width < 1024) {
        const menuBtn = page.locator('button[aria-label="Open mobile menu"]');
        await expect(menuBtn).toBeVisible();

        // Open menu and verify drawer
        await menuBtn.click();
        await expect(page.locator('div[role="dialog"]')).toBeVisible();
        await expect(page.locator('div[role="dialog"]').getByText("Features")).toBeVisible();

        // Close menu
        await page.click('button[aria-label="Close menu"]');
        await expect(page.locator('div[role="dialog"]')).not.toBeVisible();
      }
    });
  }

  test("Protected Routes remain protected from unauthenticated access", async ({ page }) => {
    // Navigating directly to /dashboard without session redirects to /login
    await page.goto("/dashboard");
    await page.waitForURL("**/login?redirectTo=%2Fdashboard", { timeout: 10000 });
    await expect(page.locator("h2, h1, div").filter({ hasText: "Welcome Back" }).first()).toBeVisible();

    // Navigating directly to /transactions without session redirects to /login
    await page.goto("/transactions");
    await page.waitForURL("**/login?redirectTo=%2Ftransactions", { timeout: 10000 });
    await expect(page.locator("h2, h1, div").filter({ hasText: "Welcome Back" }).first()).toBeVisible();
  });
});
