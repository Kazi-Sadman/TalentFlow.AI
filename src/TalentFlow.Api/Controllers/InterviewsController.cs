using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using TalentFlow.Api.Authorization;
using TalentFlow.Api.DTOs.Interviews;
using TalentFlow.Api.Services.Interfaces;

namespace TalentFlow.Api.Controllers
{
    [Route("api")]
    [Authorize]
    public class InterviewsController : BaseApiController
    {
        private readonly IInterviewService _interviewService;

        public InterviewsController(IInterviewService interviewService)
        {
            _interviewService = interviewService;
        }

        // POST /api/applications/7/interviews  (recruiter)
        [HttpPost("applications/{applicationId:int}/interviews")]
        [Authorize(Policy = PolicyNames.RecruiterOnly)]
        public async Task<IActionResult> CreateInterview(int applicationId, [FromBody] CreateInterviewRequest request)
        {
            InterviewResponse response = await _interviewService.CreateInterviewAsync(
                applicationId, GetUserId(), GetCompanyId(), request);
            return StatusCode(StatusCodes.Status201Created, response);
        }

        // GET /api/applications/7/interviews  (candidate owner or recruiter of the same company)
        [HttpGet("applications/{applicationId:int}/interviews")]
        public async Task<IActionResult> GetInterviews(int applicationId)
        {
            List<InterviewResponse> interviews = await _interviewService.GetInterviewsAsync(
                applicationId, GetUserId(), GetUserRole(), GetCompanyIdOrNull());
            return Ok(interviews);
        }

        // PATCH /api/interviews/3/feedback  (recruiter)
        [HttpPatch("interviews/{interviewId:int}/feedback")]
        [Authorize(Policy = PolicyNames.RecruiterOnly)]
        public async Task<IActionResult> UpdateFeedback(int interviewId, [FromBody] UpdateInterviewFeedbackRequest request)
        {
            InterviewResponse response = await _interviewService.UpdateFeedbackAsync(
                interviewId, GetCompanyId(), request);
            return Ok(response);
        }
    }
}
