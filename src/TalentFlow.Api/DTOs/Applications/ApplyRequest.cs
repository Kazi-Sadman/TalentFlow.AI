namespace TalentFlow.Api.DTOs.Applications
{
    public class ApplyRequest
    {
        // Optional. If it is empty (or 0), the latest uploaded resume is used.
        public int? ResumeId { get; set; }
    }
}
