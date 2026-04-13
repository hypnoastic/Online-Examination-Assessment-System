import assert from "node:assert/strict";
import test from "node:test";

import {
  createDraftExamAuthoringDraft,
  createDraftExamSummary,
  getDraftExamWindowDurationMinutes,
  normalizeDraftExamAuthoringDraft,
  parseDraftExamInstructions,
  validateDraftExamAuthoringDraft,
} from "./exam-authoring-form.js";

test("draft exam validation accepts valid metadata and persists parsed instructions", () => {
  const draft = createDraftExamAuthoringDraft({
    title: "Database Systems Midterm",
    code: "dbms-301",
    instructionsText:
      "Read carefully.\n\nWrite answers clearly.\nSubmit before time expires.",
    durationMinutes: "90",
    windowStartsAt: "2026-04-20T09:00",
    windowEndsAt: "2026-04-20T10:30",
  });

  const result = validateDraftExamAuthoringDraft(draft);

  assert.equal(result.success, true);

  if (!result.success) {
    throw new Error("Expected draft exam validation to succeed");
  }

  assert.equal(result.data.code, "DBMS-301");
  assert.deepEqual(result.data.instructions, [
    "Read carefully.",
    "Write answers clearly.",
    "Submit before time expires.",
  ]);

  const normalizedDraft = normalizeDraftExamAuthoringDraft(draft, result.data);

  assert.equal(normalizedDraft.title, "Database Systems Midterm");
  assert.equal(normalizedDraft.code, "DBMS-301");
  assert.equal(normalizedDraft.instructionsText.includes("Write answers clearly."), true);
});

test("schedule validation blocks reversed exam windows", () => {
  const draft = createDraftExamAuthoringDraft({
    title: "Operating Systems Quiz",
    code: "OS-220",
    instructionsText: "Attempt every question.",
    durationMinutes: "45",
    windowStartsAt: "2026-04-18T11:00",
    windowEndsAt: "2026-04-18T10:00",
  });

  const result = validateDraftExamAuthoringDraft(draft);

  assert.equal(result.success, false);

  if (result.success) {
    throw new Error("Expected schedule validation to fail");
  }

  assert.deepEqual(result.errors.fields.windowEndsAt, [
    "Window end must be after the window start",
  ]);
});

test("schedule validation blocks durations that exceed the exam window", () => {
  const draft = createDraftExamAuthoringDraft({
    title: "Compiler Design Test",
    code: "CD-410",
    instructionsText: "Answer all questions.",
    durationMinutes: "120",
    windowStartsAt: "2026-04-22T09:00",
    windowEndsAt: "2026-04-22T10:00",
  });

  const result = validateDraftExamAuthoringDraft(draft);

  assert.equal(result.success, false);

  if (result.success) {
    throw new Error("Expected duration validation to fail");
  }

  assert.deepEqual(result.errors.fields.durationMinutes, [
    "Duration must fit inside the scheduled exam window",
  ]);
});

test("draft exam summaries keep normalized metadata and derived window length", () => {
  const result = validateDraftExamAuthoringDraft(
    createDraftExamAuthoringDraft({
      title: "Computer Networks Internal",
      code: "CNS-214",
      instructionsText: "Use precise networking terminology.\nReview before submitting.",
      durationMinutes: "60",
      windowStartsAt: "2026-04-25T14:00",
      windowEndsAt: "2026-04-25T15:15",
    }),
  );

  if (!result.success) {
    throw new Error("Expected normalized draft exam data");
  }

  const summary = createDraftExamSummary(result.data);

  assert.equal(summary.status, "DRAFT");
  assert.equal(summary.examId, "draft-cns-214");
  assert.equal(getDraftExamWindowDurationMinutes(summary), 75);
  assert.deepEqual(parseDraftExamInstructions("Line one\n\nLine two"), [
    "Line one",
    "Line two",
  ]);
});
