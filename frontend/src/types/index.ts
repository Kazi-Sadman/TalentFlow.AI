// These types match the JSON that the ASP.NET backend sends (camelCase, enums as text).

export type UserRole = "Candidate" | "Recruiter" | "Admin";
export type JobStatus = "Draft" | "Published" | "Closed";
export type ExperienceLevel = "Intern" | "Junior" | "Mid" | "Senior";
export type ApplicationStatus =
  | "Applied"
  | "InReview"
  | "Shortlisted"
  | "Interview"
  | "Offered"
  | "Rejected";
export type AnalysisStatus = "Pending" | "Processing" | "Completed" | "Failed";

export interface PagedResult<T> {
  items: T[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}

export interface AuthResponse {
  token: string;
  expiresAtUtc: string;
  userId: number;
  fullName: string;
  email: string;
  role: UserRole;
  companyId: number | null;
}

// The logged-in user that we keep in the browser (the token is stored separately)
export interface AuthUser {
  expiresAtUtc: string;
  userId: number;
  fullName: string;
  email: string;
  role: UserRole;
  companyId: number | null;
}

export interface RegisterPayload {
  fullName: string;
  email: string;
  password: string;
  role: "Candidate" | "Recruiter";
  companyName?: string;
}

export interface Job {
  id: number;
  companyId: number;
  companyName: string;
  title: string;
  description: string;
  requiredSkills: string;
  experienceLevel: ExperienceLevel;
  status: JobStatus;
  deadline: string | null;
  createdAt: string;
}

export interface JobPayload {
  title?: string;
  description?: string;
  requiredSkills?: string;
  experienceLevel?: ExperienceLevel;
  status?: JobStatus;
  deadline?: string | null;
}

export interface JobListParams {
  page?: number;
  pageSize?: number;
  search?: string;
  skill?: string;
  experienceLevel?: string;
  status?: string;
}

export interface MyApplication {
  id: number;
  jobId: number;
  jobTitle: string;
  companyName: string;
  status: ApplicationStatus;
  appliedAt: string;
  resumeId: number | null;
}

export interface Applicant {
  applicationId: number;
  candidateProfileId: number;
  candidateName: string;
  candidateEmail: string;
  experienceYears: number;
  status: ApplicationStatus;
  appliedAt: string;
  resumeId: number | null;
}

export interface ApplicationListParams {
  page?: number;
  pageSize?: number;
  status?: string;
  search?: string;
}

export interface ResumeInfo {
  id: number;
  originalFileName: string;
  sizeBytes: number;
  uploadedAt: string;
  detectedSkills: string[];
}

export interface ApplicationDetail {
  applicationId: number;
  status: ApplicationStatus;
  appliedAt: string;
  recruiterNotes: string | null;
  jobId: number;
  jobTitle: string;
  companyName: string;
  jobRequiredSkills: string;
  candidateProfileId: number;
  candidateName: string;
  candidateEmail: string;
  candidateSummary: string | null;
  candidateEducation: string | null;
  candidateExperienceYears: number;
  candidateSkills: string | null;
  resume: ResumeInfo | null;
}

export interface UpdateStatusPayload {
  status: ApplicationStatus;
  recruiterNotes?: string;
}

export interface CandidateProfile {
  id: number;
  fullName: string;
  email: string;
  summary: string | null;
  education: string | null;
  experienceYears: number;
  skills: string | null;
}

export interface ProfilePayload {
  summary: string;
  education: string;
  experienceYears: number;
  skills: string;
}

export interface Interview {
  id: number;
  applicationId: number;
  interviewerUserId: number;
  interviewerName: string;
  startAtUtc: string;
  endAtUtc: string;
  meetingLink: string;
  feedback: string | null;
}

export interface InterviewPayload {
  startAtUtc: string;
  endAtUtc: string;
  meetingLink: string;
}

export interface SkillEvidence {
  skill: string;
  snippet: string;
}

export interface AiAnalysis {
  id: number;
  applicationId: number;
  status: AnalysisStatus;
  provider: string;
  createdAt: string;
  extractedSkills: string[];
  evidence: SkillEvidence[];
  missingSkills: string[];
  needsReview: string[];
  errorMessage: string | null;
  disclaimer: string;
}

export interface PipelineItem {
  status: string;
  count: number;
}

export interface DashboardSummary {
  totalJobs: number;
  draftJobs: number;
  publishedJobs: number;
  closedJobs: number;
  totalApplications: number;
  newApplications: number;
  applicationsLast7Days: number;
  upcomingInterviews: number;
  pipeline: PipelineItem[];
}
