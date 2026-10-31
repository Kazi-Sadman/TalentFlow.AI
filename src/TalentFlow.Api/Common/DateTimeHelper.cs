using System;

namespace TalentFlow.Api.Common
{
    public static class DateTimeHelper
    {
        // PostgreSQL ("timestamp with time zone") only accepts UTC values.
        // This method makes sure every date is in UTC before we save it.
        public static DateTime ToUtc(DateTime value)
        {
            if (value.Kind == DateTimeKind.Utc)
            {
                return value;
            }
            if (value.Kind == DateTimeKind.Local)
            {
                return value.ToUniversalTime();
            }
            // Unspecified: we treat it as UTC.
            return DateTime.SpecifyKind(value, DateTimeKind.Utc);
        }
    }
}
