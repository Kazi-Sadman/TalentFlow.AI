using System.ComponentModel.DataAnnotations;

namespace TalentFlow.Api.DTOs.Interviews
{
    public class UpdateInterviewFeedbackRequest
    {
        [Required(ErrorMessage = "Feedback is required.")]
        [StringLength(3000)]
        public string Feedback { get; set; }
    }
}
