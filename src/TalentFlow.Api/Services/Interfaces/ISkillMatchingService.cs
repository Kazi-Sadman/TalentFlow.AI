using System.Collections.Generic;

namespace TalentFlow.Api.Services.Interfaces
{
    public interface ISkillMatchingService
    {
        // Compares the CV text with the skills that the job requires
        SkillMatchResult Analyze(string cvText, string requiredSkills);

        // Finds all known skills that appear in a text
        List<string> FindSkillsInText(string text);
    }
}
