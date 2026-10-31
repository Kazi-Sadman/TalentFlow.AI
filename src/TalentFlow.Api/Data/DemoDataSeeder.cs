using System;
using System.Linq;
using TalentFlow.Api.Entities;

namespace TalentFlow.Api.Data
{
    // Adds a small amount of FAKE demo data when the database is empty.
    // It runs only in Development and only when "SeedDemoData" is true.
    // Never use real candidate data for demos.
    public static class DemoDataSeeder
    {
        public static void Seed(TalentFlowDbContext db)
        {
            if (db.Users.Any())
            {
                return;
            }

            string passwordHash = BCrypt.Net.BCrypt.HashPassword("Demo@12345");

            Company company = new Company();
            company.Name = "Demo Tech Ltd";
            company.Website = "https://example.com";
            company.CreatedAt = DateTime.UtcNow;
            db.Companies.Add(company);
            db.SaveChanges();

            User recruiter = new User();
            recruiter.CompanyId = company.Id;
            recruiter.FullName = "Demo Recruiter";
            recruiter.Email = "recruiter@demo.com";
            recruiter.PasswordHash = passwordHash;
            recruiter.Role = UserRole.Recruiter;
            recruiter.CreatedAt = DateTime.UtcNow;
            db.Users.Add(recruiter);

            User candidate = new User();
            candidate.FullName = "Demo Candidate";
            candidate.Email = "candidate@demo.com";
            candidate.PasswordHash = passwordHash;
            candidate.Role = UserRole.Candidate;
            candidate.CreatedAt = DateTime.UtcNow;
            db.Users.Add(candidate);
            db.SaveChanges();

            CandidateProfile profile = new CandidateProfile();
            profile.UserId = candidate.Id;
            profile.Summary = "Fresh graduate who likes backend development.";
            profile.Education = "BSc in Computer Science";
            profile.ExperienceYears = 1;
            profile.Skills = "C#, ASP.NET Core, SQL, Git";
            db.CandidateProfiles.Add(profile);

            Job job1 = new Job();
            job1.CompanyId = company.Id;
            job1.Title = ".NET Backend Trainee Engineer";
            job1.Description = "Build REST APIs with ASP.NET Core and PostgreSQL. Learn from senior engineers.";
            job1.RequiredSkills = "C#, ASP.NET Core, PostgreSQL, Entity Framework Core, Git";
            job1.ExperienceLevel = ExperienceLevel.Intern;
            job1.Status = JobStatus.Published;
            job1.CreatedAt = DateTime.UtcNow;
            db.Jobs.Add(job1);

            Job job2 = new Job();
            job2.CompanyId = company.Id;
            job2.Title = "Junior React Developer";
            job2.Description = "Build modern web screens with React and TypeScript.";
            job2.RequiredSkills = "JavaScript, TypeScript, React, HTML, CSS";
            job2.ExperienceLevel = ExperienceLevel.Junior;
            job2.Status = JobStatus.Published;
            job2.CreatedAt = DateTime.UtcNow;
            db.Jobs.Add(job2);

            Job job3 = new Job();
            job3.CompanyId = company.Id;
            job3.Title = "QA Engineer (draft)";
            job3.Description = "This job is still a draft, so the public cannot see it.";
            job3.RequiredSkills = "Testing, Postman, SQL";
            job3.ExperienceLevel = ExperienceLevel.Mid;
            job3.Status = JobStatus.Draft;
            job3.CreatedAt = DateTime.UtcNow;
            db.Jobs.Add(job3);

            db.SaveChanges();
        }
    }
}
