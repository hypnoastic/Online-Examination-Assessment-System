export type AttemptTimerTone = "stable" | "warning" | "critical" | "expired";

export interface AttemptTimerViewModel {
  tone: AttemptTimerTone;
  remainingMilliseconds: number;
  remainingLabel: string;
  statusLabel: string;
  helperText: string;
  expiresAtLabel: string;
}

const formatCountdown = (milliseconds: number): string => {
  const totalSeconds = Math.max(0, Math.floor(milliseconds / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return [hours, minutes, seconds]
    .map((value) => String(value).padStart(2, "0"))
    .join(":");
};

const formatExpiry = (value: Date): string =>
  new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(value);

export const buildAttemptTimerViewModel = (
  startedAt: Date,
  expiresAt: Date,
  now: Date,
): AttemptTimerViewModel => {
  const remainingMilliseconds = Math.max(0, expiresAt.getTime() - now.getTime());
  const remainingMinutes = remainingMilliseconds / (60 * 1000);

  let tone: AttemptTimerTone = "stable";
  let statusLabel = "On track";
  let helperText =
    "The timer is server-authoritative. Use the question frame below to continue the attempt.";

  if (remainingMilliseconds === 0) {
    tone = "expired";
    statusLabel = "Expired";
    helperText =
      "The scheduled expiry time has been reached. The live attempt surface should move into submission handling.";
  } else if (remainingMinutes <= 5) {
    tone = "critical";
    statusLabel = "Final minutes";
    helperText =
      "Time is almost over. Finish the current response and review only what is essential.";
  } else if (remainingMinutes <= 15) {
    tone = "warning";
    statusLabel = "Ending soon";
    helperText =
      "The attempt is entering its warning window. Keep the timer visible while finishing the current question.";
  }

  return {
    tone,
    remainingMilliseconds,
    remainingLabel: formatCountdown(remainingMilliseconds),
    statusLabel,
    helperText,
    expiresAtLabel: formatExpiry(expiresAt),
  };
};
