# Manual Test Cases — Employee Management Workflow

**Application:** OrangeHRM public demo — `https://opensource-demo.orangehrmlive.com/web/index.php/auth/login`
**Workflow:** Login → PIM → Add Employee → Save → Search / verify
**Author:** Jonathan Riggs

---

## Test data strategy

All employee records created by these cases use a generated, collision-resistant identity so runs do not clash with records left by other users of the shared demo:

| Field | Convention | Example |
| --- | --- | --- |
| First Name | `QA` + last 8 digits of Date.now() | `QA17263841` |
| Last Name | `Test` + last 6 digits of Date.now() | `Test638412` |
| Employee Id | last 9 digits of Date.now() + 3 random digits, truncated to 9 | `638412907` |

Referred to below as **`{firstName}`**, **`{lastName}`**, **`{employeeId}`**.

---

## Traceability summary

| ID | Title | Type | Priority | Risk | Automated |
| --- | --- | --- | --- | --- | --- |
| TC-01 | Valid admin login reaches Dashboard | Happy path | P1 | High | Yes |
| TC-02 | Invalid password is rejected with an error | Negative | P1 | High | Yes |
| TC-03 | Add employee with required fields only saves successfully | Happy path | P1 | High | Yes |
| TC-04 | Newly created employee is retrievable via PIM search | State / verification | P1 | High | Yes |
| TC-05 | Save is blocked when Last Name is empty | Validation | P1 | High | Yes |
| TC-06 | Duplicate Employee Id is rejected | Negative / uniqueness | P2 | Medium | No |
| TC-07 | Employee Id enforces its maximum length | Boundary | P3 | Low | No |
| TC-08 | Search for a non-existent Employee Id reports no records | Negative / feedback | P2 | Medium | No |


---

## TC-01 — Valid admin login reaches Dashboard

| | |
| --- | --- |
| **Priority / Risk** | P1 / High |
| **Type** | Happy path |
| **Automated** | Yes — `tests/login.spec.ts` |

**Preconditions**
- Browser session has no existing OrangeHRM authentication cookie.
- Demo site is reachable.

**Test data**
- Username: `Admin`
- Password: `admin123`

**Steps**
1. Navigate to `/web/index.php/auth/login`.
2. Enter `Admin` in the Username field.
3. Enter `admin123` in the Password field.
4. Click **Login**.

**Expected result**
- Browser lands on `/web/index.php/dashboard/index`.
- The page header reads **Dashboard**.
- The left sidebar is present and includes a **PIM** menu item.
- No error banner is shown.

---

## TC-02 — Invalid password is rejected with an error

| | |
| --- | --- |
| **Priority / Risk** | P1 / High |
| **Type** | Negative |
| **Automated** | Yes — `tests/login.spec.ts` |

**Preconditions**
- No existing authenticated session.

**Test data**
- Username: `Admin`
- Password: `wrongPassword123`

**Steps**
1. Navigate to `/web/index.php/auth/login`.
2. Enter `Admin` in the Username field.
3. Enter `wrongPassword123` in the Password field.
4. Click **Login**.

**Expected result**
- An error alert reading **Invalid credentials** is displayed above the form.
- The URL remains `/web/index.php/auth/login`.
- No Dashboard content or sidebar is rendered.
- The error message does not disclose whether the *username* specifically was valid.

---

## TC-03 — Add employee with required fields only saves successfully

| | |
| --- | --- |
| **Priority / Risk** | P1 / High |
| **Type** | Happy path |
| **Automated** | Yes — `tests/add-employee.spec.ts` |

**Preconditions**
- Logged in as `Admin` (per TC-01).

**Test data**
- First Name: `{firstName}`
- Last Name: `{lastName}`
- Employee Id: `{employeeId}` (replaces the auto-populated value)
- Middle Name, photo, and login details are intentionally left blank.

**Steps**
1. From the sidebar, click **PIM**.
2. Click **+ Add Employee**.
3. Enter `{firstName}` in the First Name field.
4. Enter `{lastName}` in the Last Name field.
5. Clear the Employee Id field and enter `{employeeId}`.
6. Leave the **Create Login Details** toggle off.
7. Click **Save**.

**Expected result**
- A success prompt shows **Successfully Saved**.
- The browser navigates to `/web/index.php/pim/viewPersonalDetails/empNumber/{n}`, where `{n}` is a numeric internal id.
- The page header reads **Personal Details**.
- The First Name and Last Name fields on the resulting page are populated with `{firstName}` and `{lastName}`.
- The Employee Id field on the resulting page shows `{employeeId}`.

> **Automation note:** the outcome assertion is the persisted Personal Details record and the `empNumber` in the URL, not the prompt.

---

## TC-04 — Newly created employee is retrievable via PIM search

| | |
| --- | --- |
| **Priority / Risk** | P1 / High |
| **Type** | State / verification |
| **Automated** | Yes — asserted at the end of the TC-03 spec |

**Preconditions**
- TC-03 has completed successfully in the same session; `{firstName}`, `{lastName}`, and `{employeeId}` are known.

**Steps**
1. Click **PIM** in the sidebar to return to the Employee List.
2. Enter `{employeeId}` in the **Employee Id** field.
3. Click **Search**.

**Expected result**
- The results area reports **(1) Record Found**.
- Exactly one row is returned.
- That row's Id cell shows `{employeeId}`.
- That row's First (& Middle) Name cell shows `{firstName}` and its Last Name cell shows `{lastName}`.
- Clicking the row opens the Personal Details page for the same `empNumber` created in TC-03.

> **Rationale:** searching by Employee Id rather than Employee Name is deliberate. The Employee Name field is an autocomplete that validates against a list. Name-based search is done separately during exploratory execution.

---

## TC-05 — Save is blocked when Last Name is empty

| | |
| --- | --- |
| **Priority / Risk** | P1 / High |
| **Type** | Validation |
| **Automated** | Yes — `tests/add-employee.spec.ts` |

**Preconditions**
- Logged in as `Admin`.
- On the PIM → Add Employee page.

**Test data**
- First Name: `{firstName}`
- Last Name: *(empty)*

**Steps**
1. Enter `{firstName}` in the First Name field.
2. Leave the Last Name field empty.
3. Click **Save**.

**Expected result**
- A **Required** validation message is displayed directly beneath the Last Name field.
- The URL remains `/web/index.php/pim/addEmployee`.
- No success toast appears.
- No employee record is created — a subsequent PIM search for `{firstName}` returns **(0) Records Found**.

---

## TC-06 — Duplicate Employee Id is rejected

| | |
| --- | --- |
| **Priority / Risk** | P2 / Medium |
| **Type** | Negative / uniqueness |
| **Automated** | No — see README tradeoffs |

**Preconditions**
- Logged in as `Admin`.
- An employee with Employee Id `{employeeId}` already exists (created in TC-03).

**Test data**
- First Name: `{firstName}Dup`
- Last Name: `{lastName}Dup`
- Employee Id: `{employeeId}` (the existing value)

**Steps**
1. Navigate to PIM → **+ Add Employee**.
2. Enter `{firstName}Dup` in the First Name field.
3. Enter `{lastName}Dup` in the Last Name field.
4. Clear the Employee Id field and enter the existing `{employeeId}`.
5. Click **Save**.

**Expected result**
- A validation message indicating the Employee Id is already in use is displayed beneath the Employee Id field.
- The record is **not** saved and the browser remains on the Add Employee page.
- Data already entered in the First and Last Name fields is preserved so the user can correct the Id without re-typing.

---

## TC-07 — Employee Id enforces its maximum length

| | |
| --- | --- |
| **Priority / Risk** | P3 / Low |
| **Type** | Boundary |
| **Automated** | No — low risk |

**Preconditions**
- Logged in as `Admin`, on the Add Employee page.

**Test data**
- Boundary input: a 10-character numeric string, e.g. `1234567890`
- Over-boundary input: an 11-character numeric string, e.g. `12345678901`

**Steps**
1. Clear the Employee Id field.
2. Type the 10-character value and observe the field contents.
3. Clear the field again and type the 11-character value.
4. Observe the field contents and any validation message.
5. Enter valid First and Last Names and click **Save**.

**Expected result**
- The field does not accept an over-length value.
- Whichever behavior applies, it is consistent between typing and pasting.

---

## TC-08 — Search for a non-existent Employee Id reports no records

| | |
| --- | --- |
| **Priority / Risk** | P2 / Medium |
| **Type** | Negative / user feedback |
| **Automated** | No — covered by TC-05 |

**Preconditions**
- Logged in as `Admin`, on the PIM → Employee List page.

**Test data**
- Employee Id: `999999999` (verified not to exist at execution time)

**Steps**
1. Enter `999999999` in the **Employee Id** field.
2. Click **Search**.

**Expected result**
- A **No Records Found** prompt is displayed.
- The results area reports **(0) Records Found** rather than rendering an empty table with no explanation.
- The search criteria remain populated so the user can amend rather than re-enter them.
- Clicking **Reset** clears the criteria and restores the unfiltered employee list.

---