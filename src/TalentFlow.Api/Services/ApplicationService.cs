using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using TalentFlow.Api.Authorization;
using TalentFlow.Api.Common;
using TalentFlow.Api.Data;
using TalentFlow.Api.DTOs.Applications;
using TalentFlow.Api.DTOs.Resumes;
using TalentFlow.Api.Entities;
using TalentFlow.Api.Mapping;
using TalentFlow.Api.Services.Interfaces;

namespace TalentFlow.Api.Services
{
    public class ApplicationService : IApplicationService
    {
        private readonly TalentFlowDbContext _db;
        private readonly ISkillMatchingService _skillMatchingService;

        public ApplicationService(TalentFlowDbContext db, ISkillMatchingService skillMatchingService)
        {
            _db = db;
            _skillMatchingService = skillMatchingService;
        }

        // A candidate applies for a job
        public async Task<ApplicationResponse> ApplyAsync(int userId, int jobId, ApplyRequest request)
        {
            CandidateProfile profile = await _db.CandidateProfiles.FirstOrDefaultAsync(p => p.UserId == userId);
            if (profile == null)
            {
                throw new NotFoundException("Candidate profile not found.");
            }

            Job job = await _db.Jobs.Include(j => j.Company).FirstOrDefaultAsync(j => j.Id == jobId);

            // A draft job is not public, so for a candidate it does not exist.
            if (job == null || job.Status == JobStatus.Draft)
            {
                throw new NotFoundException("Job not found.");
            }

            if (job.Status == JobStatus.Closed)
            {
                throw new BadRequestException("This job is closed. You cannot apply.");
            }

            if (job.Deadline != null && job.Deadline.Value < DateTime.UtcNow)
            {
                throw new BadRequestException("The application deadline has passed.");
            }

            bool alreadyApplied = await _db.Applications
                .AnyAsync(a => a.JobId == jobId && a.CandidateProfileId == profile.Id);
            if (alreadyApplied)
            {
                throw new ConflictException("You have already applied for this job.");
            }

            int? resumeId = await ChooseResumeIdAsync(profile.Id, request);

            Application application = new Application();
            application.JobId = job.Id;
            application.CandidateProfileId = profile.Id;
            application.ResumeId = resumeId;
            application.Status = ApplicationStatus.Applied;
            application.AppliedAt = DateTime.UtcNow;

            _db.Applications.Add(application);

            try
            {
                await _db.SaveChangesAsync();
            }
            catch (DbUpdateException)
            {
                // The database has a unique index on (JobId, CandidateProfileId).
                // If two requests arrive at the same time, the database stops the second one.
                bool nowExists = await _db.Applications
                    .AnyAsync(a => a.JobId == jobId && a.CandidateProfileId == profile.Id);
                if (nowExists)
                {
                    throw new ConflictException("You have already applied for this job.");
                }
                throw;
            }

            application.Job = job;
            return EntityMapper.ToApplicationResponse(application);
        }

        // The applications of the logged-in candidate
        public async Task<PagedResult<ApplicationResponse>> GetMyApplicationsAsync(int userId, ApplicationQuery query)
        {
            int page = PagingHelper.FixPage(query.Page);
            int pageSize = PagingHelper.FixPageSize(query.PageSize);

            IQueryable<Application> applications = _db.Applications
                .Include(a => a.Job).ThenInclude(j => j.Company)
                .Where(a => a.CandidateProfile.UserId == userId);

            if (query.Status != null)
            {
                ApplicationStatus status = query.Status.Value;
                applications = applications.Where(a => a.Status == status);
            }

            int totalCount = await applications.CountAsync();

            List<Application> items = await applications
                .OrderByDescending(a => a.AppliedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            List<ApplicationResponse> responses = new List<ApplicationResponse>();
            foreach (Application application in items)
            {
                responses.Add(EntityMapper.ToApplicationResponse(application));
            }

            return new PagedResult<ApplicationResponse>(responses, page, pageSize, totalCount);
        }

        // The applicants of one job (recruiter view)
        public async Task<PagedResult<ApplicantResponse>> GetJobApplicantsAsync(int jobId, int companyId, ApplicationQuery query)
        {
            // The job must belong to the recruiter's company
            Job job = await _db.Jobs.FirstOrDefaultAsync(j => j.Id == jobId && j.CompanyId == companyId);
            if (job == null)
            {
                throw new NotFoundException("Job not found.");
            }

            int page = PagingHelper.FixPage(query.Page);
            int pageSize = PagingHelper.FixPageSize(query.PageSize);

            IQueryable<Application> applications = _db.Applications
                .Include(a => a.CandidateProfile).ThenInclude(p => p.User)
                .Where(a => a.JobId == jobId);

            if (query.Status != null)
            {
                ApplicationStatus status = query.Status.Value;
                applications = applications.Where(a => a.Status == status);
            }

            if (string.IsNullOrWhiteSpace(query.Search) == false)
            {
                string search = query.Search.Trim().ToLower();
                applications = applications.Where(a => a.CandidateProfile.User.FullName.ToLower().Contains(search));
            }

            int totalCount = await applications.CountAsync();

            List<Application> items = await applications
                .OrderByDescending(a => a.AppliedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            List<ApplicantResponse> responses = new List<ApplicantResponse>();
            foreach (Application application in items)
            {
                responses.Add(EntityMapper.ToApplicantResponse(application));
            }

            return new PagedResult<ApplicantResponse>(responses, page, pageSize, totalCount);
        }

        public async Task<ApplicationDetailResponse> GetApplicationDetailAsync(int applicationId, int userId, UserRole role, int? companyId)
        {
            Application application = await ApplicationAccess.LoadAsync(_db, applicationId, userId, role, companyId);

            // Recruiter notes are private. Only a recruiter can see them.
            bool isRecruiter = (role == UserRole.Recruiter);

            return BuildDetail(application, isRecruiter);
        }

        public async Task<ApplicationDetailResponse> UpdateStatusAsync(int applicationId, int userId, int companyId, UpdateApplicationStatusRequest request)
        {
            Application application = await ApplicationAccess.LoadAsync(_db, applicationId, userId, UserRole.Recruiter, companyId);

            ApplicationStatus oldStatus = application.Status;
            ApplicationStatus newStatus = request.Status.Value;

            if (newStatus != oldStatus)
            {
                if (ApplicationWorkflow.IsAllowed(oldStatus, newStatus) == false)
                {
                    throw new UnprocessableException("An application cannot change from " + oldStatus + " to " + newStatus + ".");
                }

                application.Status = newStatus;

                AuditLog log = new AuditLog();
                log.ActorUserId = userId;
                log.EntityType = "Application";
                log.EntityId = application.Id;
                log.Action = "Status changed from " + oldStatus + " to " + newStatus;
                log.CreatedAtUtc = DateTime.UtcNow;
                _db.AuditLogs.Add(log);
            }

            if (request.RecruiterNotes != null)
            {
                application.RecruiterNotes = request.RecruiterNotes.Trim();
            }

            await _db.SaveChangesAsync();

            return BuildDetail(application, true);
        }

        // ---------------- helper methods ----------------

        private ApplicationDetailResponse BuildDetail(Application application, bool showRecruiterNotes)
        {
            ResumeResponse resume = null;

            if (application.Resume != null)
            {
                List<string> skills = _skillMatchingService.FindSkillsInText(application.Resume.ExtractedText);
                resume = EntityMapper.ToResumeResponse(application.Resume, skills);
            }

            return EntityMapper.ToApplicationDetail(application, showRecruiterNotes, resume);
        }

        // If the candidate chose a resume, we check that it is his or her own resume.
        // If not, we use the latest uploaded resume (it can also be none).
        private async Task<int?> ChooseResumeIdAsync(int candidateProfileId, ApplyRequest request)
        {
            if (request != null && request.ResumeId != null && request.ResumeId.Value > 0)
            {
                int chosenId = request.ResumeId.Value;

                bool isOwnResume = await _db.Resumes
                    .AnyAsync(r => r.Id == chosenId && r.CandidateProfileId == candidateProfileId);
                if (isOwnResume == false)
                {
                    throw new BadRequestException("The selected resume was not found.");
                }

                return chosenId;
            }

            Resume latest = await _db.Resumes
                .Where(r => r.CandidateProfileId == candidateProfileId)
                .OrderByDescending(r => r.UploadedAt)
                .FirstOrDefaultAsync();

            if (latest == null)
            {
                return null;
            }

            return latest.Id;
        }
    }
}
