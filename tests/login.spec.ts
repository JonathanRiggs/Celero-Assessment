import { expect, test } from "@playwright/test";

import { ADMIN_PASSWORD, ADMIN_USERNAME } from "./utils/page-helpers";

test.describe("Login", () => {
	// TC-01 — Valid admin login reaches Dashboard

	test("valid admin login reaches Dashboard", async ({ page }) => {
		await page.goto("/web/index.php/auth/login");
		await page.getByPlaceholder("Username").fill(ADMIN_USERNAME);
		await page.getByPlaceholder("Password").fill(ADMIN_PASSWORD);
		await page.getByRole("button", { name: "Login" }).click();
		await expect(page).toHaveURL(/\/dashboard\/index$/);
		await expect(
			page.getByRole("heading", { name: "Dashboard" }),
		).toBeVisible();
		await expect(page.getByRole("link", { name: "PIM" })).toBeVisible();
		await expect(page.locator(".oxd-alert-content")).toHaveCount(0);
	});

	// TC-02 — Invalid password is rejected with an error

	test("invalid password is rejected with an error", async ({ page }) => {
		await page.goto("/web/index.php/auth/login");
		await page.getByPlaceholder("Username").fill(ADMIN_USERNAME);
		await page.getByPlaceholder("Password").fill("wrongPassword123");
		await page.getByRole("button", { name: "Login" }).click();
		await expect(page.getByText("Invalid credentials")).toBeVisible();
		await expect(page).toHaveURL(/\/auth\/login$/);
		await expect(
			page.getByRole("heading", { name: "Dashboard" }),
		).not.toBeVisible();
		await expect(page.getByRole("link", { name: "PIM" })).not.toBeVisible();
	});
});
