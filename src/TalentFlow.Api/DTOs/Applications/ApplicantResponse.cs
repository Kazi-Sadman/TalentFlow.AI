using System;
using TalentFlow.Api.Entities;

namespace TalentFlow.Api.DTOs.Applications
{
    // One row in the applicants list of a job (recruiter view)
    public class ApplicantResponse
    {
        public int ApplicationId { get; set; }
        public int CandidateProfileId { get; set; }
        public string CandidateName { get; set; }
        public string CandidateEmail { get; set; }
        public int ExperienceYears { get; set; }
        public ApplicationStatus Status { get; set; }
        public DateTime AppliedAt { get; set; }
        public int? ResumeId { get; set; }
    }
}
