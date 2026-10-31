using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TalentFlow.Api.Entities;

namespace TalentFlow.Api.Data.Configurations
{
    public class InterviewConfiguration : IEntityTypeConfiguration<Interview>
    {
        public void Configure(EntityTypeBuilder<Interview> builder)
        {
            builder.ToTable("Interviews", table =>
            {
                // Start time must be before end time
                table.HasCheckConstraint("CK_Interviews_StartBeforeEnd", "\"StartAtUtc\" < \"EndAtUtc\"");
            });
            builder.HasKey(i => i.Id);

            builder.Property(i => i.MeetingLink).IsRequired().HasMaxLength(500);
            builder.Property(i => i.Feedback).HasMaxLength(3000);

            builder.HasOne(i => i.Application)
                .WithMany(a => a.Interviews)
                .HasForeignKey(i => i.ApplicationId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne(i => i.InterviewerUser)
                .WithMany()
                .HasForeignKey(i => i.InterviewerUserId)
                .OnDelete(DeleteBehavior.Restrict);
        }
    }
}
