namespace TalentFlow.Api.Entities
{
    // Normal flow: Applied -> InReview -> Shortlisted -> Interview -> Offered
    // A recruiter can reject at any step before the final step.
    public enum ApplicationStatus
    {
        Applied,
        InReview,
        Shortlisted,
        Interview,
        Offered,
        Rejected
    }
}
