using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using TalentFlow.Api.Authorization;
using TalentFlow.Api.Common;
using TalentFlow.Api.Data;
using TalentFlow.Api.DTOs.Interviews;
using TalentFlow.Api.Entities;
using TalentFlow.Api.Mapping;
using TalentFlow.Api.Services.Interfaces;

namespace TalentFlow.Api.Services
{
    public class InterviewService : IInterviewService
    {
        private readonly TalentFlowDbContext _db;

        public InterviewService(TalentFlowDbContext db)
        {
            _db = db;
        }

        public async Task<InterviewResponse> CreateInterviewAsync(int applicationId, int userId, int companyId, CreateInterviewRequest request)
        {
            Application application = await ApplicationAccess.LoadAsync(_db, applicationId, userId, UserRole.Recruiter, companyId);

            if (application.Status != ApplicationStatus.Shortlisted && application.Status != ApplicationStatus.Interview)
            {
                throw new UnprocessableException("An interview can be created only for a Shortlisted or Interview application.");
            }

            DateTime startAt = DateTimeHelper.ToUtc(request.StartAtUtc);
            DateTime endAt = DateTimeHelper.ToUtc(request.EndAtUtc);

            if (startAt <= DateTime.UtcNow)
            {
                throw new BadRequestException("The interview start time must be in the future.");
            }

            if (endAt <= startAt)
            {
                throw new BadRequestException("The interview end time must be after the start time.");
            }

            if ((endAt - startAt).TotalHours > 8)
            {
                throw new BadRequestException("An interview cannot be longer than 8 hours.");
            }

            // The interviewer is the current recruiter, unless another recruiter of the same company is chosen.
            int interviewerId = userId;

            if (request.InterviewerUserId != null && request.InterviewerUserId.Value > 0)
            {
                int requestedId = request.InterviewerUserId.Value;

                bool isValidInterviewer = await _db.Users
                    .AnyAsync(u => u.Id == requestedId && u.CompanyId == companyId && u.Role == UserRole.Recruiter);

                if (isValidInterviewer == false)
                {
                    throw new BadRequestException("The interviewer must be a recruiter of your company.");
                }

                interviewerId = requestedId;
            }

            Interview interview = new Interview();
            interview.ApplicationId = application.Id;
            interview.InterviewerUserId = interviewerId;
            interview.StartAtUtc = startAt;
            interview.EndAtUtc = endAt;
            interview.MeetingLink = request.MeetingLink.Trim();

            _db.Interviews.Add(interview);

            // When the first interview is created, the application moves to the Interview step.
            if (application.Status == ApplicationStatus.Shortlisted)
            {
                application.Status = ApplicationStatus.Interview;

                AuditLog log = new AuditLog();
                log.ActorUserId = userId;
                log.EntityType = "Application";
                log.EntityId = application.Id;
                log.Action = "Status changed from Shortlisted to Interview (interview created)";
                log.CreatedAtUtc = DateTime.UtcNow;
                _db.AuditLogs.Add(log);
            }

            await _db.SaveChangesAsync();

            interview.InterviewerUser = await _db.Users.FirstOrDefaultAsync(u => u.Id == interviewerId);

            return EntityMapper.ToInterviewResponse(interview, true);
        }

        public async Task<List<InterviewResponse>> GetInterviewsAsync(int applicationId, int userId, UserRole role, int? companyId)
        {
            // This also checks that the user is allowed to see the application
            Application application = await ApplicationAccess.LoadAsync(_db, applicationId, userId, role, companyId);

            List<Interview> interviews = await _db.Interviews
                .Include(i => i.InterviewerUser)
                .Where(i => i.ApplicationId == application.Id)
                .OrderBy(i => i.StartAtUtc)
                .ToListAsync();

            // Feedback is private. Only recruiters can see it.
            bool includeFeedback = (role == UserRole.Recruiter);

            List<InterviewResponse> responses = new List<InterviewResponse>();
            foreach (Interview interview in interviews)
            {
                responses.Add(EntityMapper.ToInterviewResponse(interview, includeFeedback));
            }

            return responses;
        }

        public async Task<InterviewResponse> UpdateFeedbackAsync(int interviewId, int companyId, UpdateInterviewFeedbackRequest request)
        {
            Interview interview = await _db.Interviews
                .Include(i => i.InterviewerUser)
                .Include(i => i.Application).ThenInclude(a => a.Job)
                .FirstOrDefaultAsync(i => i.Id == interviewId);

            if (interview == null || interview.Application.Job.CompanyId != companyId)
            {
                throw new NotFoundException("Interview not found.");
            }

            interview.Feedback = request.Feedback.Trim();
            await _db.SaveChangesAsync();

            return EntityMapper.ToInterviewResponse(interview, true);
        }
    }
}
