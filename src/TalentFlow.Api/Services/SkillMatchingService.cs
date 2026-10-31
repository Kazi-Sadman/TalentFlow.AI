using System;
using System.Collections.Generic;
using TalentFlow.Api.DTOs.AI;
using TalentFlow.Api.Services.Interfaces;

namespace TalentFlow.Api.Services
{
    // A simple RULE-BASED skill matcher (no external AI service is needed).
    //
    // How it works:
    //   1. It knows a list of skills and their other names (for example "postgres" = "PostgreSQL").
    //   2. It searches the CV text for the whole word of each skill.
    //   3. It compares the found skills with the skills that the job requires.
    //
    // Important: the CV text is only DATA. Any sentence in the CV is never
    // followed as an instruction.
    public class SkillMatchingService : ISkillMatchingService
    {
        // If the CV has fewer characters than this, it may be a scanned image PDF.
        private const int MinimumTextLength = 100;

        // How many characters to show before and after a found skill
        private const int SnippetRadius = 40;

        private readonly List<KnownSkill> _knownSkills;

        public SkillMatchingService()
        {
            _knownSkills = new List<KnownSkill>();

            AddSkill("C#", "csharp", "c sharp");
            AddSkill("ASP.NET Core", "aspnet core", "asp.net", "asp net core", "dotnet core", ".net core");
            AddSkill(".NET", "dotnet");
            AddSkill("Entity Framework Core", "entity framework", "ef core", "efcore");
            AddSkill("LINQ");
            AddSkill("SQL");
            AddSkill("PostgreSQL", "postgres", "psql");
            AddSkill("SQL Server", "mssql", "ms sql");
            AddSkill("MySQL");
            AddSkill("MongoDB", "mongo");
            AddSkill("Redis");
            AddSkill("REST API", "rest apis", "restful", "restful api");
            AddSkill("JWT", "json web token");
            AddSkill("Swagger", "openapi");
            AddSkill("Git");
            AddSkill("GitHub");
            AddSkill("Docker");
            AddSkill("Kubernetes", "k8s");
            AddSkill("CI/CD", "cicd", "github actions", "jenkins");
            AddSkill("Azure");
            AddSkill("AWS", "amazon web services");
            AddSkill("Linux");
            AddSkill("JavaScript", "js", "ecmascript");
            AddSkill("TypeScript");
            AddSkill("React", "reactjs", "react.js");
            AddSkill("Angular", "angularjs");
            AddSkill("Vue.js", "vue", "vuejs");
            AddSkill("Node.js", "nodejs", "node js");
            AddSkill("HTML", "html5");
            AddSkill("CSS", "css3");
            AddSkill("Blazor");
            AddSkill("SignalR");
            AddSkill("Dapper");
            AddSkill("Python");
            AddSkill("Java");
            AddSkill("OOP", "object oriented programming", "object-oriented programming");
            AddSkill("Microservices", "microservice");
            AddSkill("Unit Testing", "unit test", "unit tests");
            AddSkill("xUnit");
            AddSkill("NUnit");
            AddSkill("Postman");
            AddSkill("Agile", "scrum");
        }

        public SkillMatchResult Analyze(string cvText, string requiredSkills)
        {
            SkillMatchResult result = new SkillMatchResult();

            if (cvText == null)
            {
                cvText = "";
            }

            string lowerText = cvText.ToLowerInvariant();
            bool textIsTooShort = cvText.Trim().Length < MinimumTextLength;

            result.ExtractedSkills = FindSkillsInText(cvText);

            List<string> required = SplitSkills(requiredSkills);

            foreach (string requiredSkill in required)
            {
                string writtenName = requiredSkill.ToLowerInvariant();
                List<string> searchTerms = GetSearchTerms(writtenName);

                bool found = false;

                foreach (string term in searchTerms)
                {
                    int index = FindWholeWord(lowerText, term);
                    if (index >= 0)
                    {
                        found = true;

                        SkillEvidenceDto evidence = new SkillEvidenceDto();
                        evidence.Skill = requiredSkill;
                        evidence.Snippet = MakeSnippet(cvText, index, term.Length);
                        result.Evidence.Add(evidence);

                        // The job used a different name than the CV (example: "ASP.NET Core" and "asp.net").
                        // The match is probably right, but a person should check it.
                        if (term != writtenName)
                        {
                            result.NeedsReview.Add(requiredSkill + " - found as \"" + term + "\", please check");
                        }

                        break;
                    }
                }

                if (found == false)
                {
                    if (textIsTooShort)
                    {
                        result.NeedsReview.Add(requiredSkill + " - the CV text is too short to check (maybe a scanned PDF)");
                    }
                    else
                    {
                        result.MissingSkills.Add(requiredSkill);
                    }
                }
            }

            return result;
        }

        public List<string> FindSkillsInText(string text)
        {
            List<string> foundSkills = new List<string>();

            if (string.IsNullOrWhiteSpace(text))
            {
                return foundSkills;
            }

            string lowerText = text.ToLowerInvariant();

            foreach (KnownSkill skill in _knownSkills)
            {
                foreach (string term in skill.Terms)
                {
                    if (FindWholeWord(lowerText, term) >= 0)
                    {
                        foundSkills.Add(skill.Name);
                        break;
                    }
                }
            }

            return foundSkills;
        }

        // ---------------- helper methods ----------------

        private void AddSkill(string name, params string[] otherNames)
        {
            KnownSkill skill = new KnownSkill();
            skill.Name = name;
            skill.Terms.Add(name.ToLowerInvariant());

            foreach (string otherName in otherNames)
            {
                skill.Terms.Add(otherName.ToLowerInvariant());
            }

            _knownSkills.Add(skill);
        }

        // Splits "C#, ASP.NET Core; SQL" into separate skills
        private List<string> SplitSkills(string requiredSkills)
        {
            List<string> skills = new List<string>();

            if (string.IsNullOrWhiteSpace(requiredSkills))
            {
                return skills;
            }

            string[] parts = requiredSkills.Split(new char[] { ',', ';', '\n' });

            foreach (string part in parts)
            {
                string skill = part.Trim();
                if (skill.Length == 0)
                {
                    continue;
                }

                bool alreadyAdded = false;
                foreach (string existing in skills)
                {
                    if (existing.ToLowerInvariant() == skill.ToLowerInvariant())
                    {
                        alreadyAdded = true;
                    }
                }

                if (alreadyAdded == false && skills.Count < 30)
                {
                    skills.Add(skill);
                }
            }

            return skills;
        }

        // Returns the written name first, then the other names of the same skill
        private List<string> GetSearchTerms(string writtenName)
        {
            List<string> terms = new List<string>();
            terms.Add(writtenName);

            foreach (KnownSkill skill in _knownSkills)
            {
                if (skill.Terms.Contains(writtenName))
                {
                    foreach (string term in skill.Terms)
                    {
                        if (terms.Contains(term) == false)
                        {
                            terms.Add(term);
                        }
                    }
                }
            }

            return terms;
        }

        // Finds a term as a WHOLE word. Example: "java" is not found inside "javascript".
        // Returns the position, or -1 when it is not found.
        private int FindWholeWord(string lowerText, string term)
        {
            if (term.Length == 0)
            {
                return -1;
            }

            int startIndex = 0;

            while (startIndex < lowerText.Length)
            {
                int index = lowerText.IndexOf(term, startIndex, StringComparison.Ordinal);
                if (index < 0)
                {
                    return -1;
                }

                bool startIsOk = (index == 0) || (char.IsLetterOrDigit(lowerText[index - 1]) == false);

                int endIndex = index + term.Length;
                bool endIsOk = (endIndex >= lowerText.Length) || (char.IsLetterOrDigit(lowerText[endIndex]) == false);

                if (startIsOk && endIsOk)
                {
                    return index;
                }

                startIndex = index + 1;
            }

            return -1;
        }

        private string MakeSnippet(string originalText, int index, int length)
        {
            int start = index - SnippetRadius;
            if (start < 0)
            {
                start = 0;
            }

            int end = index + length + SnippetRadius;
            if (end > originalText.Length)
            {
                end = originalText.Length;
            }

            if (start >= end)
            {
                return "";
            }

            string snippet = originalText.Substring(start, end - start);
            snippet = snippet.Replace("\r", " ").Replace("\n", " ").Trim();
            return snippet;
        }

        // A skill and all the names that mean the same skill
        private class KnownSkill
        {
            public string Name { get; set; }
            public List<string> Terms { get; set; }

            public KnownSkill()
            {
                Terms = new List<string>();
            }
        }
    }
}
