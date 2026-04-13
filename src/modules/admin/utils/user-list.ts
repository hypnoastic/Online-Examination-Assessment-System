import type {
  AdminCreateUserInput,
  AdminUserListFilters,
  AdminUserListSummary,
  AdminUserMutationResult,
  AdminUserRecord,
  AdminUserRole,
  AdminUserStatus,
  AdminUpdateUserRoleInput,
  AdminUpdateUserStatusInput,
} from "../domain/user-management.types.ts";

export const listAdminUserRecords = (): AdminUserRecord[] => [
  {
    id: "user-admin-001",
    name: "Abhishek Rana",
    email: "abhishek.rana@college.edu",
    role: "ADMIN",
    status: "ACTIVE",
    department: "Academic Operations",
    lastActiveAt: new Date("2026-04-13T09:15:00.000Z"),
  },
  {
    id: "user-admin-002",
    name: "Meera Joshi",
    email: "meera.joshi@college.edu",
    role: "ADMIN",
    status: "ACTIVE",
    department: "Examination Cell",
    lastActiveAt: new Date("2026-04-13T07:35:00.000Z"),
  },
  {
    id: "user-examiner-001",
    name: "Rahul Verma",
    email: "rahul.verma@college.edu",
    role: "EXAMINER",
    status: "ACTIVE",
    department: "Computer Science",
    lastActiveAt: new Date("2026-04-13T08:10:00.000Z"),
  },
  {
    id: "user-examiner-002",
    name: "Sonia Malhotra",
    email: "sonia.malhotra@college.edu",
    role: "EXAMINER",
    status: "INACTIVE",
    department: "Electronics",
    lastActiveAt: new Date("2026-04-09T11:45:00.000Z"),
  },
  {
    id: "user-examiner-003",
    name: "Ankit Sharma",
    email: "ankit.sharma@college.edu",
    role: "EXAMINER",
    status: "ACTIVE",
    department: "Mathematics",
    lastActiveAt: new Date("2026-04-12T15:20:00.000Z"),
  },
  {
    id: "user-student-001",
    name: "Priya Singh",
    email: "priya.singh@college.edu",
    role: "STUDENT",
    status: "ACTIVE",
    department: "B.Tech CSE",
    lastActiveAt: new Date("2026-04-13T09:05:00.000Z"),
  },
  {
    id: "user-student-002",
    name: "Arjun Patel",
    email: "arjun.patel@college.edu",
    role: "STUDENT",
    status: "ACTIVE",
    department: "B.Tech ECE",
    lastActiveAt: new Date("2026-04-12T13:25:00.000Z"),
  },
  {
    id: "user-student-003",
    name: "Neha Kapoor",
    email: "neha.kapoor@college.edu",
    role: "STUDENT",
    status: "INACTIVE",
    department: "BCA",
    lastActiveAt: new Date("2026-04-06T10:30:00.000Z"),
  },
];

const normalizeQuery = (query?: string): string => query?.trim().toLowerCase() ?? "";

const normalizeEmail = (email: string): string => email.trim().toLowerCase();

const isAdminUserRole = (value: string): value is AdminUserRole =>
  value === "ADMIN" || value === "EXAMINER" || value === "STUDENT";

const isAdminUserStatus = (value: string): value is AdminUserStatus =>
  value === "ACTIVE" || value === "INACTIVE";

const matchesQuery = (record: AdminUserRecord, query: string): boolean =>
  query.length === 0 ||
  [record.name, record.email].some((value) => value.toLowerCase().includes(query));

const sortUsers = (records: readonly AdminUserRecord[]): AdminUserRecord[] =>
  [...records].sort((left, right) => {
    const activeDelta = right.lastActiveAt.getTime() - left.lastActiveAt.getTime();

    if (activeDelta !== 0) {
      return activeDelta;
    }

    return left.name.localeCompare(right.name);
  });

export const filterAdminUserRecords = (
  records: readonly AdminUserRecord[],
  filters: AdminUserListFilters = {},
): AdminUserRecord[] => {
  const query = normalizeQuery(filters.query);

  return sortUsers(
    records.filter((record) => {
      if (filters.role && filters.role !== "ALL" && record.role !== filters.role) {
        return false;
      }

      if (filters.status && filters.status !== "ALL" && record.status !== filters.status) {
        return false;
      }

      if (!matchesQuery(record, query)) {
        return false;
      }

      return true;
    }),
  );
};

export const summarizeAdminUserRecords = (
  allRecords: readonly AdminUserRecord[],
  visibleRecords: readonly AdminUserRecord[],
): AdminUserListSummary => {
  const countRole = (role: AdminUserRole): number =>
    allRecords.filter((record) => record.role === role).length;
  const countStatus = (status: AdminUserStatus): number =>
    allRecords.filter((record) => record.status === status).length;

  return {
    total: allRecords.length,
    visible: visibleRecords.length,
    activeCount: countStatus("ACTIVE"),
    inactiveCount: countStatus("INACTIVE"),
    adminCount: countRole("ADMIN"),
    examinerCount: countRole("EXAMINER"),
    studentCount: countRole("STUDENT"),
  };
};

export const createAdminUserRecord = (
  records: readonly AdminUserRecord[],
  input: AdminCreateUserInput,
  now: Date = new Date(),
): AdminUserMutationResult => {
  const name = input.name.trim();
  const email = normalizeEmail(input.email);
  const department = input.department.trim();

  if (name.length === 0 || email.length === 0 || department.length === 0) {
    return {
      ok: false,
      code: "MISSING_FIELDS",
      message: "Name, email, and department are required to create or invite a user.",
    };
  }

  if (!isAdminUserRole(input.role)) {
    return {
      ok: false,
      code: "INVALID_ROLE",
      message: "Choose a valid role: Admin, Examiner, or Student.",
    };
  }

  if (records.some((record) => normalizeEmail(record.email) === email)) {
    return {
      ok: false,
      code: "DUPLICATE_EMAIL",
      message: `A user with ${email} already exists. Use a different email address.`,
    };
  }

  const nextRecord: AdminUserRecord = {
    id: `user-${input.role.toLowerCase()}-${records.length + 1}`.replace(/\s+/g, "-"),
    name,
    email,
    role: input.role,
    status: "ACTIVE",
    department,
    lastActiveAt: now,
  };

  return {
    ok: true,
    records: sortUsers([...records, nextRecord]),
    message: `${name} was created and invited as ${input.role}.`,
  };
};

export const updateAdminUserRole = (
  records: readonly AdminUserRecord[],
  input: AdminUpdateUserRoleInput,
): AdminUserMutationResult => {
  if (!isAdminUserRole(input.role)) {
    return {
      ok: false,
      code: "INVALID_ROLE",
      message: "Choose a valid role before saving the update.",
    };
  }

  const nextRole: AdminUserRole = input.role;

  const target = records.find((record) => record.id === input.userId);

  if (!target) {
    return {
      ok: false,
      code: "USER_NOT_FOUND",
      message: "The selected user could not be found for the role update.",
    };
  }

  return {
    ok: true,
    records: sortUsers(
      records.map<AdminUserRecord>((record) =>
        record.id === input.userId
          ? {
              ...record,
              role: nextRole,
            }
          : record,
      ),
    ),
    message: `${target.name} is now assigned the ${nextRole} role.`,
  };
};

export const updateAdminUserStatus = (
  records: readonly AdminUserRecord[],
  input: AdminUpdateUserStatusInput,
): AdminUserMutationResult => {
  if (!isAdminUserStatus(input.status)) {
    return {
      ok: false,
      code: "INVALID_STATUS",
      message: "Choose Active or Inactive before saving the status update.",
    };
  }

  const nextStatus: AdminUserStatus = input.status;

  const target = records.find((record) => record.id === input.userId);

  if (!target) {
    return {
      ok: false,
      code: "USER_NOT_FOUND",
      message: "The selected user could not be found for the status update.",
    };
  }

  return {
    ok: true,
    records: sortUsers(
      records.map<AdminUserRecord>((record) =>
        record.id === input.userId
          ? {
              ...record,
              status: nextStatus,
            }
          : record,
      ),
    ),
    message: `${target.name} is now marked ${nextStatus}.`,
  };
};
