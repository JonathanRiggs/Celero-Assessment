import { expect, test } from "@playwright/test";
import { getInputByLabel, login } from "./utils/page-helpers";
import { generateEmployeeIdentity } from "./utils/test-data";

test.describe("Add Employee", () => {
	test.beforeEach(async ({ page }) => {
		await login(page);
		await page.getByRole("link", { name: "PIM" }).click();
		await page.getByRole("link", { name: "Add Employee" }).click();
	});

	// TC-03: Add employee with required fields saves successfully

	test("add employee with required fields saves successfully", async ({
		page,
	}) => {
		const { firstName, lastName, employeeId } = generateEmployeeIdentity();
		await getInputByLabel(page, "First Name").fill(firstName);
		await getInputByLabel(page, "Last Name").fill(lastName);
		await getInputByLabel(page, "Employee Id").fill(employeeId);

		await page.getByRole("button", { name: "Save" }).click();

		await page.waitForURL(/\/pim\/viewPersonalDetails\/empNumber\/\d+$/);

		const empNumMatch = page.url().match(/\/empNumber\/(\d+)$/);
		const empNum = empNumMatch?.[1];
		expect(empNum).toBeDefined();

		await expect(
			page.getByRole("heading", { name: "Personal Details" }),
		).toBeVisible();
		await expect(getInputByLabel(page, "First Name")).toHaveValue(firstName);
		await expect(getInputByLabel(page, "Last Name")).toHaveValue(lastName);
		await expect(getInputByLabel(page, "Employee Id")).toHaveValue(employeeId);

		// TC-04: Newly added employee is retrievable from PIM search
		await page.getByRole("link", { name: "PIM" }).click();
		await expect(page).toHaveURL(/\/pim\/viewEmployeeList$/);
		await getInputByLabel(page, "Employee Id").fill(employeeId);
		await page.getByRole("button", { name: "Search" }).click();

		await expect(page.getByText(/^\(1\) Record Found$/)).toBeVisible();
		const row = page.locator(".oxd-table-card", { hasText: employeeId });
		await expect(row).toBeVisible();
		await expect(row).toContainText(firstName);
		await expect(row).toContainText(lastName);

		await row.click();
		await expect(page).toHaveURL(
			new RegExp(`/pim/viewPersonalDetails/empNumber/${empNum}$`),
		);
	});

	// TC-05: Save is blocked when Last Name is missing
	test("save is blocked when Last Name is missing", async ({ page }) => {
		const { firstName } = generateEmployeeIdentity();
		await page.getByPlaceholder("First Name").fill(firstName);
		await page.getByRole("button", { name: "Save" }).click();

		const lastNameGroup = page
			.locator(".oxd-input-group")
			.filter({ hasText: "Last Name" });
		await expect(lastNameGroup.getByText("Required")).toBeVisible();

		await expect(page).toHaveURL(/\/pim\/addEmployee$/);
		await expect(page.getByText("Successfully Saved")).not.toBeVisible();
		await page.getByRole("link", { name: "PIM" }).click();
		await getInputByLabel(page, "Employee Name").fill(firstName);
		await page.getByRole("button", { name: "Search" }).click();

		await expect(page.getByText(/^\(0\) Records Found$/)).toBeVisible();
	});
});
