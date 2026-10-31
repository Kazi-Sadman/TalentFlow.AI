using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using TalentFlow.Api.Authorization;
using TalentFlow.Api.Common;
using TalentFlow.Api.DTOs.Applications;
using TalentFlow.Api.Services.Interfaces;

namespace TalentFlow.Api.Controllers
{
    [Route("api")]
    [Authorize]
    public class ApplicationsController : BaseApiController
    {
        private readonly IApplicationService _applicationService;

        public ApplicationsController(IApplicationService applicationService)
        {
            _applicationService = applicationService;
        }

        // POST /api/jobs/5/apply  (candidate)
        [HttpPost("jobs/{jobId:int}/apply")]
        [Authorize(Policy = PolicyNames.CandidateOnly)]
        public async Task<IActionResult> Apply(int jobId, [FromBody] ApplyRequest request)
        {
            ApplicationResponse response = await _applicationService.ApplyAsync(GetUserId(), jobId, request);
            return StatusCode(StatusCodes.Status201Created, response);
        }

        // GET /api/applications/me  (candidate)
        [HttpGet("applications/me")]
        [Authorize(Policy = PolicyNames.CandidateOnly)]
        public async Task<IActionResult> GetMyApplications([FromQuery] ApplicationQuery query)
        {
            PagedResult<ApplicationResponse> result = await _applicationService.GetMyApplicationsAsync(GetUserId(), query);
            return Ok(result);
        }

        // GET /api/jobs/5/applications  (recruiter of the job's company)
        [HttpGet("jobs/{jobId:int}/applications")]
        [Authorize(Policy = PolicyNames.RecruiterOnly)]
        public async Task<IActionResult> GetJobApplicants(int jobId, [FromQuery] ApplicationQuery query)
        {
            PagedResult<ApplicantResponse> result = await _applicationService.GetJobApplicantsAsync(jobId, GetCompanyId(), query);
            return Ok(result);
        }

        // GET /api/applications/7  (the candidate who owns it, or a recruiter of the same company)
        [HttpGet("applications/{id:int}")]
        public async Task<IActionResult> GetApplicationDetail(int id)
        {
            ApplicationDetailResponse detail = await _applicationService.GetApplicationDetailAsync(
                id, GetUserId(), GetUserRole(), GetCompanyIdOrNull());
            return Ok(detail);
        }

        // PATCH /api/applications/7/status  (recruiter)
        [HttpPatch("applications/{id:int}/status")]
        [Authorize(Policy = PolicyNames.RecruiterOnly)]
        public async Task<IActionResult> UpdateStatus(int id, [FromBody] UpdateApplicationStatusRequest request)
        {
            ApplicationDetailResponse detail = await _applicationService.UpdateStatusAsync(
                id, GetUserId(), GetCompanyId(), request);
            return Ok(detail);
        }
    }
}
