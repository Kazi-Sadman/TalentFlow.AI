namespace TalentFlow.Api.Common
{
    // Values come from the "ResumeStorage" section of the configuration.
    public class ResumeSettings
    {
        public string StorageFolder { get; set; }
        public int MaxFileSizeMb { get; set; }
        public int MaxResumesPerCandidate { get; set; }

        public ResumeSettings()
        {
            StorageFolder = "PrivateStorage/resumes";
            MaxFileSizeMb = 5;
            MaxResumesPerCandidate = 5;
        }
    }
}
