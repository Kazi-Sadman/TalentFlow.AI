using System;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using TalentFlow.Api.Common;
using TalentFlow.Api.Data;
using TalentFlow.Api.DTOs.Profile;
using TalentFlow.Api.Entities;
using TalentFlow.Api.Mapping;
using TalentFlow.Api.Services.Interfaces;

namespace TalentFlow.Api.Services
{
    public class ProfileService : IProfileService
    {
        private readonly TalentFlowDbContext _db;

        public ProfileService(TalentFlowDbContext db)
        {
            _db = db;
        }

        public async Task<CandidateProfileResponse> GetMyProfileAsync(int userId)
        {
            CandidateProfile profile = await FindProfileAsync(userId);
            return EntityMapper.ToProfileResponse(profile);
        }

        public async Task<CandidateProfileResponse> UpdateMyProfileAsync(int userId, UpdateProfileRequest request)
        {
            CandidateProfile profile = await FindProfileAsync(userId);

            profile.Summary = request.Summary;
            profile.Education = request.Education;
            profile.ExperienceYears = request.ExperienceYears;
            profile.Skills = request.Skills;
            profile.UpdatedAt = DateTime.UtcNow;

            await _db.SaveChangesAsync();

            return EntityMapper.ToProfileResponse(profile);
        }

        private async Task<CandidateProfile> FindProfileAsync(int userId)
        {
            CandidateProfile profile = await _db.CandidateProfiles
                .Include(p => p.User)
                .FirstOrDefaultAsync(p => p.UserId == userId);

            if (profile == null)
            {
                throw new NotFoundException("Candidate profile not found.");
            }

            return profile;
        }
    }
}
