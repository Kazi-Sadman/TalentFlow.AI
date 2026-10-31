using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TalentFlow.Api.Entities;

namespace TalentFlow.Api.Data.Configurations
{
    public class CandidateProfileConfiguration : IEntityTypeConfiguration<CandidateProfile>
    {
        public void Configure(EntityTypeBuilder<CandidateProfile> builder)
        {
            builder.ToTable("CandidateProfiles");
            builder.HasKey(p => p.Id);

            builder.Property(p => p.Summary).HasMaxLength(2000);
            builder.Property(p => p.Education).HasMaxLength(1000);
            builder.Property(p => p.Skills).HasMaxLength(500);

            // One user has one candidate profile (the unique index is created automatically)
            builder.HasOne(p => p.User)
                .WithOne(u => u.CandidateProfile)
                .HasForeignKey<CandidateProfile>(p => p.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
