using System;
using System.Collections.Generic;

namespace TalentFlow.Api.Entities
{
    public class CandidateProfile
    {
        public int Id { get; set; }

        public int UserId { get; set; }
        public User User { get; set; }

        public string Summary { get; set; }
        public string Education { get; set; }
        public int ExperienceYears { get; set; }

        // Comma separated list, for example: "C#, SQL, Git"
        public string Skills { get; set; }

        public DateTime? UpdatedAt { get; set; }

        public List<Resume> Resumes { get; set; } = new List<Resume>();
        public List<Application> Applications { get; set; } = new List<Application>();
    }
}
