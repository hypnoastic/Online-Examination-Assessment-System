import type { DraftExamSummary, DraftExamValues } from "../domain/exam.types";
import {
  draftExamSchema,
  type DraftExamValidatedValues,
} from "../validation/exam.schemas";

export interface DraftExamAuthoringDraft {
  title: string;
  code: string;
  instructionsText: string;
  durationMinutes: string;
  windowStartsAt: string;
  windowEndsAt: string;
}

type DraftExamFieldKey = keyof DraftExamAuthoringDraft;

export interface DraftExamAuthoringFormErrors {
  summary: string[];
  form: string[];
  fields: Partial<Record<DraftExamFieldKey, string[]>>;
}

const DRAFT_EXAM_FIELD_KEYS = new Set<DraftExamFieldKey>([
  "title",
  "code",
  "instructionsText",
  "durationMinutes",
  "windowStartsAt",
  "windowEndsAt",
]);

const VALIDATION_PATH_TO_FIELD: Record<string, DraftExamFieldKey> = {
  title: "title",
  code: "code",
  instructions: "instructionsText",
  durationMinutes: "durationMinutes",
  windowStartsAt: "windowStartsAt",
  windowEndsAt: "windowEndsAt",
};

const pushUniqueMessage = (messages: string[], message: string) => {
  if (!messages.includes(message)) {
    messages.push(message);
  }
};

export const createEmptyDraftExamFormErrors =
  (): DraftExamAuthoringFormErrors => ({
    summary: [],
    form: [],
    fields: {},
  });

export const createDraftExamAuthoringDraft = (
  overrides: Partial<DraftExamAuthoringDraft> = {},
): DraftExamAuthoringDraft => ({
  title: "",
  code: "",
  instructionsText: "",
  durationMinutes: "90",
  windowStartsAt: "",
  windowEndsAt: "",
  ...overrides,
});

export const updateDraftExamField = (
  draft: DraftExamAuthoringDraft,
  field: DraftExamFieldKey,
  value: string,
): DraftExamAuthoringDraft => ({
  ...draft,
  [field]: value,
});

export const parseDraftExamInstructions = (instructionsText: string) =>
  instructionsText
    .split(/\r?\n/)
    .map((instruction) => instruction.trim())
    .filter((instruction) => instruction !== "");

const toDraftExamValidationInput = (draft: DraftExamAuthoringDraft) => ({
  title: draft.title,
  code: draft.code,
  instructions: parseDraftExamInstructions(draft.instructionsText),
  durationMinutes: draft.durationMinutes,
  windowStartsAt: draft.windowStartsAt,
  windowEndsAt: draft.windowEndsAt,
  status: "DRAFT" as const,
});

export const mapDraftExamValidationErrors = (
  issues: Array<{ message: string; path: Array<PropertyKey> }>,
): DraftExamAuthoringFormErrors => {
  const errors = createEmptyDraftExamFormErrors();

  issues.forEach((issue) => {
    pushUniqueMessage(errors.summary, issue.message);

    if (issue.path.length === 0) {
      pushUniqueMessage(errors.form, issue.message);
      return;
    }

    const firstSegment = issue.path[0];

    if (typeof firstSegment !== "string") {
      pushUniqueMessage(errors.form, issue.message);
      return;
    }

    const fieldKey = VALIDATION_PATH_TO_FIELD[firstSegment];

    if (fieldKey && DRAFT_EXAM_FIELD_KEYS.has(fieldKey)) {
      const fieldMessages = errors.fields[fieldKey] ?? [];
      pushUniqueMessage(fieldMessages, issue.message);
      errors.fields[fieldKey] = fieldMessages;
      return;
    }

    pushUniqueMessage(errors.form, issue.message);
  });

  return errors;
};

export const validateDraftExamAuthoringDraft = (
  draft: DraftExamAuthoringDraft,
):
  | { success: true; data: DraftExamValidatedValues }
  | { success: false; errors: DraftExamAuthoringFormErrors } => {
  const parsed = draftExamSchema.safeParse(toDraftExamValidationInput(draft));

  if (parsed.success) {
    return {
      success: true,
      data: parsed.data,
    };
  }

  return {
    success: false,
    errors: mapDraftExamValidationErrors(parsed.error.issues),
  };
};

export const toDraftExamId = (code: string) =>
  `draft-${code.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}`;

export const createDraftExamSummary = (
  values: DraftExamValues,
): DraftExamSummary => ({
  examId: toDraftExamId(values.code),
  ...values,
});

export const getDraftExamWindowDurationMinutes = ({
  windowEndsAt,
  windowStartsAt,
}: Pick<DraftExamValues, "windowEndsAt" | "windowStartsAt">) =>
  Math.round(
    (windowEndsAt.getTime() - windowStartsAt.getTime()) / (60 * 1000),
  );

export const formatDraftExamDateTime = (value: Date) =>
  new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(value);

export const toDateTimeLocalValue = (value: Date) => {
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const day = String(value.getDate()).padStart(2, "0");
  const hours = String(value.getHours()).padStart(2, "0");
  const minutes = String(value.getMinutes()).padStart(2, "0");

  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

export const normalizeDraftExamAuthoringDraft = (
  draft: DraftExamAuthoringDraft,
  values: DraftExamValidatedValues,
): DraftExamAuthoringDraft => ({
  ...draft,
  title: values.title,
  code: values.code,
  instructionsText: values.instructions.join("\n"),
  durationMinutes: String(values.durationMinutes),
  windowStartsAt: draft.windowStartsAt || toDateTimeLocalValue(values.windowStartsAt),
  windowEndsAt: draft.windowEndsAt || toDateTimeLocalValue(values.windowEndsAt),
});
