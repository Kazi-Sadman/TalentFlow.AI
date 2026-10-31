using System.Text;
using TalentFlow.Api.Services.Interfaces;
using UglyToad.PdfPig;
using UglyToad.PdfPig.Content;

namespace TalentFlow.Api.Services
{
    // Reads the text of a PDF file using the PdfPig library.
    // Note: this works for PDFs that contain real text. A scanned image PDF
    // gives almost no text (OCR is not part of this MVP).
    public class ResumeParserService : IResumeParserService
    {
        private const int MaxPages = 20;
        private const int MaxCharacters = 50000;

        public string ExtractText(string filePath)
        {
            StringBuilder builder = new StringBuilder();

            using (PdfDocument document = PdfDocument.Open(filePath))
            {
                int pageNumber = 0;

                foreach (Page page in document.GetPages())
                {
                    pageNumber++;
                    if (pageNumber > MaxPages)
                    {
                        break;
                    }

                    builder.AppendLine(page.Text);

                    if (builder.Length > MaxCharacters)
                    {
                        break;
                    }
                }
            }

            string text = builder.ToString();

            // PostgreSQL cannot save the NUL character, so we remove it.
            text = text.Replace("\0", "");

            if (text.Length > MaxCharacters)
            {
                text = text.Substring(0, MaxCharacters);
            }

            return text;
        }
    }
}
