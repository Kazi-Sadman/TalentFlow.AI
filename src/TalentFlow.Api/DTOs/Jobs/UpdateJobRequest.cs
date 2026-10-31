using System;
using System.ComponentModel.DataAnnotations;
using TalentFlow.Api.Entities;

namespace TalentFlow.Api.DTOs.Jobs
{
    // PATCH request: only the fields that are sent (not null) are changed.
    public class UpdateJobRequest
    {
        [StringLength(150)]
        public string Title { get; set; }

        [StringLength(5000)]
        public string Description { get; set; }

        [StringLength(500)]
        public string RequiredSkills { get; set; }

        public ExperienceLevel? ExperienceLevel { get; set; }
        public JobStatus? Status { get; set; }
        public DateTime? Deadline { get; set; }
    }
}
