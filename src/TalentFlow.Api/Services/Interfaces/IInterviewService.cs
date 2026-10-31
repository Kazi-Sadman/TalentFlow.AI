using System.Collections.Generic;
using System.Threading.Tasks;
using TalentFlow.Api.DTOs.Interviews;
using TalentFlow.Api.Entities;

namespace TalentFlow.Api.Services.Interfaces
{
    public interface IInterviewService
    {
        Task<InterviewResponse> CreateInterviewAsync(int applicationId, int userId, int companyId, CreateInterviewRequest request);
        Task<List<InterviewResponse>> GetInterviewsAsync(int applicationId, int userId, UserRole role, int? companyId);
        Task<InterviewResponse> UpdateFeedbackAsync(int interviewId, int companyId, UpdateInterviewFeedbackRequest request);
    }
}
