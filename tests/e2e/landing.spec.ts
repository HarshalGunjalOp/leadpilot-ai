import { test, expect } from "@playwright/test";

test.describe("Landing Page", () => {
  test("should display the homepage", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("h1")).toContainText("Find Your Perfect");
  });

  test("should navigate to pricing", async ({ page }) => {
    await page.goto("/");
    await page.click('a[href="/pricing"]');
    await expect(page).toHaveURL("/pricing");
  });
});

test.describe("Authentication", () => {
  test("should redirect to sign in when accessing protected route", async ({
    page,
  }) => {
    await page.goto("/dashboard");
    // Should redirect to Clerk sign-in
    await expect(page).toHaveURL(/sign-in/);
  });
});
