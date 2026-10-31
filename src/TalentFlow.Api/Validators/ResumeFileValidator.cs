using System.IO;
using System.Text;
using Microsoft.AspNetCore.Http;
using TalentFlow.Api.Common;

namespace TalentFlow.Api.Validators
{
    // Checks an uploaded CV file before we save it.
    // We check: file exists, size, extension, content type and the real PDF signature.
    public static class ResumeFileValidator
    {
        public static void Validate(IFormFile file, long maxSizeBytes)
        {
            if (file == null || file.Length == 0)
            {
                throw new BadRequestException("Please choose a PDF file.");
            }

            if (file.Length > maxSizeBytes)
            {
                long maxMb = maxSizeBytes / (1024 * 1024);
                throw new PayloadTooLargeException("The file is too large. Maximum size is " + maxMb + " MB.");
            }

            string extension = Path.GetExtension(file.FileName);
            if (extension == null || extension.ToLower() != ".pdf")
            {
                throw new UnprocessableException("Only PDF files are allowed.");
            }

            if (file.ContentType == null || file.ContentType.ToLower() != "application/pdf")
            {
                throw new UnprocessableException("The file content type must be application/pdf.");
            }

            if (HasPdfSignature(file) == false)
            {
                throw new UnprocessableException("The file is not a real PDF document.");
            }
        }

        // Every real PDF file starts with the text "%PDF-"
        private static bool HasPdfSignature(IFormFile file)
        {
            byte[] header = new byte[5];
            int bytesRead = 0;

            using (Stream stream = file.OpenReadStream())
            {
                bytesRead = stream.Read(header, 0, 5);
            }

            if (bytesRead < 5)
            {
                return false;
            }

            string text = Encoding.ASCII.GetString(header);
            return text == "%PDF-";
        }
    }
}
