using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using TalentFlow.Api.Authorization;
using TalentFlow.Api.DTOs.Resumes;
using TalentFlow.Api.Services.Interfaces;

namespace TalentFlow.Api.Controllers
{
    [Route("api/resumes")]
    [Authorize]
    public class ResumesController : BaseApiController
    {
        private readonly IResumeService _resumeService;

        public ResumesController(IResumeService resumeService)
        {
            _resumeService = resumeService;
        }

        // POST /api/resumes  (candidate; multipart/form-data with a field named "file")
        [HttpPost]
        [Authorize(Policy = PolicyNames.CandidateOnly)]
        [Consumes("multipart/form-data")]
        [RequestSizeLimit(6291456)]
        public async Task<IActionResult> UploadResume(IFormFile file)
        {
            ResumeResponse response = await _resumeService.UploadResumeAsync(GetUserId(), file);
            return StatusCode(StatusCodes.Status201Created, response);
        }

        // GET /api/resumes/me  (candidate)
        [HttpGet("me")]
        [Authorize(Policy = PolicyNames.CandidateOnly)]
        public async Task<IActionResult> GetMyResumes()
        {
            List<ResumeResponse> resumes = await _resumeService.GetMyResumesAsync(GetUserId());
            return Ok(resumes);
        }

        // GET /api/resumes/3/download  (owner candidate, or a recruiter who received it in an application)
        [HttpGet("{id:int}/download")]
        public async Task<IActionResult> DownloadResume(int id)
        {
            ResumeDownloadResult file = await _resumeService.GetResumeForDownloadAsync(
                id, GetUserId(), GetUserRole(), GetCompanyIdOrNull());

            return PhysicalFile(file.FullPath, "application/pdf", file.FileName);
        }
    }
}
