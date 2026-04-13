export interface GradingWorkspaceItem {
  attemptId: string;
  attemptAnswerId: string;
  examId: string;
  examTitle: string;
  examCode: string;
  studentId: string;
  studentName: string;
  questionType: "SHORT_TEXT" | "LONG_TEXT";
  questionStem: string;
  modelAnswerText?: string;
  studentAnswerText: string;
  maxMarks: number;
  submittedAt: Date;
}

export interface GradingMarksEntryInput {
  marksAwarded: number;
  feedback?: string;
}

export interface ManualReviewEntry {
  attemptAnswerId: string;
  reviewerId: string;
  marksAwarded: number;
  feedback: string | null;
  reviewedAt: Date;
}

export interface GradingWorkspaceNavigation {
  currentAttemptAnswerId: string;
  previousAttemptAnswerId: string | null;
  nextAttemptAnswerId: string | null;
  position: number;
  total: number;
}

export interface GradingWorkspaceViewModel {
  header: {
    exam: string;
    student: string;
    questionType: GradingWorkspaceItem["questionType"];
  };
  questionPanel: {
    stem: string;
    modelAnswer: string | null;
  };
  answerPanel: {
    text: string;
    paragraphs: string[];
    lineCount: number;
  };
  marksPanel: {
    maxMarks: number;
    marksAwarded: number | null;
    feedback: string;
  };
  navigation: GradingWorkspaceNavigation;
}
