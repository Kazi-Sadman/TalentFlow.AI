using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using TalentFlow.Api.Data;
using TalentFlow.Api.DTOs.Dashboard;
using TalentFlow.Api.Entities;
using TalentFlow.Api.Services.Interfaces;

namespace TalentFlow.Api.Services
{
    public class DashboardService : IDashboardService
    {
        private readonly TalentFlowDbContext _db;

        public DashboardService(TalentFlowDbContext db)
        {
            _db = db;
        }

        public async Task<DashboardSummaryResponse> GetSummaryAsync(int companyId)
        {
            DashboardSummaryResponse summary = new DashboardSummaryResponse();

            // Jobs of this company
            summary.TotalJobs = await _db.Jobs.CountAsync(j => j.CompanyId == companyId);
            summary.DraftJobs = await _db.Jobs.CountAsync(j => j.CompanyId == companyId && j.Status == JobStatus.Draft);
            summary.PublishedJobs = await _db.Jobs.CountAsync(j => j.CompanyId == companyId && j.Status == JobStatus.Published);
            summary.ClosedJobs = await _db.Jobs.CountAsync(j => j.CompanyId == companyId && j.Status == JobStatus.Closed);

            // Applications for the jobs of this company
            IQueryable<Application> companyApplications = _db.Applications.Where(a => a.Job.CompanyId == companyId);

            summary.TotalApplications = await companyApplications.CountAsync();
            summary.NewApplications = await companyApplications.CountAsync(a => a.Status == ApplicationStatus.Applied);

            DateTime sevenDaysAgo = DateTime.UtcNow.AddDays(-7);
            summary.ApplicationsLast7Days = await companyApplications.CountAsync(a => a.AppliedAt >= sevenDaysAgo);

            // Interviews in the future
            DateTime now = DateTime.UtcNow;
            summary.UpcomingInterviews = await _db.Interviews
                .CountAsync(i => i.Application.Job.CompanyId == companyId && i.StartAtUtc > now);

            // Pipeline: how many applications are in each status
            foreach (ApplicationStatus status in Enum.GetValues(typeof(ApplicationStatus)))
            {
                ApplicationStatus currentStatus = status;
                int count = await companyApplications.CountAsync(a => a.Status == currentStatus);

                PipelineItem item = new PipelineItem();
                item.Status = currentStatus.ToString();
                item.Count = count;
                summary.Pipeline.Add(item);
            }

            return summary;
        }
    }
}
