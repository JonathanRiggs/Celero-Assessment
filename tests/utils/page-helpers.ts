import type { Locator, Page } from "@playwright/test";

export const ADMIN_USERNAME = "Admin";
export const ADMIN_PASSWORD = "admin123";

// Used as a precondition by specs that assume an authenticated session.

export async function login(
	page: Page,
	username = ADMIN_USERNAME,
	password = ADMIN_PASSWORD,
): Promise<void> {
	await page.goto("/web/index.php/auth/login");
	await page.getByPlaceholder("Username").fill(username);
	await page.getByPlaceholder("Password").fill(password);
	await page.getByRole("button", { name: "Login" }).click();
	await page.waitForURL("**/dashboard/index");
}

// Locating by the visible label text is the most resilient option available.

export function getInputByLabel(page: Page, labelText: string): Locator {
	return page
		.locator(".oxd-input-group")
		.filter({ has: page.locator("label", { hasText: labelText }) })
		.locator("input")
		.first();
}
