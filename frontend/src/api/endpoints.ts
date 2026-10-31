import { api } from "./client";
import type {
  AiAnalysis,
  Applicant,
  ApplicationDetail,
  ApplicationListParams,
  AuthResponse,
  CandidateProfile,
  DashboardSummary,
  Interview,
  InterviewPayload,
  Job,
  JobListParams,
  JobPayload,
  MyApplication,
  PagedResult,
  ProfilePayload,
  RegisterPayload,
  ResumeInfo,
  UpdateStatusPayload
} from "../types";

// Removes empty values, so we do not send "?search=&skill=" to the backend
function clean(params: object): Record<string, string | number> {
  const result: Record<string, string | number> = {};
  Object.entries(params).forEach(function ([key, value]) {
    if (value !== undefined && value !== null && value !== "") {
      result[key] = value as string | number;
    }
  });
  return result;
}

export const authApi = {
  async login(email: string, password: string): Promise<AuthResponse> {
    const res = await api.post<AuthResponse>("/auth/login", { email, password });
    return res.data;
  },
  async register(payload: RegisterPayload): Promise<AuthResponse> {
    const res = await api.post<AuthResponse>("/auth/register", payload);
    return res.data;
  }
};

export const jobsApi = {
  async list(params: JobListParams): Promise<PagedResult<Job>> {
    const res = await api.get<PagedResult<Job>>("/jobs", { params: clean(params) });
    return res.data;
  },
  async mine(params: JobListParams): Promise<PagedResult<Job>> {
    const res = await api.get<PagedResult<Job>>("/jobs/mine", { params: clean(params) });
    return res.data;
  },
  async get(id: number): Promise<Job> {
    const res = await api.get<Job>("/jobs/" + id);
    return res.data;
  },
  async create(payload: JobPayload): Promise<Job> {
    const res = await api.post<Job>("/jobs", payload);
    return res.data;
  },
  async update(id: number, payload: JobPayload): Promise<Job> {
    const res = await api.patch<Job>("/jobs/" + id, payload);
    return res.data;
  },
  async remove(id: number): Promise<void> {
    await api.delete("/jobs/" + id);
  },
  async apply(jobId: number, resumeId: number | null): Promise<MyApplication> {
    const res = await api.post<MyApplication>("/jobs/" + jobId + "/apply", { resumeId: resumeId });
    return res.data;
  }
};

export const applicationsApi = {
  async mine(params: ApplicationListParams): Promise<PagedResult<MyApplication>> {
    const res = await api.get<PagedResult<MyApplication>>("/applications/me", { params: clean(params) });
    return res.data;
  },
  async forJob(jobId: number, params: ApplicationListParams): Promise<PagedResult<Applicant>> {
    const res = await api.get<PagedResult<Applicant>>("/jobs/" + jobId + "/applications", {
      params: clean(params)
    });
    return res.data;
  },
  async get(id: number): Promise<ApplicationDetail> {
    const res = await api.get<ApplicationDetail>("/applications/" + id);
    return res.data;
  },
  async updateStatus(id: number, payload: UpdateStatusPayload): Promise<ApplicationDetail> {
    const res = await api.patch<ApplicationDetail>("/applications/" + id + "/status", payload);
    return res.data;
  }
};

export const profileApi = {
  async get(): Promise<CandidateProfile> {
    const res = await api.get<CandidateProfile>("/profile/me");
    return res.data;
  },
  async update(payload: ProfilePayload): Promise<CandidateProfile> {
    const res = await api.put<CandidateProfile>("/profile/me", payload);
    return res.data;
  }
};

export const resumesApi = {
  async mine(): Promise<ResumeInfo[]> {
    const res = await api.get<ResumeInfo[]>("/resumes/me");
    return res.data;
  },
  async upload(file: File): Promise<ResumeInfo> {
    const form = new FormData();
    form.append("file", file);
    const res = await api.post<ResumeInfo>("/resumes", form);
    return res.data;
  },
  // Downloads a CV file (the request needs the token, so a normal link does not work)
  async download(resumeId: number, fileName: string): Promise<void> {
    const res = await api.get("/resumes/" + resumeId + "/download", { responseType: "blob" });
    const url = window.URL.createObjectURL(res.data as Blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName || "resume.pdf";
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  }
};

export const interviewsApi = {
  async list(applicationId: number): Promise<Interview[]> {
    const res = await api.get<Interview[]>("/applications/" + applicationId + "/interviews");
    return res.data;
  },
  async create(applicationId: number, payload: InterviewPayload): Promise<Interview> {
    const res = await api.post<Interview>("/applications/" + applicationId + "/interviews", payload);
    return res.data;
  },
  async saveFeedback(interviewId: number, feedback: string): Promise<Interview> {
    const res = await api.patch<Interview>("/interviews/" + interviewId + "/feedback", { feedback });
    return res.data;
  }
};

export const aiApi = {
  async latest(applicationId: number): Promise<AiAnalysis> {
    const res = await api.get<AiAnalysis>("/applications/" + applicationId + "/ai-analysis");
    return res.data;
  },
  async run(applicationId: number): Promise<AiAnalysis> {
    const res = await api.post<AiAnalysis>("/applications/" + applicationId + "/ai-analysis");
    return res.data;
  }
};

export const dashboardApi = {
  async summary(): Promise<DashboardSummary> {
    const res = await api.get<DashboardSummary>("/dashboard/summary");
    return res.data;
  }
};
