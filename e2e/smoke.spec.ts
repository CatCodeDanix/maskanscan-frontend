import { expect, test } from "@playwright/test";

test.describe("Smoke Test", () => {
	test("home page loads successfully and displays brand", async ({ page }) => {
		await page.goto("/");
		await expect(page).toHaveTitle(/مسکن[\s‌]?اسکن/i);

		// Brand heading / logo text in header
		const brand = page.locator("header");
		await expect(brand).toContainText(/مسکن[\s‌]?اسکن/i);
	});

	test("explore map page loads successfully", async ({ page }) => {
		await page.goto("/explore");
		await expect(page).toHaveTitle(/مسکن[\s‌]?اسکن/i);

		const header = page.locator("header");
		await expect(header).toBeVisible();
	});
});

