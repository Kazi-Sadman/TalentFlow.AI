using System.Threading.Tasks;
using TalentFlow.Api.Common;
using TalentFlow.Api.DTOs.Applications;
using TalentFlow.Api.Entities;

namespace TalentFlow.Api.Services.Interfaces
{
    public interface IApplicationService
    {
        Task<ApplicationResponse> ApplyAsync(int userId, int jobId, ApplyRequest request);
        Task<PagedResult<ApplicationResponse>> GetMyApplicationsAsync(int userId, ApplicationQuery query);
        Task<PagedResult<ApplicantResponse>> GetJobApplicantsAsync(int jobId, int companyId, ApplicationQuery query);
        Task<ApplicationDetailResponse> GetApplicationDetailAsync(int applicationId, int userId, UserRole role, int? companyId);
        Task<ApplicationDetailResponse> UpdateStatusAsync(int applicationId, int userId, int companyId, UpdateApplicationStatusRequest request);
    }
}
