using System.ComponentModel.DataAnnotations;

namespace TalentFlow.Api.DTOs.Auth
{
    public class LoginRequest
    {
        [Required(ErrorMessage = "Email is required.")]
        [StringLength(200)]
        public string Email { get; set; }

        [Required(ErrorMessage = "Password is required.")]
        [StringLength(100)]
        public string Password { get; set; }
    }
}
