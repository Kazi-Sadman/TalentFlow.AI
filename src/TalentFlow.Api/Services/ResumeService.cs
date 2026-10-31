using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using TalentFlow.Api.Common;
using TalentFlow.Api.Data;
using TalentFlow.Api.DTOs.Resumes;
using TalentFlow.Api.Entities;
using TalentFlow.Api.Mapping;
using TalentFlow.Api.Services.Interfaces;
using TalentFlow.Api.Validators;

namespace TalentFlow.Api.Services
{
    public class ResumeService : IResumeService
    {
        private readonly TalentFlowDbContext _db;
        private readonly IResumeParserService _parser;
        private readonly ISkillMatchingService _skillMatchingService;
        private readonly ResumeSettings _settings;
        private readonly string _storageFolder;

        public ResumeService(
            TalentFlowDbContext db,
            IResumeParserService parser,
            ISkillMatchingService skillMatchingService,
            ResumeSettings settings,
            IWebHostEnvironment environment)
        {
            _db = db;
            _parser = parser;
            _skillMatchingService = skillMatchingService;
            _settings = settings;

            // The folder is inside the project folder, NOT inside wwwroot.
            // We never call UseStaticFiles for it, so nobody can open a CV by URL.
            _storageFolder = Path.Combine(environment.ContentRootPath, settings.StorageFolder);
        }

        public async Task<ResumeResponse> UploadResumeAsync(int userId, IFormFile file)
        {
            CandidateProfile profile = await _db.CandidateProfiles.FirstOrDefaultAsync(p => p.UserId == userId);
            if (profile == null)
            {
                throw new NotFoundException("Candidate profile not found.");
            }

            // 1. Check the file (size, extension, content type, PDF signature)
            long maxBytes = _settings.MaxFileSizeMb * 1024L * 1024L;
            ResumeFileValidator.Validate(file, maxBytes);

            // 2. Limit the number of resumes per candidate
            int resumeCount = await _db.Resumes.CountAsync(r => r.CandidateProfileId == profile.Id);
            if (resumeCount >= _settings.MaxResumesPerCandidate)
            {
                throw new ConflictException("You can keep at most " + _settings.MaxResumesPerCandidate + " resumes.");
            }

            // 3. Save the file with a random name (the user's file name is never used as a path)
            Directory.CreateDirectory(_storageFolder);

            string storageKey = Guid.NewGuid().ToString("N") + ".pdf";
            string fullPath = Path.Combine(_storageFolder, storageKey);

            using (FileStream stream = new FileStream(fullPath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            // 4. Read the text of the PDF
            string text = "";
            try
            {
                text = _parser.ExtractText(fullPath);
            }
            catch (Exception)
            {
                File.Delete(fullPath);
                throw new UnprocessableException("The PDF could not be read. Please upload a valid PDF file.");
            }

            // 5. Save the information in the database
            string originalName = Path.GetFileName(file.FileName);
            if (originalName.Length > 200)
            {
                originalName = originalName.Substring(0, 200);
            }

            Resume resume = new Resume();
            resume.CandidateProfileId = profile.Id;
            resume.StorageKey = storageKey;
            resume.OriginalFileName = originalName;
            resume.ContentType = "application/pdf";
            resume.SizeBytes = file.Length;
            resume.ExtractedText = text;
            resume.UploadedAt = DateTime.UtcNow;

            _db.Resumes.Add(resume);
            await _db.SaveChangesAsync();

            List<string> skills = _skillMatchingService.FindSkillsInText(text);
            return EntityMapper.ToResumeResponse(resume, skills);
        }

        public async Task<List<ResumeResponse>> GetMyResumesAsync(int userId)
        {
            List<Resume> resumes = await _db.Resumes
                .Where(r => r.CandidateProfile.UserId == userId)
                .OrderByDescending(r => r.UploadedAt)
                .ToListAsync();

            List<ResumeResponse> responses = new List<ResumeResponse>();
            foreach (Resume resume in resumes)
            {
                List<string> skills = _skillMatchingService.FindSkillsInText(resume.ExtractedText);
                responses.Add(EntityMapper.ToResumeResponse(resume, skills));
            }

            return responses;
        }

        public async Task<ResumeDownloadResult> GetResumeForDownloadAsync(int resumeId, int userId, UserRole role, int? companyId)
        {
            Resume resume = await _db.Resumes
                .Include(r => r.CandidateProfile)
                .FirstOrDefaultAsync(r => r.Id == resumeId);

            if (resume == null)
            {
                throw new NotFoundException("Resume not found.");
            }

            if (role == UserRole.Candidate)
            {
                // A candidate can download only his or her own resume
                if (resume.CandidateProfile.UserId != userId)
                {
                    throw new NotFoundException("Resume not found.");
                }
            }
            else if (role == UserRole.Recruiter)
            {
                // A recruiter can download a resume only if it was used in an
                // application for a job of the recruiter's company.
                if (companyId == null)
                {
                    throw new NotFoundException("Resume not found.");
                }

                int recruiterCompanyId = companyId.Value;

                bool isAllowed = await _db.Applications
                    .AnyAsync(a => a.ResumeId == resumeId && a.Job.CompanyId == recruiterCompanyId);

                if (isAllowed == false)
                {
                    throw new NotFoundException("Resume not found.");
                }
            }
            else
            {
                throw new ForbiddenException("You are not allowed to download this resume.");
            }

            string fullPath = Path.Combine(_storageFolder, resume.StorageKey);
            if (File.Exists(fullPath) == false)
            {
                throw new NotFoundException("The resume file was not found on the server.");
            }

            ResumeDownloadResult result = new ResumeDownloadResult();
            result.FullPath = fullPath;
            result.FileName = resume.OriginalFileName;
            return result;
        }
    }
}
