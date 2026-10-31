using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TalentFlow.Api.Entities;

namespace TalentFlow.Api.Data.Configurations
{
    public class JobConfiguration : IEntityTypeConfiguration<Job>
    {
        public void Configure(EntityTypeBuilder<Job> builder)
        {
            builder.ToTable("Jobs");
            builder.HasKey(j => j.Id);

            builder.Property(j => j.Title).IsRequired().HasMaxLength(150);
            builder.Property(j => j.Description).IsRequired().HasMaxLength(5000);
            builder.Property(j => j.RequiredSkills).IsRequired().HasMaxLength(500);

            builder.Property(j => j.ExperienceLevel).HasConversion<string>().HasMaxLength(20);
            builder.Property(j => j.Status).HasConversion<string>().HasMaxLength(20);

            // Indexes for the most common searches
            builder.HasIndex(j => new { j.CompanyId, j.Status });
            builder.HasIndex(j => j.Status);

            builder.HasOne(j => j.Company)
                .WithMany(c => c.Jobs)
                .HasForeignKey(j => j.CompanyId)
                .OnDelete(DeleteBehavior.Restrict);
        }
    }
}
