using TalentFlow.Api.Entities;

namespace TalentFlow.Api.Services
{
    // The allowed status changes of an application.
    //
    //   Applied -> InReview -> Shortlisted -> Interview -> Offered
    //   Rejected is possible from every step except Offered and Rejected.
    //   Offered and Rejected are final steps.
    public static class ApplicationWorkflow
    {
        public static bool IsAllowed(ApplicationStatus from, ApplicationStatus to)
        {
            if (from == ApplicationStatus.Applied)
            {
                return to == ApplicationStatus.InReview || to == ApplicationStatus.Rejected;
            }

            if (from == ApplicationStatus.InReview)
            {
                return to == ApplicationStatus.Shortlisted || to == ApplicationStatus.Rejected;
            }

            if (from == ApplicationStatus.Shortlisted)
            {
                return to == ApplicationStatus.Interview || to == ApplicationStatus.Rejected;
            }

            if (from == ApplicationStatus.Interview)
            {
                return to == ApplicationStatus.Offered || to == ApplicationStatus.Rejected;
            }

            // Offered and Rejected cannot change any more
            return false;
        }
    }
}
