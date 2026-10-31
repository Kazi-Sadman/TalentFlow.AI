using System;

namespace TalentFlow.Api.Entities
{
    public class Resume
    {
        public int Id { get; set; }

        public int CandidateProfileId { get; set; }
        public CandidateProfile CandidateProfile { get; set; }

        // The file name on the server (a random name that we generate).
        // We never save the file bytes in the database.
        public string StorageKey { get; set; }

        public string OriginalFileName { get; set; }
        public string ContentType { get; set; }
        public long SizeBytes { get; set; }

        // Text that was read from the PDF. Used by the skill matcher.
        public string ExtractedText { get; set; }

        public DateTime UploadedAt { get; set; }
    }
}
