using System.Threading.Tasks;
using TalentFlow.Api.DTOs.AI;
using TalentFlow.Api.Entities;

namespace TalentFlow.Api.Services.Interfaces
{
    public interface IAIAnalysisService
    {
        Task<AIAnalysisResponse> RunAnalysisAsync(int applicationId, int userId, UserRole role, int? companyId);
        Task<AIAnalysisResponse> GetLatestAnalysisAsync(int applicationId, int userId, UserRole role, int? companyId);
    }
}
