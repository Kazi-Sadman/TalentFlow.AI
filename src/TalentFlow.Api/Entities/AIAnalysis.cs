using System;

namespace TalentFlow.Api.Entities
{
    public class AIAnalysis
    {
        public int Id { get; set; }

        public int ApplicationId { get; set; }
        public Application Application { get; set; }

        public AnalysisStatus Status { get; set; }

        // The lists below are saved as JSON text.
        public string ExtractedSkillsJson { get; set; }
        public string EvidenceJson { get; set; }
        public string MissingSkillsJson { get; set; }
        public string NeedsReviewJson { get; set; }

        public string Provider { get; set; }
        public string ErrorMessage { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}
