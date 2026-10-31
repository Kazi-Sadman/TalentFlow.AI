using System;
using TalentFlow.Api.Entities;

namespace TalentFlow.Api.DTOs.Jobs
{
    public class JobResponse
    {
        public int Id { get; set; }
        public int CompanyId { get; set; }
        public string CompanyName { get; set; }
        public string Title { get; set; }
        public string Description { get; set; }
        public string RequiredSkills { get; set; }
        public ExperienceLevel ExperienceLevel { get; set; }
        public JobStatus Status { get; set; }
        public DateTime? Deadline { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}
