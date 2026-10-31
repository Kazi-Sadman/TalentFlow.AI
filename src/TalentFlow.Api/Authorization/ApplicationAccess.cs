using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using TalentFlow.Api.Common;
using TalentFlow.Api.Data;
using TalentFlow.Api.Entities;

namespace TalentFlow.Api.Authorization
{
    // One place that decides: "Is this user allowed to see this application?"
    //   - A candidate can open only his or her own applications.
    //   - A recruiter can open only applications of jobs of his or her own company.
    // If the user is not allowed, we answer "404 Not Found" (not 403),
    // so nobody can find out which application IDs exist.
    public static class ApplicationAccess
    {
        public static async Task<Application> LoadAsync(
            TalentFlowDbContext db,
            int applicationId,
            int userId,
            UserRole role,
            int? companyId)
        {
            Application application = await db.Applications
                .Include(a => a.Job).ThenInclude(j => j.Company)
                .Include(a => a.CandidateProfile).ThenInclude(p => p.User)
                .Include(a => a.Resume)
                .FirstOrDefaultAsync(a => a.Id == applicationId);

            if (application == null)
            {
                throw new NotFoundException("Application not found.");
            }

            if (role == UserRole.Candidate)
            {
                if (application.CandidateProfile.UserId != userId)
                {
                    throw new NotFoundException("Application not found.");
                }
            }
            else if (role == UserRole.Recruiter)
            {
                if (companyId == null || application.Job.CompanyId != companyId.Value)
                {
                    throw new NotFoundException("Application not found.");
                }
            }
            else
            {
                throw new ForbiddenException("You are not allowed to see this application.");
            }

            return application;
        }
    }
}
