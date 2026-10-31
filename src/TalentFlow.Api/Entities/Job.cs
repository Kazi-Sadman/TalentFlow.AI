using System;
using System.Collections.Generic;

namespace TalentFlow.Api.Entities
{
    public class Job
    {
        public int Id { get; set; }

        public int CompanyId { get; set; }
        public Company Company { get; set; }

        public string Title { get; set; }
        public string Description { get; set; }

        // Comma separated list, for example: "C#, ASP.NET Core, PostgreSQL"
        public string RequiredSkills { get; set; }

        public ExperienceLevel ExperienceLevel { get; set; }
        public JobStatus Status { get; set; }

        // Saved in UTC
        public DateTime? Deadline { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }

        public List<Application> Applications { get; set; } = new List<Application>();
    }
}
