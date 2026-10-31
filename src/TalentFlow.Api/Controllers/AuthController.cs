using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using TalentFlow.Api.DTOs.Auth;
using TalentFlow.Api.Services.Interfaces;

namespace TalentFlow.Api.Controllers
{
    [Route("api/auth")]
    [AllowAnonymous]
    [EnableRateLimiting("auth")]
    public class AuthController : BaseApiController
    {
        private readonly IAuthService _authService;

        public AuthController(IAuthService authService)
        {
            _authService = authService;
        }

        // POST /api/auth/register
        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterRequest request)
        {
            AuthResponse response = await _authService.RegisterAsync(request);
            return StatusCode(StatusCodes.Status201Created, response);
        }

        // POST /api/auth/login
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            AuthResponse response = await _authService.LoginAsync(request);
            return Ok(response);
        }
    }
}
