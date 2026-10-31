using TalentFlow.Api.Entities;
using TalentFlow.Api.Services;
using Xunit;

namespace TalentFlow.Tests.Services
{
    public class ApplicationWorkflowTests
    {
        [Fact]
        public void Applied_CanMoveToInReview()
        {
            Assert.True(ApplicationWorkflow.IsAllowed(ApplicationStatus.Applied, ApplicationStatus.InReview));
        }

        [Fact]
        public void Applied_CannotJumpToOffered()
        {
            Assert.False(ApplicationWorkflow.IsAllowed(ApplicationStatus.Applied, ApplicationStatus.Offered));
        }

        [Fact]
        public void Interview_CanBeRejected()
        {
            Assert.True(ApplicationWorkflow.IsAllowed(ApplicationStatus.Interview, ApplicationStatus.Rejected));
        }

        [Fact]
        public void Rejected_IsFinal()
        {
            Assert.False(ApplicationWorkflow.IsAllowed(ApplicationStatus.Rejected, ApplicationStatus.InReview));
        }

        [Fact]
        public void Offered_IsFinal()
        {
            Assert.False(ApplicationWorkflow.IsAllowed(ApplicationStatus.Offered, ApplicationStatus.Rejected));
        }
    }
}
