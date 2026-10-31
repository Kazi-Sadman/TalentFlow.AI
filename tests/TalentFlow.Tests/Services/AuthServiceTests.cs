using System.Linq;
using System.Threading.Tasks;
using TalentFlow.Api.Common;
using TalentFlow.Api.Data;
using TalentFlow.Api.DTOs.Auth;
using TalentFlow.Api.Entities;
using TalentFlow.Api.Services;
using TalentFlow.Tests.Helpers;
using Xunit;

namespace TalentFlow.Tests.Services
{
    public class AuthServiceTests
    {
        private AuthService CreateService(TalentFlowDbContext db)
        {
            JwtSettings settings = new JwtSettings();
            settings.Key = "this-is-a-test-key-with-more-than-32-characters";
            settings.Issuer = "test";
            settings.Audience = "test";
            settings.ExpiryMinutes = 60;
            return new AuthService(db, settings);
        }

        private RegisterRequest MakeCandidateRequest(string email)
        {
            RegisterRequest request = new RegisterRequest();
            request.FullName = "Test User";
            request.Email = email;
            request.Password = "Password1";
            request.Role = UserRole.Candidate;
            return request;
        }

        [Fact]
        public async Task RegisterCandidate_CreatesUserProfileAndToken()
        {
            TalentFlowDbContext db = TestDbFactory.CreateContext();
            AuthService service = CreateService(db);

            AuthResponse response = await service.RegisterAsync(MakeCandidateRequest("a@test.com"));

            Assert.False(string.IsNullOrEmpty(response.Token));
            Assert.Equal(UserRole.Candidate, response.Role);
            Assert.Equal(1, db.CandidateProfiles.Count());
        }

        [Fact]
        public async Task RegisterRecruiter_CreatesCompany()
        {
            TalentFlowDbContext db = TestDbFactory.CreateContext();
            AuthService service = CreateService(db);

            RegisterRequest request = MakeCandidateRequest("r@test.com");
            request.Role = UserRole.Recruiter;
            request.CompanyName = "My Company";

            AuthResponse response = await service.RegisterAsync(request);

            Assert.NotNull(response.CompanyId);
            Assert.Equal(1, db.Companies.Count());
        }

        [Fact]
        public async Task RegisterRecruiter_WithoutCompanyName_ThrowsBadRequest()
        {
            TalentFlowDbContext db = TestDbFactory.CreateContext();
            AuthService service = CreateService(db);

            RegisterRequest request = MakeCandidateRequest("r@test.com");
            request.Role = UserRole.Recruiter;

            await Assert.ThrowsAsync<BadRequestException>(() => service.RegisterAsync(request));
        }

        [Fact]
        public async Task RegisterAdmin_IsNotAllowed()
        {
            TalentFlowDbContext db = TestDbFactory.CreateContext();
            AuthService service = CreateService(db);

            RegisterRequest request = MakeCandidateRequest("admin@test.com");
            request.Role = UserRole.Admin;

            await Assert.ThrowsAsync<BadRequestException>(() => service.RegisterAsync(request));
        }

        [Fact]
        public async Task RegisterSameEmailTwice_ThrowsConflict()
        {
            TalentFlowDbContext db = TestDbFactory.CreateContext();
            AuthService service = CreateService(db);

            await service.RegisterAsync(MakeCandidateRequest("same@test.com"));

            await Assert.ThrowsAsync<ConflictException>(() => service.RegisterAsync(MakeCandidateRequest("SAME@test.com")));
        }

        [Fact]
        public async Task Login_WithCorrectPassword_Works()
        {
            TalentFlowDbContext db = TestDbFactory.CreateContext();
            AuthService service = CreateService(db);
            await service.RegisterAsync(MakeCandidateRequest("login@test.com"));

            LoginRequest login = new LoginRequest();
            login.Email = "login@test.com";
            login.Password = "Password1";

            AuthResponse response = await service.LoginAsync(login);

            Assert.False(string.IsNullOrEmpty(response.Token));
        }

        [Fact]
        public async Task Login_WithWrongPassword_ThrowsUnauthorized()
        {
            TalentFlowDbContext db = TestDbFactory.CreateContext();
            AuthService service = CreateService(db);
            await service.RegisterAsync(MakeCandidateRequest("login@test.com"));

            LoginRequest login = new LoginRequest();
            login.Email = "login@test.com";
            login.Password = "WrongPassword9";

            await Assert.ThrowsAsync<UnauthorizedException>(() => service.LoginAsync(login));
        }

        [Fact]
        public async Task Login_UnknownEmail_ThrowsUnauthorized()
        {
            TalentFlowDbContext db = TestDbFactory.CreateContext();
            AuthService service = CreateService(db);

            LoginRequest login = new LoginRequest();
            login.Email = "nobody@test.com";
            login.Password = "Password1";

            await Assert.ThrowsAsync<UnauthorizedException>(() => service.LoginAsync(login));
        }
    }
}
