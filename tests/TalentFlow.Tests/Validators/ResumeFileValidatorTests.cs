using System.IO;
using System.Text;
using Microsoft.AspNetCore.Http;
using TalentFlow.Api.Common;
using TalentFlow.Api.Validators;
using Xunit;

namespace TalentFlow.Tests.Validators
{
    public class ResumeFileValidatorTests
    {
        private const long MaxBytes = 5 * 1024 * 1024;

        private IFormFile MakeFile(string content, string fileName, string contentType)
        {
            byte[] bytes = Encoding.ASCII.GetBytes(content);
            MemoryStream stream = new MemoryStream(bytes);

            FormFile file = new FormFile(stream, 0, bytes.Length, "file", fileName);
            file.Headers = new HeaderDictionary();
            file.ContentType = contentType;
            return file;
        }

        [Fact]
        public void RealPdf_IsAccepted()
        {
            IFormFile file = MakeFile("%PDF-1.4 fake content", "cv.pdf", "application/pdf");

            ResumeFileValidator.Validate(file, MaxBytes);
        }

        [Fact]
        public void NullFile_ThrowsBadRequest()
        {
            Assert.Throws<BadRequestException>(() => ResumeFileValidator.Validate(null, MaxBytes));
        }

        [Fact]
        public void WrongExtension_IsRejected()
        {
            IFormFile file = MakeFile("%PDF-1.4 fake content", "cv.exe", "application/pdf");

            Assert.Throws<UnprocessableException>(() => ResumeFileValidator.Validate(file, MaxBytes));
        }

        [Fact]
        public void WrongContentType_IsRejected()
        {
            IFormFile file = MakeFile("%PDF-1.4 fake content", "cv.pdf", "text/plain");

            Assert.Throws<UnprocessableException>(() => ResumeFileValidator.Validate(file, MaxBytes));
        }

        [Fact]
        public void FakePdfWithoutSignature_IsRejected()
        {
            IFormFile file = MakeFile("MZ this is an executable", "cv.pdf", "application/pdf");

            Assert.Throws<UnprocessableException>(() => ResumeFileValidator.Validate(file, MaxBytes));
        }

        [Fact]
        public void TooLargeFile_ThrowsPayloadTooLarge()
        {
            IFormFile file = MakeFile("%PDF-1.4 fake content that is bigger than the tiny limit", "cv.pdf", "application/pdf");

            Assert.Throws<PayloadTooLargeException>(() => ResumeFileValidator.Validate(file, 10));
        }
    }
}
