using System;
using System.ComponentModel.DataAnnotations;
using TalentFlow.Api.Entities;

namespace TalentFlow.Api.DTOs.Jobs
{
    public class CreateJobRequest
    {
        [Required(ErrorMessage = "Title is required.")]
        [StringLength(150)]
        public string Title { get; set; }

        [Required(ErrorMessage = "Description is required.")]
        [StringLength(5000)]
        public string Description { get; set; }

        // Comma separated, for example: "C#, ASP.NET Core, PostgreSQL"
        [Required(ErrorMessage = "Required skills are required.")]
        [StringLength(500)]
        public string RequiredSkills { get; set; }

        public ExperienceLevel ExperienceLevel { get; set; }

        // Draft or Published. A new job cannot start as Closed.
        public JobStatus Status { get; set; }

        public DateTime? Deadline { get; set; }
    }
}
