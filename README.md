# Celero Assessment —  E2E Tests

Playwright end-to-end test suite covering login and PIM "Add Employee"
workflows against the public OrangeHRM demo instance:
`https://opensource-demo.orangehrmlive.com`.

## Prerequisites

- Node.js 18 or later (CI uses `lts/*`)
- npm
- Internet access

## Installation

```bash
git clone <repo-url>
cd celero-assessment
npm ci
npx playwright install --with-deps
```

`npm ci` installs the exact versions from `package-lock.json`
(`@playwright/test`, `@types/node`). `npx playwright install --with-deps`
downloads the browser binaries Playwright drives and, on Linux, their system
dependencies. `--with-deps` needs sudo/apt access; omit it if that's
unavailable and install OS packages manually per the Playwright docs.

## Configuration

All configuration lives in [playwright.config.ts](playwright.config.ts):

- **Base URL** — hardcoded to the public demo (`baseURL:
  "https://opensource-demo.orangehrmlive.com"`). There's no `.env` file or
  environment-variable override in use today; the `dotenv` lines at the top
  of the config are scaffolding, commented out.
- **Credentials** — the demo's standard public admin login (`Admin` /
  `admin123`) is hardcoded in [tests/utils/page-helpers.ts](tests/utils/page-helpers.ts).
  This is intentional: it's the documented default credential for this demo
  instance, not a secret.
- **Browser projects** — only `chromium` is currently enabled. `firefox` and
  the mobile/branded browser projects are present in the config but commented
  out.
- **Retries / workers** — `retries` and `workers` are conditioned on
  `process.env.CI`: no retries and full parallelism locally, 2 retries and a
  single worker on CI.
- **Reporter** — HTML (`reporter: "html"`), written to `playwright-report/`.

## Running the tests

```bash
# Run everything (chromium, per current config)
npx playwright test

# Run a single spec file
npx playwright test tests/add-employee.spec.ts

# Run a single test by name
npx playwright test -g "save is blocked when Last Name is missing"

# Run headed, for local debugging
npx playwright test --headed

# Interactive UI mode
npx playwright test --ui

# View the last HTML report
npx playwright show-report
```


## Test suite layout

```
tests/
  login.spec.ts          TC-01, TC-02 — authentication
  add-employee.spec.ts   TC-03, TC-04, TC-05 — add / search / validate
  utils/
    page-helpers.ts       login() precondition + getInputByLabel() locator helper
    test-data.ts          generateEmployeeIdentity()
docs/
  test-cases.md           Full manual test case catalogue (TC-01 through TC-08),
                           including the ones not yet automated
```

`docs/test-cases.md` is the source of truth for test intent, preconditions,
and expected results.

## Test-data strategy

Every automated run against the shared demo generates a new and
unique employee identity rather than using the same one, so parallel or
repeated runs don't collide on Employee Id or produce ambiguous search results. 
See [tests/utils/test-data.ts](tests/utils/test-data.ts):

| Field | Convention | Example |
| --- | --- | --- |
| First Name | `QA` + last 8 digits of `Date.now()` | `QA17263841` |
| Last Name | `Test` + last 6 digits of `Date.now()` | `Test638412` |
| Employee Id | last 9 digits of `Date.now()` + 3 random digits, truncated to 9 | `638412907` |

The timestamp component makes collisions across separate test runs unlikely.

## Assumptions

- The suite runs against the **shared, public** OrangeHRM demo. It is not a
  disposable environment: data created here persists and is visible to
  anyone else using the same instance.
- No test performs cleanup/teardown of created employees — see Known
  Limitations.
- The standard demo admin credentials (`Admin` / `admin123`) are valid and
  unchanged.
- Network access to `opensource-demo.orangehrmlive.com` is available and the
  demo is up; there is no mock/stub layer.
- Structural assumptions about the app's DOM are baked into the locators
  (e.g. `getInputByLabel` matches an `<input>` inside a `.oxd-input-group`
  that has a `<label>` with the given text). This works for fields like
  **Employee Id** and **Employee Name**, which have real `<label>` elements.
  The **First/Middle/Last Name** fields on the Add Employee and Personal
  Details pages do *not* have individual labels — they sit under one shared
  "Employee Full Name" label — so those specific fields are located by
  placeholder text (`page.getByPlaceholder(...)`) instead.

## Known limitations

- **No data cleanup.** Employees created by TC-03/TC-04 runs are never
  deleted, so the shared demo accumulates `QA*`/`Test*` records over time.
  There is no API or UI teardown step in this suite.
- **Coverage gaps (documented, not automated).** `docs/test-cases.md` defines
  TC-06 (duplicate Employee Id), TC-07 (Employee Id max length), and TC-08
  (search for a non-existent id) as manual-only, lower-priority cases not yet
  automated.
- **Docs vs. actual UI text drift.** `docs/test-cases.md` (TC-05, TC-08)
  describes the zero-results state as `(0) Records Found`. The live demo
  actually renders `No Records Found` for an empty result set (there is no
  `(0) Records Found` string in the app) — `add-employee.spec.ts` asserts
  the real text. The doc wording is stale and should be reconciled.
- **External, uncontrolled dependency.** Because the target is a public demo
  rather than an environment this project owns, tests are exposed to that
  demo's own downtime, latency, data resets, or unannounced UI changes,
  independent of anything in this repo.
- **Single-browser default.** Only Chromium runs unless the config is edited
  to re-enable Firefox/WebKit, so cross-browser regressions won't surface
  from a default `npx playwright test` run or from CI as currently
  configured.

## Running from a clean clone — checklist

1. `git clone <repo-url> && cd celero-assessment`
2. `npm ci`
3. `npx playwright install --with-deps`
4. `npx playwright test`
5. `npx playwright show-report` to inspect results (also uploaded as a CI
   artifact by [.github/workflows/playwright.yml](.github/workflows/playwright.yml) on every push/PR to
   `main`/`master`)
