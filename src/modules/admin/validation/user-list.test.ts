import assert from "node:assert/strict";
import test from "node:test";

import {
  ADMIN_USER_ROLES,
  ADMIN_USER_STATUSES,
  createAdminUserRecord,
  filterAdminUserRecords,
  listAdminUserRecords,
  summarizeAdminUserRecords,
  updateAdminUserRole,
  updateAdminUserStatus,
} from "../index";

test("admin user list contracts keep supported role and status filters stable", () => {
  assert.deepEqual(ADMIN_USER_ROLES, ["ADMIN", "EXAMINER", "STUDENT"]);
  assert.deepEqual(ADMIN_USER_STATUSES, ["ACTIVE", "INACTIVE"]);
});

test("admin user list filters by role and status independently and together", () => {
  const users = listAdminUserRecords();

  assert.equal(filterAdminUserRecords(users, { role: "ADMIN" }).length, 2);
  assert.equal(filterAdminUserRecords(users, { status: "INACTIVE" }).length, 2);

  const filtered = filterAdminUserRecords(users, {
    role: "EXAMINER",
    status: "ACTIVE",
  });

  assert.deepEqual(
    filtered.map((user) => user.email),
    ["rahul.verma@college.edu", "ankit.sharma@college.edu"],
  );
});

test("admin user list search matches name or email without case sensitivity", () => {
  const users = listAdminUserRecords();

  assert.deepEqual(
    filterAdminUserRecords(users, { query: "priya" }).map((user) => user.name),
    ["Priya Singh"],
  );

  assert.deepEqual(
    filterAdminUserRecords(users, { query: "ANKIT.SHARMA@" }).map((user) => user.name),
    ["Ankit Sharma"],
  );
});

test("admin user list can resolve to an empty state when filters remove all rows", () => {
  const users = listAdminUserRecords();
  const visible = filterAdminUserRecords(users, {
    role: "ADMIN",
    status: "INACTIVE",
    query: "nobody",
  });

  assert.deepEqual(visible, []);
});

test("admin user summary keeps the full and visible counts readable", () => {
  const users = listAdminUserRecords();
  const visible = filterAdminUserRecords(users, { status: "ACTIVE" });

  assert.deepEqual(summarizeAdminUserRecords(users, visible), {
    total: 8,
    visible: 6,
    activeCount: 6,
    inactiveCount: 2,
    adminCount: 2,
    examinerCount: 3,
    studentCount: 3,
  });
});

test("admin can create a user when the email is unique and the role is valid", () => {
  const users = listAdminUserRecords();
  const result = createAdminUserRecord(users, {
    name: "Isha Nair",
    email: "isha.nair@college.edu",
    role: "EXAMINER",
    department: "Physics",
  });

  assert.equal(result.ok, true);
  if (!result.ok) {
    return;
  }

  assert.equal(result.records.length, 9);
  assert.equal(result.records.some((user) => user.email === "isha.nair@college.edu"), true);
});

test("duplicate email and invalid role errors remain clear during user creation", () => {
  const users = listAdminUserRecords();

  const duplicate = createAdminUserRecord(users, {
    name: "Duplicate User",
    email: "abhishek.rana@college.edu",
    role: "ADMIN",
    department: "Ops",
  });
  assert.deepEqual(duplicate, {
    ok: false,
    code: "DUPLICATE_EMAIL",
    message: "A user with abhishek.rana@college.edu already exists. Use a different email address.",
  });

  const invalidRole = createAdminUserRecord(users, {
    name: "Role Error",
    email: "role.error@college.edu",
    role: "OWNER",
    department: "Ops",
  });
  assert.deepEqual(invalidRole, {
    ok: false,
    code: "INVALID_ROLE",
    message: "Choose a valid role: Admin, Examiner, or Student.",
  });
});

test("admin can update user role and status with clear invalid-option handling", () => {
  const users = listAdminUserRecords();

  const roleResult = updateAdminUserRole(users, {
    userId: "user-student-001",
    role: "EXAMINER",
  });
  assert.equal(roleResult.ok, true);
  if (roleResult.ok) {
    const updated = roleResult.records.find((user) => user.id === "user-student-001");
    assert.equal(updated?.role, "EXAMINER");
  }

  const statusResult = updateAdminUserStatus(users, {
    userId: "user-examiner-002",
    status: "ACTIVE",
  });
  assert.equal(statusResult.ok, true);
  if (statusResult.ok) {
    const updated = statusResult.records.find((user) => user.id === "user-examiner-002");
    assert.equal(updated?.status, "ACTIVE");
  }

  assert.deepEqual(updateAdminUserRole(users, { userId: "user-student-001", role: "OWNER" }), {
    ok: false,
    code: "INVALID_ROLE",
    message: "Choose a valid role before saving the update.",
  });
});
