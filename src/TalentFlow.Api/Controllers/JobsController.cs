using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TalentFlow.Api.Authorization;
using TalentFlow.Api.Common;
using TalentFlow.Api.DTOs.Jobs;
using TalentFlow.Api.Services.Interfaces;

namespace TalentFlow.Api.Controllers
{
    [Route("api/jobs")]
    public class JobsController : BaseApiController
    {
        private readonly IJobService _jobService;

        public JobsController(IJobService jobService)
        {
            _jobService = jobService;
        }

        // GET /api/jobs?page=1&pageSize=10&search=...&skill=...  (public)
        [HttpGet]
        [AllowAnonymous]
        public async Task<IActionResult> GetPublishedJobs([FromQuery] JobQuery query)
        {
            PagedResult<JobResponse> result = await _jobService.GetPublishedJobsAsync(query);
            return Ok(result);
        }

        // GET /api/jobs/mine?status=Draft  (recruiter: all jobs of my company)
        [HttpGet("mine")]
        [Authorize(Policy = PolicyNames.RecruiterOnly)]
        public async Task<IActionResult> GetMyCompanyJobs([FromQuery] JobQuery query)
        {
            PagedResult<JobResponse> result = await _jobService.GetCompanyJobsAsync(GetCompanyId(), query);
            return Ok(result);
        }

        // GET /api/jobs/5  (public; a draft job is visible only to its own company)
        [HttpGet("{id:int}")]
        [AllowAnonymous]
        public async Task<IActionResult> GetJobById(int id)
        {
            JobResponse job = await _jobService.GetJobByIdAsync(id, GetCompanyIdOrNull());
            return Ok(job);
        }

        // POST /api/jobs  (recruiter)
        [HttpPost]
        [Authorize(Policy = PolicyNames.RecruiterOnly)]
        public async Task<IActionResult> CreateJob([FromBody] CreateJobRequest request)
        {
            JobResponse job = await _jobService.CreateJobAsync(GetCompanyId(), request);
            return CreatedAtAction(nameof(GetJobById), new { id = job.Id }, job);
        }

        // PATCH /api/jobs/5  (recruiter of the same company)
        [HttpPatch("{id:int}")]
        [Authorize(Policy = PolicyNames.RecruiterOnly)]
        public async Task<IActionResult> UpdateJob(int id, [FromBody] UpdateJobRequest request)
        {
            JobResponse job = await _jobService.UpdateJobAsync(id, GetCompanyId(), GetUserId(), request);
            return Ok(job);
        }

        // DELETE /api/jobs/5  (recruiter; only a draft job)
        [HttpDelete("{id:int}")]
        [Authorize(Policy = PolicyNames.RecruiterOnly)]
        public async Task<IActionResult> DeleteJob(int id)
        {
            await _jobService.DeleteJobAsync(id, GetCompanyId());
            return NoContent();
        }
    }
}
