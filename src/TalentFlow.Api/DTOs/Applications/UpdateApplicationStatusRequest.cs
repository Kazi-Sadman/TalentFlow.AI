using System.ComponentModel.DataAnnotations;
using TalentFlow.Api.Entities;

namespace TalentFlow.Api.DTOs.Applications
{
    public class UpdateApplicationStatusRequest
    {
        [Required(ErrorMessage = "Status is required.")]
        public ApplicationStatus? Status { get; set; }

        [StringLength(2000)]
        public string RecruiterNotes { get; set; }
    }
}
