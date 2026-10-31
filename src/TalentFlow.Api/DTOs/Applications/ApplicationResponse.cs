using System;
using TalentFlow.Api.Entities;

namespace TalentFlow.Api.DTOs.Applications
{
    // One row in "my applications" list (candidate view)
    public class ApplicationResponse
    {
        public int Id { get; set; }
        public int JobId { get; set; }
        public string JobTitle { get; set; }
        public string CompanyName { get; set; }
        public ApplicationStatus Status { get; set; }
        public DateTime AppliedAt { get; set; }
        public int? ResumeId { get; set; }
    }
}
