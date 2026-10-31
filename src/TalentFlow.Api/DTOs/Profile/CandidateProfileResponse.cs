namespace TalentFlow.Api.DTOs.Profile
{
    public class CandidateProfileResponse
    {
        public int Id { get; set; }
        public string FullName { get; set; }
        public string Email { get; set; }
        public string Summary { get; set; }
        public string Education { get; set; }
        public int ExperienceYears { get; set; }
        public string Skills { get; set; }
    }
}
