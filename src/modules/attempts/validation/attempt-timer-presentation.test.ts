import assert from "node:assert/strict";
import test from "node:test";

import { buildAttemptTimerViewModel } from "../utils/attempt-timer-presentation.ts";

const startedAt = new Date("2026-04-12T09:00:00.000Z");
const expiresAt = new Date("2026-04-12T10:00:00.000Z");

test("stable timer state keeps a full countdown and calm helper text", () => {
  const viewModel = buildAttemptTimerViewModel(
    startedAt,
    expiresAt,
    new Date("2026-04-12T09:20:00.000Z"),
  );

  assert.equal(viewModel.tone, "stable");
  assert.equal(viewModel.remainingLabel, "00:40:00");
  assert.equal(viewModel.statusLabel, "On track");
});

test("warning timer state appears inside the last fifteen minutes", () => {
  const viewModel = buildAttemptTimerViewModel(
    startedAt,
    expiresAt,
    new Date("2026-04-12T09:47:00.000Z"),
  );

  assert.equal(viewModel.tone, "warning");
  assert.equal(viewModel.remainingLabel, "00:13:00");
  assert.match(viewModel.helperText, /warning window/i);
});

test("critical timer state appears inside the final five minutes", () => {
  const viewModel = buildAttemptTimerViewModel(
    startedAt,
    expiresAt,
    new Date("2026-04-12T09:56:30.000Z"),
  );

  assert.equal(viewModel.tone, "critical");
  assert.equal(viewModel.remainingLabel, "00:03:30");
  assert.equal(viewModel.statusLabel, "Final minutes");
});

test("expired timer state clamps the countdown at zero", () => {
  const viewModel = buildAttemptTimerViewModel(
    startedAt,
    expiresAt,
    new Date("2026-04-12T10:05:00.000Z"),
  );

  assert.equal(viewModel.tone, "expired");
  assert.equal(viewModel.remainingLabel, "00:00:00");
  assert.equal(viewModel.statusLabel, "Expired");
});
