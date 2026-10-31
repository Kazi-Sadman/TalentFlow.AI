using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TalentFlow.Api.Authorization;
using TalentFlow.Api.DTOs.Profile;
using TalentFlow.Api.Services.Interfaces;

namespace TalentFlow.Api.Controllers
{
    [Route("api/profile")]
    [Authorize(Policy = PolicyNames.CandidateOnly)]
    public class ProfileController : BaseApiController
    {
        private readonly IProfileService _profileService;

        public ProfileController(IProfileService profileService)
        {
            _profileService = profileService;
        }

        // GET /api/profile/me
        [HttpGet("me")]
        public async Task<IActionResult> GetMyProfile()
        {
            CandidateProfileResponse profile = await _profileService.GetMyProfileAsync(GetUserId());
            return Ok(profile);
        }

        // PUT /api/profile/me
        [HttpPut("me")]
        public async Task<IActionResult> UpdateMyProfile([FromBody] UpdateProfileRequest request)
        {
            CandidateProfileResponse profile = await _profileService.UpdateMyProfileAsync(GetUserId(), request);
            return Ok(profile);
        }
    }
}
