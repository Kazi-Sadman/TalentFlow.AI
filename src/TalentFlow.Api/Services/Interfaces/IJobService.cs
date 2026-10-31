using System.Threading.Tasks;
using TalentFlow.Api.Common;
using TalentFlow.Api.DTOs.Jobs;

namespace TalentFlow.Api.Services.Interfaces
{
    public interface IJobService
    {
        // Public list: only Published jobs
        Task<PagedResult<JobResponse>> GetPublishedJobsAsync(JobQuery query);

        // Recruiter list: all jobs of one company
        Task<PagedResult<JobResponse>> GetCompanyJobsAsync(int companyId, JobQuery query);

        // viewerCompanyId is the company of the logged-in recruiter (null for everyone else)
        Task<JobResponse> GetJobByIdAsync(int jobId, int? viewerCompanyId);

        Task<JobResponse> CreateJobAsync(int companyId, CreateJobRequest request);
        Task<JobResponse> UpdateJobAsync(int jobId, int companyId, int userId, UpdateJobRequest request);
        Task DeleteJobAsync(int jobId, int companyId);
    }
}
