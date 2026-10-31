using System.Collections.Generic;

namespace TalentFlow.Api.Common
{
    // Every error from the API has this same shape.
    public class ErrorResponse
    {
        public int StatusCode { get; set; }
        public string Message { get; set; }
        public List<string> Errors { get; set; }

        public ErrorResponse()
        {
            Errors = new List<string>();
        }

        public ErrorResponse(int statusCode, string message, List<string> errors)
        {
            StatusCode = statusCode;
            Message = message;
            Errors = errors;
        }
    }
}
