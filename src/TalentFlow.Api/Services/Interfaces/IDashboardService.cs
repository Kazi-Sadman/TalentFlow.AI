using System.Threading.Tasks;
using TalentFlow.Api.DTOs.Dashboard;

namespace TalentFlow.Api.Services.Interfaces
{
    public interface IDashboardService
    {
        Task<DashboardSummaryResponse> GetSummaryAsync(int companyId);
    }
}
