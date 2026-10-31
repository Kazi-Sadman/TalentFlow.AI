using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging.Abstractions;
using TalentFlow.Api.Common;
using TalentFlow.Api.Data;
using TalentFlow.Api.DTOs.AI;
using TalentFlow.Api.Entities;
using TalentFlow.Api.Services;
using TalentFlow.Api.Services.Interfaces;
using TalentFlow.Tests.Helpers;
using Xunit;

namespace TalentFlow.Tests.Services
{
    public class AIAnalysisServiceTests
    {
        // A fake matcher that always crashes. It simulates an AI provider that is down.
        private class BrokenSkillMatcher : ISkillMatchingService
        {
            public SkillMatchResult Analyze(string cvText, string requiredSkills)
            {
                throw new System.InvalidOperationException("Provider is down");
            }

            public List<string> FindSkillsInText(string text)
            {
                return new List<string>();
            }
        }

        private Application CreateApplicationWithResume(TalentFlowDbContext db, Company company, string cvText)
        {
            Job job = TestDbFactory.AddJob(db, company.Id, JobStatus.Published, "C#, Docker");
            CandidateProfile candidate = TestDbFactory.AddCandidate(db, "c@test.com");
            Resume resume = TestDbFactory.AddResume(db, candidate.Id, cvText);
            Application application = TestDbFactory.AddApplication(db, job.Id, candidate.Id, ApplicationStatus.Applied);
            application.ResumeId = resume.Id;
            db.SaveChanges();
            return application;
        }

        private const string LongCv =
            "Junior developer. I write C# code every day and I use Git for source control. " +
            "I am learning cloud tools and want to grow as a backend engineer in a good team.";

        [Fact]
        public async Task RunAnalysis_ByRecruiter_CompletesAndFindsMissingSkill()
        {
            TalentFlowDbContext db = TestDbFactory.CreateContext();
            Company company = TestDbFactory.AddCompany(db, "Company A");
            User recruiter = TestDbFactory.AddRecruiter(db, company.Id, "r@test.com");
            Application application = CreateApplicationWithResume(db, company, LongCv);
            AIAnalysisService service = new AIAnalysisService(db, new SkillMatchingService(), NullLogger<AIAnalysisService>.Instance);

            AIAnalysisResponse response = await service.RunAnalysisAsync(application.Id, recruiter.Id, UserRole.Recruiter, company.Id);

            Assert.Equal(AnalysisStatus.Completed, response.Status);
            Assert.Contains("Docker", response.MissingSkills);
            Assert.Single(response.Evidence);
            Assert.False(string.IsNullOrEmpty(response.Disclaimer));
        }

        [Fact]
        public async Task RunAnalysis_WhenMatcherFails_StatusIsFailed_AndApplicationIsUntouched()
        {
            TalentFlowDbContext db = TestDbFactory.CreateContext();
            Company company = TestDbFactory.AddCompany(db, "Company A");
            User recruiter = TestDbFactory.AddRecruiter(db, company.Id, "r@test.com");
            Application application = CreateApplicationWithResume(db, company, LongCv);
            AIAnalysisService service = new AIAnalysisService(db, new BrokenSkillMatcher(), NullLogger<AIAnalysisService>.Instance);

            AIAnalysisResponse response = await service.RunAnalysisAsync(application.Id, recruiter.Id, UserRole.Recruiter, company.Id);

            Assert.Equal(AnalysisStatus.Failed, response.Status);
            Assert.Equal(ApplicationStatus.Applied, application.Status);
        }

        [Fact]
        public async Task RunAnalysis_WithoutResume_ThrowsBadRequest()
        {
            TalentFlowDbContext db = TestDbFactory.CreateContext();
            Company company = TestDbFactory.AddCompany(db, "Company A");
            User recruiter = TestDbFactory.AddRecruiter(db, company.Id, "r@test.com");
            Job job = TestDbFactory.AddJob(db, company.Id, JobStatus.Published, "C#");
            CandidateProfile candidate = TestDbFactory.AddCandidate(db, "c@test.com");
            Application application = TestDbFactory.AddApplication(db, job.Id, candidate.Id, ApplicationStatus.Applied);
            AIAnalysisService service = new AIAnalysisService(db, new SkillMatchingService(), NullLogger<AIAnalysisService>.Instance);

            await Assert.ThrowsAsync<BadRequestException>(
                () => service.RunAnalysisAsync(application.Id, recruiter.Id, UserRole.Recruiter, company.Id));
        }

        [Fact]
        public async Task RunAnalysis_RecruiterOfOtherCompany_ThrowsNotFound()
        {
            TalentFlowDbContext db = TestDbFactory.CreateContext();
            Company companyA = TestDbFactory.AddCompany(db, "Company A");
            Company companyB = TestDbFactory.AddCompany(db, "Company B");
            User recruiterB = TestDbFactory.AddRecruiter(db, companyB.Id, "b@test.com");
            Application application = CreateApplicationWithResume(db, companyA, LongCv);
            AIAnalysisService service = new AIAnalysisService(db, new SkillMatchingService(), NullLogger<AIAnalysisService>.Instance);

            await Assert.ThrowsAsync<NotFoundException>(
                () => service.RunAnalysisAsync(application.Id, recruiterB.Id, UserRole.Recruiter, companyB.Id));
        }

        [Fact]
        public async Task GetLatest_WhenNoAnalysis_ThrowsNotFound()
        {
            TalentFlowDbContext db = TestDbFactory.CreateContext();
            Company company = TestDbFactory.AddCompany(db, "Company A");
            User recruiter = TestDbFactory.AddRecruiter(db, company.Id, "r@test.com");
            Application application = CreateApplicationWithResume(db, company, LongCv);
            AIAnalysisService service = new AIAnalysisService(db, new SkillMatchingService(), NullLogger<AIAnalysisService>.Instance);

            await Assert.ThrowsAsync<NotFoundException>(
                () => service.GetLatestAnalysisAsync(application.Id, recruiter.Id, UserRole.Recruiter, company.Id));
        }
    }
}
