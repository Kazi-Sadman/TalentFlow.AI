using System;
using TalentFlow.Api.Entities;

namespace TalentFlow.Api.DTOs.Auth
{
    public class AuthResponse
    {
        public string Token { get; set; }
        public DateTime ExpiresAtUtc { get; set; }
        public int UserId { get; set; }
        public string FullName { get; set; }
        public string Email { get; set; }
        public UserRole Role { get; set; }
        public int? CompanyId { get; set; }
    }
}
