namespace TalentFlow.Api.Authorization
{
    // The role names are the same text as the UserRole enum values.
    public static class RoleNames
    {
        public const string Candidate = "Candidate";
        public const string Recruiter = "Recruiter";
    }

    public static class PolicyNames
    {
        public const string CandidateOnly = "CandidateOnly";
        public const string RecruiterOnly = "RecruiterOnly";
    }
}
