using System.Collections.Generic;

namespace TalentFlow.Api.DTOs.Dashboard
{
    public class PipelineItem
    {
        public string Status { get; set; }
        public int Count { get; set; }
    }

    public class DashboardSummaryResponse
    {
        public int TotalJobs { get; set; }
        public int DraftJobs { get; set; }
        public int PublishedJobs { get; set; }
        public int ClosedJobs { get; set; }

        public int TotalApplications { get; set; }

        // Applications that are still in "Applied" status
        public int NewApplications { get; set; }
        public int ApplicationsLast7Days { get; set; }

        public int UpcomingInterviews { get; set; }

        public List<PipelineItem> Pipeline { get; set; }

        public DashboardSummaryResponse()
        {
            Pipeline = new List<PipelineItem>();
        }
    }
}
