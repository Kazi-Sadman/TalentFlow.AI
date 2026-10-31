namespace TalentFlow.Api.Entities
{
    // Candidate = first value, so it is also the default value.
    // Admin is reserved for a future version (not used in the MVP).
    public enum UserRole
    {
        Candidate,
        Recruiter,
        Admin
    }
}
