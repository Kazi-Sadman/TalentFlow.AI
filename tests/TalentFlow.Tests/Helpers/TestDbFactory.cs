using System;
using Microsoft.EntityFrameworkCore;
using TalentFlow.Api.Data;
using TalentFlow.Api.Entities;

namespace TalentFlow.Tests.Helpers
{
    // Creates a fresh in-memory database for every test and small helper methods
    // that add test data. No real PostgreSQL is needed for these unit tests.
    public static class TestDbFactory
    {
        public static TalentFlowDbContext CreateContext()
        {
            DbContextOptionsBuilder<TalentFlowDbContext> builder = new DbContextOptionsBuilder<TalentFlowDbContext>();
            builder.UseInMemoryDatabase(Guid.NewGuid().ToString());
            return new TalentFlowDbContext(builder.Options);
        }

        public static Company AddCompany(TalentFlowDbContext db, string name)
        {
            Company company = new Company();
            company.Name = name;
            company.CreatedAt = DateTime.UtcNow;
            db.Companies.Add(company);
            db.SaveChanges();
            return company;
        }

        public static User AddRecruiter(TalentFlowDbContext db, int companyId, string email)
        {
            User user = new User();
            user.CompanyId = companyId;
            user.FullName = "Recruiter " + email;
            user.Email = email;
            user.PasswordHash = "hash";
            user.Role = UserRole.Recruiter;
            user.CreatedAt = DateTime.UtcNow;
            db.Users.Add(user);
            db.SaveChanges();
            return user;
        }

        // Creates a candidate user and its profile. Returns the profile (profile.User is set).
        public static CandidateProfile AddCandidate(TalentFlowDbContext db, string email)
        {
            User user = new User();
            user.FullName = "Candidate " + email;
            user.Email = email;
            user.PasswordHash = "hash";
            user.Role = UserRole.Candidate;
            user.CreatedAt = DateTime.UtcNow;
            db.Users.Add(user);
            db.SaveChanges();

            CandidateProfile profile = new CandidateProfile();
            profile.UserId = user.Id;
            db.CandidateProfiles.Add(profile);
            db.SaveChanges();
            return profile;
        }

        public static Job AddJob(TalentFlowDbContext db, int companyId, JobStatus status, string skills)
        {
            Job job = new Job();
            job.CompanyId = companyId;
            job.Title = "Test Job";
            job.Description = "Test description";
            job.RequiredSkills = skills;
            job.ExperienceLevel = ExperienceLevel.Junior;
            job.Status = status;
            job.CreatedAt = DateTime.UtcNow;
            db.Jobs.Add(job);
            db.SaveChanges();
            return job;
        }

        public static Application AddApplication(TalentFlowDbContext db, int jobId, int profileId, ApplicationStatus status)
        {
            Application application = new Application();
            application.JobId = jobId;
            application.CandidateProfileId = profileId;
            application.Status = status;
            application.AppliedAt = DateTime.UtcNow;
            db.Applications.Add(application);
            db.SaveChanges();
            return application;
        }

        public static Resume AddResume(TalentFlowDbContext db, int profileId, string text)
        {
            Resume resume = new Resume();
            resume.CandidateProfileId = profileId;
            resume.StorageKey = Guid.NewGuid().ToString("N") + ".pdf";
            resume.OriginalFileName = "cv.pdf";
            resume.ContentType = "application/pdf";
            resume.SizeBytes = 1000;
            resume.ExtractedText = text;
            resume.UploadedAt = DateTime.UtcNow;
            db.Resumes.Add(resume);
            db.SaveChanges();
            return resume;
        }
    }
}
