using System;
using System.Collections.Generic;

namespace TalentFlow.Api.DTOs.Resumes
{
    public class ResumeResponse
    {
        public int Id { get; set; }
        public string OriginalFileName { get; set; }
        public long SizeBytes { get; set; }
        public DateTime UploadedAt { get; set; }

        // Skills that the system found in the CV text (so the user can review them)
        public List<string> DetectedSkills { get; set; }

        public ResumeResponse()
        {
            DetectedSkills = new List<string>();
        }
    }
}
