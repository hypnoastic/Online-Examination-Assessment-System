import Link from "next/link";

import { PublicShell } from "@/components/layout/public-shell";
import { SurfaceCard } from "@/components/ui/shell-primitives";
import { routes } from "@oeas/backend/lib/routes";

const heroMetrics = [
  {
    label: "Question formats",
    value: "5",
    detail: "Objective and descriptive patterns",
  },
  {
    label: "Core roles",
    value: "3",
    detail: "Admin, Examiner, Student",
  },
  {
    label: "Exam lifecycle",
    value: "4",
    detail: "Create, attempt, review, publish",
  },
] as const;

const featureCards = [
  {
    eyebrow: "Question bank",
    title: "Reuse structured academic content",
    description:
      "Build questions once, keep type and difficulty metadata consistent, and reuse them across later assessments.",
  },
  {
    eyebrow: "Timed exams",
    title: "Run exam windows with operational clarity",
    description:
      "Schedule controlled assessment windows and prepare a stable runtime for timed attempts and submissions.",
  },
  {
    eyebrow: "Grading",
    title: "Blend objective scoring with manual review",
    description:
      "Support auto-evaluation where possible while leaving room for examiner-led review and final result control.",
  },
  {
    eyebrow: "Analytics",
    title: "Track readiness, workload, and outcomes",
    description:
      "Give faculty and evaluators a coherent view of exam activity, pending work, and publication progress.",
  },
  {
    eyebrow: "Auditability",
    title: "Keep sensitive actions visible",
    description:
      "Preserve trust through role-aware access, operational traceability, and consistent review checkpoints.",
  },
] as const;

const roleCards = [
  {
    role: "Admin",
    summary: "Govern access, audit visibility, and system-wide readiness.",
    actions: ["Manage users", "Review audit logs", "Monitor activity"],
  },
  {
    role: "Examiner",
    summary: "Author academic content and move exams from draft to results.",
    actions: ["Build question banks", "Schedule assessments", "Review submissions"],
  },
  {
    role: "Student",
    summary: "Enter assigned assessments with clear timing and result visibility.",
    actions: ["See assigned exams", "Complete timed attempts", "Check published results"],
  },
] as const;

const workflowSteps = [
  {
    step: "Create",
    detail: "Compose reusable questions and prepare exam structure.",
  },
  {
    step: "Attempt",
    detail: "Open the timed exam experience with visible status and guidance.",
  },
  {
    step: "Review",
    detail: "Move submitted work into objective grading and examiner review.",
  },
  {
    step: "Publish",
    detail: "Release trustworthy results once evaluation is complete.",
  },
] as const;

const footerItems = [
  "TypeScript + Next.js modular monolith",
  "Role-aware academic operations platform",
  "Prepared for team-based module implementation",
] as const;

export default function LandingPage() {
  return (
    <PublicShell>
      <section className="landing-hero">
        <div className="landing-hero__copy">
          <p className="landing-kicker">Serious assessment infrastructure for colleges</p>
          <h2 className="landing-display">
            Manage the full examination lifecycle in one calm, role-aware
            workspace.
          </h2>
          <p className="landing-lead">
            The Online Examination Assessment System gives faculty, evaluators,
            and demo audiences a clear view of question authoring, timed exam
            delivery, grading, results, analytics, and auditability without the
            noise of a generic dashboard template.
          </p>
          <div className="landing-actions">
            <Link className="button-link button-link--primary" href={routes.login}>
              Sign in to continue
            </Link>
            <a className="button-link button-link--secondary" href="#platform-flow">
              View workflow
            </a>
          </div>
          <div className="landing-metrics" aria-label="Platform overview">
            {heroMetrics.map((item) => (
              <div key={item.label} className="landing-metric">
                <span>{item.label}</span>
                <strong>{item.value}</strong>
                <p>{item.detail}</p>
              </div>
            ))}
          </div>
        </div>
        <SurfaceCard className="preview-board" tone="tint">
          <div className="preview-board__header">
            <div>
              <p className="surface-card__eyebrow">Product preview</p>
              <h3>Assessment operations at a glance</h3>
            </div>
            <div className="preview-board__meta">
              <span className="status-pill status-pill--scheduled">Scheduled</span>
              <span className="preview-code">EXM-2401</span>
            </div>
          </div>
          <div className="preview-board__metrics">
            <div className="preview-tile">
              <span>Assigned students</span>
              <strong>126</strong>
              <p>Across internal mid-semester assessments</p>
            </div>
            <div className="preview-tile">
              <span>Pending review</span>
              <strong>18</strong>
              <p>Descriptive answers queued for examiners</p>
            </div>
            <div className="preview-tile">
              <span>Results published</span>
              <strong>74%</strong>
              <p>Latest processed exam batches</p>
            </div>
          </div>
          <div className="preview-board__timeline">
            <div className="preview-timeline-item">
              <span className="preview-timeline-item__step">Create</span>
              <p>Question bank synced with section-ready metadata.</p>
            </div>
            <div className="preview-timeline-item">
              <span className="preview-timeline-item__step">Attempt</span>
              <p>Timed window opens with autosave and status checkpoints.</p>
            </div>
            <div className="preview-timeline-item">
              <span className="preview-timeline-item__step">Review</span>
              <p>Objective grading and descriptive review move into one queue.</p>
            </div>
          </div>
        </SurfaceCard>
      </section>

      <section className="landing-section" aria-labelledby="feature-grid-heading">
        <div className="section-heading">
          <p className="shell-eyebrow">Platform capabilities</p>
          <h2 id="feature-grid-heading">Built for operationally clear assessment delivery</h2>
          <p>
            The entry experience introduces the shared product language before
            module-specific workflows expand underneath it.
          </p>
        </div>
        <div className="feature-grid">
          {featureCards.map((item) => (
            <SurfaceCard key={item.title} className="feature-card">
              <p className="surface-card__eyebrow">{item.eyebrow}</p>
              <div className="surface-card__copy">
                <h3>{item.title}</h3>
                <p>{item.description}</p>
              </div>
            </SurfaceCard>
          ))}
        </div>
      </section>

      <section className="landing-section" aria-labelledby="role-grid-heading">
        <div className="section-heading">
          <p className="shell-eyebrow">Role-based access</p>
          <h2 id="role-grid-heading">One platform, three clear operating perspectives</h2>
        </div>
        <div className="role-grid">
          {roleCards.map((item) => (
            <SurfaceCard key={item.role} className="role-card">
              <div className="role-card__header">
                <h3>{item.role}</h3>
                <span className="role-card__badge">{item.role}</span>
              </div>
              <p>{item.summary}</p>
              <ul className="surface-card__list">
                {item.actions.map((action) => (
                  <li key={action}>{action}</li>
                ))}
              </ul>
            </SurfaceCard>
          ))}
        </div>
      </section>

      <SurfaceCard
        as="section"
        className="workflow-board"
        tone="tint"
        padding="compact"
        id="platform-flow"
      >
        <div className="section-heading section-heading--compact">
          <p className="shell-eyebrow">Platform flow</p>
          <h2>Create, attempt, review, and publish with one shared structure</h2>
        </div>
        <div className="workflow-strip">
          {workflowSteps.map((item, index) => (
            <div key={item.step} className="workflow-step">
              <div className="workflow-step__index">{`0${index + 1}`}</div>
              <div className="workflow-step__copy">
                <h3>{item.step}</h3>
                <p>{item.detail}</p>
              </div>
            </div>
          ))}
        </div>
      </SurfaceCard>

      <footer className="landing-footer">
        <div className="landing-footer__copy">
          <p className="shell-eyebrow">Project context</p>
          <h2>Shared scaffold for a five-member implementation team</h2>
          <p>
            This landing screen gives evaluators and teammates a coherent entry
            point before protected routes, RBAC, and feature modules are wired.
          </p>
        </div>
        <div className="landing-footer__meta">
          <ul className="surface-card__list">
            {footerItems.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <p className="landing-footer__team">
            Team: Yash, Rakshita, Lakshya, Ravleen, Abhishek
          </p>
        </div>
      </footer>
    </PublicShell>
  );
}
