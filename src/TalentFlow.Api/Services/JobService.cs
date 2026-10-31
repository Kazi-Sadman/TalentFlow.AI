using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using TalentFlow.Api.Common;
using TalentFlow.Api.Data;
using TalentFlow.Api.DTOs.Jobs;
using TalentFlow.Api.Entities;
using TalentFlow.Api.Mapping;
using TalentFlow.Api.Services.Interfaces;

namespace TalentFlow.Api.Services
{
    public class JobService : IJobService
    {
        private readonly TalentFlowDbContext _db;

        public JobService(TalentFlowDbContext db)
        {
            _db = db;
        }

        public async Task<PagedResult<JobResponse>> GetPublishedJobsAsync(JobQuery query)
        {
            DateTime now = DateTime.UtcNow;

            // The public can see only Published jobs whose deadline has not passed.
            IQueryable<Job> jobs = _db.Jobs
                .Include(j => j.Company)
                .Where(j => j.Status == JobStatus.Published)
                .Where(j => j.Deadline == null || j.Deadline > now);

            jobs = ApplySearchFilters(jobs, query);

            return await GetPageAsync(jobs, query);
        }

        public async Task<PagedResult<JobResponse>> GetCompanyJobsAsync(int companyId, JobQuery query)
        {
            IQueryable<Job> jobs = _db.Jobs
                .Include(j => j.Company)
                .Where(j => j.CompanyId == companyId);

            if (query.Status != null)
            {
                JobStatus status = query.Status.Value;
                jobs = jobs.Where(j => j.Status == status);
            }

            jobs = ApplySearchFilters(jobs, query);

            return await GetPageAsync(jobs, query);
        }

        public async Task<JobResponse> GetJobByIdAsync(int jobId, int? viewerCompanyId)
        {
            Job job = await _db.Jobs
                .Include(j => j.Company)
                .FirstOrDefaultAsync(j => j.Id == jobId);

            if (job == null)
            {
                throw new NotFoundException("Job not found.");
            }

            // A Draft job can be seen only by the recruiters of the same company.
            if (job.Status == JobStatus.Draft)
            {
                bool isOwnerCompany = viewerCompanyId != null && viewerCompanyId.Value == job.CompanyId;
                if (isOwnerCompany == false)
                {
                    throw new NotFoundException("Job not found.");
                }
            }

            return EntityMapper.ToJobResponse(job);
        }

        public async Task<JobResponse> CreateJobAsync(int companyId, CreateJobRequest request)
        {
            if (request.Status == JobStatus.Closed)
            {
                throw new BadRequestException("A new job cannot be created as Closed.");
            }

            DateTime? deadline = null;
            if (request.Deadline != null)
            {
                deadline = DateTimeHelper.ToUtc(request.Deadline.Value);
                if (deadline.Value <= DateTime.UtcNow)
                {
                    throw new BadRequestException("Deadline must be in the future.");
                }
            }

            Job job = new Job();
            job.CompanyId = companyId;
            job.Title = request.Title.Trim();
            job.Description = request.Description.Trim();
            job.RequiredSkills = request.RequiredSkills.Trim();
            job.ExperienceLevel = request.ExperienceLevel;
            job.Status = request.Status;
            job.Deadline = deadline;
            job.CreatedAt = DateTime.UtcNow;

            _db.Jobs.Add(job);
            await _db.SaveChangesAsync();

            job.Company = await _db.Companies.FirstOrDefaultAsync(c => c.Id == companyId);

            return EntityMapper.ToJobResponse(job);
        }

        public async Task<JobResponse> UpdateJobAsync(int jobId, int companyId, int userId, UpdateJobRequest request)
        {
            // We search by Id AND CompanyId, so a recruiter cannot touch another company's job.
            Job job = await _db.Jobs
                .Include(j => j.Company)
                .FirstOrDefaultAsync(j => j.Id == jobId && j.CompanyId == companyId);

            if (job == null)
            {
                throw new NotFoundException("Job not found.");
            }

            if (job.Status == JobStatus.Closed)
            {
                throw new ConflictException("A closed job cannot be edited.");
            }

            if (request.Title != null)
            {
                if (string.IsNullOrWhiteSpace(request.Title))
                {
                    throw new BadRequestException("Title cannot be empty.");
                }
                job.Title = request.Title.Trim();
            }

            if (request.Description != null)
            {
                if (string.IsNullOrWhiteSpace(request.Description))
                {
                    throw new BadRequestException("Description cannot be empty.");
                }
                job.Description = request.Description.Trim();
            }

            if (request.RequiredSkills != null)
            {
                if (string.IsNullOrWhiteSpace(request.RequiredSkills))
                {
                    throw new BadRequestException("Required skills cannot be empty.");
                }
                job.RequiredSkills = request.RequiredSkills.Trim();
            }

            if (request.ExperienceLevel != null)
            {
                job.ExperienceLevel = request.ExperienceLevel.Value;
            }

            if (request.Deadline != null)
            {
                DateTime deadline = DateTimeHelper.ToUtc(request.Deadline.Value);
                if (deadline <= DateTime.UtcNow)
                {
                    throw new BadRequestException("Deadline must be in the future.");
                }
                job.Deadline = deadline;
            }

            if (request.Status != null && request.Status.Value != job.Status)
            {
                JobStatus oldStatus = job.Status;
                JobStatus newStatus = request.Status.Value;

                if (IsJobStatusChangeAllowed(oldStatus, newStatus) == false)
                {
                    throw new UnprocessableException("A job cannot change from " + oldStatus + " to " + newStatus + ".");
                }

                job.Status = newStatus;

                AuditLog log = new AuditLog();
                log.ActorUserId = userId;
                log.EntityType = "Job";
                log.EntityId = job.Id;
                log.Action = "Status changed from " + oldStatus + " to " + newStatus;
                log.CreatedAtUtc = DateTime.UtcNow;
                _db.AuditLogs.Add(log);
            }

            job.UpdatedAt = DateTime.UtcNow;
            await _db.SaveChangesAsync();

            return EntityMapper.ToJobResponse(job);
        }

        public async Task DeleteJobAsync(int jobId, int companyId)
        {
            Job job = await _db.Jobs.FirstOrDefaultAsync(j => j.Id == jobId && j.CompanyId == companyId);

            if (job == null)
            {
                throw new NotFoundException("Job not found.");
            }

            // Only a Draft can be deleted. A Published job must be Closed instead.
            if (job.Status != JobStatus.Draft)
            {
                throw new ConflictException("Only a draft job can be deleted. Close the job instead.");
            }

            _db.Jobs.Remove(job);
            await _db.SaveChangesAsync();
        }

        // ---------------- helper methods ----------------

        // Draft -> Published, Draft -> Closed, Published -> Closed
        private bool IsJobStatusChangeAllowed(JobStatus from, JobStatus to)
        {
            if (from == JobStatus.Draft)
            {
                return to == JobStatus.Published || to == JobStatus.Closed;
            }

            if (from == JobStatus.Published)
            {
                return to == JobStatus.Closed;
            }

            return false;
        }

        private IQueryable<Job> ApplySearchFilters(IQueryable<Job> jobs, JobQuery query)
        {
            if (string.IsNullOrWhiteSpace(query.Search) == false)
            {
                string search = query.Search.Trim().ToLower();
                jobs = jobs.Where(j => j.Title.ToLower().Contains(search));
            }

            if (string.IsNullOrWhiteSpace(query.Skill) == false)
            {
                string skill = query.Skill.Trim().ToLower();
                jobs = jobs.Where(j => j.RequiredSkills.ToLower().Contains(skill));
            }

            if (query.ExperienceLevel != null)
            {
                ExperienceLevel level = query.ExperienceLevel.Value;
                jobs = jobs.Where(j => j.ExperienceLevel == level);
            }

            return jobs;
        }

        private async Task<PagedResult<JobResponse>> GetPageAsync(IQueryable<Job> jobs, JobQuery query)
        {
            int page = PagingHelper.FixPage(query.Page);
            int pageSize = PagingHelper.FixPageSize(query.PageSize);

            int totalCount = await jobs.CountAsync();

            List<Job> items = await jobs
                .OrderByDescending(j => j.CreatedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            List<JobResponse> responses = new List<JobResponse>();
            foreach (Job job in items)
            {
                responses.Add(EntityMapper.ToJobResponse(job));
            }

            return new PagedResult<JobResponse>(responses, page, pageSize, totalCount);
        }
    }
}
