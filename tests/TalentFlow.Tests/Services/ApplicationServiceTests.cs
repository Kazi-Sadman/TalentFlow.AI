using System;
using System.Linq;
using System.Threading.Tasks;
using TalentFlow.Api.Common;
using TalentFlow.Api.Data;
using TalentFlow.Api.DTOs.Applications;
using TalentFlow.Api.Entities;
using TalentFlow.Api.Services;
using TalentFlow.Tests.Helpers;
using Xunit;

namespace TalentFlow.Tests.Services
{
    public class ApplicationServiceTests
    {
        private ApplicationService CreateService(TalentFlowDbContext db)
        {
            return new ApplicationService(db, new SkillMatchingService());
        }

        [Fact]
        public async Task Apply_FirstTime_CreatesApplication()
        {
            TalentFlowDbContext db = TestDbFactory.CreateContext();
            Company company = TestDbFactory.AddCompany(db, "Company A");
            Job job = TestDbFactory.AddJob(db, company.Id, JobStatus.Published, "C#");
            CandidateProfile candidate = TestDbFactory.AddCandidate(db, "c@test.com");
            ApplicationService service = CreateService(db);

            ApplicationResponse response = await service.ApplyAsync(candidate.UserId, job.Id, new ApplyRequest());

            Assert.Equal(ApplicationStatus.Applied, response.Status);
            Assert.Equal(job.Id, response.JobId);
        }

        [Fact]
        public async Task Apply_Twice_ThrowsConflict()
        {
            TalentFlowDbContext db = TestDbFactory.CreateContext();
            Company company = TestDbFactory.AddCompany(db, "Company A");
            Job job = TestDbFactory.AddJob(db, company.Id, JobStatus.Published, "C#");
            CandidateProfile candidate = TestDbFactory.AddCandidate(db, "c@test.com");
            ApplicationService service = CreateService(db);

            await service.ApplyAsync(candidate.UserId, job.Id, new ApplyRequest());

            await Assert.ThrowsAsync<ConflictException>(() => service.ApplyAsync(candidate.UserId, job.Id, new ApplyRequest()));
        }

        [Fact]
        public async Task Apply_ToClosedJob_ThrowsBadRequest()
        {
            TalentFlowDbContext db = TestDbFactory.CreateContext();
            Company company = TestDbFactory.AddCompany(db, "Company A");
            Job job = TestDbFactory.AddJob(db, company.Id, JobStatus.Closed, "C#");
            CandidateProfile candidate = TestDbFactory.AddCandidate(db, "c@test.com");
            ApplicationService service = CreateService(db);

            await Assert.ThrowsAsync<BadRequestException>(() => service.ApplyAsync(candidate.UserId, job.Id, new ApplyRequest()));
        }

        [Fact]
        public async Task Apply_ToDraftJob_ThrowsNotFound()
        {
            TalentFlowDbContext db = TestDbFactory.CreateContext();
            Company company = TestDbFactory.AddCompany(db, "Company A");
            Job job = TestDbFactory.AddJob(db, company.Id, JobStatus.Draft, "C#");
            CandidateProfile candidate = TestDbFactory.AddCandidate(db, "c@test.com");
            ApplicationService service = CreateService(db);

            await Assert.ThrowsAsync<NotFoundException>(() => service.ApplyAsync(candidate.UserId, job.Id, new ApplyRequest()));
        }

        [Fact]
        public async Task Apply_AfterDeadline_ThrowsBadRequest()
        {
            TalentFlowDbContext db = TestDbFactory.CreateContext();
            Company company = TestDbFactory.AddCompany(db, "Company A");
            Job job = TestDbFactory.AddJob(db, company.Id, JobStatus.Published, "C#");
            job.Deadline = DateTime.UtcNow.AddDays(-1);
            db.SaveChanges();
            CandidateProfile candidate = TestDbFactory.AddCandidate(db, "c@test.com");
            ApplicationService service = CreateService(db);

            await Assert.ThrowsAsync<BadRequestException>(() => service.ApplyAsync(candidate.UserId, job.Id, new ApplyRequest()));
        }

        [Fact]
        public async Task Apply_WithResumeOfAnotherCandidate_ThrowsBadRequest()
        {
            TalentFlowDbContext db = TestDbFactory.CreateContext();
            Company company = TestDbFactory.AddCompany(db, "Company A");
            Job job = TestDbFactory.AddJob(db, company.Id, JobStatus.Published, "C#");
            CandidateProfile me = TestDbFactory.AddCandidate(db, "me@test.com");
            CandidateProfile other = TestDbFactory.AddCandidate(db, "other@test.com");
            Resume othersResume = TestDbFactory.AddResume(db, other.Id, "text");
            ApplicationService service = CreateService(db);

            ApplyRequest request = new ApplyRequest();
            request.ResumeId = othersResume.Id;

            await Assert.ThrowsAsync<BadRequestException>(() => service.ApplyAsync(me.UserId, job.Id, request));
        }

        [Fact]
        public async Task UpdateStatus_AllowedStep_Works()
        {
            TalentFlowDbContext db = TestDbFactory.CreateContext();
            Company company = TestDbFactory.AddCompany(db, "Company A");
            User recruiter = TestDbFactory.AddRecruiter(db, company.Id, "r@test.com");
            Job job = TestDbFactory.AddJob(db, company.Id, JobStatus.Published, "C#");
            CandidateProfile candidate = TestDbFactory.AddCandidate(db, "c@test.com");
            Application application = TestDbFactory.AddApplication(db, job.Id, candidate.Id, ApplicationStatus.Applied);
            ApplicationService service = CreateService(db);

            UpdateApplicationStatusRequest request = new UpdateApplicationStatusRequest();
            request.Status = ApplicationStatus.InReview;
            request.RecruiterNotes = "Looks good";

            ApplicationDetailResponse response = await service.UpdateStatusAsync(application.Id, recruiter.Id, company.Id, request);

            Assert.Equal(ApplicationStatus.InReview, response.Status);
            Assert.Equal("Looks good", response.RecruiterNotes);
            Assert.Equal(1, db.AuditLogs.Count());
        }

        [Fact]
        public async Task UpdateStatus_NotAllowedStep_ThrowsUnprocessable()
        {
            TalentFlowDbContext db = TestDbFactory.CreateContext();
            Company company = TestDbFactory.AddCompany(db, "Company A");
            User recruiter = TestDbFactory.AddRecruiter(db, company.Id, "r@test.com");
            Job job = TestDbFactory.AddJob(db, company.Id, JobStatus.Published, "C#");
            CandidateProfile candidate = TestDbFactory.AddCandidate(db, "c@test.com");
            Application application = TestDbFactory.AddApplication(db, job.Id, candidate.Id, ApplicationStatus.Applied);
            ApplicationService service = CreateService(db);

            UpdateApplicationStatusRequest request = new UpdateApplicationStatusRequest();
            request.Status = ApplicationStatus.Offered;

            await Assert.ThrowsAsync<UnprocessableException>(() => service.UpdateStatusAsync(application.Id, recruiter.Id, company.Id, request));
        }

        [Fact]
        public async Task UpdateStatus_RecruiterOfOtherCompany_ThrowsNotFound()
        {
            TalentFlowDbContext db = TestDbFactory.CreateContext();
            Company companyA = TestDbFactory.AddCompany(db, "Company A");
            Company companyB = TestDbFactory.AddCompany(db, "Company B");
            User recruiterB = TestDbFactory.AddRecruiter(db, companyB.Id, "b@test.com");
            Job job = TestDbFactory.AddJob(db, companyA.Id, JobStatus.Published, "C#");
            CandidateProfile candidate = TestDbFactory.AddCandidate(db, "c@test.com");
            Application application = TestDbFactory.AddApplication(db, job.Id, candidate.Id, ApplicationStatus.Applied);
            ApplicationService service = CreateService(db);

            UpdateApplicationStatusRequest request = new UpdateApplicationStatusRequest();
            request.Status = ApplicationStatus.InReview;

            await Assert.ThrowsAsync<NotFoundException>(() => service.UpdateStatusAsync(application.Id, recruiterB.Id, companyB.Id, request));
        }

        [Fact]
        public async Task GetDetail_OtherCandidate_ThrowsNotFound()
        {
            TalentFlowDbContext db = TestDbFactory.CreateContext();
            Company company = TestDbFactory.AddCompany(db, "Company A");
            Job job = TestDbFactory.AddJob(db, company.Id, JobStatus.Published, "C#");
            CandidateProfile owner = TestDbFactory.AddCandidate(db, "owner@test.com");
            CandidateProfile stranger = TestDbFactory.AddCandidate(db, "stranger@test.com");
            Application application = TestDbFactory.AddApplication(db, job.Id, owner.Id, ApplicationStatus.Applied);
            ApplicationService service = CreateService(db);

            await Assert.ThrowsAsync<NotFoundException>(
                () => service.GetApplicationDetailAsync(application.Id, stranger.UserId, UserRole.Candidate, null));
        }

        [Fact]
        public async Task GetDetail_Candidate_DoesNotSeeRecruiterNotes()
        {
            TalentFlowDbContext db = TestDbFactory.CreateContext();
            Company company = TestDbFactory.AddCompany(db, "Company A");
            Job job = TestDbFactory.AddJob(db, company.Id, JobStatus.Published, "C#");
            CandidateProfile owner = TestDbFactory.AddCandidate(db, "owner@test.com");
            Application application = TestDbFactory.AddApplication(db, job.Id, owner.Id, ApplicationStatus.Applied);
            application.RecruiterNotes = "private note";
            db.SaveChanges();
            ApplicationService service = CreateService(db);

            ApplicationDetailResponse response = await service.GetApplicationDetailAsync(
                application.Id, owner.UserId, UserRole.Candidate, null);

            Assert.Null(response.RecruiterNotes);
        }

        [Fact]
        public async Task GetJobApplicants_OtherCompany_ThrowsNotFound()
        {
            TalentFlowDbContext db = TestDbFactory.CreateContext();
            Company companyA = TestDbFactory.AddCompany(db, "Company A");
            Company companyB = TestDbFactory.AddCompany(db, "Company B");
            Job job = TestDbFactory.AddJob(db, companyA.Id, JobStatus.Published, "C#");
            ApplicationService service = CreateService(db);

            await Assert.ThrowsAsync<NotFoundException>(
                () => service.GetJobApplicantsAsync(job.Id, companyB.Id, new ApplicationQuery()));
        }
    }
}
