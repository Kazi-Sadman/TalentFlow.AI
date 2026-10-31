using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TalentFlow.Api.Entities;

namespace TalentFlow.Api.Data.Configurations
{
    public class ResumeConfiguration : IEntityTypeConfiguration<Resume>
    {
        public void Configure(EntityTypeBuilder<Resume> builder)
        {
            builder.ToTable("Resumes");
            builder.HasKey(r => r.Id);

            builder.Property(r => r.StorageKey).IsRequired().HasMaxLength(100);
            builder.Property(r => r.OriginalFileName).IsRequired().HasMaxLength(200);
            builder.Property(r => r.ContentType).IsRequired().HasMaxLength(100);

            builder.HasOne(r => r.CandidateProfile)
                .WithMany(p => p.Resumes)
                .HasForeignKey(r => r.CandidateProfileId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
