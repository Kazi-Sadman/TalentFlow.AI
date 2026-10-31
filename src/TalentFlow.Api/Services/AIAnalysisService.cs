using System;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using TalentFlow.Api.Authorization;
using TalentFlow.Api.Common;
using TalentFlow.Api.Data;
using TalentFlow.Api.DTOs.AI;
using TalentFlow.Api.Entities;
using TalentFlow.Api.Mapping;
using TalentFlow.Api.Services.Interfaces;

namespace TalentFlow.Api.Services
{
    // Runs the skill analysis for one application.
    // Rule: if the analysis fails, the application itself is NOT changed.
    // The analysis only gives suggestions. The recruiter makes the decision.
    public class AIAnalysisService : IAIAnalysisService
    {
        private readonly TalentFlowDbContext _db;
        private readonly ISkillMatchingService _skillMatchingService;
        private readonly ILogger<AIAnalysisService> _logger;

        public AIAnalysisService(
            TalentFlowDbContext db,
            ISkillMatchingService skillMatchingService,
            ILogger<AIAnalysisService> logger)
        {
            _db = db;
            _skillMatchingService = skillMatchingService;
            _logger = logger;
        }

        public async Task<AIAnalysisResponse> RunAnalysisAsync(int applicationId, int userId, UserRole role, int? companyId)
        {
            Application application = await ApplicationAccess.LoadAsync(_db, applicationId, userId, role, companyId);

            if (application.Resume == null)
            {
                throw new BadRequestException("This application has no resume to analyze.");
            }

            AIAnalysis analysis = new AIAnalysis();
            analysis.ApplicationId = application.Id;
            analysis.Status = AnalysisStatus.Processing;
            analysis.Provider = "RuleBased";
            analysis.CreatedAt = DateTime.UtcNow;

            _db.AIAnalyses.Add(analysis);
            await _db.SaveChangesAsync();

            try
            {
                SkillMatchResult result = _skillMatchingService.Analyze(
                    application.Resume.ExtractedText,
                    application.Job.RequiredSkills);

                analysis.ExtractedSkillsJson = JsonSerializer.Serialize(result.ExtractedSkills);
                analysis.EvidenceJson = JsonSerializer.Serialize(result.Evidence);
                analysis.MissingSkillsJson = JsonSerializer.Serialize(result.MissingSkills);
                analysis.NeedsReviewJson = JsonSerializer.Serialize(result.NeedsReview);
                analysis.Status = AnalysisStatus.Completed;
            }
            catch (Exception ex)
            {
                // We do not write the CV text in the log (it is private data).
                _logger.LogError(ex, "Skill analysis failed for application {ApplicationId}", application.Id);

                analysis.Status = AnalysisStatus.Failed;
                analysis.ErrorMessage = "The analysis failed. The application was not changed.";
            }

            await _db.SaveChangesAsync();

            return EntityMapper.ToAnalysisResponse(analysis);
        }

        public async Task<AIAnalysisResponse> GetLatestAnalysisAsync(int applicationId, int userId, UserRole role, int? companyId)
        {
            // This also checks that the user is allowed to see the application
            Application application = await ApplicationAccess.LoadAsync(_db, applicationId, userId, role, companyId);

            AIAnalysis latest = await _db.AIAnalyses
                .Where(a => a.ApplicationId == application.Id)
                .OrderByDescending(a => a.Id)
                .FirstOrDefaultAsync();

            if (latest == null)
            {
                throw new NotFoundException("There is no analysis for this application yet.");
            }

            return EntityMapper.ToAnalysisResponse(latest);
        }
    }
}
