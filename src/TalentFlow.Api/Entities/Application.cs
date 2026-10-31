using System;
using System.Collections.Generic;

namespace TalentFlow.Api.Entities
{
    public class Application
    {
        public int Id { get; set; }

        public int JobId { get; set; }
        public Job Job { get; set; }

        public int CandidateProfileId { get; set; }
        public CandidateProfile CandidateProfile { get; set; }

        // The resume that the candidate used for this application (optional)
        public int? ResumeId { get; set; }
        public Resume Resume { get; set; }

        public ApplicationStatus Status { get; set; }
        public DateTime AppliedAt { get; set; }

        // Private notes. Only recruiters can see them.
        public string RecruiterNotes { get; set; }

        public List<Interview> Interviews { get; set; } = new List<Interview>();
        public List<AIAnalysis> AIAnalyses { get; set; } = new List<AIAnalysis>();
    }
}
