using System;
using System.ComponentModel.DataAnnotations;

namespace TalentFlow.Api.DTOs.Interviews
{
    public class CreateInterviewRequest
    {
        [Required(ErrorMessage = "Start time is required.")]
        public DateTime StartAtUtc { get; set; }

        [Required(ErrorMessage = "End time is required.")]
        public DateTime EndAtUtc { get; set; }

        [Required(ErrorMessage = "Meeting link is required.")]
        [Url(ErrorMessage = "Meeting link must be a valid URL.")]
        [StringLength(500)]
        public string MeetingLink { get; set; }

        // Optional. If it is empty (or 0), the current recruiter is the interviewer.
        public int? InterviewerUserId { get; set; }
    }
}
