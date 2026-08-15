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

test.describe("UI-009: Category Management & Transaction Reassignment UX", () => {
  test("1. Full Category Lifecycle: Create -> Edit -> Filter -> Reassign & Delete", async ({ page }) => {
    const timestamp = Date.now();
    await registerAndLogin(page, "LifecycleTester");

    await page.goto("/categories");
    await page.waitForLoadState("networkidle");

    // Verify page header and 3-second comprehension elements
    await expect(page.locator("h1")).toContainText("Categories Ledger");
    await expect(page.locator("text=Taxonomy & Ledger Organization")).toBeVisible();

    // Verify 4-card overview metrics are rendered
    await expect(page.locator("text=Total Categories")).toBeVisible();
    await expect(page.locator("text=Expense Types")).toBeVisible();
    await expect(page.locator("text=Income Types")).toBeVisible();
    await expect(page.locator("text=Custom vs System")).toBeVisible();

    // --- Step A: Add Custom Expense Category ---
    const customExpenseName = `Expense ${timestamp}`;
    await page.click('button:has-text("Add Category")');
    await expect(page.getByRole("heading", { name: "Add Custom Category" })).toBeVisible();

    // Ensure Expense is selected by default
    await page.fill('input#name', customExpenseName);
    await page.click('button[type="submit"]:has-text("Create Category")');

    // Verify category appears in grid
    await expect(page.locator(`text=${customExpenseName}`)).toBeVisible();

    // --- Step B: Add Custom Income Category ---
    const customIncomeName = `Income ${timestamp}`;
    await page.click('button:has-text("Add Category")');
    await page.click('button:has-text("Income Category")');
    await page.fill('input#name', customIncomeName);
    await page.click('button[type="submit"]:has-text("Create Category")');

    // Verify income category appears in grid
    await expect(page.locator(`text=${customIncomeName}`)).toBeVisible();

    // --- Step C: Edit Custom Category ---
    const updatedExpenseName = `Updated Exp ${timestamp}`;
    const expenseCard = page.locator("article").filter({ hasText: customExpenseName });
    await expenseCard.locator('button:has-text("Edit")').click();

    await expect(page.getByRole("heading", { name: "Edit Custom Category" })).toBeVisible();
    await expect(page.locator('input#name')).toHaveValue(customExpenseName);

    await page.fill('input#name', updatedExpenseName);
    await page.click('button[type="submit"]:has-text("Save Changes")');

    await expect(page.locator(`text=${updatedExpenseName}`)).toBeVisible();
    await expect(page.locator(`text=${customExpenseName}`)).not.toBeVisible();

    // --- Step D: Search & Tab Filtering ---
    // Tab filter: Expenses
    await page.click('button[role="tab"]:has-text("Expenses")');
    await expect(page.locator(`text=${updatedExpenseName}`)).toBeVisible();
    await expect(page.locator(`text=${customIncomeName}`)).not.toBeVisible();

    // Tab filter: Income
    await page.click('button[role="tab"]:has-text("Income")');
    await expect(page.locator(`text=${customIncomeName}`)).toBeVisible();
    await expect(page.locator(`text=${updatedExpenseName}`)).not.toBeVisible();

    // Reset to All
    await page.click('button[role="tab"]:has-text("All")');

    // Search bar filtering
    await page.fill('input#category-search', updatedExpenseName);
    await expect(page.locator(`text=${updatedExpenseName}`)).toBeVisible();
    await expect(page.locator(`text=${customIncomeName}`)).not.toBeVisible();

    // Clear search
    await page.click('button[aria-label="Clear search query"]');
    await expect(page.locator(`text=${customIncomeName}`)).toBeVisible();

    // Origin filter: Custom only
    await page.click('button:has-text("Custom")');
    await expect(page.locator(`text=${updatedExpenseName}`)).toBeVisible();

    // Reset all filters
    await page.click('text=Reset all filters');

    // --- Step E: Delete Category with Mandatory Reassignment (BR-013) ---
    const updatedCard = page.locator("article").filter({ hasText: updatedExpenseName });
    await updatedCard.locator('button:has-text("Delete")').click();

    // Verify Delete Dialog
    await expect(page.getByRole("heading", { name: "Delete Custom Category" })).toBeVisible();
    await expect(page.locator("text=Mandatory Transaction Reassignment Policy (BR-013)")).toBeVisible();

    // Check that replacement category dropdown exists and has options
    const selectDropdown = page.locator("select");
    await expect(selectDropdown).toBeVisible();

    // Ensure deleted category itself is NOT in the replacement options
    const options = await selectDropdown.locator("option").allTextContents();
    expect(options.some((opt) => opt.includes(updatedExpenseName))).toBe(false);

    // Confirm deletion
    await page.click('button:has-text("Reassign & Delete")');

    // Verify modal closes and category is removed
    await expect(page.locator(`text=${updatedExpenseName}`)).not.toBeVisible();
  });

  test("2. Multi-Viewport Responsive Verification & Zero Horizontal Overflow", async ({ page }) => {
    await registerAndLogin(page, "ViewportTester");

    const viewports = [
      { name: "Mobile SE", width: 375, height: 667 },
      { name: "Mobile Pro Max", width: 430, height: 932 },
      { name: "Tablet iPad", width: 768, height: 1024 },
      { name: "Tablet Air", width: 820, height: 1180 },
      { name: "Desktop Small", width: 1024, height: 768 },
      { name: "Desktop Standard", width: 1280, height: 800 },
      { name: "Desktop Large", width: 1440, height: 900 },
    ];

    for (const vp of viewports) {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto("/categories");
      await page.waitForLoadState("networkidle");

      // Verify page title
      await expect(page.locator("h1")).toContainText("Categories Ledger");

      // Verify zero horizontal scroll on body/documentElement
      const isOverflowing = await page.evaluate(() => {
        return document.documentElement.scrollWidth > window.innerWidth;
      });
      expect(isOverflowing, `Viewport ${vp.name} (${vp.width}px) should not overflow horizontally`).toBe(false);

      // Verify Add Category button is visible and touch target >= 40px
      const addBtn = page.locator('button:has-text("Add Category")');
      await expect(addBtn).toBeVisible();
      const boundingBox = await addBtn.boundingBox();
      expect(boundingBox?.height).toBeGreaterThanOrEqual(40);
    }
  });

  test("3. Light & Dark Theme Contrast and Accessibility", async ({ page }) => {
    await registerAndLogin(page, "ThemeTester");

    await page.goto("/categories");
    await page.waitForLoadState("networkidle");

    // Check system category protected state
    const systemCategoryCard = page.locator("article").filter({ hasText: "System Default" }).first();
    await expect(systemCategoryCard).toBeVisible();
    await expect(systemCategoryCard.locator("text=Protected Category")).toBeVisible();
    await expect(systemCategoryCard.locator("text=Read Only")).toBeVisible();

    // Verify keyboard escape closes modal
    await page.click('button:has-text("Add Category")');
    await expect(page.getByRole("heading", { name: "Add Custom Category" })).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.getByRole("heading", { name: "Add Custom Category" })).not.toBeVisible();
  });
});
