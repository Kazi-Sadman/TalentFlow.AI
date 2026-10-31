using System;
using System.Collections.Generic;
using System.Text.Json;
using TalentFlow.Api.DTOs.AI;
using TalentFlow.Api.DTOs.Applications;
using TalentFlow.Api.DTOs.Interviews;
using TalentFlow.Api.DTOs.Jobs;
using TalentFlow.Api.DTOs.Profile;
using TalentFlow.Api.DTOs.Resumes;
using TalentFlow.Api.Entities;

namespace TalentFlow.Api.Mapping
{
    // Converts Entities (database classes) into DTOs (API response classes).
    // We never send Entities directly to the client.
    public static class EntityMapper
    {
        public static JobResponse ToJobResponse(Job job)
        {
            JobResponse response = new JobResponse();
            response.Id = job.Id;
            response.CompanyId = job.CompanyId;
            if (job.Company != null)
            {
                response.CompanyName = job.Company.Name;
            }
            response.Title = job.Title;
            response.Description = job.Description;
            response.RequiredSkills = job.RequiredSkills;
            response.ExperienceLevel = job.ExperienceLevel;
            response.Status = job.Status;
            response.Deadline = job.Deadline;
            response.CreatedAt = job.CreatedAt;
            return response;
        }

        // The Job (and its Company) must be loaded
        public static ApplicationResponse ToApplicationResponse(Application application)
        {
            ApplicationResponse response = new ApplicationResponse();
            response.Id = application.Id;
            response.JobId = application.JobId;
            response.JobTitle = application.Job.Title;
            if (application.Job.Company != null)
            {
                response.CompanyName = application.Job.Company.Name;
            }
            response.Status = application.Status;
            response.AppliedAt = application.AppliedAt;
            response.ResumeId = application.ResumeId;
            return response;
        }

        // The CandidateProfile (and its User) must be loaded
        public static ApplicantResponse ToApplicantResponse(Application application)
        {
            ApplicantResponse response = new ApplicantResponse();
            response.ApplicationId = application.Id;
            response.CandidateProfileId = application.CandidateProfileId;
            response.CandidateName = application.CandidateProfile.User.FullName;
            response.CandidateEmail = application.CandidateProfile.User.Email;
            response.ExperienceYears = application.CandidateProfile.ExperienceYears;
            response.Status = application.Status;
            response.AppliedAt = application.AppliedAt;
            response.ResumeId = application.ResumeId;
            return response;
        }

        public static ApplicationDetailResponse ToApplicationDetail(Application application, bool showRecruiterNotes, ResumeResponse resume)
        {
            ApplicationDetailResponse response = new ApplicationDetailResponse();
            response.ApplicationId = application.Id;
            response.Status = application.Status;
            response.AppliedAt = application.AppliedAt;

            if (showRecruiterNotes)
            {
                response.RecruiterNotes = application.RecruiterNotes;
            }

            response.JobId = application.JobId;
            response.JobTitle = application.Job.Title;
            response.CompanyName = application.Job.Company.Name;
            response.JobRequiredSkills = application.Job.RequiredSkills;

            response.CandidateProfileId = application.CandidateProfileId;
            response.CandidateName = application.CandidateProfile.User.FullName;
            response.CandidateEmail = application.CandidateProfile.User.Email;
            response.CandidateSummary = application.CandidateProfile.Summary;
            response.CandidateEducation = application.CandidateProfile.Education;
            response.CandidateExperienceYears = application.CandidateProfile.ExperienceYears;
            response.CandidateSkills = application.CandidateProfile.Skills;

            response.Resume = resume;
            return response;
        }

        public static ResumeResponse ToResumeResponse(Resume resume, List<string> detectedSkills)
        {
            ResumeResponse response = new ResumeResponse();
            response.Id = resume.Id;
            response.OriginalFileName = resume.OriginalFileName;
            response.SizeBytes = resume.SizeBytes;
            response.UploadedAt = resume.UploadedAt;
            if (detectedSkills != null)
            {
                response.DetectedSkills = detectedSkills;
            }
            return response;
        }

        // The User must be loaded
        public static CandidateProfileResponse ToProfileResponse(CandidateProfile profile)
        {
            CandidateProfileResponse response = new CandidateProfileResponse();
            response.Id = profile.Id;
            response.FullName = profile.User.FullName;
            response.Email = profile.User.Email;
            response.Summary = profile.Summary;
            response.Education = profile.Education;
            response.ExperienceYears = profile.ExperienceYears;
            response.Skills = profile.Skills;
            return response;
        }

        // The InterviewerUser must be loaded
        public static InterviewResponse ToInterviewResponse(Interview interview, bool includeFeedback)
        {
            InterviewResponse response = new InterviewResponse();
            response.Id = interview.Id;
            response.ApplicationId = interview.ApplicationId;
            response.InterviewerUserId = interview.InterviewerUserId;
            if (interview.InterviewerUser != null)
            {
                response.InterviewerName = interview.InterviewerUser.FullName;
            }
            response.StartAtUtc = interview.StartAtUtc;
            response.EndAtUtc = interview.EndAtUtc;
            response.MeetingLink = interview.MeetingLink;
            if (includeFeedback)
            {
                response.Feedback = interview.Feedback;
            }
            return response;
        }

        public static AIAnalysisResponse ToAnalysisResponse(AIAnalysis analysis)
        {
            AIAnalysisResponse response = new AIAnalysisResponse();
            response.Id = analysis.Id;
            response.ApplicationId = analysis.ApplicationId;
            response.Status = analysis.Status;
            response.Provider = analysis.Provider;
            response.CreatedAt = analysis.CreatedAt;
            response.ErrorMessage = analysis.ErrorMessage;
            response.ExtractedSkills = ReadStringList(analysis.ExtractedSkillsJson);
            response.MissingSkills = ReadStringList(analysis.MissingSkillsJson);
            response.NeedsReview = ReadStringList(analysis.NeedsReviewJson);
            response.Evidence = ReadEvidenceList(analysis.EvidenceJson);
            return response;
        }

        private static List<string> ReadStringList(string json)
        {
            if (string.IsNullOrWhiteSpace(json))
            {
                return new List<string>();
            }

            try
            {
                List<string> list = JsonSerializer.Deserialize<List<string>>(json);
                if (list == null)
                {
                    return new List<string>();
                }
                return list;
            }
            catch (JsonException)
            {
                return new List<string>();
            }
        }

        private static List<SkillEvidenceDto> ReadEvidenceList(string json)
        {
            if (string.IsNullOrWhiteSpace(json))
            {
                return new List<SkillEvidenceDto>();
            }

            try
            {
                List<SkillEvidenceDto> list = JsonSerializer.Deserialize<List<SkillEvidenceDto>>(json);
                if (list == null)
                {
                    return new List<SkillEvidenceDto>();
                }
                return list;
            }
            catch (JsonException)
            {
                return new List<SkillEvidenceDto>();
            }
        }
    }
}
