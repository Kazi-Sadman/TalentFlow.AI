using System;

namespace TalentFlow.Api.DTOs.Interviews
{
    public class InterviewResponse
    {
        public int Id { get; set; }
        public int ApplicationId { get; set; }
        public int InterviewerUserId { get; set; }
        public string InterviewerName { get; set; }
        public DateTime StartAtUtc { get; set; }
        public DateTime EndAtUtc { get; set; }
        public string MeetingLink { get; set; }

        // Only filled for recruiters.
        public string Feedback { get; set; }
    }
}
