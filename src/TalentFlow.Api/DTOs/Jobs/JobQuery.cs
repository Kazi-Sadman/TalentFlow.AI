using TalentFlow.Api.Entities;

namespace TalentFlow.Api.DTOs.Jobs
{
    // Query string values for the job list endpoints.
    public class JobQuery
    {
        public int Page { get; set; } = 1;
        public int PageSize { get; set; } = 10;

        // Search in the job title
        public string Search { get; set; }

        // Search in the required skills
        public string Skill { get; set; }

        public ExperienceLevel? ExperienceLevel { get; set; }

        // Used only by the recruiter list (/api/jobs/mine)
        public JobStatus? Status { get; set; }
    }
}
