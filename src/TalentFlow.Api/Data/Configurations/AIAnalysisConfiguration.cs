using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TalentFlow.Api.Entities;

namespace TalentFlow.Api.Data.Configurations
{
    public class AIAnalysisConfiguration : IEntityTypeConfiguration<AIAnalysis>
    {
        public void Configure(EntityTypeBuilder<AIAnalysis> builder)
        {
            builder.ToTable("AIAnalyses");
            builder.HasKey(a => a.Id);

            builder.Property(a => a.Status).HasConversion<string>().HasMaxLength(20);
            builder.Property(a => a.Provider).HasMaxLength(50);
            builder.Property(a => a.ErrorMessage).HasMaxLength(500);

            // If an analysis fails, the application stays untouched
            builder.HasOne(a => a.Application)
                .WithMany(app => app.AIAnalyses)
                .HasForeignKey(a => a.ApplicationId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
