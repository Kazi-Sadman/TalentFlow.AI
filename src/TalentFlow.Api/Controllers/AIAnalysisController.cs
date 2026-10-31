using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using TalentFlow.Api.DTOs.AI;
using TalentFlow.Api.Services.Interfaces;

namespace TalentFlow.Api.Controllers
{
    [Route("api/applications/{applicationId:int}/ai-analysis")]
    [Authorize]
    public class AIAnalysisController : BaseApiController
    {
        private readonly IAIAnalysisService _analysisService;

        public AIAnalysisController(IAIAnalysisService analysisService)
        {
            _analysisService = analysisService;
        }

        // POST /api/applications/7/ai-analysis
        // Allowed: the candidate who owns the application, or a recruiter of the same company.
        [HttpPost]
        public async Task<IActionResult> RunAnalysis(int applicationId)
        {
            AIAnalysisResponse response = await _analysisService.RunAnalysisAsync(
                applicationId, GetUserId(), GetUserRole(), GetCompanyIdOrNull());
            return StatusCode(StatusCodes.Status201Created, response);
        }

        // GET /api/applications/7/ai-analysis  (the latest analysis)
        [HttpGet]
        public async Task<IActionResult> GetLatestAnalysis(int applicationId)
        {
            AIAnalysisResponse response = await _analysisService.GetLatestAnalysisAsync(
                applicationId, GetUserId(), GetUserRole(), GetCompanyIdOrNull());
            return Ok(response);
        }
    }
}
