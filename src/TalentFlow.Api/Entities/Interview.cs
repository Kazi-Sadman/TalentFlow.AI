using System;

namespace TalentFlow.Api.Entities
{
    public class Interview
    {
        public int Id { get; set; }

        public int ApplicationId { get; set; }
        public Application Application { get; set; }

        public int InterviewerUserId { get; set; }
        public User InterviewerUser { get; set; }

        public DateTime StartAtUtc { get; set; }
        public DateTime EndAtUtc { get; set; }
        public string MeetingLink { get; set; }

        // Private feedback. Only recruiters can see it.
        public string Feedback { get; set; }
    }
}
