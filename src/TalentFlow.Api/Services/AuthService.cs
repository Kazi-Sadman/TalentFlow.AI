using System;
using System.Collections.Generic;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.JsonWebTokens;
using Microsoft.IdentityModel.Tokens;
using TalentFlow.Api.Common;
using TalentFlow.Api.Data;
using TalentFlow.Api.DTOs.Auth;
using TalentFlow.Api.Entities;
using TalentFlow.Api.Services.Interfaces;

namespace TalentFlow.Api.Services
{
    public class AuthService : IAuthService
    {
        private readonly TalentFlowDbContext _db;
        private readonly JwtSettings _jwtSettings;

        public AuthService(TalentFlowDbContext db, JwtSettings jwtSettings)
        {
            _db = db;
            _jwtSettings = jwtSettings;
        }

        public async Task<AuthResponse> RegisterAsync(RegisterRequest request)
        {
            // Nobody can create an Admin account from the public register endpoint.
            if (request.Role != UserRole.Candidate && request.Role != UserRole.Recruiter)
            {
                throw new BadRequestException("Role must be Candidate or Recruiter.");
            }

            string email = request.Email.Trim().ToLower();

            bool emailExists = await _db.Users.AnyAsync(u => u.Email == email);
            if (emailExists)
            {
                throw new ConflictException("This email is already registered.");
            }

            User user = new User();
            user.FullName = request.FullName.Trim();
            user.Email = email;
            user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password);
            user.Role = request.Role;
            user.CreatedAt = DateTime.UtcNow;

            if (request.Role == UserRole.Recruiter)
            {
                // A recruiter always creates a NEW company.
                // (A recruiter can never join an existing company by typing its name.)
                if (string.IsNullOrWhiteSpace(request.CompanyName))
                {
                    throw new BadRequestException("Company name is required for a recruiter.");
                }

                string companyName = request.CompanyName.Trim();

                bool companyExists = await _db.Companies.AnyAsync(c => c.Name.ToLower() == companyName.ToLower());
                if (companyExists)
                {
                    throw new ConflictException("A company with this name already exists.");
                }

                Company company = new Company();
                company.Name = companyName;
                company.Website = request.CompanyWebsite;
                company.CreatedAt = DateTime.UtcNow;

                user.Company = company;
            }

            _db.Users.Add(user);

            if (request.Role == UserRole.Candidate)
            {
                // Every candidate gets an empty profile.
                CandidateProfile profile = new CandidateProfile();
                profile.User = user;
                _db.CandidateProfiles.Add(profile);
            }

            await _db.SaveChangesAsync();

            return CreateAuthResponse(user);
        }

        public async Task<AuthResponse> LoginAsync(LoginRequest request)
        {
            string email = request.Email.Trim().ToLower();

            User user = await _db.Users.FirstOrDefaultAsync(u => u.Email == email);

            // The same message is used for "no user" and "wrong password",
            // so an attacker cannot find out which emails exist.
            if (user == null)
            {
                throw new UnauthorizedException("Invalid email or password.");
            }

            bool passwordIsCorrect = BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash);
            if (passwordIsCorrect == false)
            {
                throw new UnauthorizedException("Invalid email or password.");
            }

            return CreateAuthResponse(user);
        }

        private AuthResponse CreateAuthResponse(User user)
        {
            DateTime expiresAt = DateTime.UtcNow.AddMinutes(_jwtSettings.ExpiryMinutes);

            AuthResponse response = new AuthResponse();
            response.Token = CreateToken(user, expiresAt);
            response.ExpiresAtUtc = expiresAt;
            response.UserId = user.Id;
            response.FullName = user.FullName;
            response.Email = user.Email;
            response.Role = user.Role;
            response.CompanyId = user.CompanyId;
            return response;
        }

        private string CreateToken(User user, DateTime expiresAt)
        {
            List<Claim> claims = new List<Claim>();
            claims.Add(new Claim("sub", user.Id.ToString()));
            claims.Add(new Claim("email", user.Email));
            claims.Add(new Claim("role", user.Role.ToString()));

            if (user.CompanyId != null)
            {
                claims.Add(new Claim("companyId", user.CompanyId.Value.ToString()));
            }

            SymmetricSecurityKey key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_jwtSettings.Key));

            SecurityTokenDescriptor descriptor = new SecurityTokenDescriptor();
            descriptor.Subject = new ClaimsIdentity(claims);
            descriptor.Issuer = _jwtSettings.Issuer;
            descriptor.Audience = _jwtSettings.Audience;
            descriptor.NotBefore = DateTime.UtcNow;
            descriptor.Expires = expiresAt;
            descriptor.SigningCredentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            JsonWebTokenHandler handler = new JsonWebTokenHandler();
            return handler.CreateToken(descriptor);
        }
    }
}
