using TalentFlow.Api.Entities;

namespace TalentFlow.Api.DTOs.Applications
{
    public class ApplicationQuery
    {
        public int Page { get; set; } = 1;
        public int PageSize { get; set; } = 10;
        public ApplicationStatus? Status { get; set; }

        // Used by the recruiter: search by candidate name
        public string Search { get; set; }
    }
}
