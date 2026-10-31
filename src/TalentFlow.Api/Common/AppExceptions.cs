using System;

namespace TalentFlow.Api.Common
{
    // Services throw these exceptions when a business rule is broken.
    // ExceptionMiddleware turns them into a clean JSON error response.
    public class AppException : Exception
    {
        public int StatusCode { get; private set; }

        public AppException(int statusCode, string message) : base(message)
        {
            StatusCode = statusCode;
        }
    }

    public class BadRequestException : AppException
    {
        public BadRequestException(string message) : base(400, message) { }
    }

    public class UnauthorizedException : AppException
    {
        public UnauthorizedException(string message) : base(401, message) { }
    }

    public class ForbiddenException : AppException
    {
        public ForbiddenException(string message) : base(403, message) { }
    }

    public class NotFoundException : AppException
    {
        public NotFoundException(string message) : base(404, message) { }
    }

    public class ConflictException : AppException
    {
        public ConflictException(string message) : base(409, message) { }
    }

    public class PayloadTooLargeException : AppException
    {
        public PayloadTooLargeException(string message) : base(413, message) { }
    }

    public class UnprocessableException : AppException
    {
        public UnprocessableException(string message) : base(422, message) { }
    }
}
