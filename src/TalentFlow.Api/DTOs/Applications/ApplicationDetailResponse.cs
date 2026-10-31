using System;
using TalentFlow.Api.DTOs.Resumes;
using TalentFlow.Api.Entities;

namespace TalentFlow.Api.DTOs.Applications
{
    public class ApplicationDetailResponse
    {
        public int ApplicationId { get; set; }
        public ApplicationStatus Status { get; set; }
        public DateTime AppliedAt { get; set; }

        // Only filled for recruiters. Candidates always get null.
        public string RecruiterNotes { get; set; }

        public int JobId { get; set; }
        public string JobTitle { get; set; }
        public string CompanyName { get; set; }
        public string JobRequiredSkills { get; set; }

        public int CandidateProfileId { get; set; }
        public string CandidateName { get; set; }
        public string CandidateEmail { get; set; }
        public string CandidateSummary { get; set; }
        public string CandidateEducation { get; set; }
        public int CandidateExperienceYears { get; set; }
        public string CandidateSkills { get; set; }

        public ResumeResponse Resume { get; set; }
    }
}
