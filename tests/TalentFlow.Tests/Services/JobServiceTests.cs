using System;
using System.Linq;
using System.Threading.Tasks;
using TalentFlow.Api.Common;
using TalentFlow.Api.Data;
using TalentFlow.Api.DTOs.Jobs;
using TalentFlow.Api.Entities;
using TalentFlow.Api.Services;
using TalentFlow.Tests.Helpers;
using Xunit;

namespace TalentFlow.Tests.Services
{
    public class JobServiceTests
    {
        private CreateJobRequest MakeRequest()
        {
            CreateJobRequest request = new CreateJobRequest();
            request.Title = "  .NET Developer  ";
            request.Description = "Build APIs";
            request.RequiredSkills = "C#, SQL";
            request.ExperienceLevel = ExperienceLevel.Junior;
            request.Status = JobStatus.Published;
            return request;
        }

        [Fact]
        public async Task CreateJob_SavesJobAndTrimsTitle()
        {
            TalentFlowDbContext db = TestDbFactory.CreateContext();
            Company company = TestDbFactory.AddCompany(db, "Company A");
            JobService service = new JobService(db);

            JobResponse response = await service.CreateJobAsync(company.Id, MakeRequest());

            Assert.Equal(".NET Developer", response.Title);
            Assert.Equal("Company A", response.CompanyName);
            Assert.Equal(1, db.Jobs.Count());
        }

        [Fact]
        public async Task CreateJob_WithPastDeadline_ThrowsBadRequest()
        {
            TalentFlowDbContext db = TestDbFactory.CreateContext();
            Company company = TestDbFactory.AddCompany(db, "Company A");
            JobService service = new JobService(db);

            CreateJobRequest request = MakeRequest();
            request.Deadline = DateTime.UtcNow.AddDays(-1);

            await Assert.ThrowsAsync<BadRequestException>(() => service.CreateJobAsync(company.Id, request));
        }

        [Fact]
        public async Task CreateJob_AsClosed_ThrowsBadRequest()
        {
            TalentFlowDbContext db = TestDbFactory.CreateContext();
            Company company = TestDbFactory.AddCompany(db, "Company A");
            JobService service = new JobService(db);

            CreateJobRequest request = MakeRequest();
            request.Status = JobStatus.Closed;

            await Assert.ThrowsAsync<BadRequestException>(() => service.CreateJobAsync(company.Id, request));
        }

        [Fact]
        public async Task PublicList_ShowsOnlyPublishedJobs()
        {
            TalentFlowDbContext db = TestDbFactory.CreateContext();
            Company company = TestDbFactory.AddCompany(db, "Company A");
            TestDbFactory.AddJob(db, company.Id, JobStatus.Published, "C#");
            TestDbFactory.AddJob(db, company.Id, JobStatus.Draft, "C#");
            TestDbFactory.AddJob(db, company.Id, JobStatus.Closed, "C#");
            JobService service = new JobService(db);

            PagedResult<JobResponse> result = await service.GetPublishedJobsAsync(new JobQuery());

            Assert.Equal(1, result.TotalCount);
        }

        [Fact]
        public async Task PublicList_FiltersBySkill()
        {
            TalentFlowDbContext db = TestDbFactory.CreateContext();
            Company company = TestDbFactory.AddCompany(db, "Company A");
            TestDbFactory.AddJob(db, company.Id, JobStatus.Published, "C#, SQL");
            TestDbFactory.AddJob(db, company.Id, JobStatus.Published, "React, CSS");
            JobService service = new JobService(db);

            JobQuery query = new JobQuery();
            query.Skill = "react";

            PagedResult<JobResponse> result = await service.GetPublishedJobsAsync(query);

            Assert.Equal(1, result.TotalCount);
        }

        [Fact]
        public async Task PublicList_PageSizeIsLimited()
        {
            TalentFlowDbContext db = TestDbFactory.CreateContext();
            Company company = TestDbFactory.AddCompany(db, "Company A");
            JobService service = new JobService(db);

            JobQuery query = new JobQuery();
            query.PageSize = 100000;

            PagedResult<JobResponse> result = await service.GetPublishedJobsAsync(query);

            Assert.Equal(PagingHelper.MaxPageSize, result.PageSize);
        }

        [Fact]
        public async Task GetDraftJob_FromOtherCompany_ThrowsNotFound()
        {
            TalentFlowDbContext db = TestDbFactory.CreateContext();
            Company company = TestDbFactory.AddCompany(db, "Company A");
            Job draft = TestDbFactory.AddJob(db, company.Id, JobStatus.Draft, "C#");
            JobService service = new JobService(db);

            await Assert.ThrowsAsync<NotFoundException>(() => service.GetJobByIdAsync(draft.Id, null));
        }

        [Fact]
        public async Task GetDraftJob_FromOwnCompany_Works()
        {
            TalentFlowDbContext db = TestDbFactory.CreateContext();
            Company company = TestDbFactory.AddCompany(db, "Company A");
            Job draft = TestDbFactory.AddJob(db, company.Id, JobStatus.Draft, "C#");
            JobService service = new JobService(db);

            JobResponse response = await service.GetJobByIdAsync(draft.Id, company.Id);

            Assert.Equal(draft.Id, response.Id);
        }

        [Fact]
        public async Task UpdateJob_OtherCompany_ThrowsNotFound()
        {
            TalentFlowDbContext db = TestDbFactory.CreateContext();
            Company companyA = TestDbFactory.AddCompany(db, "Company A");
            Company companyB = TestDbFactory.AddCompany(db, "Company B");
            Job job = TestDbFactory.AddJob(db, companyA.Id, JobStatus.Published, "C#");
            JobService service = new JobService(db);

            UpdateJobRequest request = new UpdateJobRequest();
            request.Title = "Hacked";

            await Assert.ThrowsAsync<NotFoundException>(() => service.UpdateJobAsync(job.Id, companyB.Id, 1, request));
        }

        [Fact]
        public async Task UpdateJob_ClosePublishedJob_Works()
        {
            TalentFlowDbContext db = TestDbFactory.CreateContext();
            Company company = TestDbFactory.AddCompany(db, "Company A");
            Job job = TestDbFactory.AddJob(db, company.Id, JobStatus.Published, "C#");
            JobService service = new JobService(db);

            UpdateJobRequest request = new UpdateJobRequest();
            request.Status = JobStatus.Closed;

            JobResponse response = await service.UpdateJobAsync(job.Id, company.Id, 1, request);

            Assert.Equal(JobStatus.Closed, response.Status);
        }

        [Fact]
        public async Task UpdateJob_ClosedJobCannotBeEdited()
        {
            TalentFlowDbContext db = TestDbFactory.CreateContext();
            Company company = TestDbFactory.AddCompany(db, "Company A");
            Job job = TestDbFactory.AddJob(db, company.Id, JobStatus.Closed, "C#");
            JobService service = new JobService(db);

            UpdateJobRequest request = new UpdateJobRequest();
            request.Title = "New title";

            await Assert.ThrowsAsync<ConflictException>(() => service.UpdateJobAsync(job.Id, company.Id, 1, request));
        }

        [Fact]
        public async Task UpdateJob_PublishedToDraft_ThrowsUnprocessable()
        {
            TalentFlowDbContext db = TestDbFactory.CreateContext();
            Company company = TestDbFactory.AddCompany(db, "Company A");
            Job job = TestDbFactory.AddJob(db, company.Id, JobStatus.Published, "C#");
            JobService service = new JobService(db);

            UpdateJobRequest request = new UpdateJobRequest();
            request.Status = JobStatus.Draft;

            await Assert.ThrowsAsync<UnprocessableException>(() => service.UpdateJobAsync(job.Id, company.Id, 1, request));
        }

        [Fact]
        public async Task DeleteJob_PublishedJob_ThrowsConflict()
        {
            TalentFlowDbContext db = TestDbFactory.CreateContext();
            Company company = TestDbFactory.AddCompany(db, "Company A");
            Job job = TestDbFactory.AddJob(db, company.Id, JobStatus.Published, "C#");
            JobService service = new JobService(db);

            await Assert.ThrowsAsync<ConflictException>(() => service.DeleteJobAsync(job.Id, company.Id));
        }
    }
}
