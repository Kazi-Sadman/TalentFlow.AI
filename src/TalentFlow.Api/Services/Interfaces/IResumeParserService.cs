namespace TalentFlow.Api.Services.Interfaces
{
    public interface IResumeParserService
    {
        // Reads the text from a PDF file
        string ExtractText(string filePath);
    }
}
