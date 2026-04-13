import { escapeHtml } from "./question-bank-ui.shared.js";

export const renderQuestionBankShell = ({
  description,
  eyebrow,
  headerActions = "",
  mainContent,
  title,
}: {
  description: string;
  eyebrow: string;
  headerActions?: string;
  mainContent: string;
  title: string;
}) => `
  <div class="question-bank-shell">
    <aside class="question-bank-shell__sidebar" aria-label="Examiner navigation">
      <div class="question-bank-brand">
        <span class="question-bank-brand__mark">OE</span>
        <div>
          <p>Online Examination</p>
          <p>Assessment System</p>
        </div>
      </div>
      <nav class="question-bank-nav">
        <a href="#" class="question-bank-nav__item">Dashboard</a>
        <a href="../exams/create.html" class="question-bank-nav__item">Exams</a>
        <a href="./index.html" class="question-bank-nav__item is-active" aria-current="page">Question Bank</a>
        <a href="#" class="question-bank-nav__item">Review Queue</a>
        <a href="#" class="question-bank-nav__item">Analytics</a>
      </nav>
      <div class="question-bank-sidebar__footer">
        <p>Examiner workspace</p>
        <p>Question reuse, taxonomy, and exam authoring stay aligned here.</p>
      </div>
    </aside>
    <main class="question-bank-shell__main">
      <header class="question-bank-page-header">
        <div class="question-bank-page-header__top">
          <div class="question-bank-page-header__copy">
            <p class="question-bank-page-header__eyebrow">${escapeHtml(eyebrow)}</p>
            <h1>${escapeHtml(title)}</h1>
            <p>${escapeHtml(description)}</p>
          </div>
          ${
            headerActions === ""
              ? ""
              : `<div class="question-bank-page-header__actions">${headerActions}</div>`
          }
        </div>
      </header>
      ${mainContent}
    </main>
  </div>
`;
