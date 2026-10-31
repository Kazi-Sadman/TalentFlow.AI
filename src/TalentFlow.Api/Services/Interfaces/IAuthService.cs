using System.Threading.Tasks;
using TalentFlow.Api.DTOs.Auth;

namespace TalentFlow.Api.Services.Interfaces
{
    public interface IAuthService
    {
        Task<AuthResponse> RegisterAsync(RegisterRequest request);
        Task<AuthResponse> LoginAsync(LoginRequest request);
    }
}
