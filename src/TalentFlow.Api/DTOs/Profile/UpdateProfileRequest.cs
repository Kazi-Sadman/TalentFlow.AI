using System.ComponentModel.DataAnnotations;

namespace TalentFlow.Api.DTOs.Profile
{
    public class UpdateProfileRequest
    {
        [StringLength(2000)]
        public string Summary { get; set; }

        [StringLength(1000)]
        public string Education { get; set; }

        [Range(0, 60, ErrorMessage = "Experience years must be between 0 and 60.")]
        public int ExperienceYears { get; set; }

        // Comma separated, for example: "C#, SQL, Git"
        [StringLength(500)]
        public string Skills { get; set; }
    }
}
