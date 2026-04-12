import assert from "node:assert/strict";
import test from "node:test";

import {
  ASSIGNED_EXAM_WINDOW_STATUSES,
  STUDENT_ATTEMPT_STATUSES,
  type AssignedExamRecord,
} from "../domain/assigned-exam.types.ts";
import {
  buildAssignedExamListItem,
  buildAssignedExamListViewModel,
  summarizeAssignedExamList,
} from "../utils/assigned-exam-list.ts";

const baseRecord: AssignedExamRecord = {
  assignmentId: "assignment-dbms",
  examId: "exam-dbms",
  examTitle: "DBMS Midterm",
  examCode: "DBMS-301",
  durationMinutes: 90,
  windowStartsAt: new Date("2026-04-14T09:00:00.000Z"),
  windowEndsAt: new Date("2026-04-14T10:30:00.000Z"),
  windowStatus: "OPEN",
  isManuallyBlocked: false,
  attempt: null,
};

test("assigned exam contracts keep the student exam list states stable", () => {
  assert.deepEqual(ASSIGNED_EXAM_WINDOW_STATUSES, ["UPCOMING", "OPEN", "CLOSED"]);
  assert.deepEqual(STUDENT_ATTEMPT_STATUSES, [
    "IN_PROGRESS",
    "SUBMITTED",
    "AUTO_SUBMITTED",
    "UNDER_REVIEW",
    "EVALUATED",
  ]);
});

test("open assigned exams without an attempt resolve to Start", () => {
  const item = buildAssignedExamListItem(baseRecord);

  assert.equal(item.statusLabel, "Start");
  assert.equal(item.action.disabled, false);
  assert.equal(item.action.href, "/student/exams/exam-dbms/start");
});

test("in-progress attempts resolve to Continue even if the window is no longer open", () => {
  const item = buildAssignedExamListItem({
    ...baseRecord,
    windowStatus: "CLOSED",
    isManuallyBlocked: true,
    attempt: {
      attemptId: "attempt-dbms-1",
      status: "IN_PROGRESS",
      startedAt: new Date("2026-04-14T09:05:00.000Z"),
      expiresAt: new Date("2026-04-14T10:35:00.000Z"),
      submittedAt: null,
    },
  });

  assert.equal(item.statusLabel, "Continue");
  assert.equal(item.action.disabled, false);
  assert.equal(item.action.href, "/student/attempts/attempt-dbms-1");
});

test("locked states explain why the student cannot start the exam", () => {
  const upcoming = buildAssignedExamListItem({
    ...baseRecord,
    assignmentId: "assignment-upcoming",
    examId: "exam-upcoming",
    windowStatus: "UPCOMING",
  });

  const blocked = buildAssignedExamListItem({
    ...baseRecord,
    assignmentId: "assignment-blocked",
    examId: "exam-blocked",
    isManuallyBlocked: true,
  });

  assert.equal(upcoming.statusLabel, "Locked");
  assert.match(upcoming.helperText, /has not opened yet/i);
  assert.equal(upcoming.action.disabled, false);
  assert.equal(upcoming.action.href, "/student/exams/exam-upcoming/start");
  assert.equal(blocked.statusLabel, "Locked");
  assert.match(blocked.helperText, /locked by the examiner/i);
  assert.equal(blocked.action.disabled, false);
  assert.equal(blocked.action.href, "/student/exams/exam-blocked/start");
});

test("submitted and review-complete attempts collapse to Submitted in the list", () => {
  const items = STUDENT_ATTEMPT_STATUSES.filter(
    (status) => status !== "IN_PROGRESS",
  ).map((status) =>
    buildAssignedExamListItem({
      ...baseRecord,
      assignmentId: `assignment-${status.toLowerCase()}`,
      examId: `exam-${status.toLowerCase()}`,
      attempt: {
        attemptId: `attempt-${status.toLowerCase()}`,
        status,
        startedAt: new Date("2026-04-14T09:00:00.000Z"),
        expiresAt: new Date("2026-04-14T10:30:00.000Z"),
        submittedAt: new Date("2026-04-14T10:15:00.000Z"),
      },
    }),
  );

  items.forEach((item) => {
    assert.equal(item.statusLabel, "Submitted");
    assert.equal(item.action.disabled, true);
    assert.equal(item.action.href, null);
  });
});

test("list summary counts and ordering prioritize active student actions first", () => {
  const items = buildAssignedExamListViewModel([
    {
      ...baseRecord,
      assignmentId: "assignment-submitted",
      examId: "exam-submitted",
      examTitle: "Compiler Lab",
      windowStartsAt: new Date("2026-04-20T09:00:00.000Z"),
      attempt: {
        attemptId: "attempt-submitted",
        status: "SUBMITTED",
        startedAt: new Date("2026-04-20T09:00:00.000Z"),
        expiresAt: new Date("2026-04-20T10:00:00.000Z"),
        submittedAt: new Date("2026-04-20T09:45:00.000Z"),
      },
    },
    {
      ...baseRecord,
      assignmentId: "assignment-continue",
      examId: "exam-continue",
      examTitle: "Network Security Quiz",
      windowStartsAt: new Date("2026-04-15T10:00:00.000Z"),
      attempt: {
        attemptId: "attempt-continue",
        status: "IN_PROGRESS",
        startedAt: new Date("2026-04-15T10:05:00.000Z"),
        expiresAt: new Date("2026-04-15T11:05:00.000Z"),
        submittedAt: null,
      },
    },
    {
      ...baseRecord,
      assignmentId: "assignment-locked",
      examId: "exam-locked",
      examTitle: "Operating Systems Viva",
      windowStartsAt: new Date("2026-04-18T08:00:00.000Z"),
      windowStatus: "UPCOMING",
    },
    {
      ...baseRecord,
      assignmentId: "assignment-start",
      examId: "exam-start",
      examTitle: "Discrete Mathematics Practice Test",
      windowStartsAt: new Date("2026-04-16T12:00:00.000Z"),
    },
  ]);

  assert.deepEqual(
    items.map((item) => item.statusLabel),
    ["Continue", "Start", "Locked", "Submitted"],
  );

  assert.deepEqual(summarizeAssignedExamList(items), {
    total: 4,
    startCount: 1,
    continueCount: 1,
    lockedCount: 1,
    submittedCount: 1,
    actionableCount: 2,
  });
});

test("empty assigned exam collections stay valid and summarize to zero counts", () => {
  const items = buildAssignedExamListViewModel([]);

  assert.deepEqual(items, []);
  assert.deepEqual(summarizeAssignedExamList(items), {
    total: 0,
    startCount: 0,
    continueCount: 0,
    lockedCount: 0,
    submittedCount: 0,
    actionableCount: 0,
  });
});
