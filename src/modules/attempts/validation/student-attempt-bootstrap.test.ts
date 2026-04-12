import assert from "node:assert/strict";
import test from "node:test";

import type { AttemptBootstrapRecord } from "../domain/attempt-session.types.ts";
import { toBootstrapAttemptId } from "../utils/attempt-identifiers.ts";
import {
  resolveAttemptSessionEntry,
  resolveExamStartEntry,
} from "../utils/student-attempt-bootstrap.ts";

const fixedNow = new Date("2026-04-12T10:00:00.000Z");

const baseRecord: AttemptBootstrapRecord = {
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
  sessionTemplate: {
    instructions: ["Keep answers concise and relevant."],
    questions: [
      {
        examQuestionId: "eq-2",
        questionId: "question-2",
        questionOrder: 2,
        type: "SHORT_TEXT",
        reviewMode: "MANUAL",
        stem: "Explain ACID properties.",
        maxMarks: 5,
      },
      {
        examQuestionId: "eq-1",
        questionId: "question-1",
        questionOrder: 1,
        type: "SINGLE_CHOICE",
        reviewMode: "OBJECTIVE",
        stem: "Which normal form removes partial dependency?",
        maxMarks: 2,
        options: [
          { id: "opt-1-a", label: "A", text: "1NF" },
          { id: "opt-1-b", label: "B", text: "2NF" },
        ],
      },
    ],
  },
};

test("eligible exams bootstrap a new attempt and question session", () => {
  const entry = resolveExamStartEntry(baseRecord, fixedNow);

  assert.equal(entry.outcome, "READY_TO_START");
  assert.equal(entry.actionHref, "/student/attempts/attempt-exam-dbms-bootstrap");
  assert.equal(entry.session?.questionCount, 2);
  assert.equal(entry.session?.questions[0]?.questionOrder, 1);
  assert.equal(
    entry.session?.expiresAt.toISOString(),
    "2026-04-12T11:30:00.000Z",
  );
});

test("active attempts resume through the correct path instead of creating duplicates", () => {
  const entry = resolveExamStartEntry(
    {
      ...baseRecord,
      attempt: {
        attemptId: "attempt-dbms-1",
        status: "IN_PROGRESS",
        startedAt: new Date("2026-04-12T09:05:00.000Z"),
        expiresAt: new Date("2026-04-12T10:35:00.000Z"),
        submittedAt: null,
      },
    },
    fixedNow,
  );

  assert.equal(entry.outcome, "RESUME_ACTIVE");
  assert.equal(entry.actionHref, "/student/attempts/attempt-dbms-1");
  assert.equal(entry.session?.attemptId, "attempt-dbms-1");
});

test("blocked starts explain window, manual block, and duplicate-attempt cases clearly", () => {
  const upcoming = resolveExamStartEntry(
    { ...baseRecord, windowStatus: "UPCOMING" },
    fixedNow,
  );
  const blocked = resolveExamStartEntry(
    { ...baseRecord, isManuallyBlocked: true },
    fixedNow,
  );
  const submitted = resolveExamStartEntry(
    {
      ...baseRecord,
      attempt: {
        attemptId: "attempt-dbms-closed",
        status: "SUBMITTED",
        startedAt: new Date("2026-04-12T08:00:00.000Z"),
        expiresAt: new Date("2026-04-12T09:30:00.000Z"),
        submittedAt: new Date("2026-04-12T09:20:00.000Z"),
      },
    },
    fixedNow,
  );

  assert.equal(upcoming.outcome, "BLOCKED");
  assert.equal(upcoming.blockReason, "WINDOW_NOT_OPEN");
  assert.match(upcoming.message, /wait until the published start time/i);
  assert.equal(blocked.blockReason, "MANUALLY_BLOCKED");
  assert.match(blocked.message, /blocked access/i);
  assert.equal(submitted.blockReason, "ALREADY_SUBMITTED");
  assert.match(submitted.message, /cannot start it again/i);
});

test("attempt session entry loads question payload for both fresh bootstrap and active resume", () => {
  const bootstrapAttemptId = toBootstrapAttemptId(baseRecord.examId);

  const bootstrapLoad = resolveAttemptSessionEntry(
    [baseRecord],
    bootstrapAttemptId,
    fixedNow,
  );

  const resumedLoad = resolveAttemptSessionEntry(
    [
      {
        ...baseRecord,
        attempt: {
          attemptId: "attempt-dbms-1",
          status: "IN_PROGRESS",
          startedAt: new Date("2026-04-12T09:10:00.000Z"),
          expiresAt: new Date("2026-04-12T10:40:00.000Z"),
          submittedAt: null,
        },
      },
    ],
    "attempt-dbms-1",
    fixedNow,
  );

  assert.equal(bootstrapLoad.status, "READY");
  assert.equal(bootstrapLoad.session?.questions[0]?.examQuestionId, "eq-1");
  assert.equal(resumedLoad.status, "READY");
  assert.equal(resumedLoad.session?.attemptId, "attempt-dbms-1");
});

test("inactive or unknown attempt routes return blocked session messages", () => {
  const closedLoad = resolveAttemptSessionEntry(
    [
      {
        ...baseRecord,
        attempt: {
          attemptId: "attempt-dbms-closed",
          status: "EVALUATED",
          startedAt: new Date("2026-04-12T08:00:00.000Z"),
          expiresAt: new Date("2026-04-12T09:00:00.000Z"),
          submittedAt: new Date("2026-04-12T08:50:00.000Z"),
        },
      },
    ],
    "attempt-dbms-closed",
    fixedNow,
  );

  const missingLoad = resolveAttemptSessionEntry([], "attempt-missing", fixedNow);

  assert.equal(closedLoad.status, "BLOCKED");
  assert.equal(closedLoad.blockReason, "ATTEMPT_NOT_ACTIVE");
  assert.equal(missingLoad.status, "BLOCKED");
  assert.equal(missingLoad.blockReason, "ATTEMPT_NOT_FOUND");
});
