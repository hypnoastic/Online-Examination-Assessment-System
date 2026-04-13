"use client";

import type { CSSProperties } from "react";
import { useState } from "react";

import {
  createAdminUserRecord,
  filterAdminUserRecords,
  summarizeAdminUserRecords,
  updateAdminUserRole,
  updateAdminUserStatus,
  type AdminUserListFilters,
  type AdminUserRecord,
} from "../../modules/admin";

type UserManagementTableProps = {
  initialUsers: readonly AdminUserRecord[];
  initialFilters: Required<AdminUserListFilters>;
};

type NoticeState = {
  tone: "success" | "error";
  title: string;
  message: string;
} | null;

type CreateUserFormState = {
  name: string;
  email: string;
  role: "ADMIN" | "EXAMINER" | "STUDENT";
  department: string;
};

const defaultFilterState: Required<AdminUserListFilters> = {
  query: "",
  role: "ALL",
  status: "ALL",
};

const defaultCreateFormState: CreateUserFormState = {
  name: "",
  email: "",
  role: "STUDENT",
  department: "",
};

const workspaceStyle: CSSProperties = {
  display: "grid",
  gap: "18px",
};

const noticeStyle = (tone: "success" | "error"): CSSProperties => ({
  display: "grid",
  gap: "8px",
  padding: "16px 18px",
  borderRadius: "18px",
  border: tone === "success" ? "1px solid rgba(21, 128, 61, 0.18)" : "1px solid rgba(185, 28, 28, 0.16)",
  background: tone === "success" ? "rgba(240, 253, 244, 0.92)" : "rgba(254, 242, 242, 0.92)",
});

const createCardStyle: CSSProperties = {
  display: "grid",
  gap: "16px",
  padding: "20px",
  borderRadius: "22px",
  background: "rgba(245, 248, 252, 0.96)",
  border: "1px solid rgba(16, 35, 60, 0.08)",
};

const createGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
  gap: "12px",
  alignItems: "end",
};

const toolbarStyle: CSSProperties = {
  display: "grid",
  gap: "16px",
};

const toolbarGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "minmax(220px, 1.8fr) repeat(2, minmax(180px, 1fr)) auto",
  gap: "12px",
  alignItems: "end",
};

const inputGroupStyle: CSSProperties = {
  display: "grid",
  gap: "8px",
};

const labelStyle: CSSProperties = {
  fontSize: "0.85rem",
  fontWeight: 600,
  color: "#334155",
};

const inputStyle: CSSProperties = {
  height: "48px",
  padding: "0 14px",
  borderRadius: "12px",
  border: "1px solid #d5dfea",
  background: "#ffffff",
  color: "#10233c",
  fontSize: "0.95rem",
};

const buttonStyle: CSSProperties = {
  display: "inline-flex",
  justifyContent: "center",
  alignItems: "center",
  height: "48px",
  padding: "0 18px",
  borderRadius: "12px",
  border: "none",
  background: "#1f4f82",
  color: "#f8fafc",
  fontWeight: 600,
  cursor: "pointer",
};

const secondaryButtonStyle: CSSProperties = {
  display: "inline-flex",
  justifyContent: "center",
  alignItems: "center",
  height: "48px",
  padding: "0 18px",
  borderRadius: "12px",
  border: "1px solid #d5dfea",
  background: "#ffffff",
  color: "#10233c",
  fontWeight: 600,
  cursor: "pointer",
};

const summaryGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
  gap: "12px",
};

const summaryCardStyle: CSSProperties = {
  display: "grid",
  gap: "6px",
  padding: "14px 16px",
  borderRadius: "16px",
  background: "rgba(245, 248, 252, 0.96)",
  border: "1px solid rgba(16, 35, 60, 0.08)",
};

const tableWrapperStyle: CSSProperties = {
  overflowX: "auto",
  borderRadius: "18px",
  border: "1px solid rgba(16, 35, 60, 0.08)",
};

const tableStyle: CSSProperties = {
  width: "100%",
  borderCollapse: "collapse",
  background: "#ffffff",
};

const headerCellStyle: CSSProperties = {
  padding: "14px 16px",
  textAlign: "left",
  fontSize: "0.82rem",
  fontWeight: 700,
  letterSpacing: "0.04em",
  textTransform: "uppercase",
  color: "#475569",
  background: "#f5f8fc",
  borderBottom: "1px solid rgba(16, 35, 60, 0.08)",
};

const cellStyle: CSSProperties = {
  padding: "16px",
  borderBottom: "1px solid rgba(16, 35, 60, 0.08)",
  verticalAlign: "top",
};

const rowControlStyle: CSSProperties = {
  display: "grid",
  gap: "8px",
};

const rowActionStyle: CSSProperties = {
  display: "flex",
  gap: "8px",
  alignItems: "center",
};

const actionButtonStyle: CSSProperties = {
  display: "inline-flex",
  justifyContent: "center",
  alignItems: "center",
  height: "36px",
  padding: "0 12px",
  borderRadius: "10px",
  border: "none",
  background: "#10233c",
  color: "#f8fafc",
  fontWeight: 600,
  cursor: "pointer",
};

const emptyStateStyle: CSSProperties = {
  display: "grid",
  gap: "12px",
  padding: "24px",
  borderRadius: "18px",
  background: "rgba(236, 244, 248, 0.8)",
  border: "1px dashed rgba(31, 79, 130, 0.34)",
};

const getRoleBadgeStyle = (role: AdminUserRecord["role"]): CSSProperties => {
  switch (role) {
    case "ADMIN":
      return {
        background: "rgba(31, 79, 130, 0.12)",
        color: "#1f4f82",
      };
    case "EXAMINER":
      return {
        background: "rgba(15, 118, 110, 0.12)",
        color: "#0f766e",
      };
    case "STUDENT":
      return {
        background: "rgba(3, 105, 161, 0.12)",
        color: "#0369a1",
      };
  }
};

const getStatusBadgeStyle = (status: AdminUserRecord["status"]): CSSProperties =>
  status === "ACTIVE"
    ? {
        background: "rgba(21, 128, 61, 0.12)",
        color: "#15803d",
      }
    : {
        background: "rgba(180, 83, 9, 0.12)",
        color: "#b45309",
      };

const formatDateTime = (value: Date): string =>
  new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(value);

export function UserManagementTable({ initialUsers, initialFilters }: UserManagementTableProps) {
  const [records, setRecords] = useState(initialUsers);
  const [filterDraft, setFilterDraft] = useState(initialFilters);
  const [filters, setFilters] = useState(initialFilters);
  const [createForm, setCreateForm] = useState(defaultCreateFormState);
  const [roleDrafts, setRoleDrafts] = useState<Record<string, AdminUserRecord["role"]>>({});
  const [statusDrafts, setStatusDrafts] = useState<Record<string, AdminUserRecord["status"]>>({});
  const [notice, setNotice] = useState<NoticeState>(null);

  const visibleUsers = filterAdminUserRecords(records, filters);
  const summary = summarizeAdminUserRecords(records, visibleUsers);

  const handleCreateUser = () => {
    const result = createAdminUserRecord(records, createForm);

    if (!result.ok) {
      setNotice({
        tone: "error",
        title: "Create user failed",
        message: result.message,
      });
      return;
    }

    setRecords(result.records);
    setCreateForm(defaultCreateFormState);
    setNotice({
      tone: "success",
      title: "User created",
      message: result.message,
    });
  };

  const handleRoleUpdate = (userId: string, currentRole: AdminUserRecord["role"]) => {
    const nextRole = roleDrafts[userId] ?? currentRole;
    const result = updateAdminUserRole(records, {
      userId,
      role: nextRole,
    });

    if (!result.ok) {
      setNotice({
        tone: "error",
        title: "Role update failed",
        message: result.message,
      });
      return;
    }

    setRecords(result.records);
    setNotice({
      tone: "success",
      title: "Role updated",
      message: result.message,
    });
  };

  const handleStatusUpdate = (userId: string, currentStatus: AdminUserRecord["status"]) => {
    const nextStatus = statusDrafts[userId] ?? currentStatus;
    const result = updateAdminUserStatus(records, {
      userId,
      status: nextStatus,
    });

    if (!result.ok) {
      setNotice({
        tone: "error",
        title: "Status update failed",
        message: result.message,
      });
      return;
    }

    setRecords(result.records);
    setNotice({
      tone: "success",
      title: "Status updated",
      message: result.message,
    });
  };

  return (
    <div style={workspaceStyle}>
      {notice ? (
        <div role="status" aria-live="polite" style={noticeStyle(notice.tone)}>
          <p style={{ margin: 0, fontWeight: 700, color: "#10233c" }}>{notice.title}</p>
          <p style={{ margin: 0, color: "#4b647a", lineHeight: 1.6 }}>{notice.message}</p>
        </div>
      ) : null}

      <section style={createCardStyle}>
        <div style={{ display: "grid", gap: "8px" }}>
          <h3 style={{ margin: 0, fontSize: "1.05rem", color: "#10233c" }}>Create Or Invite User</h3>
          <p style={{ margin: 0, color: "#4b647a", lineHeight: 1.6 }}>
            Add a new account to the working admin list and set the starting role before later provisioning
            details arrive.
          </p>
        </div>

        <div style={createGridStyle}>
          <div style={inputGroupStyle}>
            <label htmlFor="create-name" style={labelStyle}>
              Full name
            </label>
            <input
              id="create-name"
              value={createForm.name}
              onChange={(event) =>
                setCreateForm((current) => ({
                  ...current,
                  name: event.target.value,
                }))
              }
              style={inputStyle}
            />
          </div>

          <div style={inputGroupStyle}>
            <label htmlFor="create-email" style={labelStyle}>
              Email
            </label>
            <input
              id="create-email"
              type="email"
              value={createForm.email}
              onChange={(event) =>
                setCreateForm((current) => ({
                  ...current,
                  email: event.target.value,
                }))
              }
              style={inputStyle}
            />
          </div>

          <div style={inputGroupStyle}>
            <label htmlFor="create-role" style={labelStyle}>
              Starting role
            </label>
            <select
              id="create-role"
              value={createForm.role}
              onChange={(event) =>
                setCreateForm((current) => ({
                  ...current,
                  role: event.target.value as CreateUserFormState["role"],
                }))
              }
              style={inputStyle}
            >
              <option value="ADMIN">Admin</option>
              <option value="EXAMINER">Examiner</option>
              <option value="STUDENT">Student</option>
            </select>
          </div>

          <div style={inputGroupStyle}>
            <label htmlFor="create-department" style={labelStyle}>
              Department
            </label>
            <input
              id="create-department"
              value={createForm.department}
              onChange={(event) =>
                setCreateForm((current) => ({
                  ...current,
                  department: event.target.value,
                }))
              }
              style={inputStyle}
            />
          </div>

          <div style={{ display: "flex", gap: "12px", alignItems: "end" }}>
            <button type="button" style={buttonStyle} onClick={handleCreateUser}>
              Create User
            </button>
            <button
              type="button"
              style={secondaryButtonStyle}
              onClick={() => {
                setCreateForm(defaultCreateFormState);
                setNotice(null);
              }}
            >
              Clear
            </button>
          </div>
        </div>
      </section>

      <form
        style={toolbarStyle}
        onSubmit={(event) => {
          event.preventDefault();
          setFilters(filterDraft);
        }}
      >
        <div style={toolbarGridStyle}>
          <div style={inputGroupStyle}>
            <label htmlFor="q" style={labelStyle}>
              Search name or email
            </label>
            <input
              id="q"
              name="q"
              type="search"
              value={filterDraft.query}
              placeholder="Search by user name or institutional email"
              onChange={(event) =>
                setFilterDraft((current) => ({
                  ...current,
                  query: event.target.value,
                }))
              }
              style={inputStyle}
            />
          </div>

          <div style={inputGroupStyle}>
            <label htmlFor="role" style={labelStyle}>
              Role
            </label>
            <select
              id="role"
              name="role"
              value={filterDraft.role}
              onChange={(event) =>
                setFilterDraft((current) => ({
                  ...current,
                  role: event.target.value as Required<AdminUserListFilters>["role"],
                }))
              }
              style={inputStyle}
            >
              <option value="ALL">All roles</option>
              <option value="ADMIN">Admin</option>
              <option value="EXAMINER">Examiner</option>
              <option value="STUDENT">Student</option>
            </select>
          </div>

          <div style={inputGroupStyle}>
            <label htmlFor="status" style={labelStyle}>
              Status
            </label>
            <select
              id="status"
              name="status"
              value={filterDraft.status}
              onChange={(event) =>
                setFilterDraft((current) => ({
                  ...current,
                  status: event.target.value as Required<AdminUserListFilters>["status"],
                }))
              }
              style={inputStyle}
            >
              <option value="ALL">All statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
            </select>
          </div>

          <div style={{ display: "flex", gap: "12px", alignItems: "end" }}>
            <button type="submit" style={buttonStyle}>
              Apply Filters
            </button>
            <button
              type="button"
              style={secondaryButtonStyle}
              onClick={() => {
                setFilterDraft(defaultFilterState);
                setFilters(defaultFilterState);
              }}
            >
              Reset
            </button>
          </div>
        </div>

        <div style={summaryGridStyle}>
          {[
            { label: "Visible", value: String(summary.visible) },
            { label: "All Users", value: String(summary.total) },
            { label: "Active", value: String(summary.activeCount) },
            { label: "Inactive", value: String(summary.inactiveCount) },
            { label: "Admins", value: String(summary.adminCount) },
            { label: "Examiners", value: String(summary.examinerCount) },
            { label: "Students", value: String(summary.studentCount) },
          ].map((item) => (
            <div key={item.label} style={summaryCardStyle}>
              <p style={{ margin: 0, fontSize: "0.8rem", color: "#64748b", textTransform: "uppercase" }}>
                {item.label}
              </p>
              <p style={{ margin: 0, fontSize: "1.35rem", fontWeight: 700, color: "#10233c" }}>{item.value}</p>
            </div>
          ))}
        </div>
      </form>

      {visibleUsers.length === 0 ? (
        <div style={emptyStateStyle}>
          <p style={{ margin: 0, fontSize: "1.05rem", fontWeight: 700, color: "#10233c" }}>
            No users match the current filters.
          </p>
          <p style={{ margin: 0, color: "#4b647a", lineHeight: 1.6 }}>
            Try clearing one filter or broadening the search query so the admin table can show matching
            accounts again.
          </p>
        </div>
      ) : (
        <div style={tableWrapperStyle}>
          <table style={tableStyle}>
            <thead>
              <tr>
                <th style={headerCellStyle}>User</th>
                <th style={headerCellStyle}>Role</th>
                <th style={headerCellStyle}>Status</th>
                <th style={headerCellStyle}>Department</th>
                <th style={headerCellStyle}>Last Active</th>
              </tr>
            </thead>
            <tbody>
              {visibleUsers.map((user) => (
                <tr key={user.id}>
                  <td style={cellStyle}>
                    <div style={{ display: "grid", gap: "6px" }}>
                      <p style={{ margin: 0, fontWeight: 700, color: "#10233c" }}>{user.name}</p>
                      <p style={{ margin: 0, color: "#475569" }}>{user.email}</p>
                    </div>
                  </td>
                  <td style={cellStyle}>
                    <div style={rowControlStyle}>
                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          width: "fit-content",
                          padding: "7px 11px",
                          borderRadius: "999px",
                          fontSize: "0.85rem",
                          fontWeight: 600,
                          ...getRoleBadgeStyle(user.role),
                        }}
                      >
                        {user.role}
                      </span>
                      <div style={rowActionStyle}>
                        <select
                          aria-label={`Change role for ${user.name}`}
                          value={roleDrafts[user.id] ?? user.role}
                          onChange={(event) =>
                            setRoleDrafts((current) => ({
                              ...current,
                              [user.id]: event.target.value as AdminUserRecord["role"],
                            }))
                          }
                          style={{ ...inputStyle, height: "36px", minWidth: "132px" }}
                        >
                          <option value="ADMIN">Admin</option>
                          <option value="EXAMINER">Examiner</option>
                          <option value="STUDENT">Student</option>
                        </select>
                        <button
                          type="button"
                          style={actionButtonStyle}
                          onClick={() => handleRoleUpdate(user.id, user.role)}
                        >
                          Save Role
                        </button>
                      </div>
                    </div>
                  </td>
                  <td style={cellStyle}>
                    <div style={rowControlStyle}>
                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          width: "fit-content",
                          padding: "7px 11px",
                          borderRadius: "999px",
                          fontSize: "0.85rem",
                          fontWeight: 600,
                          ...getStatusBadgeStyle(user.status),
                        }}
                      >
                        {user.status}
                      </span>
                      <div style={rowActionStyle}>
                        <select
                          aria-label={`Change status for ${user.name}`}
                          value={statusDrafts[user.id] ?? user.status}
                          onChange={(event) =>
                            setStatusDrafts((current) => ({
                              ...current,
                              [user.id]: event.target.value as AdminUserRecord["status"],
                            }))
                          }
                          style={{ ...inputStyle, height: "36px", minWidth: "132px" }}
                        >
                          <option value="ACTIVE">Active</option>
                          <option value="INACTIVE">Inactive</option>
                        </select>
                        <button
                          type="button"
                          style={actionButtonStyle}
                          onClick={() => handleStatusUpdate(user.id, user.status)}
                        >
                          Save Status
                        </button>
                      </div>
                    </div>
                  </td>
                  <td style={cellStyle}>{user.department}</td>
                  <td style={cellStyle}>{formatDateTime(user.lastActiveAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
