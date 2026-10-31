using System.Collections.Generic;
using TalentFlow.Api.DTOs.AI;

namespace TalentFlow.Api.Services
{
    // The result of comparing one CV with one job.
    public class SkillMatchResult
    {
        // All known skills found in the CV
        public List<string> ExtractedSkills { get; set; }

        // Required skills that were found, with a short piece of CV text
        public List<SkillEvidenceDto> Evidence { get; set; }

        // Required skills that were NOT found
        public List<string> MissingSkills { get; set; }

        // Results that a human should check
        public List<string> NeedsReview { get; set; }

        public SkillMatchResult()
        {
            ExtractedSkills = new List<string>();
            Evidence = new List<SkillEvidenceDto>();
            MissingSkills = new List<string>();
            NeedsReview = new List<string>();
        }
    }
}
