import type {
  DraftExamSectionRecord,
  DraftExamAssignmentRecord,
  ExamAssignmentCandidate,
  DraftExamQuestionSnapshot,
  DraftExamSummary,
  DraftExamValues,
  ExamAuthoringStatus,
} from "../domain/exam.types";
import type { QuestionBankEntry } from "../../questions/question-bank/question-bank.types";
import {
  draftExamSchema,
  type DraftExamValidatedValues,
} from "../validation/exam.schemas";

export interface DraftExamQuestionAuthoringDraft {
  examQuestionId: string;
  questionOrder: number;
  marks: string;
  snapshot: DraftExamQuestionSnapshot;
}

export interface DraftExamSectionAuthoringDraft {
  sectionId: string;
  title: string;
  sectionOrder: number;
  questions: DraftExamQuestionAuthoringDraft[];
}

export type DraftExamAssignmentAuthoringDraft = DraftExamAssignmentRecord;

export interface DraftExamAuthoringDraft {
  title: string;
  code: string;
  instructionsText: string;
  durationMinutes: string;
  windowStartsAt: string;
  windowEndsAt: string;
  sections: DraftExamSectionAuthoringDraft[];
  assignments: DraftExamAssignmentAuthoringDraft[];
  status: ExamAuthoringStatus;
}

type DraftExamFieldKey = Exclude<
  keyof DraftExamAuthoringDraft,
  "sections" | "assignments" | "status"
>;
type DraftExamSectionFieldKey = "title" | "sectionOrder" | "questions";
type DraftExamQuestionFieldKey = "marks" | "questionOrder";
type DraftExamAssignmentFieldKey =
  | "studentId"
  | "studentRole"
  | "studentStatus";

export interface DraftExamAuthoringFormErrors {
  summary: string[];
  form: string[];
  fields: Partial<Record<DraftExamFieldKey, string[]>>;
  sectionFields: Record<
    number,
    Partial<Record<DraftExamSectionFieldKey, string[]>>
  >;
  questionFields: Record<
    number,
    Record<number, Partial<Record<DraftExamQuestionFieldKey, string[]>>>
  >;
  assignmentFields: Record<
    number,
    Partial<Record<DraftExamAssignmentFieldKey, string[]>>
  >;
}

export interface DraftExamReadinessCheck {
  id: "schedule" | "questions" | "assignments";
  label: string;
  ready: boolean;
  detail: string;
}

export interface DraftExamPublishReadiness {
  isReady: boolean;
  checks: DraftExamReadinessCheck[];
  blockingMessages: string[];
}

const DRAFT_EXAM_FIELD_KEYS = new Set<DraftExamFieldKey>([
  "title",
  "code",
  "instructionsText",
  "durationMinutes",
  "windowStartsAt",
  "windowEndsAt",
]);
const DRAFT_EXAM_SECTION_FIELD_KEYS = new Set<DraftExamSectionFieldKey>([
  "title",
  "sectionOrder",
  "questions",
]);
const DRAFT_EXAM_QUESTION_FIELD_KEYS = new Set<DraftExamQuestionFieldKey>([
  "marks",
  "questionOrder",
]);
const DRAFT_EXAM_ASSIGNMENT_FIELD_KEYS = new Set<DraftExamAssignmentFieldKey>([
  "studentId",
  "studentRole",
  "studentStatus",
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

const isPositiveWholeNumber = (value: string | number) => {
  const numericValue = typeof value === "number" ? value : Number(value);

  return Number.isInteger(numericValue) && numericValue >= 1;
};

export const createEmptyDraftExamFormErrors =
  (): DraftExamAuthoringFormErrors => ({
    summary: [],
    form: [],
    fields: {},
    sectionFields: {},
    questionFields: {},
    assignmentFields: {},
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
  sections: [],
  assignments: [],
  status: "DRAFT",
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

const getNextEntityId = (ids: string[], prefix: string) => {
  const maxSuffix = ids.reduce((currentMax, id) => {
    if (!id.startsWith(`${prefix}-`)) {
      return currentMax;
    }

    const suffix = Number(id.slice(prefix.length + 1));

    if (!Number.isInteger(suffix)) {
      return currentMax;
    }

    return Math.max(currentMax, suffix);
  }, 0);

  return `${prefix}-${maxSuffix + 1}`;
};

const resequenceDraftExamQuestions = (
  questions: DraftExamQuestionAuthoringDraft[],
) =>
  questions.map((question, index) => ({
    ...question,
    questionOrder: index + 1,
  }));

const resequenceDraftExamSections = (
  sections: DraftExamSectionAuthoringDraft[],
) =>
  sections.map((section, index) => ({
    ...section,
    sectionOrder: index + 1,
    questions: resequenceDraftExamQuestions(section.questions),
  }));

const replaceDraftExamSection = (
  draft: DraftExamAuthoringDraft,
  sectionId: string,
  replaceWith: (
    section: DraftExamSectionAuthoringDraft,
  ) => DraftExamSectionAuthoringDraft,
) => ({
  ...draft,
  sections: resequenceDraftExamSections(
    draft.sections.map((section) =>
      section.sectionId === sectionId ? replaceWith(section) : section,
    ),
  ),
});

const parseMarksValue = (value: string | number) => {
  const numericValue = typeof value === "number" ? value : Number(value);

  return Number.isFinite(numericValue) ? numericValue : 0;
};

const getDefaultExamQuestionMarks = (entry: QuestionBankEntry) =>
  entry.reviewMode === "MANUAL" ? "10" : "2";

const appendBlockingMessages = (
  errors: DraftExamAuthoringFormErrors,
  messages: string[],
) => {
  messages.forEach((message) => {
    pushUniqueMessage(errors.summary, message);
    pushUniqueMessage(errors.form, message);
  });

  return errors;
};

const getScheduleCheck = (
  draft: DraftExamAuthoringDraft,
): DraftExamReadinessCheck => {
  if (draft.windowStartsAt.trim() === "" || draft.windowEndsAt.trim() === "") {
    return {
      id: "schedule",
      label: "Schedule",
      ready: false,
      detail: "Add both schedule fields before the exam can be published.",
    };
  }

  const start = new Date(draft.windowStartsAt);
  const end = new Date(draft.windowEndsAt);

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return {
      id: "schedule",
      label: "Schedule",
      ready: false,
      detail: "Use valid date and time values for the exam window.",
    };
  }

  if (start.getTime() >= end.getTime()) {
    return {
      id: "schedule",
      label: "Schedule",
      ready: false,
      detail: "The exam window must close after it opens.",
    };
  }

  if (!isPositiveWholeNumber(draft.durationMinutes)) {
    return {
      id: "schedule",
      label: "Schedule",
      ready: false,
      detail: "Duration must be a whole number greater than zero.",
    };
  }

  const windowMinutes = Math.round((end.getTime() - start.getTime()) / (60 * 1000));

  if (windowMinutes < Number(draft.durationMinutes)) {
    return {
      id: "schedule",
      label: "Schedule",
      ready: false,
      detail: "Duration must fit completely inside the scheduled exam window.",
    };
  }

  return {
    id: "schedule",
    label: "Schedule",
    ready: true,
    detail: `${windowMinutes} minute window supports the current duration.`,
  };
};

const getQuestionCheck = (
  draft: DraftExamAuthoringDraft,
): DraftExamReadinessCheck => {
  if (draft.sections.length === 0 || getDraftExamMappedQuestionCount(draft) === 0) {
    return {
      id: "questions",
      label: "Questions",
      ready: false,
      detail: "Map at least one reusable question into an ordered section.",
    };
  }

  const seenSourceQuestionIds = new Set<string>();

  for (const section of draft.sections) {
    if (section.title.trim() === "") {
      return {
        id: "questions",
        label: "Questions",
        ready: false,
        detail: "Every section needs a title before the exam can be published.",
      };
    }

    if (section.questions.length === 0) {
      return {
        id: "questions",
        label: "Questions",
        ready: false,
        detail: "Every section must contain at least one mapped question.",
      };
    }

    for (const question of section.questions) {
      if (!isPositiveWholeNumber(question.marks)) {
        return {
          id: "questions",
          label: "Questions",
          ready: false,
          detail: "Each mapped question needs whole-number marks greater than zero.",
        };
      }

      if (seenSourceQuestionIds.has(question.snapshot.sourceQuestionId)) {
        return {
          id: "questions",
          label: "Questions",
          ready: false,
          detail: "A source question can only appear once in a scheduled exam.",
        };
      }

      seenSourceQuestionIds.add(question.snapshot.sourceQuestionId);
    }
  }

  return {
    id: "questions",
    label: "Questions",
    ready: true,
    detail: `${getDraftExamMappedQuestionCount(draft)} mapped questions are ready to publish.`,
  };
};

const getAssignmentCheck = (
  draft: DraftExamAuthoringDraft,
): DraftExamReadinessCheck => {
  if (draft.assignments.length === 0) {
    return {
      id: "assignments",
      label: "Assignments",
      ready: false,
      detail: "Assign at least one active student before publishing.",
    };
  }

  const seenStudentIds = new Set<string>();

  for (const assignment of draft.assignments) {
    if (seenStudentIds.has(assignment.studentId)) {
      return {
        id: "assignments",
        label: "Assignments",
        ready: false,
        detail: "Duplicate student assignments must be removed before publishing.",
      };
    }

    seenStudentIds.add(assignment.studentId);

    if (assignment.studentRole !== "STUDENT") {
      return {
        id: "assignments",
        label: "Assignments",
        ready: false,
        detail: "Only student accounts are eligible for exam assignment.",
      };
    }

    if (assignment.studentStatus !== "ACTIVE") {
      return {
        id: "assignments",
        label: "Assignments",
        ready: false,
        detail: "Inactive students must be removed before the exam can be published.",
      };
    }
  }

  return {
    id: "assignments",
    label: "Assignments",
    ready: true,
    detail: `${draft.assignments.length} active student assignment${
      draft.assignments.length === 1 ? "" : "s"
    } confirmed.`,
  };
};

export const getDraftExamPublishReadiness = (
  draft: DraftExamAuthoringDraft,
): DraftExamPublishReadiness => {
  const checks = [
    getScheduleCheck(draft),
    getQuestionCheck(draft),
    getAssignmentCheck(draft),
  ];
  const blockingMessages = checks
    .filter((check) => !check.ready)
    .map((check) => check.detail);

  return {
    isReady: blockingMessages.length === 0,
    checks,
    blockingMessages,
  };
};

export const createDraftExamQuestionSnapshot = (
  entry: QuestionBankEntry,
): DraftExamQuestionSnapshot => ({
  sourceQuestionId: entry.id,
  stem: entry.stem,
  type: entry.type,
  difficulty: entry.difficulty,
  topicId: entry.topicId,
  topicName: entry.topicName,
  reviewMode: entry.reviewMode,
});

export const createDraftExamAssignmentRecord = (
  candidate: ExamAssignmentCandidate,
): DraftExamAssignmentAuthoringDraft => ({
  assignmentId: "",
  studentId: candidate.userId,
  studentName: candidate.name,
  studentEmail: candidate.email,
  department: candidate.department,
  studentRole: candidate.role,
  studentStatus: candidate.status,
});

export const isQuestionMappedInDraft = (
  draft: DraftExamAuthoringDraft,
  sourceQuestionId: string,
) =>
  draft.sections.some((section) =>
    section.questions.some(
      (question) => question.snapshot.sourceQuestionId === sourceQuestionId,
    ),
  );

export const isStudentAssignedInDraft = (
  draft: DraftExamAuthoringDraft,
  studentId: string,
) =>
  draft.assignments.some((assignment) => assignment.studentId === studentId);

export const addDraftExamSection = (
  draft: DraftExamAuthoringDraft,
  overrides: Partial<Pick<DraftExamSectionAuthoringDraft, "title">> = {},
): DraftExamAuthoringDraft => {
  const sectionId = getNextEntityId(
    draft.sections.map((section) => section.sectionId),
    "section",
  );
  const nextSectionNumber = draft.sections.length + 1;

  return {
    ...draft,
    sections: [
      ...draft.sections,
      {
        sectionId,
        title: overrides.title ?? `Section ${nextSectionNumber}`,
        sectionOrder: nextSectionNumber,
        questions: [],
      },
    ],
  };
};

export const removeDraftExamSection = (
  draft: DraftExamAuthoringDraft,
  sectionId: string,
): DraftExamAuthoringDraft => ({
  ...draft,
  sections: resequenceDraftExamSections(
    draft.sections.filter((section) => section.sectionId !== sectionId),
  ),
});

export const moveDraftExamSection = (
  draft: DraftExamAuthoringDraft,
  sectionId: string,
  direction: "up" | "down",
): DraftExamAuthoringDraft => {
  const currentIndex = draft.sections.findIndex(
    (section) => section.sectionId === sectionId,
  );

  if (currentIndex === -1) {
    return draft;
  }

  const targetIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;

  if (targetIndex < 0 || targetIndex >= draft.sections.length) {
    return draft;
  }

  const nextSections = [...draft.sections];
  const [movedSection] = nextSections.splice(currentIndex, 1);

  if (!movedSection) {
    return draft;
  }

  nextSections.splice(targetIndex, 0, movedSection);

  return {
    ...draft,
    sections: resequenceDraftExamSections(nextSections),
  };
};

export const updateDraftExamSectionTitle = (
  draft: DraftExamAuthoringDraft,
  sectionId: string,
  title: string,
): DraftExamAuthoringDraft =>
  replaceDraftExamSection(draft, sectionId, (section) => ({
    ...section,
    title,
  }));

export const addQuestionToDraftExamSection = (
  draft: DraftExamAuthoringDraft,
  sectionId: string,
  entry: QuestionBankEntry,
): DraftExamAuthoringDraft => {
  if (isQuestionMappedInDraft(draft, entry.id)) {
    return draft;
  }

  const examQuestionId = getNextEntityId(
    draft.sections.flatMap((section) =>
      section.questions.map((question) => question.examQuestionId),
    ),
    "eq",
  );

  return replaceDraftExamSection(draft, sectionId, (section) => ({
    ...section,
    questions: [
      ...section.questions,
      {
        examQuestionId,
        questionOrder: section.questions.length + 1,
        marks: getDefaultExamQuestionMarks(entry),
        snapshot: createDraftExamQuestionSnapshot(entry),
      },
    ],
  }));
};

export const removeQuestionFromDraftExamSection = (
  draft: DraftExamAuthoringDraft,
  sectionId: string,
  examQuestionId: string,
): DraftExamAuthoringDraft =>
  replaceDraftExamSection(draft, sectionId, (section) => ({
    ...section,
    questions: resequenceDraftExamQuestions(
      section.questions.filter(
        (question) => question.examQuestionId !== examQuestionId,
      ),
    ),
  }));

export const moveDraftExamQuestion = (
  draft: DraftExamAuthoringDraft,
  sectionId: string,
  examQuestionId: string,
  direction: "up" | "down",
): DraftExamAuthoringDraft =>
  replaceDraftExamSection(draft, sectionId, (section) => {
    const currentIndex = section.questions.findIndex(
      (question) => question.examQuestionId === examQuestionId,
    );

    if (currentIndex === -1) {
      return section;
    }

    const targetIndex =
      direction === "up" ? currentIndex - 1 : currentIndex + 1;

    if (targetIndex < 0 || targetIndex >= section.questions.length) {
      return section;
    }

    const nextQuestions = [...section.questions];
    const [movedQuestion] = nextQuestions.splice(currentIndex, 1);

    if (!movedQuestion) {
      return section;
    }

    nextQuestions.splice(targetIndex, 0, movedQuestion);

    return {
      ...section,
      questions: resequenceDraftExamQuestions(nextQuestions),
    };
  });

export const updateDraftExamQuestionMarks = (
  draft: DraftExamAuthoringDraft,
  sectionId: string,
  examQuestionId: string,
  marks: string,
): DraftExamAuthoringDraft =>
  replaceDraftExamSection(draft, sectionId, (section) => ({
    ...section,
    questions: section.questions.map((question) =>
      question.examQuestionId === examQuestionId
        ? {
            ...question,
            marks,
          }
        : question,
    ),
  }));

export const addStudentAssignmentToDraftExam = (
  draft: DraftExamAuthoringDraft,
  candidate: ExamAssignmentCandidate,
): DraftExamAuthoringDraft => {
  if (isStudentAssignedInDraft(draft, candidate.userId)) {
    return draft;
  }

  return {
    ...draft,
    assignments: [
      ...draft.assignments,
      {
        ...createDraftExamAssignmentRecord(candidate),
        assignmentId: getNextEntityId(
          draft.assignments.map((assignment) => assignment.assignmentId),
          "assignment",
        ),
      },
    ],
  };
};

export const removeStudentAssignmentFromDraftExam = (
  draft: DraftExamAuthoringDraft,
  studentId: string,
): DraftExamAuthoringDraft => ({
  ...draft,
  assignments: draft.assignments.filter(
    (assignment) => assignment.studentId !== studentId,
  ),
});

export const getDraftExamMappedQuestionCount = ({
  sections,
}: Pick<DraftExamAuthoringDraft | DraftExamValues, "sections">) =>
  sections.reduce((total, section) => total + section.questions.length, 0);

export const getDraftExamAssignedStudentCount = ({
  assignments,
}: Pick<DraftExamAuthoringDraft | DraftExamValues, "assignments">) =>
  assignments.length;

export const getDraftExamSectionTotalMarks = ({
  questions,
}: Pick<
  DraftExamSectionAuthoringDraft | DraftExamSectionRecord,
  "questions"
>) =>
  questions.reduce((total, question) => total + parseMarksValue(question.marks), 0);

export const getDraftExamTotalMarks = ({
  sections,
}: Pick<DraftExamAuthoringDraft | DraftExamValues, "sections">) =>
  sections.reduce(
    (total, section) => total + getDraftExamSectionTotalMarks(section),
    0,
  );

export const getDraftExamManualReviewQuestionCount = ({
  sections,
}: Pick<DraftExamAuthoringDraft | DraftExamValues, "sections">) =>
  sections.reduce(
    (total, section) =>
      total +
      section.questions.filter(
        (question) => question.snapshot.reviewMode === "MANUAL",
      ).length,
    0,
  );

const toDraftExamValidationInput = (
  draft: DraftExamAuthoringDraft,
  status: ExamAuthoringStatus = draft.status,
) => ({
  title: draft.title,
  code: draft.code,
  instructions: parseDraftExamInstructions(draft.instructionsText),
  durationMinutes: draft.durationMinutes,
  windowStartsAt: draft.windowStartsAt,
  windowEndsAt: draft.windowEndsAt,
  sections: draft.sections.map((section) => ({
    sectionId: section.sectionId,
    title: section.title,
    sectionOrder: section.sectionOrder,
    questions: section.questions.map((question) => ({
      examQuestionId: question.examQuestionId,
      questionOrder: question.questionOrder,
      marks: question.marks,
      snapshot: question.snapshot,
    })),
  })),
  assignments: draft.assignments.map((assignment) => ({
    assignmentId: assignment.assignmentId,
    studentId: assignment.studentId,
    studentName: assignment.studentName,
    studentEmail: assignment.studentEmail,
    department: assignment.department,
    studentRole: assignment.studentRole,
    studentStatus: assignment.studentStatus,
  })),
  status,
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

    if (firstSegment === "sections" && typeof issue.path[1] === "number") {
      const sectionIndex = issue.path[1];
      const sectionField = issue.path[2];

      if (
        typeof sectionField === "string" &&
        DRAFT_EXAM_SECTION_FIELD_KEYS.has(
          sectionField as DraftExamSectionFieldKey,
        )
      ) {
        if (
          sectionField === "questions" &&
          typeof issue.path[3] === "number" &&
          typeof issue.path[4] === "string" &&
          DRAFT_EXAM_QUESTION_FIELD_KEYS.has(
            issue.path[4] as DraftExamQuestionFieldKey,
          )
        ) {
          const questionIndex = issue.path[3];
          const questionField = issue.path[4] as DraftExamQuestionFieldKey;
          const sectionQuestionFields = errors.questionFields[sectionIndex] ?? {};
          const questionFieldErrors = sectionQuestionFields[questionIndex] ?? {};
          const fieldMessages = questionFieldErrors[questionField] ?? [];

          pushUniqueMessage(fieldMessages, issue.message);
          questionFieldErrors[questionField] = fieldMessages;
          sectionQuestionFields[questionIndex] = questionFieldErrors;
          errors.questionFields[sectionIndex] = sectionQuestionFields;
          return;
        }

        const sectionFieldErrors = errors.sectionFields[sectionIndex] ?? {};
        const fieldMessages =
          sectionFieldErrors[sectionField as DraftExamSectionFieldKey] ?? [];

        pushUniqueMessage(fieldMessages, issue.message);
        sectionFieldErrors[sectionField as DraftExamSectionFieldKey] =
          fieldMessages;
        errors.sectionFields[sectionIndex] = sectionFieldErrors;
        return;
      }

      const sectionFieldErrors = errors.sectionFields[sectionIndex] ?? {};
      const questionMessages = sectionFieldErrors.questions ?? [];

      pushUniqueMessage(questionMessages, issue.message);
      sectionFieldErrors.questions = questionMessages;
      errors.sectionFields[sectionIndex] = sectionFieldErrors;
      return;
    }

    if (firstSegment === "assignments" && typeof issue.path[1] === "number") {
      const assignmentIndex = issue.path[1];
      const assignmentField = issue.path[2];

      if (
        typeof assignmentField === "string" &&
        DRAFT_EXAM_ASSIGNMENT_FIELD_KEYS.has(
          assignmentField as DraftExamAssignmentFieldKey,
        )
      ) {
        const assignmentFieldErrors =
          errors.assignmentFields[assignmentIndex] ?? {};
        const fieldMessages =
          assignmentFieldErrors[
            assignmentField as DraftExamAssignmentFieldKey
          ] ?? [];

        pushUniqueMessage(fieldMessages, issue.message);
        assignmentFieldErrors[
          assignmentField as DraftExamAssignmentFieldKey
        ] = fieldMessages;
        errors.assignmentFields[assignmentIndex] = assignmentFieldErrors;
        return;
      }

      pushUniqueMessage(errors.form, issue.message);
      return;
    }

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

export const publishDraftExamAuthoringDraft = (
  draft: DraftExamAuthoringDraft,
):
  | {
      success: true;
      data: DraftExamValidatedValues;
      readiness: DraftExamPublishReadiness;
    }
  | {
      success: false;
      errors: DraftExamAuthoringFormErrors;
      readiness: DraftExamPublishReadiness;
    } => {
  const readiness = getDraftExamPublishReadiness(draft);
  const parsed = draftExamSchema.safeParse(
    toDraftExamValidationInput(draft, "SCHEDULED"),
  );

  if (!parsed.success) {
    return {
      success: false,
      errors: appendBlockingMessages(
        mapDraftExamValidationErrors(parsed.error.issues),
        readiness.blockingMessages,
      ),
      readiness,
    };
  }

  if (!readiness.isReady) {
    return {
      success: false,
      errors: appendBlockingMessages(
        createEmptyDraftExamFormErrors(),
        readiness.blockingMessages,
      ),
      readiness,
    };
  }

  return {
    success: true,
    data: parsed.data,
    readiness,
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
  windowStartsAt:
    draft.windowStartsAt || toDateTimeLocalValue(values.windowStartsAt),
  windowEndsAt: draft.windowEndsAt || toDateTimeLocalValue(values.windowEndsAt),
  sections: values.sections.map((section) => ({
    sectionId: section.sectionId,
    title: section.title,
    sectionOrder: section.sectionOrder,
    questions: section.questions.map((question) => ({
      examQuestionId: question.examQuestionId,
      questionOrder: question.questionOrder,
      marks: String(question.marks),
      snapshot: question.snapshot,
    })),
  })),
  assignments: values.assignments.map((assignment) => ({
    assignmentId: assignment.assignmentId,
    studentId: assignment.studentId,
    studentName: assignment.studentName,
    studentEmail: assignment.studentEmail,
    department: assignment.department,
    studentRole: assignment.studentRole,
    studentStatus: assignment.studentStatus,
  })),
  status: values.status,
});
