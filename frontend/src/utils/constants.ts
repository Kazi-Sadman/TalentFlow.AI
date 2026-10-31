import type { ApplicationStatus, ExperienceLevel } from "../types";

// Next statuses that a recruiter is allowed to choose.
// This is the same rule as ApplicationWorkflow.cs in the backend.
export const NEXT_STATUSES: Record<ApplicationStatus, ApplicationStatus[]> = {
  Applied: ["InReview", "Rejected"],
  InReview: ["Shortlisted", "Rejected"],
  Shortlisted: ["Interview", "Rejected"],
  Interview: ["Offered", "Rejected"],
  Offered: [],
  Rejected: []
};

export const PIPELINE_STEPS: ApplicationStatus[] = ["Applied", "InReview", "Shortlisted", "Interview", "Offered"];

export const STEP_DESCRIPTIONS: Record<string, string> = {
  Applied: "The application was received.",
  InReview: "A recruiter is reading the application.",
  Shortlisted: "Selected for the next step.",
  Interview: "An interview is planned or done.",
  Offered: "An offer was made."
};

export const STATUS_LABELS: Record<string, string> = {
  Applied: "Applied",
  InReview: "In review",
  Shortlisted: "Shortlisted",
  Interview: "Interview",
  Offered: "Offered",
  Rejected: "Rejected",
  Draft: "Draft",
  Published: "Published",
  Closed: "Closed"
};

// Mantine color names
export const STATUS_COLORS: Record<string, string> = {
  Applied: "gray",
  InReview: "cyan",
  Shortlisted: "indigo",
  Interview: "violet",
  Offered: "teal",
  Rejected: "red",
  Draft: "gray",
  Published: "teal",
  Closed: "orange"
};

// Hex colors for the dashboard pipeline bar
export const PIPELINE_COLORS: Record<string, string> = {
  Applied: "#7F8F88",
  InReview: "#38BDF8",
  Shortlisted: "#818CF8",
  Interview: "#C084FC",
  Offered: "#47DC9A",
  Rejected: "#F87171"
};

export const EXPERIENCE_LEVELS: ExperienceLevel[] = ["Intern", "Junior", "Mid", "Senior"];

export const PASSWORD_HELP = "At least 8 characters, with a letter and a number.";
