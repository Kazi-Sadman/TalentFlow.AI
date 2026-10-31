using System.Threading.Tasks;
using TalentFlow.Api.DTOs.Profile;

namespace TalentFlow.Api.Services.Interfaces
{
    public interface IProfileService
    {
        Task<CandidateProfileResponse> GetMyProfileAsync(int userId);
        Task<CandidateProfileResponse> UpdateMyProfileAsync(int userId, UpdateProfileRequest request);
    }
}
