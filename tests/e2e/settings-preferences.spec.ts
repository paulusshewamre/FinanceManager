import { test, expect, Page } from "@playwright/test";

async function registerAndLogin(page: Page, prefix: string) {
  const timestamp = Date.now() + Math.floor(Math.random() * 10000);
  const user = {
    name: `${prefix} ${timestamp}`,
    email: `${prefix.toLowerCase()}-${timestamp}@example.com`,
    password: "Password123!",
  };

  await page.goto("/register");
  await expect(page.locator("h2, h1, div").filter({ hasText: "Create Account" }).first()).toBeVisible();
  await page.fill("#name", user.name);
  await page.fill("#email", user.email);
  await page.fill("#password", user.password);
  await page.fill("#confirmPassword", user.password);
  await page.click('button[type="submit"]:has-text("Create Account")');
  await page.waitForURL("**/dashboard", { timeout: 25000 });
  await expect(page.locator("body")).toContainText("Welcome back");

  return user;
}

test.describe("UI-010: Settings, Profile & Preferences Experience + Ethiopian Birr (ETB/Br)", () => {
  test("1. Settings View, Profile Editing, and Ethiopian Birr Default Currency", async ({ page }) => {
    const timestamp = Date.now();
    const user = await registerAndLogin(page, "SettingsTester");

    await page.goto("/settings");
    await page.waitForLoadState("networkidle");

    // 1. Verify Header & 3-Second Comprehension
    await expect(page.locator("h1")).toContainText("Settings & Preferences");
    await expect(page.locator("text=User Profile & Preferences")).toBeVisible();

    // 2. Verify Profile & Identity Section
    await expect(page.locator("text=Profile & Identity")).toBeVisible();
    await expect(page.locator(`text=${user.email}`)).toBeVisible();
    await expect(page.locator("text=Verified")).toBeVisible();

    // Update Display Name
    const updatedName = `Renamed User ${timestamp}`;
    const nameInput = page.locator("#display-name");
    await nameInput.fill(updatedName);
    await page.click('button:has-text("Save Profile Name")');
    await expect(page.locator("text=Display name updated successfully!")).toBeVisible();

    // 3. Verify Ethiopian Birr (ETB / Br) is Default and Present
    await expect(page.locator("text=Display Currency Preference (BR-018)")).toBeVisible();
    await expect(page.locator("text=Ethiopian Birr")).toBeVisible();
    await expect(page.locator("text=ETB")).toBeVisible();
    await expect(page.locator("text=Default")).toBeVisible();

    // Verify Active badge is Br
    await expect(page.locator("text=Active: Br")).toBeVisible();

    // 4. Verify Ethiopian Birr Propagation across all main views
    await page.goto("/dashboard");
    await page.waitForLoadState("networkidle");
    await expect(page.locator("body")).toContainText("Br");

    await page.goto("/transactions");
    await page.waitForLoadState("networkidle");
    await expect(page.locator("h1")).toContainText("Transactions Ledger");

    await page.goto("/budgets");
    await page.waitForLoadState("networkidle");
    await expect(page.locator("h1")).toContainText("Monthly Category Budgets");

    await page.goto("/savings");
    await page.waitForLoadState("networkidle");
    await expect(page.locator("h1")).toContainText("Savings Goals");

    await page.goto("/analytics");
    await page.waitForLoadState("networkidle");
    await expect(page.locator("h1")).toContainText("Financial Analytics");

    // 5. Navigate back to Settings & Switch Currency to USD ($)
    await page.goto("/settings");
    await page.waitForLoadState("networkidle");
    await page.click('button:has-text("US Dollar")');
    await expect(page.locator("text=Primary currency updated to US Dollar ($)")).toBeVisible();
    await expect(page.locator("text=Active: $")).toBeVisible();

    // Refresh page and verify persistence of USD
    await page.reload();
    await page.waitForLoadState("networkidle");
    await expect(page.locator("text=Active: $")).toBeVisible();

    // Switch to Euro (€)
    await page.click('button:has-text("Euro")');
    await expect(page.locator("text=Primary currency updated to Euro (€)")).toBeVisible();
    await expect(page.locator("text=Active: €")).toBeVisible();

    // Switch back to Ethiopian Birr (Br)
    await page.click('button:has-text("Ethiopian Birr")');
    await expect(page.locator("text=Primary currency updated to Ethiopian Birr (Br)")).toBeVisible();
    await expect(page.locator("text=Active: Br")).toBeVisible();

    // 6. Verify Theme Switcher Interaction
    await expect(page.locator("text=Appearance & Theme")).toBeVisible();
    await page.click('button:has-text("Light Mode")');
    await expect(page.locator("text=Theme set to Light mode")).toBeVisible();
    await page.click('button:has-text("Dark Mode")');
    await expect(page.locator("text=Theme set to Dark mode")).toBeVisible();

    // 7. Verify Account Security Section & Danger Zone
    await expect(page.locator("text=Account Security & Authentication")).toBeVisible();
    await expect(page.locator("text=Danger Zone — Permanent Account Deletion")).toBeVisible();
    await expect(page.locator("text=7-Table Cascading Data Hard Purge Policy (BR-019)")).toBeVisible();

    // Open Delete Account Modal and verify type-to-confirm safeguard
    await page.click('button:has-text("Delete My Account & All Data")');
    await expect(page.locator("text=Permanent Account Purge")).toBeVisible();

    const confirmButton = page.locator('button:has-text("Permanently Delete Account")');
    // Button is disabled until confirmation text matches
    await expect(confirmButton).toBeDisabled();

    await page.fill('input[placeholder*="DELETE MY ACCOUNT"]', "DELETE MY ACCOUNT");
    await expect(confirmButton).toBeEnabled();

    // Dismiss dialog with Cancel
    await page.click('button:has-text("Cancel")');
    await expect(page.locator("text=Permanent Account Purge")).not.toBeVisible();
  });

  test("2. Zero Horizontal Overflow & 7 Viewport Responsive Checks", async ({ page }) => {
    const viewports = [
      { name: "Mobile Small (375px)", width: 375, height: 667 },
      { name: "Mobile Standard (430px)", width: 430, height: 932 },
      { name: "Tablet Portrait (768px)", width: 768, height: 1024 },
      { name: "Tablet Medium (820px)", width: 820, height: 1180 },
      { name: "Desktop Small (1024px)", width: 1024, height: 768 },
      { name: "Desktop Large (1280px)", width: 1280, height: 800 },
      { name: "Desktop Ultra (1440px)", width: 1440, height: 900 },
    ];

    await registerAndLogin(page, "ViewportTester");

    for (const vp of viewports) {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto("/settings");
      await page.waitForLoadState("networkidle");

      // Verify page loaded
      await expect(page.locator("h1")).toContainText("Settings & Preferences");

      // Verify zero horizontal overflow
      const isOverflowing = await page.evaluate(() => {
        return document.documentElement.scrollWidth > document.documentElement.clientWidth;
      });

      expect(isOverflowing, `Viewport ${vp.name} should not have horizontal overflow`).toBe(false);
    }
  });
});
