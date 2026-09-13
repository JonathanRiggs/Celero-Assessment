export interface EmployeeIdentity {
  firstName: string;
  lastName: string;
  employeeId: string;
}

export function generateEmployeeIdentity(): EmployeeIdentity {
  const now = Date.now().toString();

  const firstName = `QA${now.slice(-8)}`;
  const lastName = `Test${now.slice(-6)}`;

  const randomSuffix = Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, '0');
  const employeeId = `${now.slice(-9)}${randomSuffix}`.slice(-9);

  return { firstName, lastName, employeeId };
}
