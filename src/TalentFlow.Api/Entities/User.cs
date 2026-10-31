using System;

namespace TalentFlow.Api.Entities
{
    public class User
    {
        public int Id { get; set; }

        // Only recruiters belong to a company. For candidates this is null.
        public int? CompanyId { get; set; }
        public Company Company { get; set; }

        public string FullName { get; set; }
        public string Email { get; set; }
        public string PasswordHash { get; set; }
        public UserRole Role { get; set; }
        public DateTime CreatedAt { get; set; }

        public CandidateProfile CandidateProfile { get; set; }
    }
}
