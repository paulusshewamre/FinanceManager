import { test, expect } from "@playwright/test";

test.describe("Full User Journey E2E Test Suite (TSK-080)", () => {
  const timestamp = Date.now();
  const testUser = {
    name: `E2E Tester ${timestamp}`,
    email: `e2e-user-${timestamp}@example.com`,
    password: "Password123!",
  };

  test("Complete E2E Journey: Register -> Category -> Backdated Txn -> Budget Warning -> Savings -> Account Purge", async ({
    page,
  }) => {
    // ----------------------------------------------------
    // Step 1: User Registration & Dashboard Landing
    // ----------------------------------------------------
    await page.goto("/register");
    await expect(page.locator("h2, h1, div").filter({ hasText: "Create Account" }).first()).toBeVisible();

    await page.fill("#name", testUser.name);
    await page.fill("#email", testUser.email);
    await page.fill("#password", testUser.password);
    await page.fill("#confirmPassword", testUser.password);

    await page.click('button[type="submit"]:has-text("Create Account")');
    await page.waitForURL("**/dashboard", { timeout: 20000 });
    await expect(page.locator("body")).toContainText("Welcome back");

    // ----------------------------------------------------
    // Step 2: Category Domain Management & Custom Category Creation
    // ----------------------------------------------------
    await page.goto("/categories");
    await expect(page.locator("h1")).toContainText("Categories Ledger");

    await page.click('button:has-text("Add Category")');
    await page.waitForSelector('input#name');
    await page.fill('input#name', `E2E Expense ${timestamp}`);
    await page.click('button[type="submit"]:has-text("Create Category")');

    await expect(page.locator("body")).toContainText(`E2E Expense ${timestamp}`);

    // ----------------------------------------------------
    // Step 3: Backdated Transaction Ledger Engine
    // ----------------------------------------------------
    await page.goto("/transactions");
    await expect(page.locator("h1")).toContainText("Transactions Ledger");

    await page.click('button:has-text("Log Transaction")');
    await page.waitForSelector('#amount');

    await page.fill('#amount', "150.00");
    await page.selectOption('#categoryId', { label: `E2E Expense ${timestamp}` });
    await page.fill('#transactionDate', "2026-08-01T10:00");
    await page.fill('#merchantName', `E2E Store ${timestamp}`);
    await page.fill('#notes', "Backdated test transaction");

    await page.click('button[type="submit"]:has-text("Log Transaction")');
    await expect(page.locator("body")).toContainText(`E2E Store ${timestamp}`);
    await expect(page.locator("body")).toContainText("$150.00");

    // ----------------------------------------------------
    // Step 4: Monthly Budget Warning Alert Threshold Engine
    // ----------------------------------------------------
    await page.goto("/budgets");
    await expect(page.locator("h1")).toContainText("Monthly Budgets");

    await page.click('button:has-text("Set Category Budget")');
    await page.waitForSelector('#categoryId');

    await page.selectOption('#categoryId', { label: `E2E Expense ${timestamp} (Custom)` });
    await page.fill('#amount', "100.00");
    await page.click('button[type="submit"]:has-text("Set Budget")');

    // 150 spent out of 100 budget triggers EXCEEDED warning threshold alert
    await expect(page.locator("body")).toContainText(/exceeded/i);

    // ----------------------------------------------------
    // Step 5: Savings Goals & Atomic Contribution Engine
    // ----------------------------------------------------
    await page.goto("/savings");
    await expect(page.locator("h1")).toContainText("Savings Goals");

    await page.click('button:has-text("New Savings Goal")');
    await page.waitForSelector('input[placeholder*="Emergency Fund"]');

    await page.fill('input[placeholder*="Emergency Fund"]', `E2E Laptop Fund ${timestamp}`);
    await page.fill('input[placeholder="1000.00"]', "500.00");
    await page.fill('input[placeholder="0.00"]', "100.00");
    await page.fill('input[type="date"]', "2026-12-31");

    await page.click('button[type="submit"]:has-text("Create Goal")');
    await expect(page.locator("body")).toContainText(`E2E Laptop Fund ${timestamp}`);

    // Deposit atomic contribution
    const goalCard = page.locator('.bg-\\[\\#161a1d\\]', { hasText: `E2E Laptop Fund ${timestamp}` }).first();
    await goalCard.locator('button:has-text("Add Funds")').click();

    await page.waitForSelector('input[placeholder*="100.00"]');
    await page.fill('input[placeholder*="100.00"]', "150.00");
    await page.click('button[type="submit"]:has-text("Record Contribution")');

    // $100 + $150 contribution = $250.00 saved
    await expect(goalCard).toContainText("$250.00");

    // ----------------------------------------------------
    // Step 6: Settings, Preferences & Cascading Hard Purge
    // ----------------------------------------------------
    await page.goto("/settings");
    await expect(page.locator("h1")).toContainText("Account Settings");

    // Update Display Name
    const nameInput = page.locator('input[placeholder="Enter your display name"]');
    await nameInput.fill(`Updated E2E Name ${timestamp}`);
    await page.click('button:has-text("Save Profile Name")');
    await expect(page.locator("body")).toContainText("Preferences updated successfully!");

    // Execute Hard Purge Account Deletion
    await page.click('button:has-text("Delete My Account & All Data")');
    await page.waitForSelector('input[placeholder="DELETE MY ACCOUNT"]');

    await page.fill('input[placeholder="DELETE MY ACCOUNT"]', "DELETE MY ACCOUNT");
    await page.click('button:has-text("Permanently Delete Account")');

    // Should redirect user back to register page upon successful hard purge
    await page.waitForURL("**/register", { timeout: 20000 });
    await expect(page.locator("body")).toContainText("Create Account");
  });
});
