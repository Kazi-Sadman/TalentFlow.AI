using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using TalentFlow.Api.DTOs.Resumes;
using TalentFlow.Api.Entities;

namespace TalentFlow.Api.Services.Interfaces
{
    public interface IResumeService
    {
        Task<ResumeResponse> UploadResumeAsync(int userId, IFormFile file);
        Task<List<ResumeResponse>> GetMyResumesAsync(int userId);
        Task<ResumeDownloadResult> GetResumeForDownloadAsync(int resumeId, int userId, UserRole role, int? companyId);
    }
}
