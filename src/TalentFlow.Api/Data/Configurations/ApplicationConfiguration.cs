using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TalentFlow.Api.Entities;

namespace TalentFlow.Api.Data.Configurations
{
    public class ApplicationConfiguration : IEntityTypeConfiguration<Application>
    {
        public void Configure(EntityTypeBuilder<Application> builder)
        {
            builder.ToTable("Applications");
            builder.HasKey(a => a.Id);

            builder.Property(a => a.Status).HasConversion<string>().HasMaxLength(30);
            builder.Property(a => a.RecruiterNotes).HasMaxLength(2000);

            // One candidate can apply to one job only once
            builder.HasIndex(a => new { a.JobId, a.CandidateProfileId }).IsUnique();
            builder.HasIndex(a => a.Status);

            builder.HasOne(a => a.Job)
                .WithMany(j => j.Applications)
                .HasForeignKey(a => a.JobId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(a => a.CandidateProfile)
                .WithMany(p => p.Applications)
                .HasForeignKey(a => a.CandidateProfileId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(a => a.Resume)
                .WithMany()
                .HasForeignKey(a => a.ResumeId)
                .OnDelete(DeleteBehavior.SetNull);
        }
    }
}
