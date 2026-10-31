using System.ComponentModel.DataAnnotations;
using TalentFlow.Api.Entities;

namespace TalentFlow.Api.DTOs.Auth
{
    public class RegisterRequest
    {
        [Required(ErrorMessage = "Full name is required.")]
        [StringLength(100)]
        public string FullName { get; set; }

        [Required(ErrorMessage = "Email is required.")]
        [EmailAddress(ErrorMessage = "Email is not valid.")]
        [StringLength(200)]
        public string Email { get; set; }

        [Required(ErrorMessage = "Password is required.")]
        [StringLength(100, MinimumLength = 8, ErrorMessage = "Password must be at least 8 characters.")]
        [RegularExpression("^(?=.*[A-Za-z])(?=.*[0-9]).+$", ErrorMessage = "Password must contain at least one letter and one number.")]
        public string Password { get; set; }

        // Candidate or Recruiter
        public UserRole Role { get; set; }

        // Required only when Role is Recruiter. A new company is created.
        [StringLength(150)]
        public string CompanyName { get; set; }

        [Url(ErrorMessage = "Company website must be a valid URL.")]
        [StringLength(300)]
        public string CompanyWebsite { get; set; }
    }
}
