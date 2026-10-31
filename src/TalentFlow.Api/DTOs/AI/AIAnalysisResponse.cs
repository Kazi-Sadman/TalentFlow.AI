using System;
using System.Collections.Generic;
using TalentFlow.Api.Entities;

namespace TalentFlow.Api.DTOs.AI
{
    public class AIAnalysisResponse
    {
        public int Id { get; set; }
        public int ApplicationId { get; set; }
        public AnalysisStatus Status { get; set; }
        public string Provider { get; set; }
        public DateTime CreatedAt { get; set; }

        // All known skills found anywhere in the CV
        public List<string> ExtractedSkills { get; set; }

        // Required skills that were found, with the CV text around them
        public List<SkillEvidenceDto> Evidence { get; set; }

        // Required skills that were not found in the CV
        public List<string> MissingSkills { get; set; }

        // Results that a human should check
        public List<string> NeedsReview { get; set; }

        public string ErrorMessage { get; set; }
        public string Disclaimer { get; set; }

        public AIAnalysisResponse()
        {
            ExtractedSkills = new List<string>();
            Evidence = new List<SkillEvidenceDto>();
            MissingSkills = new List<string>();
            NeedsReview = new List<string>();
            Disclaimer = "This is an automatic suggestion only. The recruiter makes the final decision.";
        }
    }
}
